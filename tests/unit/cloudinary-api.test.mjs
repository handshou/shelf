import assert from 'node:assert/strict'
import { PassThrough } from 'node:stream'
import { beforeEach, mock, test } from 'node:test'

let authorize
let uploadCount = 0
let mediaAuthorization

const isAuthorized = async (request) => authorize(request)

mock.module('@tinacms/auth', {
	defaultExport: { isAuthorized },
	namedExports: { isAuthorized, isUserAuthorized: isAuthorized },
})
mock.module('cloudinary', {
	namedExports: {
		v2: {
			config() {},
			uploader: {
				upload_stream(_options, callback) {
					uploadCount++
					const stream = new PassThrough()
					stream.on('finish', () => callback(null, { public_id: 'travels/test' }))
					stream.resume()
					return stream
				},
			},
		},
	},
})
mock.module('next-tinacms-cloudinary/dist/handlers.js', {
	namedExports: {
		mediaHandlerConfig: {},
		createMediaHandler: ({ authorized }) => {
			mediaAuthorization = authorized
			return async (request, response) => {
				if (!(await authorized(request))) return response.status(401)
				return response.json([])
			}
		},
	},
})

const { POST } = await import('../../src/pages/api/cloudinary/[...media].ts')

beforeEach(() => {
	process.env.TINA_PUBLIC_CLIENT_ID = 'test-client'
	process.env.NODE_ENV = 'production'
	authorize = async () => undefined
	uploadCount = 0
})

const uploadRequest = () => {
	const form = new FormData()
	form.set('file', new File(['photo'], 'photo.jpg', { type: 'image/jpeg' }))
	form.set('directory', '/travels')
	const url = new URL('http://localhost/api/cloudinary/media?clientID=test-client')
	return {
		url,
		request: new Request(url, {
			method: 'POST',
			headers: { authorization: 'Bearer test-token' },
			body: form,
		}),
	}
}

test('upload rejects a missing user before reading or uploading the file', async () => {
	const context = uploadRequest()
	context.request.formData = () => {
		throw new Error('Unauthorized request body was read')
	}
	const response = await POST(context)
	assert.equal(response.status, 401)
	assert.equal(uploadCount, 0)
})

test('upload rejects an unverified user', async () => {
	authorize = async () => ({ verified: false })
	const response = await POST(uploadRequest())
	assert.equal(response.status, 401)
	assert.equal(uploadCount, 0)
})

test('upload waits for authorization before uploading', async () => {
	let resolveAuthorization
	authorize = () =>
		new Promise((resolve) => {
			resolveAuthorization = resolve
		})
	const responsePromise = POST(uploadRequest())
	await new Promise((resolve) => setImmediate(resolve))
	assert.equal(uploadCount, 0)
	resolveAuthorization({ verified: true })
	const response = await responsePromise
	assert.equal(response.status, 200)
	assert.equal(uploadCount, 1)
})

test('upload passes the bearer token and client ID to Tina authorization', async () => {
	authorize = async ({ token, clientID }) => {
		assert.equal(token, 'Bearer test-token')
		assert.equal(clientID, 'test-client')
		return { verified: true }
	}
	const response = await POST(uploadRequest())
	assert.equal(response.status, 200)
})

test('upload authenticates against the configured app rather than the query parameter', async () => {
	authorize = async ({ clientID }) => {
		assert.equal(clientID, 'test-client')
		return { verified: false }
	}
	const context = uploadRequest()
	context.url.searchParams.set('clientID', 'other-app')
	const response = await POST(context)
	assert.equal(response.status, 401)
	assert.equal(uploadCount, 0)
})

test('upload rejects a missing bearer token without contacting Tina', async () => {
	authorize = () => {
		throw new Error('Authorization should not be requested')
	}
	const context = uploadRequest()
	context.request.headers.delete('authorization')
	const response = await POST(context)
	assert.equal(response.status, 401)
	assert.equal(uploadCount, 0)
})

test('upload rejects a missing configured client ID', async () => {
	process.env.TINA_PUBLIC_CLIENT_ID = ''
	const response = await POST(uploadRequest())
	assert.equal(response.status, 401)
	assert.equal(uploadCount, 0)
})

test('upload fails closed when the authorization service fails', async () => {
	authorize = async () => {
		throw new Error('Authorization unavailable')
	}
	const response = await POST(uploadRequest())
	assert.equal(response.status, 401)
	assert.equal(uploadCount, 0)
})

test('media handler authorization fails closed when the service fails', async () => {
	authorize = async () => {
		throw new Error('Authorization unavailable')
	}
	const context = uploadRequest()
	assert.equal(await mediaAuthorization(context.request), false)
})
