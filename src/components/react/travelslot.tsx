import type { ReactNode } from 'react'
import type { TravelsQuery } from '../../../tina/__generated__/types'

import { tinaField, useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'

import { AdvancedImage, AdvancedVideo, lazyload, responsive } from '@cloudinary/react'
import { Cloudinary } from '@cloudinary/url-gen'
import { quality } from '@cloudinary/url-gen/actions/delivery'
import { format } from '@cloudinary/url-gen/actions/delivery'
import { auto } from '@cloudinary/url-gen/qualifiers/format'

import { extractImageIdFromUrl, extractVideoIdFromUrl } from '@/lib/cloudinary'
import { convertDMSToDecimal, validateGPSCoordinates } from '@/lib/map'
import { IFrame } from '@rc/Tina/IFrame'
import { Map as EmbedMap, type MapType } from '@rc/Tina/Map'

// TODO: https://tina.io/docs/editing/blocks/

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	url: string
	children: ReactNode
}

const TravelComponent = (props: {
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

	const myImage = (url: string) =>
		cld.image(extractImageIdFromUrl(url)).delivery(quality(70)).delivery(format(auto()))

	const myVideo = (url: string) => cld.video(extractVideoIdFromUrl(url))

	const components = {
		a: (props: LinkProps) => (
			<a href={props.url} target="_blank" rel="noopener noreferrer">
				{props.children}
			</a>
		),

		img: (props: LinkProps) => (
			<a href={props.url} target="_blank" rel="noopener noreferrer">
				<AdvancedImage
					className="ease-in duration-50 border-transparent border-2 -m-px mb-8 hover:border-1 hover:border-spacing-1 hover:border-orange-600"
					cldImg={myImage(props.url)}
					plugins={[lazyload(), responsive()]}
				/>
			</a>
		),

		Map: (props: { gpsCoordinates: string; mapType: MapType }) => {
			let { gpsCoordinates = "30 19' 45.49N, 35 26' 34.86E", mapType } = props
			if (typeof validateGPSCoordinates(gpsCoordinates) === 'string')
				gpsCoordinates = "30 19' 45.49N, 35 26' 34.86E"

			return (
				<>
					<EmbedMap {...convertDMSToDecimal(gpsCoordinates)} mapType={mapType} />
				</>
			)
		},

		IFrame: (props: {
			embedCode: string
		}) => {
			return <IFrame embedCode={props.embedCode} />
		},

		Video: (props: {
			videoUrl: string
		}) => {
			return (
				<div className="flex justify-center items-center">
					<div className="w-2/3 max-w-xs">
						<AdvancedVideo
							cldVid={myVideo(props.videoUrl)}
							cldPoster="auto"
							controls
							plugins={[lazyload()]}
						/>
					</div>
				</div>
			)
		},
	}

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
						{/* @ts-ignore component types must match TinaMarkdown component types*/}
						<TinaMarkdown components={components} content={data.travels.body} />
					</article>
				</div>
			</div>
		</>
	)
}

export { type LinkProps, TravelComponent }
