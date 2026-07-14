import { SITE_TITLE } from '@/config.ts'
import { expect, test } from '@playwright/test'

test('travels is visible', async ({ page }) => {
	await page.goto('/travels')
	await expect(page.getByRole('heading', { name: SITE_TITLE })).toBeVisible()
	await expect(page.getByRole('link', { name: /travels\/hanoi\// }).first()).toBeVisible()
})

test('a country page loads instead of redirecting to 404', async ({ page }) => {
	const response = await page.goto('/travels/hanoi')
	expect(response?.status()).toBe(200)
	expect(new URL(page.url()).pathname).toBe('/travels/hanoi')
})

test('back button navigates to the previous page', async ({ page }) => {
	await page.goto('/travels')
	await page.goto('/travels/hanoi')
	await page.getByRole('button', { name: 'back' }).click()
	await page.waitForURL('/travels')
	expect(new URL(page.url()).pathname).toBe('/travels')
})
