import { tinaField, useTina } from 'tinacms/dist/react'
import type { TravelsQuery } from '../../../tina/__generated__/types'

import { RichTextContent } from '@rc/Tina/RichTextContent'

const TravelComponent = (props: {
	data: TravelsQuery
	variables: {
		relativePath: string
	}
	query: string
}) => {
	const { data } = useTina(props)
	const { title } = data.travels

	return (
		<>
			<div className="p-8 space-y-8 pb-48 lg:pb-24">
				<h1
					className="travel-title font-serif text-3xl tracking-wide mb-6 lowercase"
					data-tina-field={tinaField(data.travels, 'title')}
				>
					{title}
				</h1>
				<div data-tina-field={tinaField(data.travels, 'body')}>
					<article
						className="
            prose 
            prose-img:rounded-lg 
            prose-base 
            prose-neutral 
            lg:prose-neutral 
            first:prose-tr:bg-slate-50
            first:prose-tr:text-gray-500
            first:prose-tr:text-xs
            first:prose-tr:uppercase
            first:prose-tr:font-medium
            not-first:hover:prose-tr:bg-orange-50
            prose-table:!border-none
            prose-td:!border-none
            prose-td:!p-1
            "
					>
						<RichTextContent content={data.travels.body} />
					</article>
				</div>
			</div>
		</>
	)
}

export { TravelComponent }
