import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads and shows hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('link', { name: /shop now/i })).toBeVisible();
  });

  test('shows shop by category section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/shop by category/i)).toBeVisible();
  });

  test('shows features section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/why choose lichee/i)).toBeVisible();
  });

  test('nav links are visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /lichee/i }).first()).toBeVisible();
  });

  test('clicking shop now navigates to products', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /shop now/i }).first().click();
    await expect(page).toHaveURL(/\/products/);
  });
});
