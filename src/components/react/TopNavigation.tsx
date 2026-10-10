import { useSyncExternalStore } from 'react'
import type { TravelsQuery } from '../../../tina/__generated__/types.ts'

import { useTina } from 'tinacms/dist/react'

import '@styles/globals.css'
import { ChevronRightIcon } from '@radix-ui/react-icons'

import { SITE_TITLE } from '@/config.ts'

import {
	getNavigationSnapshot,
	getServerNavigationSnapshot,
	subscribeNavigation,
} from '@store/travelNavigation.ts'

export const TopNavigation = (props: {
	data: TravelsQuery
	query: string
	variables: {
		relativePath: string
	}
}) => {
	const { data } = useTina(props)
	const { title: tinaTitle } = data.travels

	const { showTitle, isBottom } = useSyncExternalStore(
		subscribeNavigation,
		getNavigationSnapshot,
		getServerNavigationSnapshot
	)

	return (
		<div className="travel-crumb sticky top-0 z-10 bg-white lg:h-16 h-12">
			<nav className="text-sm pt-4 lg:pt-8 pl-8" aria-label="Breadcrumb">
				{showTitle ? (
					<h2 className="font-serif text-xl lg:text-2xl tracking-wide lowercase animate-fade">
						{tinaTitle}
					</h2>
				) : (
					<ol className="list-none p-0 flex animate-fade">
						<li className="flex items-center">
							<a href="/" className="text-gray-500 hover:text-gray-700">
								{SITE_TITLE}
							</a>
						</li>
						<li className="flex items-center">
							<span className="mx-2">
								<ChevronRightIcon />
							</span>
							<a href="/travels" className="text-gray-500 hover:text-gray-700">
								travels
							</a>
						</li>
						{isBottom && (
							<li className="flex items-center text-gray-900 font-bold">
								<span className="mx-2">
									<ChevronRightIcon />
								</span>
								{tinaTitle.toLowerCase()}
							</li>
						)}
					</ol>
				)}
			</nav>
		</div>
	)
}
