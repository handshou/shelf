import { SITE_DESCRIPTION, SITE_TITLE } from '@/config'
import rss, { pagesGlobToRssItems } from '@astrojs/rss'

export async function GET(context) {
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: import.meta.env.SITE,
		items: await pagesGlobToRssItems(import.meta.glob('./blog/**/*.{md,mdx}')),
	})
}
