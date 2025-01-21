import { defineCollection, z } from 'astro:content'
import { cldAssetsLoader } from 'astro-cloudinary/loaders'

const postsCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		pubDate: z.union([z.null(), z.undefined(), z.string(), z.date()]),
		description: z.string(),
	}),
})

export const collections = {
	taipei: defineCollection({
		loader: cldAssetsLoader({
			folder: 'travels/taipei',
			limit: 20,
			fields: ['last_updated', 'width', 'height', 'secure_url'],
		}),
	}),
	fukuoka: defineCollection({
		loader: cldAssetsLoader({
			folder: 'travels/fukuoka',
			limit: 20,
			fields: ['last_updated', 'width', 'height', 'secure_url'],
		}),
	}),
	tokyo: defineCollection({
		loader: cldAssetsLoader({
			folder: 'travels/tokyo',
			limit: 20,
			fields: ['last_updated', 'width', 'height', 'secure_url'],
		}),
	}),
	hanoi: defineCollection({
		loader: cldAssetsLoader({
			folder: 'travels/hanoi',
			limit: 15,
			fields: ['last_updated', 'width', 'height', 'secure_url'],
		}),
	}),
	israel: defineCollection({
		loader: cldAssetsLoader({
			folder: 'travels/israel',
			limit: 15,
			fields: ['last_updated', 'width', 'height', 'secure_url'],
		}),
	}),
	jordan: defineCollection({
		loader: cldAssetsLoader({
			folder: 'travels/jordan',
			limit: 20,
			fields: ['last_updated', 'width', 'height', 'secure_url'],
		}),
	}),
	posts: postsCollection,
}
