import { expect, test } from '@playwright/test'

test('title is visible', async ({ page }) => {
	await page.goto('/')

	await expect(page.getByText('🎈')).toBeVisible()
})
