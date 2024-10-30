import { type ReactNode, useEffect, useState } from 'react'
import { tinaField, useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import type { TravelsQuery } from '../../../tina/__generated__/types'

import { AdvancedImage, AdvancedVideo, lazyload, responsive } from '@cloudinary/react'
import { Cloudinary } from '@cloudinary/url-gen'
import { quality } from '@cloudinary/url-gen/actions/delivery'
import { format } from '@cloudinary/url-gen/actions/delivery'
import { auto } from '@cloudinary/url-gen/qualifiers/format'

const API_KEY = import.meta.env?.PUBLIC_GOOGLE_MAPS_API_KEY || ''

const convertDMSToDecimal = (dms: string) => {
	// Split the input into latitude and longitude
	const [latString, lonString] = dms.split(',').map((coord) => coord.trim())

	const convertSingleDMS = (coord: string) => {
		// Remove the direction and trim spaces
		const direction = coord.slice(-1)
		const cleanedCoord = coord.slice(0, -1).trim()

		// Split by spaces and handle the presence of seconds
		const parts = cleanedCoord.split(/\s+/)
		const degrees = Number.parseFloat(parts[0])
		let minutes = Number.parseFloat(parts[1]) || 0
		let seconds = Number.parseFloat(parts[2]) || 0

		// If only degrees and minutes are present
		if (parts.length === 2) {
			seconds = 0 // Assume no seconds provided
		} else if (parts.length === 1) {
			minutes = 0 // Only degrees provided
			seconds = 0
		}

		// Calculate the decimal value
		let decimal = degrees + minutes / 60 + seconds / 3600

		// Adjust for direction
		if (direction === 'S' || direction === 'W') {
			decimal *= -1
		}

		return decimal
	}

	// Convert latitude and longitude
	const latitude = convertSingleDMS(latString)
	const longitude = convertSingleDMS(lonString)

	return { latitude, longitude }
}

const validateGPSCoordinates = (value: string) => {
	if (!value || value.trim() === '') {
		return 'GPS coordinates are required'
	}

	const parts = value.split(',')

	if (parts.length !== 2) {
		return 'Invalid format. Expected format: 30 19 45.49N, 35 26 34.86E'
	}

	const validatePart = (part: string) => {
		const trimmedPart = part.trim()
		const direction = trimmedPart.slice(-1)
		const dmsString = trimmedPart.slice(0, -1).trim()

		// Split DMS string into parts
		const dmsParts = dmsString.split(/\s+/)

		if (dmsParts.length < 3 || dmsParts.length > 4) {
			return 'Invalid DMS format'
		}

		// Convert degrees, minutes, and seconds to numbers
		const degrees = Number(dmsParts[0])
		const minutes = Number(dmsParts[1])
		const seconds = dmsParts.length === 4 ? Number(dmsParts[2]) : 0

		// Validate that degrees, minutes, and seconds are numbers
		if (
			Number.isNaN(degrees) ||
			Number.isNaN(minutes) ||
			Number.isNaN(seconds) ||
			degrees < 0 ||
			degrees > 180 || // Valid degrees range
			minutes < 0 ||
			minutes >= 60 || // Valid minutes range
			seconds < 0 ||
			seconds >= 60 // Valid seconds range
		) {
			return 'Degrees, minutes, and seconds must be valid numbers'
		}

		// Validate direction
		if (!['N', 'S', 'E', 'W'].includes(direction)) {
			return 'Direction must be N, S, E, or W'
		}

		return true // Validation passed
	}

	// Validate both latitude and longitude
	const latValidation = validatePart(parts[0])
	const lonValidation = validatePart(parts[1])

	if (latValidation !== true) {
		return latValidation // Return error from latitude validation
	}

	if (lonValidation !== true) {
		return lonValidation // Return error from longitude validation
	}

	return true // Validation passed
}

// TODO: https://tina.io/docs/editing/blocks/
const IFrame = ({ embedCode }) => {
	return <div dangerouslySetInnerHTML={{ __html: embedCode }} />
}

export type MapType = 'Openstreetmaps' | 'GoogleGPS' | 'GoogleSearch' | 'GoogleGeneral'

const TinaEmbed = ({ latitude, longitude, mapType }) => {
	const [iframeMarkup, setIframeMarkup] = useState('')

	useEffect(() => {
		const fetchIframe = async () => {
			const markup = await getIframeFromCoordinates(latitude, longitude, mapType)
			setIframeMarkup(markup)
		}

		fetchIframe()
	}, [latitude, longitude, mapType])

	// TODO: https://tina.io/docs/editing/blocks/
	return <div dangerouslySetInnerHTML={{ __html: iframeMarkup }} />
}

const getIframeFromCoordinates = async (latitude: string, longitude: string, mapType: MapType) => {
	const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`

	try {
		const response = await fetch(url)
		const data = await response.json()
		const location = data.display_name

		// Calculate bounding box for the OSM iframe
		const bbox = {
			minLon: Number(longitude) - 0.001,
			minLat: Number(latitude) - 0.001,
			maxLon: Number(longitude) + 0.001,
			maxLat: Number(latitude) + 0.001,
		}

		let iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}&layer=mapnik&marker=${latitude},${longitude}`
		if (mapType === 'GoogleGPS') {
			iframeSrc = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${latitude},${longitude}`
		}
		if (mapType === 'GoogleSearch') {
			iframeSrc = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodeURI(location)}`
		}
		if (mapType === 'GoogleGeneral') {
			iframeSrc = `https://www.google.com/maps/embed/v1/search?key=${API_KEY}&q=${encodeURI(location)}&center=${latitude},${longitude}&zoom=17`
		}
		console.log('iframeSrc: ', iframeSrc)
		return `<h3>${location.split(/,(.*)/s)[0]}</h3><p>${location.split(/,(.*)/s)[1]}</p> <iframe loading="lazy" width="100%" height="300px" allowFullScreen src="${iframeSrc}"></iframe>`
	} catch (error) {
		console.error('Error fetching location:', error)
		return '<p>Location not found</p>'
	}
}

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

	const extractVideoIdFromUrl = (source: string) => {
		// Check if the source is a valid string
		if (!source || typeof source !== 'string') {
			console.error('Invalid source URL provided')
			return source
		}

		// Regular expression to capture the path + public ID (after /upload/v<version>)
		const regex = /\/upload\/v\d{8,12}\/(.+)\.[^/.]+/
		const matches = regex.exec(source)

		// Check if there was a match
		if (matches?.[1]) {
			return matches[1] // Return the directory/path and public ID
		}

		console.error('No match found in the provided URL')
		return source
	}

	const extractImageIdFromUrl = (source: string) => {
		const regex = /\/upload\/v\d{8,12}\/(.+)$/
		const matches = regex.exec(source)

		if (matches) {
			return matches[1]
		}

		return source
	}

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
					{/*<iframe width="100%" height="350" 
        src={"https://www.openstreetmap.org/export/embed.html?" 
        + "bbox=" + "103.84615302085876" 
        + "%2C"   + "1.2855071020885447" 
        + "%2C"   + "103.85844826698305" 
        + "%2C"   + "1.293465882410554"
        + "&amp;layer=mapnik"} />
      <small>
        <a target="_blank" href="https://www.openstreetmap.org/#map=17/1.289486/103.852301">
          View Larger Map
        </a>
      </small>*/}
					{/*<iframe 
      width="100%"
      height="350"
      src={`https://nominatim.openstreetmap.org/ui/reverse.html?lat=30.32967&lon=35.44303`}
      >
      </iframe>
      <iframe
      width="100%"
      height="350"
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      src={`https://www.google.com/maps/embed/v1/place?key=${API_KEY}
      &q=30%2019%20'45.49N,35%2026'%2034.86E
      `}>
      </iframe>
      <iframe 
      src="https://www.google.com/maps/d/embed?mid=1fgfekK1Q3ivRaapgnxDP4_UJhd9atos&ehbc=2E312F&noprof=1"
      width="100%" 
      height="350"
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      >
      </iframe>
      <iframe src = "https://maps.google.com/maps?q=10.305385,77.923029&hl=es;z=14&amp;output=embed"></iframe>
      */}
					<TinaEmbed {...convertDMSToDecimal(gpsCoordinates)} mapType={mapType} />
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

export { type LinkProps, TinaEmbed, TravelComponent, validateGPSCoordinates, IFrame }
