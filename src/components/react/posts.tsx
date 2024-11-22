import { tinaField, useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import type { PostsQuery } from '../../../tina/__generated__/types'

import { RichTextContent } from '@rc/Tina/RichTextContent'

export const PostComponent = (props: {
	data: PostsQuery
	variables: {
		relativePath: string
	}
	query: string
}) => {
	const { data } = useTina(props)

	const { title, pubDate: unPubDate } = data.posts

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
				data-tina-field={tinaField(data.posts, 'title')}
			>
				{title}
			</h1>
			<div className="py-4 font-sans text-sm uppercase text-neutral-400">
				{pubDate && (
					<time dateTime="MMM-DD-YYYY" data-tina-field={tinaField(data.posts, 'pubDate')}>
						{pubDate}
					</time>
				)}
			</div>
			<hr />
			<div className="prose font-sans" data-tina-field={tinaField(data.posts, 'body')}>
				<RichTextContent content={data.posts.body} />
			</div>
		</>
	)
}
