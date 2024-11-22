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
					<RichTextContent content={data.travels.body} />
				</div>
			</div>
		</>
	)
}

export { TravelComponent }
