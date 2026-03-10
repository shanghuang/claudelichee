import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

test.describe('Purchase history (unauthenticated)', () => {
  test('shows sign in prompt when not logged in', async ({ page }) => {
    await page.goto('/en/history');
    await expect(page.getByText(/sign in/i)).toBeVisible();
  });
});

test.describe('Purchase history (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'demo@example.com', 'demo123');
  });

  test('shows history page title', async ({ page }) => {
    await page.goto('/en/history');
    await expect(page.getByRole('heading', { name: /purchase history/i })).toBeVisible({ timeout: 10000 });
  });

  test('shows empty state or history items', async ({ page }) => {
    await page.goto('/en/history');
    // Wait for either the empty state or items to appear
    await expect(
      page.getByText(/no purchase history/i).or(page.locator('a[href*="/products/"]').first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('history link is visible in nav', async ({ page }) => {
    // Navigate to products page, retrying if ERR_ABORTED occurs
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await page.goto('/en/products');
        break;
      } catch {
        if (attempt === 2) throw new Error('Failed to navigate to /en/products after 3 attempts');
        await page.waitForTimeout(1000);
      }
    }
    await expect(page.getByRole('link', { name: /history/i })).toBeVisible({ timeout: 10000 });
  });
});
