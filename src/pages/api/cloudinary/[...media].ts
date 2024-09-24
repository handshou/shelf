import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

import {
    mediaHandlerConfig,
    createMediaHandler,
} from 'next-tinacms-cloudinary/dist/handlers'
import auth from '@tinacms/auth'

import type { APIRoute } from 'astro'
interface CustomRequest extends Request {
    query: {
        filesOnly?: string | boolean,
        directory?: string,
        limit?: string,
        offset?: string,
        clientID?: string,
        media?: [string, string],
    }
}

export const config = mediaHandlerConfig

const { isAuthorized } = auth

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
})

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

            return user ? user.verified : false
        } catch (e) {
            console.error(e)
            return false
        }
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

    // Retrieve the authorization token from headers
    const authorization = request.headers.get('authorization')

    let token = ''
    if (authorization && authorization.startsWith('Bearer ')) {
        token = authorization
    }
    // Pass the token into the request object or handle it as needed
    // @ts-expect-error
    request.headers.authorization = token

    // Add the parsed query to the request object
    request.query = { filesOnly, directory, limit, offset, clientID }
}

export const GET: APIRoute = ({ request: req, url }) => { 
    const request = req as CustomRequest
    setupRequest(request, url)
    return new Promise((resolve) => {
        handler(request, {
            status: (code: number) => 
            resolve(
                new Response(null, { status: code })
            ),
            json: (data: any) => 
            resolve(
                new Response(JSON.stringify(data), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }})
            ),

        })
    })
}

export const POST: APIRoute = async ({ request: req, url }) => {
  const request = req as CustomRequest
  setupRequest(request, url)

  if(!isAuthorized(request)) {
      return new Response(
          JSON.stringify({ message: "sorry this user is unauthorized" }), 
          {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
          }
      )
  }

  // Retrieve the formData from the request
  const formData = await request.formData()
  const file = formData.get('file') as File 
  const directory = formData.get('directory') as string

  if (!file || !file.arrayBuffer) {
    return new Response(JSON.stringify({ error: 'No file uploaded or invalid file type' }), { status: 400 })
  }

  // Convert the file to an ArrayBuffer
  const arrayBuffer = await file.arrayBuffer()

  // Convert the ArrayBuffer to a Buffer (Node.js)
  const buffer = Buffer.from(arrayBuffer)

  // Create a readable stream from the buffer
  const stream = Readable.from(buffer)

  // Cloudinary upload stream
  return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
          { 
              folder: directory.replace(/^\//, ''), 
                  use_filename: true, 
              resource_type: 'auto', 
              overwrite: false, 
          },
          (error, result) => {
              if (error) {
                  console.error('Cloudinary upload error:', error)
                  reject(new Response(JSON.stringify({ error: error.message }), { status: 500 }))
              } else {
                  resolve(new Response(JSON.stringify(result), {
                      status: 200,
                      headers: { 'Content-Type': 'application/json' },
                  }))
              }
          }
      )

      // Pipe the stream to Cloudinary
      stream.pipe(uploadStream)
  })
}

export const DELETE: APIRoute = ({ request: req, url }) => {
    const request = req as CustomRequest
    setupRequest(request, url)

    // Extract 'sample' from '/api/cloudinary/media/sample'
    const mediaId = decodeURIComponent(url.pathname.split('/').pop()||'') 
    if (!mediaId) {
        return new Response(JSON.stringify({ error: "Media ID is missing" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        })
    }
    console.log("[DELETE]")
    console.log("pathname: ", url.pathname)
    console.log("mediaId: ", mediaId)

    request.query = { media: ['media', mediaId] }
    return new Promise((resolve, reject) => {
        try {
            handler(request, {
                status: (code: number) => 
                resolve(
                    new Response(null, { status: code })
                ),
                json: (data: any) => 
                resolve(
                    new Response(JSON.stringify(data), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }})
                ),
            })
        } catch (err) {
            console.error('Error in DELETE handler:', JSON.stringify(err, null, 2))
            reject(new Response(JSON.stringify({ error: 'Delete operation failed' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }))
        }
    })
}

