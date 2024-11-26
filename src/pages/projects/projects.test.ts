import { expect, test } from '@playwright/test'

test.describe('projects', () => {
  test.describe.configure({ mode: 'serial' })

  test('is visible', async ({ page }) => {
	  await page.goto('/')
    await expect(page.getByRole('link', { name: '👨‍💻   projects' })).toBeVisible();
  })

  test('is clickable', async ({ page }) => {
	  await page.goto('/')
    await expect(page.getByRole('link', { name: '👨‍💻   projects' })).toBeVisible();
    await page.getByRole('link', { name: '👨‍💻   projects' }).click();
    await expect(page.getByRole('heading', { name: '🎈 hansel' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Astro Notion List of updates' })).toBeVisible();
  })

  test('is rendered', async ({ page }) => {
	  await page.goto('/')
    await page.getByRole('link', { name: '👨‍💻   projects' }).click();
    await page.getByRole('link', { name: 'Astro Notion List of updates' }).click();
    await expect(page.locator('div').filter({ hasText: 'back to 👨‍💻 projects' }).nth(3)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Astro Notion' })).toBeVisible();
    await expect(page.getByText('A long term project of designing and writing process.', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: '🎈 hansel' })).toBeVisible();
  })

  test('is backtrackable', async ({ page }) => {
	  await page.goto('/')
    await page.getByRole('link', { name: '👨‍💻   projects' }).click();
    await page.getByRole('link', { name: 'Astro Notion List of updates' }).click();
    await page.locator('div').filter({ hasText: 'back to 👨‍💻 projects' }).nth(3).click();
    await expect(page.getByRole('link', { name: 'Astro Notion List of updates' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '🎈 hansel' })).toBeVisible();
  })
})

