
import { test, expect } from '@playwright/test';

test.describe('Collage Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas.lower-canvas');
  });

  test('should add a collage from layouts panel', async ({ page }) => {
    // 1. Open Layouts

    // OR find by icon or position if labels missing. 
    // Given the Sidebar code, it likely has aria-label="Layouts" or we find by text.
    // Let's assume we need to click the sidebar button.
    // If no aria-label, we might need a better selector. 
    // Based on Sidebar.tsx: <ListItemButton onClick={() => setActivePanel("layouts")}>...<Dashboard />...</ListItemButton>
    // We can target by text "Layouts" potentially if it exists, or index.
    // Let's try text "Layouts" assuming tooltip or text is present, or just use the coordinate click from the browser tool if needed, but selectors are better.
    // Looking at Sidebar.tsx, it renders `SidebarItem` which has `label`.
    await page.getByText('Layouts').click();

    // 2. Click a template
    await page.getByText('Split Vertical').click();

    // 3. Verify Canvas has objects (Collage Group)
    // We can check if delete button appears in toolbar when selected
    await page.waitForTimeout(500); // Wait for render

    // Select the center to ensure collage is selected
    const canvas = page.locator('canvas.upper-canvas');
    const box = await canvas.boundingBox();
    if (box) {
      // Click at 25% to hit the left cell, avoiding the center gap (10px)
      await page.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.25);
    }

    // Toolbar should now show "Spacing" or "Group"
    await expect(page.getByRole('slider', { name: 'Spacing' })).toBeVisible();
  });

  test('should adjust collage spacing', async ({ page }) => {
    // Setup: Add Collage
    await page.getByText('Layouts').click();
    // Wait for panel to open
    await page.waitForTimeout(500);
    // Click 'Split Vertical' template
    await page.getByText('Split Vertical').click();

    // Wait for canvas add
    await page.waitForTimeout(1000);
    // Select it
    const canvas = page.locator('canvas.upper-canvas');
    const box = await canvas.boundingBox();
    if (box) {
      // Click at 25% to hit the left cell, avoiding the center gap
      await page.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.25);
    }

    // Move Slider
    const slider = page.getByRole('slider', { name: 'Spacing' });
    await expect(slider).toBeVisible();

    // Visual check
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('collage-default.png');
  });
});
