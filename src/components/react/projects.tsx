import { tinaField, useTina } from 'tinacms/dist/react'
import '@styles/global.css'
import type { ProjectsQuery } from '../../../tina/__generated__/types.ts'

import { RichTextContent } from '@rc/RichTextContent.tsx'

export const ProjectComponent = (props: {
	data: ProjectsQuery
	query: string
	variables: {
		relativePath: string
	}
}) => {
	const { data } = useTina(props)

	const { title, pubDate: unPubDate } = data.projects

	const LocaleConfig: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	}
	const pubDate = new Date(unPubDate as string).toLocaleDateString('en-US', LocaleConfig)

	return (
		<>
			<h1
				className="title font-serif lowercase text-4xl tracking-wide pt-4"
				data-tina-field={tinaField(data.projects, 'title')}
			>
				{title}
			</h1>
			<div className="prose font-sans" data-tina-field={tinaField(data.projects, 'body')}>
				<RichTextContent content={data.projects.body} />
			</div>
			<div className="py-4 font-sans text-sm uppercase text-neutral-400">
				updated{' '}
				{pubDate && (
					<time data-tina-field={tinaField(data.projects, 'pubDate')} dateTime="MMM-DD-YYYY">
						{pubDate}
					</time>
				)}
			</div>
		</>
	)
}
