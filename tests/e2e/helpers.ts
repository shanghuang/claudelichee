import { Page } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string) {
  // Retry login to handle parallel test timing issues
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto('/en/auth/login');
    // Wait for the form to be interactive
    await page.getByLabel(/email/i).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait up to 8 seconds for navigation away from login page
    try {
      await page.waitForURL(/\/(en|zh-TW|ja)($|\/)(?!auth)/, { timeout: 8000 });
      await page.waitForLoadState('load');
      return; // Successfully logged in
    } catch {
      // Navigation didn't happen - either login failed or hydration issue
      const currentUrl = page.url();
      if (!currentUrl.includes('/auth/login')) {
        // We're somewhere else (shouldn't happen but handle gracefully)
        return;
      }
      // Still on login page - retry after a delay
      if (attempt < 2) {
        await page.waitForTimeout(2000);
      }
    }
  }

  throw new Error(`Login failed after 3 attempts for ${email}`);
}
