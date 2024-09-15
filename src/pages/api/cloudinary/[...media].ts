import {
  mediaHandlerConfig,
  createMediaHandler,
} from 'next-tinacms-cloudinary/dist/handlers'

import pkg from '@tinacms/auth';

const { isAuthorized } = pkg;

export async function POST({request, response, params}) {
    const { clientID } = params;
    console.log(clientID);
    return mediaHandler(request, response)
}

export async function DELETE({request, response, params}) {
    const { clientID } = params;
    console.log(clientID);
    return mediaHandler(request, response)
}

export async function GET({request, response, params}) {
    const { clientID } = params;
    console.log(clientID);
    return mediaHandler(request, response)
}

export const config = mediaHandlerConfig

const mediaHandler = createMediaHandler({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  authorized: async (req, _res): Promise<boolean> => {
    try {
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
