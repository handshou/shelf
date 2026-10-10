import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { mock, test } from 'node:test'
import { pathToFileURL } from 'node:url'
import { validateSchema } from '@tinacms/schema-tools'
import { build } from 'esbuild'

mock.module('tinacms', {
	namedExports: {
		defineConfig(config) {
			validateSchema({ schema: config.schema })
			return config
		},
	},
})

const baselineCommit = '60786be7f82b6dcebe451d136549d4dd469682ee'
const root = path.resolve(import.meta.dirname, '../..')
const baselineSource = execFileSync('git', ['show', `${baselineCommit}:tina/config.ts`], {
	cwd: root,
	encoding: 'utf8',
})
const currentSource = await readFile(path.join(root, 'tina/config.ts'), 'utf8')

const loadConfig = async (source, outputPath) => {
	const result = await build({
		stdin: { contents: source, resolveDir: path.join(root, 'tina'), loader: 'ts' },
		tsconfig: path.join(root, 'tsconfig.json'),
		bundle: true,
		platform: 'node',
		format: 'esm',
		packages: 'external',
		write: false,
	})
	await writeFile(outputPath, result.outputFiles[0].text)
	return (await import(pathToFileURL(outputPath).href)).default
}

test('Tina typing fixes preserve the serialized schema and custom editor settings', async () => {
	const directory = await mkdtemp(path.join(root, '.tina-schema-test-'))
	try {
		const baseline = await loadConfig(baselineSource, path.join(directory, 'baseline.mjs'))
		const current = await loadConfig(currentSource, path.join(directory, 'current.mjs'))
		assert.deepEqual(
			JSON.parse(JSON.stringify(current.schema)),
			JSON.parse(JSON.stringify(baseline.schema))
		)

		for (const collection of current.schema.collections) {
			const published = collection.fields.find((field) => field.name === 'published')
			assert.equal(published.ui.component, 'toggle')
			assert.deepEqual(published.ui.toggleLabels, { true: 'On', false: 'Off' })
		}

		const travelBody = current.schema.collections[0].fields.find((field) => field.name === 'body')
		const map = travelBody.templates.find((template) => template.name === 'Map')
		assert.deepEqual(map.fields[0].ui.defaultItem, { mapType: 'Openstreetmaps' })
		assert.equal(map.fields[1].isRequired, true)
		assert.equal(map.fields[1].validate(''), 'GPS coordinates are required')
		assert.equal(typeof travelBody.components.EmbedMap, 'function')
		assert.equal(typeof travelBody.components.IFrame, 'function')
	} finally {
		await rm(directory, { recursive: true, force: true })
	}
})
