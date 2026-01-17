import { test, expect } from '@playwright/test';

test.describe('Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas.lower-canvas');
  });

  test('should open export modal when clicking Export Image button', async ({ page }) => {
    // Click the Export Image button
    await page.getByRole('button', { name: 'Export Image' }).click();

    // Verify modal is open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Export Image' })).toBeVisible();
  });

  test('should allow selecting different formats', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: 'Export Image' }).click();
    await page.waitForSelector('[role="dialog"]');

    // Click the format dropdown
    await page.getByLabel('Format').click();

    // Verify all format options are available
    await expect(page.getByRole('option', { name: 'PNG (Lossless)' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'JPEG (Smaller size)' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'WebP (Modern format)' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'SVG (Vector)' })).toBeVisible();
  });

  test('should show quality slider for JPEG format', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: 'Export Image' }).click();
    await page.waitForSelector('[role="dialog"]');

    // Select JPEG format
    await page.getByLabel('Format').click();
    await page.getByRole('option', { name: 'JPEG (Smaller size)' }).click();

    // Verify quality slider appears
    await expect(page.getByText('Quality:')).toBeVisible();
  });

  test('should allow selecting different resolution presets', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: 'Export Image' }).click();
    await page.waitForSelector('[role="dialog"]');

    // Verify resolution options
    await expect(page.getByRole('button', { name: '1x Standard' })).toBeVisible();
    await expect(page.getByRole('button', { name: '2x HD' })).toBeVisible();
    await expect(page.getByRole('button', { name: '4x Ultra' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Custom' })).toBeVisible();
  });

  test('should show custom dimension inputs when Custom resolution is selected', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: 'Export Image' }).click();
    await page.waitForSelector('[role="dialog"]');

    // Select Custom resolution
    await page.getByRole('button', { name: 'Custom' }).click();

    // Verify custom dimension inputs appear
    await expect(page.getByLabel('Custom Width')).toBeVisible();
    await expect(page.getByLabel('Custom Height')).toBeVisible();
  });

  test('should download image when Export is clicked', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: 'Export Image' }).click();
    await page.waitForSelector('[role="dialog"]');

    // Setup download listener
    const downloadPromise = page.waitForEvent('download');

    // Click Export button
    await page.getByRole('button', { name: 'Export', exact: true }).click();

    // Verify download happened
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.png$/);
  });

  test('should close modal when Cancel is clicked', async ({ page }) => {
    // Open export modal
    await page.getByRole('button', { name: 'Export Image' }).click();
    await page.waitForSelector('[role="dialog"]');

    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify modal is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
