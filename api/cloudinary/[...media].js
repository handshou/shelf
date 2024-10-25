import { createMediaHandler, mediaHandlerConfig } from 'next-tinacms-cloudinary/dist/handlers.js'

import pkg from '@tinacms/auth'
const { isAuthorized } = pkg

export const config = mediaHandlerConfig

export default createMediaHandler({
	cloud_name: process.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.PUBLIC_CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	authorized: async (req, _res) => {
		try {
			if (process.env.NODE_ENV == 'development') {
				return true
			}

			const user = await isAuthorized(req)

			return user?.verified || false
		} catch (e) {
			console.error(e)
			return false
		}
	},
})
