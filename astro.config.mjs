import mdx from '@astrojs/mdx'
import { defineConfig } from 'astro/config'

import react from '@astrojs/react'
import vercel from '@astrojs/vercel/serverless'

import tailwind from '@astrojs/tailwind'

const tina = ({ directiveName = 'tina' } = {}) => ({
	name: 'tina-cms',
	hooks: {
		'astro:config:setup': ({ addClientDirective, opts }) => {
			addClientDirective({
				name: directiveName,
				entrypoint: './client-directives/tina.mjs',
			})
		},
	},
})

// https://astro.build/config
export default defineConfig({
	site: 'https://hansel.co',
	image: {
		domains: ['res.cloudinary.com'],
	},
	integrations: [
		mdx({}),
		react(),
		tina(),
		tailwind({
			applyBaseStyles: false,
		}),
	],
	output: 'server',
	adapter: vercel(),
})
