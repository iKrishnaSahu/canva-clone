import { test, expect } from '@playwright/test';

test.describe('Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas.lower-canvas');
  });

  test('should save and load from local storage', async ({ page }) => {
    // 1. Add an object (Rectangle)
    await page.getByText('Elements').click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Square' }).click();

    // 2. Click Quick Save
    // 2. Click Quick Save
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Quick Save' }).click();

    // Check storage
    const saved = await page.evaluate(() => localStorage.getItem('canvas-design'));
    expect(saved).toBeTruthy();

    // 3. Clear Canvas (refresh page)
    await page.reload();
    await page.waitForSelector('canvas.lower-canvas');

    // 5. Click Quick Load
    await page.getByRole('button', { name: 'Quick Load' }).click();
    await page.waitForTimeout(2000); // Wait longer for load

    // 6. Check if object exists
    const objectsCount = await page.evaluate(() => {
      // @ts-ignore
      return window.canvas?.getObjects().length || 0;
    });
    expect(objectsCount).toBeGreaterThan(0);
  });

  test('should allow downloading project file', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Save Project' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('project.json');
  });
});
