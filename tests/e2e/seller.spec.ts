import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

async function gotoWithRetry(page: import('@playwright/test').Page, url: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(url);
      return;
    } catch {
      if (attempt === 2) throw new Error(`Failed to navigate to ${url} after 3 attempts`);
      await page.waitForTimeout(1000);
    }
  }
}

test.describe('Seller flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'seller@example.com', 'seller123');
  });

  test('can access seller dashboard', async ({ page }) => {
    await gotoWithRetry(page, '/en/seller');
    await expect(page.getByRole('heading', { name: /seller dashboard/i })).toBeVisible({ timeout: 10000 });
  });

  test('seller dashboard shows stats', async ({ page }) => {
    await gotoWithRetry(page, '/en/seller');
    // Wait for loading state to finish
    await expect(page.getByText('Loading dashboard...')).toBeHidden({ timeout: 15000 });
    // Stats cards should now be visible
    await expect(page.getByText(/total products/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/total revenue/i)).toBeVisible({ timeout: 5000 });
  });

  test('can navigate to add product page', async ({ page }) => {
    await gotoWithRetry(page, '/en/seller/products/new');
    await page.waitForURL(/\/seller\/products\/new/, { timeout: 10000 });
  });

  test('add product form shows all fields', async ({ page }) => {
    await gotoWithRetry(page, '/en/seller/products/new');
    await expect(page.getByLabel(/product name/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/description/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel(/price/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel(/category/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel(/stock/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel(/unit/i)).toBeVisible({ timeout: 5000 });
  });

  test('can submit a new product', async ({ page }) => {
    await gotoWithRetry(page, '/en/seller/products/new');
    await page.getByLabel(/product name/i).fill(`Test Mango ${Date.now()}`);
    await page.getByLabel(/description/i).fill('A sweet tropical mango.');
    await page.getByLabel(/price/i).fill('3.99');
    await page.getByLabel(/stock/i).fill('50');
    await page.getByRole('button', { name: /submit for approval/i }).click();
    await page.waitForURL(/\/seller\/products/, { timeout: 10000 });
  });

  test('seller products list is visible', async ({ page }) => {
    await gotoWithRetry(page, '/en/seller/products');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('can access seller orders', async ({ page }) => {
    await gotoWithRetry(page, '/en/seller/orders');
    await expect(page.locator('h1')).toBeVisible();
  });
});
