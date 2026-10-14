import { Readable, type Writable } from 'node:stream'

export type MediaUpload = {
	readonly file: File
	readonly folder: string
}

type UploadedMedia = {
	readonly public_id: string
	readonly secure_url: string
	readonly original_filename: string
}

export class MediaUploadUnavailable extends Error {
	readonly _tag = 'MediaUploadUnavailable' as const
	readonly provider = 'cloudinary' as const
	readonly operation = 'upload' as const

	readonly cause: unknown

	constructor(cause: unknown) {
		super('Media upload failed')
		this.cause = cause
	}
}

export type MediaUploadResult =
	| { readonly _tag: 'ok'; readonly value: UploadedMedia }
	| { readonly _tag: 'err'; readonly error: MediaUploadUnavailable }

type UploadStream = (
	options: {
		folder: string
		use_filename: boolean
		resource_type: 'auto'
		overwrite: boolean
	},
	callback: (error?: unknown, result?: unknown) => void
) => Writable

export const createCloudinaryUpload =
	(uploadStream: UploadStream) =>
	async ({ file, folder }: MediaUpload): Promise<MediaUploadResult> => {
		try {
			const buffer = Buffer.from(await file.arrayBuffer())
			return await new Promise<MediaUploadResult>((resolve) => {
				const fail = (cause: unknown) =>
					resolve({ _tag: 'err', error: new MediaUploadUnavailable(cause) })
				const destination = uploadStream(
					{ folder, use_filename: true, resource_type: 'auto', overwrite: false },
					(error, result) => {
						if (error) return fail(error)
						if (
							typeof result !== 'object' ||
							result === null ||
							!('public_id' in result) ||
							typeof result.public_id !== 'string' ||
							!('secure_url' in result) ||
							typeof result.secure_url !== 'string' ||
							!('original_filename' in result) ||
							typeof result.original_filename !== 'string'
						) {
							return fail(new Error('Invalid upload response'))
						}
						resolve({
							_tag: 'ok',
							value: {
								...result,
								public_id: result.public_id,
								secure_url: result.secure_url,
								original_filename: result.original_filename,
							},
						})
					}
				)
				destination.on('error', fail)
				Readable.from(buffer).pipe(destination)
			})
		} catch (cause) {
			return { _tag: 'err', error: new MediaUploadUnavailable(cause) }
		}
	}
