import { test, expect } from '@playwright/test';

test.describe('Elements (Shapes)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas.lower-canvas');
    await page.getByText('Elements').click();
    await page.waitForTimeout(500);
  });

  test('should add a rectangle and change color', async ({ page }) => {
    // 1. Add Rectangle
    await page.getByRole('button', { name: 'Square' }).click();

    // 2. Toolbar should show color picker
    const colorInput = page.locator('input[type="color"]');
    await expect(colorInput).toBeVisible();

    // 3. Change Color
    await colorInput.fill('#ff0000');

    // 4. Visual Check
    await page.waitForTimeout(500);
    // Deselect
    const canvas = page.locator('canvas.upper-canvas');
    const box = await canvas.boundingBox();
    if (box) await page.mouse.click(box.x, box.y);

    await expect(page).toHaveScreenshot('elements-rect-red.png');
  });

  test('should add a circle', async ({ page }) => {
    await page.getByRole('button', { name: 'Circle' }).click();

    // Visual Check
    await page.waitForTimeout(500);
    // Deselect
    const canvas = page.locator('canvas.upper-canvas');
    const box = await canvas.boundingBox();
    if (box) await page.mouse.click(box.x, box.y);

    await expect(page).toHaveScreenshot('elements-circle.png');
  });
  test('should add a triangle', async ({ page }) => {
    await page.getByRole('button', { name: 'Triangle' }).click();

    // Visual Check
    await page.waitForTimeout(500);
    // Deselect
    const canvas = page.locator('canvas.upper-canvas');
    const box = await canvas.boundingBox();
    if (box) await page.mouse.click(box.x, box.y);

    await expect(page).toHaveScreenshot('elements-triangle.png');
  });

  test('should add a line', async ({ page }) => {
    await page.getByRole('button', { name: 'Line' }).click();

    // Visual Check
    await page.waitForTimeout(500);
    // Deselect
    const canvas = page.locator('canvas.upper-canvas');
    const box = await canvas.boundingBox();
    if (box) await page.mouse.click(box.x, box.y);

    await expect(page).toHaveScreenshot('elements-line.png');
  });
});
