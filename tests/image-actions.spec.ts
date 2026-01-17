import { test, expect } from '@playwright/test';

test.describe('Image Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas.lower-canvas');

    // Upload image via Sidebar
    // Use a larger image (100x100 red square) to ensure clickability
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAANElEQVR42u3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPgxPgAABhdWzIAAAAABJRU5ErkJggg==', 'base64');

    // Wait for file input to exist
    // Target image input specifically (Sidebar) - use .first() to handle strict mode or potential duplicates
    const fileInput = page.locator('input[accept="image/*"]').first();

    await fileInput.setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: buffer
    });

    // Wait for render
    await page.waitForTimeout(1000);

    // Select it (should be auto selected, but ensuring)
    const canvas = page.locator('canvas.upper-canvas');
    const box = await canvas.boundingBox();
    if (box) {
      // Click center (125,125 based on 100,100 pos + 50% scale of 100px)
      await page.mouse.click(125, 125);
    }
  });

  test('should apply grayscale filter', async ({ page }) => {
    // Toolbar should show filters
    const grayBtn = page.getByRole('button', { name: 'Grayscale' });
    await expect(grayBtn).toBeVisible();

    await grayBtn.click();
    await page.waitForTimeout(500);

    // Verification: Visual or check filters property
    const filtersCount = await page.evaluate(() => {
      // @ts-ignore
      const obj = window.canvas.getActiveObject();
      return obj && obj.filters ? obj.filters.length : 0;
    });
    expect(filtersCount).toBeGreaterThan(0);
  });
});
