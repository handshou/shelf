import { expect, test } from '@playwright/test'
import { SITE_TITLE } from '../src/config.ts'

test('title is visible', async ({ page }) => {
	await page.goto('/')

	await expect(page.getByText(SITE_TITLE)).toBeVisible()
})
