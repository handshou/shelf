import {
  mediaHandlerConfig,
  createMediaHandler,
} from 'next-tinacms-cloudinary/dist/handlers'

import auth from '@tinacms/auth';

const { isAuthorized } = auth;

export const config = mediaHandlerConfig

const handler = createMediaHandler({
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

export async function GET({ params }) { 
    console.table(params)

    return new Response(
        JSON.stringify(handler), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}
