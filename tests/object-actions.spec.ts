import { test, expect } from '@playwright/test';

test.describe('Object Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas.lower-canvas');
  });

  test('should change object opacity', async ({ page }) => {
    // Add Rect
    await page.getByText('Elements').click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Square' }).click();

    // Change Opacity
    const slider = page.getByRole('slider', { name: 'Opacity' });
    await expect(slider).toBeVisible();

    // Drag slider or click
    // Drag slider or click
    // Use fill for better reliability with MUI sliders
    await slider.fill('0.5');
    // Keyboard press to ensure change event if needed
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');

    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('object-opacity.png');
  });

  test('should delete an object', async ({ page }) => {
    // Add Rect
    await page.getByText('Elements').click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Square' }).click();

    // Delete
    const deleteBtn = page.getByRole('button', { name: 'Delete' });
    await deleteBtn.click();

    // Verify count is 0
    const objectsCount = await page.evaluate(() => {
      // @ts-ignore
      return window.canvas?.getObjects().length || 0;
    });
    expect(objectsCount).toBe(0);
  });
});
