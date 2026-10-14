import { expect, test } from '@playwright/test'

test('upload HTTP entrypoint rejects malformed unauthenticated bodies with JSON', async ({
	request,
}) => {
	const response = await request.post('/api/cloudinary/media', {
		data: 'not multipart',
		headers: { 'Content-Type': 'text/plain' },
	})
	expect(response.status()).toBe(401)
	expect(await response.json()).toEqual({ message: 'sorry this user is unauthorized' })
})

test('upload HTTP entrypoint rejects a real multipart file without credentials', async ({
	request,
}) => {
	const response = await request.post('/api/cloudinary/media?clientID=untrusted-app', {
		multipart: {
			file: { name: 'photo.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('photo') },
			directory: '/travels',
		},
	})
	expect(response.status()).toBe(401)
	expect(await response.json()).toEqual({ message: 'sorry this user is unauthorized' })
})
