import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { pathToFileURL } from 'node:url'
import { applyVercelRuntimePatch } from '../../scripts/patch-vercel-runtime.mjs'

const root = path.resolve(import.meta.dirname, '../..')
const definition = JSON.parse(
	await readFile(path.join(root, 'patches/astrojs-vercel-11.0.13.json'), 'utf8')
)
const hash = (source) => createHash('sha256').update(source).digest('hex')

const fixture = async (run) => {
	const directory = await mkdtemp(path.join(os.tmpdir(), 'shelf-adapter-patch-'))
	try {
		await writeFile(
			path.join(directory, 'package.json'),
			JSON.stringify({ name: definition.package, version: definition.version, type: 'module' })
		)
		for (const file of definition.files) {
			if (file.before === null) continue
			let source = await readFile(
				path.join(root, 'node_modules/@astrojs/vercel', file.path),
				'utf8'
			)
			if (hash(source) === file.after) {
				for (const replacement of [...file.replacements].reverse()) {
					source = source.replace(replacement.to, replacement.from)
				}
			}
			assert.equal(hash(source), file.before)
			const target = path.join(directory, file.path)
			await mkdir(path.dirname(target), { recursive: true })
			await writeFile(target, source)
		}
		await run(directory)
	} finally {
		await rm(directory, { recursive: true, force: true })
	}
}

test('adapter patch isolates runtime constants and preserves their values', async () => {
	await fixture(async (directory) => {
		assert.equal(await applyVercelRuntimePatch(directory), 4)
		const constants = await import(pathToFileURL(path.join(directory, 'dist/routing-constants.js')))
		assert.deepEqual(
			{ ...constants },
			{
				ASTRO_LOCALS_HEADER: 'x-astro-locals',
				ASTRO_MIDDLEWARE_SECRET_HEADER: 'x-astro-middleware-secret',
				ASTRO_PATH_HEADER: 'x-astro-path',
				ASTRO_PATH_PARAM: 'x_astro_path',
				ASTRO_PATH_TOKEN_PARAM: 'x_astro_path_token',
				NODE_PATH: '_render',
				VERCEL_EDGE_MIDDLEWARE_FILE: 'vercel-edge-middleware',
			}
		)
		for (const file of definition.files) {
			assert.equal(hash(await readFile(path.join(directory, file.path), 'utf8')), file.after)
		}
	})
})

test('adapter patch is idempotent', async () => {
	await fixture(async (directory) => {
		await applyVercelRuntimePatch(directory)
		assert.equal(await applyVercelRuntimePatch(directory), 0)
	})
})

test('adapter patch rejects unsupported versions', async () => {
	await fixture(async (directory) => {
		await writeFile(
			path.join(directory, 'package.json'),
			JSON.stringify({ name: definition.package, version: '11.0.14' })
		)
		await assert.rejects(applyVercelRuntimePatch(directory), /Runtime patch requires/)
	})
})

test('adapter patch rejects modified sources before writing any changes', async () => {
	await fixture(async (directory) => {
		const index = path.join(directory, 'dist/index.js')
		const original = await readFile(index, 'utf8')
		const entrypoint = path.join(directory, 'dist/serverless/entrypoint.js')
		await writeFile(entrypoint, `${await readFile(entrypoint, 'utf8')}\n`)
		await assert.rejects(applyVercelRuntimePatch(directory), /Unexpected adapter source/)
		assert.equal(await readFile(index, 'utf8'), original)
	})
})
