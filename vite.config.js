import { defineConfig } from 'vite'

export default defineConfig({
	resolve: {
		alias: {
			'@/*': ['src/*'],
			'@config': ['src/content/config.ts'],
			'@store/*': ['src/lib/store/*'],
			'@styles/*': ['src/lib/styles/*'],
			'@layouts/*': ['src/layouts/*'],
			'@ac/*': ['src/components/astro/*'],
			'@rc/*': ['src/components/react/*'],
		},
	},
})
