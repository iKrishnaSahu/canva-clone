import { test, expect } from '@playwright/test';

test.describe('Text Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas.lower-canvas');
    await page.getByText('Text').click(); // Open Text Panel
    await page.waitForTimeout(500); // Animation
  });

  test('should add a heading and apply styles', async ({ page }) => {
    // 1. Add Heading
    await page.getByRole('button', { name: 'Add a heading' }).click();

    // 2. Select it (Usually auto-selected on add, but let's verify)
    // Check formatting toolbar appears
    const boldBtn = page.locator('button[value="bold"]');
    await expect(boldBtn).toBeVisible();

    // 3. Toggle Bold
    await boldBtn.click();

    // 4. Toggle Italic
    const italicBtn = page.locator('button[value="italic"]');
    await italicBtn.click();

    // 5. Visual check
    // Deselect first to see text clearly? Or keep selected to see toolbar state.
    // Let's click away to deselect and check canvas render
    const canvas = page.locator('canvas.upper-canvas');
    const box = await canvas.boundingBox();
    if (box) await page.mouse.click(box.x, box.y); // Click top-left corner (empty)

    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('text-styling.png');
  });

  test('should add body text', async ({ page }) => {
    await page.getByRole('button', { name: 'Add a little bit of body text' }).click();

    // Allow render
    await page.waitForTimeout(500);

    // Click away
    const canvas = page.locator('canvas.upper-canvas');
    const box = await canvas.boundingBox();
    if (box) await page.mouse.click(box.x, box.y);

    await expect(page).toHaveScreenshot('text-body.png');
  });
});
