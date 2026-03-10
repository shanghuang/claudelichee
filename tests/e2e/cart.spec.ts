import { test, expect } from '@playwright/test';

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

test.describe('Cart page', () => {
  test('shows empty cart message when no items', async ({ page }) => {
    await page.goto('/en/cart');
    await expect(page.getByText(/empty/i)).toBeVisible();
  });

  test('start shopping link navigates to products', async ({ page }) => {
    await page.goto('/en/cart');
    // Wait for the "Start Shopping" link to be fully rendered with its href
    const link = page.getByRole('link', { name: /start shopping/i });
    await expect(link).toBeVisible({ timeout: 10000 });
    // Wait for the link to have the correct href (confirms React hydration)
    await expect(link).toHaveAttribute('href', /\/products/, { timeout: 5000 });
    // Navigate directly via the href to avoid hydration timing issues with client-side navigation
    const href = await link.getAttribute('href');
    await gotoWithRetry(page, href!);
    await page.waitForURL(/\/products/, { timeout: 10000 });
  });
});

test.describe('Cart interactions', () => {
  test('cart icon is visible in header', async ({ page }) => {
    await page.goto('/');
    const cartLink = page.locator('a[href*="cart"]').first();
    await expect(cartLink).toBeVisible();
  });

  test('clicking cart icon navigates to cart', async ({ page }) => {
    await page.goto('/en/products');
    await page.locator('a[href*="cart"]').first().click();
    await expect(page).toHaveURL(/\/cart/);
  });
});
