import { z, defineCollection } from 'astro:content'
import { cldAssetsLoader } from 'astro-cloudinary/loaders'
import { client } from '@tina/__generated__/client.ts'
import type { LoaderContext } from "astro/loaders";

const travels = {
    loader: async (context: LoaderContext) => {
        const travelsResponse = await client.queries.travelsConnection()
        return travelsResponse.data.travelsConnection.edges
            ?.filter((travel) => !!travel)
            .map((travel) => {
                return {
                    ...travel?.node,
                    id: travel?.node?.id,
                    tinaInfo: travel.node?._sys,
                }
            })
    },
    schema: z.object({
        title: z.string(),
        published: z.boolean().optional(),
        pubDate: z.union([z.null(), z.undefined(), z.string(), z.date()]),
        description: z.string(),
    }),
}

const hasCloudinaryCreds = !!(
    (import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.PUBLIC_CLOUDINARY_CLOUD_NAME) &&
    (import.meta.env.PUBLIC_CLOUDINARY_API_KEY || process.env.PUBLIC_CLOUDINARY_API_KEY) &&
    (import.meta.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET)
)

const cldCollection = (folder: string, limit: number) =>
    defineCollection({
        loader: hasCloudinaryCreds
            ? cldAssetsLoader({
                folder,
                limit,
                fields: ['last_updated', 'width', 'height', 'secure_url'],
            })
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
