import { useStore } from '@nanostores/react'
import { showNavigation } from '@store/titleStore.js'

export default function BottomNavigation() {
	const showNav = useStore(showNavigation)

	return (
		<nav
			className={`fixed bottom-8 left-8 z-20 bg-gray-50 p-4 rounded-lg transition-transform duration-300 ${showNav ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}`}
		>
			<ul className="space-y-2">
				<li>
					<a
						href="/travels/taiwan"
						className="block px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors duration-200"
					>
						Taiwan
					</a>
				</li>
				<li>
					<a
						href="/travels/dresden"
						className="block px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors duration-200"
					>
						Dresden
					</a>
				</li>
				<li>
					<a
						href="/travels/israel"
						className="block px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors duration-200"
					>
						Israel
					</a>
				</li>
				<li>
					<a
						href="/travels/japan"
						className="block px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors duration-200"
					>
						Japan
					</a>
				</li>
			</ul>
		</nav>
	)
}
