import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cp, mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

const output = path.resolve(process.env.VERCEL_RUNTIME_OUTPUT ?? '.vercel/output')

const probe = `
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
try {
  const handler = (await import(pathToFileURL(process.argv[1]))).default;
  assert.equal(typeof handler.fetch, 'function');
  assert.equal(existsSync(path.join(process.cwd(), 'node_modules/rolldown')), false);
  const home = await handler.fetch(new Request('https://hansel.co/'));
  assert.equal(home.status, 200);
  assert.match(await home.text(), /<html/);
  const upload = await handler.fetch(new Request('https://hansel.co/api/cloudinary/media', {
    method: 'POST',
    headers: { Origin: 'https://hansel.co', 'Content-Type': 'application/json' },
    body: '{}'
  }));
  assert.equal(upload.status, 401);
  console.log('Packaged server startup, homepage, and upload authorization passed.');
} catch (error) {
  console.error(error.name);
  process.exitCode = 1;
}
`

test('isolated Vercel functions start without build tooling and serve protected requests', async () => {
	const functions = path.join(output, 'functions')
	const entries = await readdir(functions, { withFileTypes: true })
	let tested = 0
	for (const entry of entries) {
		if (!entry.isDirectory() || !entry.name.endsWith('.func')) continue
		const source = path.join(functions, entry.name)
		const config = JSON.parse(await readFile(path.join(source, '.vc-config.json'), 'utf8'))
		if (!config.runtime.startsWith('nodejs')) continue
		const standalone = await mkdtemp(path.join(os.tmpdir(), 'shelf-vercel-runtime-'))
		try {
			await cp(source, standalone, { recursive: true, dereference: true })
			const result = execFileSync(
				process.execPath,
				['--input-type=module', '-e', probe, path.join(standalone, config.handler)],
				{ cwd: standalone, encoding: 'utf8', timeout: 30_000 }
			)
			assert.match(result, /Packaged server startup, homepage, and upload authorization passed/)
			tested++
		} finally {
			await rm(standalone, { recursive: true, force: true })
		}
	}
	assert.ok(tested > 0, 'Build output must contain at least one Node function')
})
