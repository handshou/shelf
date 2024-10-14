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
      folder: 'hanoi'
    })
  }),
  israel: defineCollection({
    loader: cldAssetsLoader({
      folder: 'travel/telaviv'
    })
  }),
  jordan: defineCollection({
    loader: cldAssetsLoader({
      folder: 'travel/jordan'
    })
  }),
  posts: postsCollection,
}
