import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const definition = JSON.parse(
	await readFile(new URL('../patches/astrojs-vercel-11.0.13.json', import.meta.url), 'utf8')
)
const hash = (source) => createHash('sha256').update(source).digest('hex')

export async function applyVercelRuntimePatch(directory) {
	const manifest = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'))
	if (manifest.name !== definition.package || manifest.version !== definition.version) {
		throw new Error(`Runtime patch requires ${definition.package}@${definition.version}`)
	}
	const updates = []
	for (const file of definition.files) {
		const target = path.join(directory, file.path)
		const source = await readFile(target, 'utf8').catch((error) => {
			if (error.code === 'ENOENT' && file.before === null) return null
			throw error
		})
		if (source !== null && hash(source) === file.after) continue
		if ((source === null ? null : hash(source)) !== file.before) {
			throw new Error(`Unexpected adapter source: ${file.path}`)
		}
		let result = file.content ?? source
		for (const replacement of file.replacements ?? []) {
			if (result.split(replacement.from).length !== 2) {
				throw new Error(`Adapter patch must match exactly once: ${file.path}`)
			}
			result = result.replace(replacement.from, replacement.to)
		}
		if (hash(result) !== file.after) {
			throw new Error(`Invalid adapter patch result: ${file.path}`)
		}
		updates.push({ target, result })
	}
	for (const { target, result } of updates) await writeFile(target, result)
	return updates.length
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
	const directory = fileURLToPath(new URL('../node_modules/@astrojs/vercel/', import.meta.url))
	const changed = await applyVercelRuntimePatch(directory)
	console.log(`Vercel runtime boundary patch: ${changed ? 'applied' : 'already applied'}`)
}
