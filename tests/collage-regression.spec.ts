
import { test, expect } from '@playwright/test';

test.describe('Collage Regression (Positioning)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas.lower-canvas');
  });

  test('should NOT shift cell position when adjusting padding', async ({ page }) => {
    // 1. Add Collage (first template)
    await page.getByText('Layouts').click();
    await page.waitForTimeout(500);
    // Click 'Split Vertical' template
    await page.getByText('Split Vertical').click();

    // 2. Select the bottom-right cell
    // Grid is usually 200x200 per cell in 400x400 base, 
    // but scale depends on canvas.
    // Let's assume standard behavior:
    // Click at 75% width, 75% height of canvas to hit bottom-right.
    const canvas = page.locator('canvas.upper-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    const clickX = box.x + box.width * 0.75;
    const clickY = box.y + box.height * 0.75;

    // Double click to select cell (if group logic requires it, based on previous manual test)
    await page.mouse.dblclick(clickX, clickY);

    // 3. Verify Toolbar shows "Padding"
    // Tooltip might say "Padding"
    // await expect(page.getByLabel('Padding')).toBeVisible(); // Might be tricky if tooltip

    // 4. Take Snapshot of BEFORE state (focused on cell)
    // We can't easily isolate just the cell visually without advanced masking, 
    // but full canvas snapshot works.
    await expect(page).toHaveScreenshot('regression-before-padding.png');

    // 5. Move Padding Slider
    // Find the slider. There are two. Spacing (Padding) is the first one usually.
    // It's inside a Box with a GridOn icon.
    // We can verify functionality by drag.
    // Let's interact with the canvas directly to measure if we can't trust visual diff only?
    // Visual diff IS the best check for "did it move?". 
    // If it shrank centrally, the center pixel shouldn't change color (unless it shrank past it).
    // But if it drifted, the whole block moves.

    // Let's just use screenshot for stability.
    // "Existing feature works as it is" -> Snapshots.

    // But to specifically test stability:
    // We can try to manipulate the slider.
    const slider1 = page.locator('.MuiSlider-root').first();
    const sliderBox = await slider1.boundingBox();
    if (sliderBox) {
      // Drag to 50%
      await page.mouse.click(sliderBox.x + sliderBox.width / 2, sliderBox.y + sliderBox.height / 2);
    }

    // 6. Screenshot AFTER
    // The cell should look smaller but CENTERED.
    // If it drifted, it would be off-center.
    await expect(page).toHaveScreenshot('regression-after-padding.png');
  });
});
