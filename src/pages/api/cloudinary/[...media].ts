import { v2 as cloudinary } from 'cloudinary'
import { createCloudinaryUpload } from '../../../lib/cloudinary-upload.ts'
import { createMediaUploadRoute } from '../../../lib/media-upload-route.ts'

import { isUserAuthorized } from '@tinacms/auth'
import { createMediaHandler, mediaHandlerConfig } from 'next-tinacms-cloudinary/dist/handlers.js'

import type { APIRoute } from 'astro'
interface CustomRequest extends Request {
	query: {
		filesOnly?: string | boolean
		directory?: string
		limit?: string
		offset?: string
		clientID?: string
		media?: [string, string]
	}
}

export const config = mediaHandlerConfig

const isMediaAuthorized = async (request: Request): Promise<boolean> => {
	const clientID = process.env.TINA_PUBLIC_CLIENT_ID
	const token = request.headers.get('authorization')
	if (!clientID || !token?.startsWith('Bearer ')) return false

	try {
		const user = await isUserAuthorized({ clientID, token })
		return user?.verified === true
	} catch {
		return false
	}
}

cloudinary.config({
	cloud_name: process.env.PUBLIC_CLOUDINARY_CLOUD_NAME || '',
	api_key: process.env.PUBLIC_CLOUDINARY_API_KEY || '',
	api_secret: process.env.CLOUDINARY_API_SECRET || '',
})

const handler = createMediaHandler({
	cloud_name: process.env.PUBLIC_CLOUDINARY_CLOUD_NAME || '',
	api_key: process.env.PUBLIC_CLOUDINARY_API_KEY || '',
	api_secret: process.env.CLOUDINARY_API_SECRET || '',
	authorized: async (req, _res): Promise<boolean> => {
		if (process.env.NODE_ENV === 'development') return true
		return isMediaAuthorized(req as CustomRequest)
	},
})

const setupRequest = (request: CustomRequest, url: URL) => {
	const params = new URLSearchParams(url.search)

	// Example: Get a specific query parameter, e.g., 'filesOnly'
	const filesOnly = params.get('filesOnly') || false
	const directory = params.get('directory') || '/'
	const limit = params.get('limit') || ''
	const offset = params.get('offset') || ''
	const clientID = params.get('clientID') || ''
	const mediaId = decodeURIComponent(url.pathname.split('/').pop() || '')

	const media = ['media', mediaId] as [string, string]

	// Add the parsed query to the request object
	request.query = { filesOnly, directory, limit, offset, clientID, media }
}

export const GET: APIRoute = ({ request: req, url }) => {
	const request = req as CustomRequest
	setupRequest(request, url)
	return new Promise((resolve) => {
		handler(request, {
			status: (code: number) => resolve(new Response(null, { status: code })),
			json: (data: []) =>
				resolve(
					new Response(JSON.stringify(data), {
						status: 200,
						headers: { 'Content-Type': 'application/json' },
					})
				),
		})
	})
}

export const POST = createMediaUploadRoute({
	authorize: isMediaAuthorized,
	upload: createCloudinaryUpload((options, callback) =>
		cloudinary.uploader.upload_stream(options, callback)
	),
})

export const DELETE: APIRoute = ({ request: req, url }) => {
	const request = req as CustomRequest
	setupRequest(request, url)

	// Extract 'sample' from '/api/cloudinary/media/sample'
	const mediaId = decodeURIComponent(url.pathname.split('/').pop() || '')
	if (!mediaId) {
		return new Response(JSON.stringify({ error: 'Media ID is missing' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		})
	}
	console.log('[DELETE]')
	console.log('pathname: ', url.pathname)
	console.log('mediaId: ', mediaId)
	console.table(request)

	return new Promise((resolve, reject) => {
		try {
			handler(request, {
				status: (code: number) => resolve(new Response(null, { status: code })),
				json: (data: []) =>
					resolve(
						new Response(JSON.stringify(data), {
							status: 200,
							headers: { 'Content-Type': 'application/json' },
						})
					),
			})
		} catch (err) {
			console.error('Error in DELETE handler:', JSON.stringify(err, null, 2))
			reject(
				new Response(JSON.stringify({ error: 'Delete operation failed' }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' },
				})
			)
		}
	})
}
