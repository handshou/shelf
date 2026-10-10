import { breadcrumbPosition, isBottom, showNavigation, titlePosition } from './titleStore.js'

type NavigationSnapshot = {
	showTitle: boolean
	isBottom: boolean
}

const serverSnapshot: NavigationSnapshot = { showTitle: false, isBottom: false }
let snapshot = serverSnapshot
const listeners = new Set<() => void>()
let stopListening: (() => void) | undefined

export const getNavigationSnapshot = () => snapshot
export const getServerNavigationSnapshot = () => serverSnapshot

export const subscribeNavigation = (listener: () => void) => {
	listeners.add(listener)
	if (listeners.size === 1) {
		let lastScrollY = window.scrollY
		showNavigation.set(true)

		const updateNavigation = () => {
			const titleRect = document.querySelector('.travel-title')?.getBoundingClientRect()
			const crumbRect = document.querySelector('.travel-crumb')?.getBoundingClientRect()
			const titleBottom = (titleRect?.top ?? 0) + (titleRect?.height ?? 0)
			const crumbHeight = crumbRect?.height ?? 0
			const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight

			if (window.scrollY !== lastScrollY) {
				showNavigation.set(window.scrollY < lastScrollY)
			}
			lastScrollY = window.scrollY
			titlePosition.set(titleBottom)
			breadcrumbPosition.set(crumbHeight)
			isBottom.set(atBottom)

			const showTitle = titleBottom < crumbHeight && !atBottom
			if (snapshot.showTitle !== showTitle || snapshot.isBottom !== atBottom) {
				snapshot = { showTitle, isBottom: atBottom }
				for (const notify of listeners) notify()
			}
		}

		window.addEventListener('scroll', updateNavigation, { passive: true })
		window.addEventListener('resize', updateNavigation)
		updateNavigation()
		stopListening = () => {
			window.removeEventListener('scroll', updateNavigation)
			window.removeEventListener('resize', updateNavigation)
		}
	}

	return () => {
		listeners.delete(listener)
		if (listeners.size === 0) {
			stopListening?.()
			stopListening = undefined
			snapshot = serverSnapshot
		}
	}
}
