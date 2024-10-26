import { test, expect } from '@playwright/test';

test('projects is visible', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.getByRole('heading', { name: '🎈' })).toBeVisible();
  await expect(page.locator('#scroll')).toContainText('Astro Notion');
});
