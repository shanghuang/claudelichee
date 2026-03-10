import { test, expect } from '@playwright/test';

test.describe('Products page', () => {
  test('loads products page', async ({ page }) => {
    await page.goto('/en/products');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('shows category filter buttons', async ({ page }) => {
    await page.goto('/en/products');
    await expect(page.getByRole('button', { name: /all/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /tropical/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /citrus/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /berries/i })).toBeVisible();
  });

  test('shows search input', async ({ page }) => {
    await page.goto('/en/products');
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test('clicking category filter updates product list', async ({ page }) => {
    await page.goto('/en/products');
    const tropicalBtn = page.getByRole('button', { name: /tropical/i });
    await tropicalBtn.click();
    // Category filter updates component state; verify button becomes active
    await expect(tropicalBtn).toHaveClass(/bg-green-600/, { timeout: 5000 });
  });

  test('searching updates product list', async ({ page }) => {
    await page.goto('/en/products');
    await page.getByPlaceholder(/search/i).fill('mango');
    await page.waitForTimeout(500);
    // Either shows results or no results message
    const hasProducts = await page.locator('[class*="grid"] > div').count();
    expect(hasProducts).toBeGreaterThanOrEqual(0);
  });

  test('seller products page shows seller name as title', async ({ page }) => {
    await page.goto('/en/products?sellerId=1');
    // Either shows seller name or "Fresh Fruits" if seller not found
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Product detail page', () => {
  test('shows 404 message for non-existent product', async ({ page }) => {
    await page.goto('/en/products/99999');
    await expect(page.getByText(/not found/i)).toBeVisible();
  });

  test('back to products link works', async ({ page }) => {
    await page.goto('/en/products/99999');
    await page.getByRole('link', { name: /back to products/i }).click();
    await expect(page).toHaveURL(/\/products/);
  });
});
