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
            const user = await isAuthorized(req);

            return user ? user.verified : false;
        } catch (e) {
            console.error(e)
            return false
        }
    },
})

const setupRequest = (request, url) => {
    const params = new URLSearchParams(url.search)

    // Example: Get a specific query parameter, e.g., 'filesOnly'
    const filesOnly = params.get('filesOnly') || false
    const directory = params.get('directory') || '/'
    const limit = params.get('limit') || ''
    const offset = params.get('offset') || ''
    const clientID = params.get('clientID') || ''

    // Retrieve the authorization token from headers
    const authorization = request.headers.get('authorization');

    let token = null
    if (authorization && authorization.startsWith('Bearer ')) {
        token = authorization
    }
    // Pass the token into the request object or handle it as needed
    request.headers.authorization = token

    // Add the parsed query to the request object
    request.query = { filesOnly, directory, limit, offset, clientID };
}

export async function GET({ request, url }) { 
    setupRequest(request, url);
    return new Promise((resolve) => {
        try {
            handler(request, {
                status: (code: number) => {
                    resolve(
                        new Response(
                            JSON.stringify({ status: code }), {
                                status: code,
                                headers: { 'Content-Type': 'application/json' }
                            })
                    )
                },
                json: (data) => {
                    resolve(
                        new Response(
                            JSON.stringify(data), {
                                status: 200,
                                headers: { 'Content-Type': 'application/json' }
                            })
                    )
                }
            })
        } catch (err) {
        }
    })
}

export async function POST({ ...options  }) {
    const {request, url} = options;

    // Handle POST-specific logic, such as receiving form data or files
    // const body = await request.json(); // Parse request body

    setupRequest(request, url)

    const formData = await request.formData();
    const file = formData.get("file")
    const directory = formData.get("directory")
    const filename = formData.get("filename")
    console.log('received file: ', file)
    console.log('received directory: ', directory)
    console.log('received filename: ', filename)

    request.file = file;
    request.directory = directory;

    return new Promise((resolve, reject) => {
        try {
            handler(request, {
                status: (code: number) => 
                resolve(
                    new Response(
                        null, { 
                            status: code 
                        })
                ),
                json: (data) => 
                resolve(
                    new Response(
                        JSON.stringify(data), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        })
                ),
                body: (body) =>
                resolve(
                    new Response(
                        JSON.stringify(body), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        })
                ),
            });
        } catch (err) {
            reject()
        }
    });
}

export async function DELETE({ request, url }) {
  setupRequest(request, url)

  // Handle DELETE-specific logic, e.g., removing media
  // const body = await request.json(); // Parse request body

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

