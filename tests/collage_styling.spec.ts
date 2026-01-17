
import { test, expect } from '@playwright/test';

test.describe('Collage Styling Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas.lower-canvas');
  });

  const selectCollageObject = async (page: any) => {
    // Wait for canvas to have objects
    await page.waitForFunction(() => {
      const canvas = (window as any).canvas;
      return canvas && canvas.getObjects().length > 0;
    });

    // Programmatically select the first object (collage group/frame)
    await page.evaluate(() => {
      const canvas = (window as any).canvas;
      const objects = canvas.getObjects();
      if (objects.length > 0) {
        canvas.setActiveObject(objects[0]);
        canvas.requestRenderAll();
      }
    });

    // Wait for the Toolbar to update (it listens to selection events)
    // We can trigger a fake selection event if needed, but setActiveObject usually fires it if using standard fabric
    // If our app uses 'selection:created', we might need to fire it manually if setActiveObject doesn't
    await page.evaluate(() => {
      const canvas = (window as any).canvas;
      const active = canvas.getActiveObject();
      canvas.fire('selection:created', { selected: [active] });
      canvas.fire('selection:updated', { selected: [active] });
    });
  };

  test('should apply border styling (color, width, style)', async ({ page }) => {
    // 1. Add Collage
    await page.getByText('Layouts').click();
    await page.waitForTimeout(500);
    await page.getByText('Split Vertical').click();
    await page.waitForTimeout(1000); // Wait for add

    // 2. Select the collage reliably
    await selectCollageObject(page);
    await page.waitForTimeout(500); // Wait for React state update

    // 3. Change Border Color
    const borderColorInput = page.getByTestId('border-color-input');
    await expect(borderColorInput).toBeVisible();
    await borderColorInput.fill('#ff0000');

    // 4. Change Border Width
    // Note: Slider component usually renders an input or role slider inside. 
    // If data-testid is on the Slider root, we might need to find the slider role within it or click the root.
    const borderWidthSlider = page.getByTestId('border-width-slider').getByRole('slider');
    await expect(borderWidthSlider).toBeVisible();
    await borderWidthSlider.click({ force: true });
    await page.keyboard.press('ArrowRight');

    // 5. Change Border Style
    const styleSelect = page.getByTestId('border-style-select');
    await styleSelect.click();
    await page.getByRole('option', { name: 'Dashed' }).click();

    // 6. Verify Visuals
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('collage-borders.png');
  });

  test('should apply background color', async ({ page }) => {
    // 1. Add Collage
    await page.getByText('Layouts').click();
    await page.getByText('Split Vertical').click();
    await page.waitForTimeout(1000);

    // 2. Select collage reliably
    await selectCollageObject(page);
    await page.waitForTimeout(500);

    // 3. Increase Spacing so background is visible
    const spacingSlider = page.getByRole('slider', { name: 'Spacing' });
    await spacingSlider.click({ force: true });
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');

    // 4. Change Background Color
    const bgColorInput = page.getByTestId('background-color-input');
    await expect(bgColorInput).toBeVisible();
    await bgColorInput.fill('#0000ff');

    // 5. Verify Visuals
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('collage-background.png');
  });

  test('should switch to new templates (e.g. Six Grid)', async ({ page }) => {
    // 1. Open Layouts
    await page.getByText('Layouts').click();
    await page.waitForTimeout(500);

    // 2. Select Six Grid
    const sixGridTemplate = page.getByText('Six Grid');
    await sixGridTemplate.scrollIntoViewIfNeeded();
    await sixGridTemplate.click();

    await page.waitForTimeout(1000);

    // 3. Verify object count or visual
    await expect(page).toHaveScreenshot('collage-six-grid.png');
  });
});
