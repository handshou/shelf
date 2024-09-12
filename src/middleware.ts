import { defineMiddleware } from "astro:middleware"

const cachingMiddleware = defineMiddleware(async ({ request }, next) => {

    const cacheName = 'default'

    const cache = await caches.open(cacheName)

    const cachedResponse = await cache.match(request)

    if (cachedResponse) return cachedResponse

    else {
        const response = await next()

        await cache.put(request, response.clone())

        return response
    }
})

export const onRequest =
    globalThis.cache
        ? cachingMiddleware
        : (_, next) => next()

