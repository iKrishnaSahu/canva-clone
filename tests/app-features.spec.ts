import { test, expect } from '@playwright/test';

test.describe('App Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas.lower-canvas');
  });

  test('should toggle dark mode', async ({ page }) => {
    // Initial state: Light mode (default)
    // Check background color of the body or a main element. 
    // MUI light mode default background is usually #fff or #f5f5f5

    const toggleBtn = page.getByRole('button', { name: 'Toggle Theme' });
    await expect(toggleBtn).toBeVisible();

    // Switch to Dark
    await toggleBtn.click();
    await page.waitForTimeout(500); // Wait for transition

    // Take a screenshot to verify dark mode
    await expect(page).toHaveScreenshot('app-dark-mode.png');

    // Switch back to Light
    await toggleBtn.click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('app-light-mode.png');
  });

  test('should trigger export image', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: 'Export Image' }).click();
    await page.waitForSelector('[role="dialog"]');

    // Setup download listener and click Export
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export', exact: true }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/canvas-design\.png$/);
  });
});
