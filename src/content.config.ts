import { defineCollection, z } from 'astro:content'
import { client } from '@tina/__generated__/client.ts'
import type { LoaderContext } from 'astro/loaders'
import { v2 as cloudinary } from 'cloudinary'

const travels = defineCollection({
	loader: async (context: LoaderContext) => {
		const travelsResponse = await client.queries.travelsConnection()
		return travelsResponse.data.travelsConnection.edges
			?.filter((travel) => !!travel)
			.map((travel) => {
				return {
					...travel?.node,
					// Astro 6 getEntry matches ids exactly (no legacy slug
					// fallback), so key entries by filename, not Tina's path id
					id: travel?.node?._sys?.filename ?? travel?.node?.id,
					tinaInfo: travel.node?._sys,
				}
			})
	},
	schema: z.object({
		title: z.string(),
		published: z.boolean().nullish(),
		pubDate: z.union([z.null(), z.undefined(), z.string(), z.date()]),
		description: z.string(),
	}),
})

const hasCloudinaryCreds = !!(
	(import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.PUBLIC_CLOUDINARY_CLOUD_NAME) &&
	(import.meta.env.PUBLIC_CLOUDINARY_API_KEY || process.env.PUBLIC_CLOUDINARY_API_KEY) &&
	(import.meta.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET)
)

// Replaces astro-cloudinary's cldAssetsLoader (peers only allow astro <=5).
// The account uses fixed folder mode, so assets are listed by public_id prefix.
const cldAssetsLoader = (folder: string, limit: number) => async () => {
	cloudinary.config({
		cloud_name:
			import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
		api_key: import.meta.env.PUBLIC_CLOUDINARY_API_KEY ?? process.env.PUBLIC_CLOUDINARY_API_KEY,
		api_secret: import.meta.env.CLOUDINARY_API_SECRET ?? process.env.CLOUDINARY_API_SECRET,
	})

	type CldResource = {
		public_id: string
		folder: string
		width: number
		height: number
		secure_url: string
		bytes: number
		placeholder?: boolean
		last_updated?: Record<string, string>
	}
	const assets: CldResource[] = []
	let nextCursor: string | undefined
	do {
		const response = await cloudinary.api.resources({
			type: 'upload',
			resource_type: 'image',
			prefix: folder,
			max_results: 500,
			next_cursor: nextCursor,
		})
		// placeholder assets (bytes: 0) 404 on delivery
		const deliverable = (response.resources as CldResource[]).filter(
			(asset) => !asset.placeholder && asset.bytes > 0
		)
		assets.push(...deliverable.slice(0, limit - assets.length))
		nextCursor = response.next_cursor
	} while (nextCursor && assets.length < limit)

	return assets.map((asset) => ({
		id: asset.public_id,
		public_id: asset.public_id,
		folder: asset.folder,
		width: asset.width,
		height: asset.height,
		secure_url: asset.secure_url,
		last_updated: asset.last_updated,
	}))
}

const cldCollection = (folder: string, limit: number) =>
	defineCollection({
		loader: hasCloudinaryCreds
			? cldAssetsLoader(folder, limit)
			: async () => {
					console.warn(`[content] Cloudinary credentials missing; "${folder}" collection is empty`)
					return []
				},
	})

const hanoi = cldCollection('travels/hanoi', 5)
const israel = cldCollection('travels/israel', 5)
const jordan = cldCollection('travels/jordan', 5)
const taipei = cldCollection('travels/taipei', 5)
const fukuoka = cldCollection('travels/fukuoka', 40)
const tokyo = cldCollection('travels/tokyo', 40)

export const collections = {
	travels,
	hanoi,
	israel,
	jordan,
	taipei,
	fukuoka,
	tokyo,
}
