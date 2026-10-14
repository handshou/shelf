import assert from 'node:assert/strict'
import { PassThrough, Writable } from 'node:stream'
import { test } from 'node:test'
import { createCloudinaryUpload } from '../../src/lib/cloudinary-upload.ts'
import { createMediaUploadRoute } from '../../src/lib/media-upload-route.ts'

const uploaded = {
	public_id: 'travels/photo',
	secure_url: 'https://example.com/photo.jpg',
	original_filename: 'photo',
	width: 20,
}

const context = (body, headers) => ({
	request: new Request('http://localhost/api/cloudinary/media', {
		method: 'POST',
		body,
		headers,
	}),
})

const form = () => {
	const body = new FormData()
	body.set('file', new File(['photo bytes'], 'photo.jpg', { type: 'image/jpeg' }))
	body.set('directory', '/travels')
	return body
}

const boundary = (uploadStream) =>
	createMediaUploadRoute({
		authorize: async () => true,
		upload: createCloudinaryUpload(uploadStream),
	})

const noUpload = () => {
	assert.fail('Invalid or unauthorized input reached Cloudinary')
}

test('unauthorized malformed uploads are rejected before parsing', async () => {
	const route = createMediaUploadRoute({
		authorize: async () => false,
		upload: noUpload,
	})
	const response = await route(context('not multipart'))
	assert.equal(response.status, 401)
})

test('authorization completes before multipart parsing and uploading', async () => {
	let release
	const route = createMediaUploadRoute({
		authorize: () =>
			new Promise((resolve) => {
				release = resolve
			}),
		upload: noUpload,
	})
	const response = route(context('not multipart'))
	await new Promise((resolve) => setImmediate(resolve))
	release(false)
	assert.equal((await response).status, 401)
})

for (const field of ['file', 'directory']) {
	test(`missing ${field} produces a JSON 400 without uploading`, async () => {
		const body = form()
		body.delete(field)
		const response = await boundary(noUpload)(context(body))
		assert.equal(response.status, 400)
		assert.equal(typeof (await response.json()).message, 'string')
	})
}

for (const [field, value] of [
	['file', 'not a file'],
	['directory', new File(['folder'], 'folder.txt')],
]) {
	test(`wrong multipart type for ${field} produces a JSON 400`, async () => {
		const body = form()
		body.set(field, value)
		const response = await boundary(noUpload)(context(body))
		assert.equal(response.status, 400)
		assert.equal(typeof (await response.json()).message, 'string')
	})
}

for (const headers of [undefined, { 'content-type': 'multipart/form-data; boundary=missing' }]) {
	test(`malformed body with ${JSON.stringify(headers)} produces a JSON 400`, async () => {
		const response = await boundary(noUpload)(context('invalid', headers))
		assert.equal(response.status, 400)
		assert.equal(typeof (await response.json()).message, 'string')
	})
}

test('real multipart upload preserves bytes, Cloudinary options, and Tina response fields', async () => {
	let record
	const route = boundary((options, callback) => {
		const chunks = []
		return new Writable({
			write(chunk, _encoding, done) {
				chunks.push(chunk)
				done()
			},
			final(done) {
				record = { options, bytes: Buffer.concat(chunks).toString() }
				callback(null, uploaded)
				done()
			},
		})
	})
	const response = await route(context(form()))
	assert.equal(response.status, 200)
	assert.deepEqual(await response.json(), uploaded)
	assert.deepEqual(record, {
		options: { folder: 'travels', use_filename: true, resource_type: 'auto', overwrite: false },
		bytes: 'photo bytes',
	})
})

test('root directory remains a supported upload destination', async () => {
	const body = form()
	body.set('directory', '/')
	const route = boundary((options, callback) => {
		assert.equal(options.folder, '')
		const stream = new PassThrough()
		stream.on('finish', () => callback(null, uploaded))
		stream.resume()
		return stream
	})
	assert.equal((await route(context(body))).status, 200)
})

for (const mode of ['throw', 'callback', 'stream', 'missing result', 'invalid result']) {
	test(`provider ${mode} failure resolves to a safe JSON response`, async () => {
		const secret = new Error('private provider credential')
		const route = boundary((_options, callback) => {
			if (mode === 'throw') throw secret
			const stream = new PassThrough()
			stream.on('finish', () => {
				if (mode === 'callback') callback(secret)
				else if (mode === 'stream') stream.destroy(secret)
				else callback(null, mode === 'invalid result' ? { public_id: 42 } : undefined)
			})
			stream.resume()
			return stream
		})
		const response = await route(context(form()))
		assert.equal(response.status, 502)
		assert.deepEqual(await response.json(), { message: 'Media upload failed' })
	})
}

test('file read failure is a tagged adapter outcome', async () => {
	const file = new File(['photo'], 'photo.jpg')
	file.arrayBuffer = async () => {
		throw new Error('read failed')
	}
	const result = await createCloudinaryUpload(noUpload)({ file, folder: 'travels' })
	assert.equal(result._tag, 'err')
	assert.equal(result.error._tag, 'MediaUploadUnavailable')
	assert.equal(result.error.operation, 'upload')
})
