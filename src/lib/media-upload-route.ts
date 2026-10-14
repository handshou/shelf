import type { APIRoute } from 'astro'
import type { MediaUpload, MediaUploadResult } from './cloudinary-upload.ts'

type UploadBoundary = {
	readonly authorize: (request: Request) => Promise<boolean>
	readonly upload: (input: MediaUpload) => Promise<MediaUploadResult>
}

class InvalidMediaUpload extends Error {
	readonly _tag = 'InvalidMediaUpload' as const

	readonly cause: unknown

	constructor(cause?: unknown) {
		super('Expected a file and a directory in multipart form data')
		this.cause = cause
	}
}

const parseUpload = async (
	request: Request
): Promise<
	| { readonly _tag: 'ok'; readonly value: MediaUpload }
	| { readonly _tag: 'err'; readonly error: InvalidMediaUpload }
> => {
	try {
		const form = await request.formData()
		const file = form.get('file')
		const directory = form.get('directory')
		if (!(file instanceof File) || typeof directory !== 'string') {
			return { _tag: 'err', error: new InvalidMediaUpload() }
		}
		return { _tag: 'ok', value: { file, folder: directory.replace(/^\//, '') } }
	} catch (cause) {
		return { _tag: 'err', error: new InvalidMediaUpload(cause) }
	}
}

export const createMediaUploadRoute =
	({ authorize, upload }: UploadBoundary): APIRoute =>
	async ({ request }) => {
		if (!(await authorize(request))) {
			return Response.json({ message: 'sorry this user is unauthorized' }, { status: 401 })
		}
		const input = await parseUpload(request)
		if (input._tag === 'err') {
			return Response.json({ message: input.error.message }, { status: 400 })
		}
		const result = await upload(input.value)
		if (result._tag === 'err') {
			console.error('Media upload failed', {
				tag: result.error._tag,
				provider: result.error.provider,
				operation: result.error.operation,
			})
			return Response.json({ message: result.error.message }, { status: 502 })
		}
		return Response.json(result.value)
	}
