import { expect, test } from '@playwright/test'

test('travels is visible', async ({ page }) => {
  await page.goto('/travels');
  await expect(page.getByRole('heading', { name: '🎈' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'hanoi travels/hanoi/DSC_3337_zprxhy' })).toBeVisible();
});