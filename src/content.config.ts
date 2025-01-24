import { z, defineCollection } from 'astro:content'
import { cldAssetsLoader } from 'astro-cloudinary/loaders'
import { client } from '@tina/__generated__/client'
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
        published: z.boolean(),
        pubDate: z.union([z.null(), z.undefined(), z.string(), z.date()]),
        description: z.string(),
    }),
}

const hanoi = defineCollection({
    loader: cldAssetsLoader({
        folder: 'travels/hanoi',
        limit: 5,
        fields: ['last_updated', 'width', 'height', 'secure_url'],
    }),
})

const israel = defineCollection({
    loader: cldAssetsLoader({
        folder: 'travels/israel',
        limit: 5,
        fields: ['last_updated', 'width', 'height', 'secure_url'],
    }),
})

const jordan = defineCollection({
    loader: cldAssetsLoader({
        folder: 'travels/jordan',
        limit: 5,
        fields: ['last_updated', 'width', 'height', 'secure_url'],
    }),
})

const taipei = defineCollection({
    loader: cldAssetsLoader({
        folder: 'travels/taipei',
        limit: 5,
        fields: ['last_updated', 'width', 'height', 'secure_url'],
    }),
})

const fukuoka = defineCollection({
    loader: cldAssetsLoader({
        folder: 'travels/fukuoka',
        limit: 5,
        fields: ['last_updated', 'width', 'height', 'secure_url'],
    }),
})

const tokyo = defineCollection({
    loader: cldAssetsLoader({
        folder: 'travels/tokyo',
        limit: 5,
        fields: ['last_updated', 'width', 'height', 'secure_url'],
    }),
})

export const collections = {
    travels,
    hanoi,
    israel,
    jordan,
    taipei,
    fukuoka,
    tokyo,
}
