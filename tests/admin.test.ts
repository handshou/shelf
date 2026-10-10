import { expect, test } from '@playwright/test'

test('local Tina admin initializes without browser runtime errors', async ({ page }) => {
	const errors: string[] = []
	page.on('pageerror', (error) => errors.push(error.message))
	const response = await page.goto('/admin/index.html')
	expect(response?.status()).toBe(200)
	await expect(page.getByRole('button', { name: 'Enter Edit Mode' })).toBeVisible()
	await expect(page.getByText('You are in local mode')).toBeVisible()
	expect(errors).toEqual([])
})
