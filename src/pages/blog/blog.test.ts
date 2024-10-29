import { expect, test } from '@playwright/test'
import { SITE_TITLE } from '@/config'

test('blog is visible', async ({ page }) => {
	await page.goto('/blog')
	await expect(page.getByRole('heading', { name: SITE_TITLE })).toBeVisible()
	await expect(page.locator('#scroll')).toContainText('First post')
})
