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

test.describe('Login page', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/en/auth/login');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/en/auth/login');
    await page.getByLabel(/email/i).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 10000 });
  });

  test('link to register page works', async ({ page }) => {
    await page.goto('/en/auth/login');
    const link = page.getByRole('link', { name: /sign up/i });
    await expect(link).toBeVisible({ timeout: 10000 });
    const href = await link.getAttribute('href');
    await gotoWithRetry(page, href || '/en/auth/register');
    await page.waitForURL(/\/auth\/register/, { timeout: 10000 });
    await expect(page.getByLabel(/full name/i)).toBeVisible();
  });
});

test.describe('Register page', () => {
  test('shows register form', async ({ page }) => {
    await page.goto('/en/auth/register');
    await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('shows error when passwords do not match', async ({ page }) => {
    await page.goto('/en/auth/register');
    await page.getByLabel(/full name/i).fill('Test User');
    await page.getByLabel(/^email/i).fill(`test_${Date.now()}@example.com`);
    await page.getByLabel(/^password$/i).fill('password123');
    await page.getByLabel(/confirm password/i).fill('different123');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText(/do not match/i)).toBeVisible();
  });

  test('link to seller register works', async ({ page }) => {
    await page.goto('/en/auth/register');
    const link = page.getByRole('link', { name: /register as a seller/i });
    await expect(link).toBeVisible({ timeout: 10000 });
    const href = await link.getAttribute('href');
    await gotoWithRetry(page, href || '/en/auth/register-seller');
    await page.waitForURL(/register-seller/, { timeout: 10000 });
    await expect(page.getByLabel(/full name/i)).toBeVisible();
  });
});

test.describe('Seller register page', () => {
  test('shows seller register form', async ({ page }) => {
    await page.goto('/en/auth/register-seller');
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});

