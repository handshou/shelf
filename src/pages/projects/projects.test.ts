import { SITE_TITLE } from '@/config'
import { expect, test } from '@playwright/test'

test('projects is visible', async ({ page }) => {
	await page.goto('/projects')
	await expect(page.getByRole('heading', { name: SITE_TITLE })).toBeVisible()
	await expect(page.locator('#scroll')).toContainText('Astro Notion')
})
