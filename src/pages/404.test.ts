import { SITE_TITLE } from '@/config.ts'
import { expect, test } from '@playwright/test'

test.describe('missing page', () => {
	test('leads to 404', async ({ page }) => {
		await page.goto('/missingpage')
		await expect(page.getByRole('heading', { name: SITE_TITLE })).toBeVisible()
		await expect(page.locator('#scroll')).toContainText('uh oh, page not found')
	})

	test('in travels subdirectory leads to 404', async ({ page }) => {
		await page.goto('/travels/missingpage')
		await expect(page.getByRole('heading', { name: SITE_TITLE })).toBeVisible()
		await expect(page.locator('#scroll')).toContainText('uh oh, page not found')
	})

	test('in blogs subdirectory leads to 404', async ({ page }) => {
		await page.goto('/blog/missingpage')
		await expect(page.getByRole('heading', { name: SITE_TITLE })).toBeVisible()
		await expect(page.locator('#scroll')).toContainText('uh oh, page not found')
	})

	test('in projects subdirectory leads to 404', async ({ page }) => {
		await page.goto('/projects/missingpage')
		await expect(page.getByRole('heading', { name: SITE_TITLE })).toBeVisible()
		await expect(page.locator('#scroll')).toContainText('uh oh, page not found')
	})

	test('in invalid subdirectory leads to 404', async ({ page }) => {
		await page.goto('/invalidsubdirectory/missingpage')
		await expect(page.getByRole('heading', { name: SITE_TITLE })).toBeVisible()
		await expect(page.locator('#scroll')).toContainText('uh oh, page not found')
	})
})
