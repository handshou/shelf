import { SITE_TITLE } from '@/config.ts'
import { expect, test } from '@playwright/test'

test('blog is visible', async ({ page }) => {
	await page.goto('/blog')
	await expect(page.getByRole('heading', { name: SITE_TITLE })).toBeVisible()
	await expect(page.locator('#scroll')).toContainText('First post')
})
