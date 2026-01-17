
import { test, expect } from '@playwright/test';

test.describe('Canvas Sanity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for canvas to be ready
    await page.waitForSelector('canvas.lower-canvas');
  });

  test('should load the editor', async ({ page }) => {
    await expect(page).toHaveTitle(/canva/i);
    await expect(page.locator('canvas.lower-canvas')).toBeVisible();
  });

  test('should look correct (visual baseline)', async ({ page }) => {
    // Wait for everything to settle
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('empty-canvas.png');
  });
});
