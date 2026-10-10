import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { performance } from 'node:perf_hooks'
import ts from 'typescript'
import { subscribeNavigation } from '../src/lib/store/travelNavigation.ts'

const baseline = process.argv[2]
if (!baseline) throw new Error('Provide the pinned merge-base commit as the first argument')
const baselineSource = execFileSync(
	'git',
	['show', `${baseline}:src/components/react/TopNavigation.tsx`],
	{ encoding: 'utf8' }
)
const baselineCode = ts.transpileModule(baselineSource, {
	compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText

const createBrowser = () => {
	const listeners = new Set()
	let geometryReads = 0
	let peakListeners = 0
	globalThis.window = {
		scrollY: 0,
		innerHeight: 600,
		addEventListener(type, listener) {
			if (type === 'scroll') {
				listeners.add(listener)
				peakListeners = Math.max(peakListeners, listeners.size)
			}
		},
		removeEventListener(type, listener) {
			if (type === 'scroll') listeners.delete(listener)
		},
	}
	globalThis.document = {
		body: { offsetHeight: 100000 },
		querySelector(selector) {
			return {
				getBoundingClientRect() {
					geometryReads++
					return selector === '.travel-title'
						? { top: 200 - window.scrollY, height: 40 }
						: { height: 48 }
				},
			}
		},
	}
	return {
		scroll(y) {
			window.scrollY = y
			for (const listener of [...listeners]) listener()
		},
		metrics: () => ({ geometryReads, peakListeners, remainingListeners: listeners.size }),
	}
}

const createLegacyRenderer = () => {
	const slots = []
	let cursor = 0
	let dirty = false
	let pendingEffects = []
	const atom = (initialValue) => {
		let value = initialValue
		const subscribers = new Set()
		return {
			get: () => value,
			set(next) {
				if (value === next) return
				value = next
				for (const listener of subscribers) listener(value)
			},
			subscribe(listener) {
				subscribers.add(listener)
				listener(value)
				return () => subscribers.delete(listener)
			},
		}
	}
	const stores = {
		titlePosition: atom(0),
		breadcrumbPosition: atom(0),
		isBottom: atom(false),
		showNavigation: atom(true),
	}
	const hooks = {
		useState(initial) {
			const index = cursor++
			slots[index] ??= { value: initial }
			return [
				slots[index].value,
				(next) => {
					if (slots[index].value !== next) dirty = true
					slots[index].value = next
				},
			]
		},
		useEffect(callback, dependencies) {
			const index = cursor++
			const previous = slots[index]
			if (!previous || dependencies.some((value, i) => value !== previous.dependencies[i])) {
				pendingEffects.push(() => {
					previous?.cleanup?.()
					slots[index] = { dependencies, cleanup: callback() }
				})
			}
		},
	}
	const exports = {}
	const requireStub = (name) => {
		if (name === 'react') return hooks
		if (name === 'react/jsx-runtime') return { jsx: () => null, jsxs: () => null }
		if (name === 'tinacms/dist/react') return { useTina: (props) => props }
		if (name === '@store/titleStore.js') return stores
		return {}
	}
	new Function('require', 'exports', baselineCode)(requireStub, exports)
	return {
		render() {
			do {
				cursor = 0
				dirty = false
				pendingEffects = []
				exports.TopNavigation({ data: { travels: { title: 'Hanoi' } } })
				for (const runEffect of pendingEffects) runEffect()
			} while (dirty)
		},
		unmount() {
			for (const slot of slots) slot?.cleanup?.()
		},
	}
}

const measure = (legacy) => {
	const browser = createBrowser()
	const renderer = legacy ? createLegacyRenderer() : undefined
	if (renderer) renderer.render()
	const unsubscribe = legacy ? undefined : subscribeNavigation(() => {})
	const start = performance.now()
	for (let y = 1; y <= 500; y++) {
		browser.scroll(y)
		renderer?.render()
	}
	const milliseconds = performance.now() - start
	renderer?.unmount()
	unsubscribe?.()
	return { milliseconds, ...browser.metrics() }
}

const median = (samples) => [...samples].sort((a, b) => a.milliseconds - b.milliseconds)[2]
const previous = median(Array.from({ length: 5 }, () => measure(true)))
const current = median(Array.from({ length: 5 }, () => measure(false)))
console.log(JSON.stringify({ baseline, scrollEvents: 500, previous, current }, null, 2))
assert.ok(current.milliseconds <= previous.milliseconds, 'Navigation timing exceeds merge-base')
assert.ok(current.geometryReads <= previous.geometryReads, 'Geometry work exceeds merge-base')
assert.equal(current.peakListeners, 1, 'Scroll listener count exceeds one')
assert.equal(current.remainingListeners, 0, 'Scroll listeners survive unmount')
Reflect.deleteProperty(globalThis, 'window')
Reflect.deleteProperty(globalThis, 'document')
