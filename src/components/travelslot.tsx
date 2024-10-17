import React, { useEffect } from 'react'
import { tinaField, useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import type { TravelsQuery } from '../../tina/__generated__/types'

import { AdvancedImage, lazyload, responsive } from '@cloudinary/react'
import { Cloudinary } from '@cloudinary/url-gen'
import { quality } from '@cloudinary/url-gen/actions/delivery'
import { format } from '@cloudinary/url-gen/actions/delivery'
import { auto } from '@cloudinary/url-gen/qualifiers/format'

export const TravelComponent = (props: {
	data: TravelsQuery
	variables: {
		relativePath: string
	}
	query: string
}) => {
	const { data } = useTina(props)

	const { title } = data.travels

	const cld = new Cloudinary({
		cloud: {
			cloudName: 'dbifqlg1w',
		},
	})

	const extractImageIdFromUrl = (source) => {
		const regex = /\/upload\/v\d{8,12}\/(.+)$/
		const matches = regex.exec(source)

		if (matches) {
			return matches[1]
		}

		return null
	}

	const myImage = (url) =>
		cld.image(extractImageIdFromUrl(url)).delivery(quality(70)).delivery(format(auto()))

	const components = {
		a: (props) => (
			<a href={props.url} target="_blank" rel="noopener noreferrer">
				{props.children}
			</a>
		),

		img: (props) => (
			<a href={props.url} target="_blank" rel="noopener noreferrer">
				<AdvancedImage cldImg={myImage(props.url)} plugins={[lazyload(), responsive()]} />
			</a>
		),
	}

	return (
		<>
			<div className="p-8 space-y-8 pb-48 lg:pb-24">
				<h1
					className="travel-title font-serif text-4xl font-bold mb-6"
					data-tina-field={tinaField(data.travels, 'title')}
				>
					{title}
				</h1>
				<div data-tina-field={tinaField(data.travels, 'body')}>
					<article className="prose prose-img:rounded-lg prose-base prose-neutral lg:prose-neutral">
						<TinaMarkdown components={components} content={data.travels.body} />
					</article>
				</div>
			</div>
		</>
	)
}
