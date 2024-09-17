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

export async function GET({ request }) { 
    request.query = { filesOnly: false, directory: '/' }

    return new Promise((resolve) => {
        try {
            handler(request, {
                status: (code: number) => {
                    resolve(
                        new Response(JSON.stringify({ status: code }), {
                            status: code,
                            headers: { 'Content-Type': 'application/json' }
                        })
                    );
                },
                json: (data) => {
                    resolve(
                        new Response(JSON.stringify(data), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        })
                    );
                }
            })
        } catch (err) {
        }
    })
}

export async function POST({ request }) {
  // Handle POST-specific logic, such as receiving form data or files
  const body = await request.json(); // Parse request body

  return new Promise((resolve) => {
    handler(request, {
      status: (code: number) => resolve(new Response(null, { status: code })),
      json: (data) => resolve(new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })),
    });
  });
}

export async function DELETE({ request }) {
  // Handle DELETE-specific logic, e.g., removing media
  const body = await request.json(); // Parse request body

  return new Promise((resolve) => {
    handler(request, {
      status: (code: number) => resolve(new Response(null, { status: code })),
      json: (data) => resolve(new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })),
    });
  });
}

