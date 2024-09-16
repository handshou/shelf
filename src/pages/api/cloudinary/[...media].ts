import {
  mediaHandlerConfig,
  createMediaHandler,
} from 'next-tinacms-cloudinary/dist/handlers'

import { isAuthorized } from '@tinacms/auth';

export const config = mediaHandlerConfig

const mediaHandler = createMediaHandler({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  authorized: async (req, _res): Promise<boolean> => {
    try {
        console.log(process.env.NODE_ENV);
      if (process.env.NODE_ENV == 'development') {
        return true
      }

      const user = await isAuthorized(req)

      return user ? user.verified : false;
    } catch (e) {
      console.error(e)
      return false
    }
  },
})

export async function POST() {
    return mediaHandler
}

export async function DELETE({request, response}) {
    return mediaHandler(request, response)
}

export async function GET({params}) {
    console.log(params);
  return mediaHandler
}
