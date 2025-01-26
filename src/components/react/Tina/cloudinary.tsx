import { extractImageIdFromUrl, extractVideoIdFromUrl } from '@/lib/cloudinary.ts'
import { AdvancedImage, AdvancedVideo, lazyload, responsive } from '@cloudinary/react'
import { Cloudinary } from '@cloudinary/url-gen'
import { quality } from '@cloudinary/url-gen/actions/delivery'
import { format } from '@cloudinary/url-gen/actions/delivery'
import { auto } from '@cloudinary/url-gen/qualifiers/format'

const cld = new Cloudinary({
	cloud: {
		cloudName: 'dbifqlg1w',
	},
})

const myImage = (url: string) =>
	cld.image(extractImageIdFromUrl(url)).delivery(quality(70)).delivery(format(auto()))

const myVideo = (url: string) => cld.video(extractVideoIdFromUrl(url))

export const CldImage = ({ url }) => (
	<AdvancedImage
		className="ease-in duration-50 border-transparent border-2 -m-px mb-8 hover:border-1 hover:border-spacing-1 hover:border-orange-600"
		cldImg={myImage(url)}
		plugins={[lazyload(), responsive()]}
	/>
)

export const CldVideo = ({ videoUrl }) => (
	<AdvancedVideo cldVid={myVideo(videoUrl)} cldPoster="auto" controls plugins={[lazyload()]} />
)
