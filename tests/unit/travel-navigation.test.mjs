import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { showNavigation } from '../../src/lib/store/titleStore.js'
import {
	getNavigationSnapshot,
	getServerNavigationSnapshot,
	subscribeNavigation,
} from '../../src/lib/store/travelNavigation.ts'

let scrollListeners
let resizeListeners
let titleTop
let titleHeight
let cleanup

beforeEach(() => {
	scrollListeners = new Set()
	resizeListeners = new Set()
	titleTop = 100
	titleHeight = 40
	cleanup = []
	globalThis.window = {
		scrollY: 0,
		innerHeight: 600,
		addEventListener(type, listener) {
			if (type === 'scroll') scrollListeners.add(listener)
			if (type === 'resize') resizeListeners.add(listener)
		},
		removeEventListener(type, listener) {
			if (type === 'scroll') scrollListeners.delete(listener)
			if (type === 'resize') resizeListeners.delete(listener)
		},
	}
	globalThis.document = {
		body: { offsetHeight: 2000 },
		querySelector(selector) {
			return {
				getBoundingClientRect: () =>
					selector === '.travel-title' ? { top: titleTop, height: titleHeight } : { height: 48 },
			}
		},
	}
})

afterEach(() => {
	for (const unsubscribe of cleanup) unsubscribe()
	Reflect.deleteProperty(globalThis, 'window')
	Reflect.deleteProperty(globalThis, 'document')
})

const subscribe = (listener = () => {}) => {
	const unsubscribe = subscribeNavigation(listener)
	cleanup.push(unsubscribe)
	return unsubscribe
}

const scrollTo = (y) => {
	window.scrollY = y
	for (const listener of scrollListeners) listener()
}

test('scrolling never accumulates listeners and the final unsubscribe cleans up', () => {
	const first = subscribe()
	const second = subscribe()
	for (let y = 1; y <= 100; y++) scrollTo(y)
	assert.equal(scrollListeners.size, 1)
	assert.equal(resizeListeners.size, 1)
	first()
	assert.equal(scrollListeners.size, 1)
	second()
	assert.equal(scrollListeners.size, 0)
	assert.equal(resizeListeners.size, 0)
})

test('navigation follows the latest scroll direction rather than stale positions', () => {
	subscribe()
	scrollTo(100)
	assert.equal(showNavigation.get(), false)
	scrollTo(50)
	assert.equal(showNavigation.get(), true)
	scrollTo(70)
	assert.equal(showNavigation.get(), false)
})

test('title visibility reacts to position and bottom-of-page changes', () => {
	subscribe()
	assert.equal(getNavigationSnapshot().showTitle, false)
	titleTop = -40
	scrollTo(200)
	assert.deepEqual(getNavigationSnapshot(), { showTitle: true, isBottom: false })
	scrollTo(1400)
	assert.deepEqual(getNavigationSnapshot(), { showTitle: false, isBottom: true })
})

test('resizing recalculates the snapshot without scrolling', () => {
	subscribe()
	window.innerHeight = 2000
	for (const listener of resizeListeners) listener()
	assert.equal(getNavigationSnapshot().isBottom, true)
})

test('unchanged scroll state preserves snapshot identity and does not notify React', () => {
	let notifications = 0
	subscribe(() => notifications++)
	const initialSnapshot = getNavigationSnapshot()
	for (let y = 1; y <= 20; y++) scrollTo(y)
	assert.equal(getNavigationSnapshot(), initialSnapshot)
	assert.equal(notifications, 0)
})

test('server snapshot is stable and does not require a browser', () => {
	Reflect.deleteProperty(globalThis, 'window')
	Reflect.deleteProperty(globalThis, 'document')
	assert.equal(getServerNavigationSnapshot(), getServerNavigationSnapshot())
	assert.deepEqual(getServerNavigationSnapshot(), { showTitle: false, isBottom: false })
})

test('a fresh mount does not retain hidden navigation from the previous page', () => {
	const unsubscribe = subscribe()
	scrollTo(100)
	assert.equal(showNavigation.get(), false)
	unsubscribe()
	subscribe()
	assert.equal(scrollListeners.size, 1)
	assert.equal(showNavigation.get(), true)
})
