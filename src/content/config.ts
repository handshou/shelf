import { defineCollection, z } from 'astro:content'
import { cldAssetsLoader } from 'astro-cloudinary/loaders'

const postsCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		pubDate: z.union([z.date(), z.string()]),
		description: z.string(),
	}),
})

export const collections = {
	hanoi: defineCollection({
		loader: cldAssetsLoader({
			folder: 'travels/hanoi',
			limit: 40,
		}),
	}),
	israel: defineCollection({
		loader: cldAssetsLoader({
			folder: 'travels/israel',
			limit: 20,
		}),
	}),
	jordan: defineCollection({
		loader: cldAssetsLoader({
			folder: 'travels/jordan',
			limit: 30,
		}),
	}),
	posts: postsCollection,
}
