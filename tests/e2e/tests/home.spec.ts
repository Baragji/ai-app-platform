import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('should display welcome message', async ({ page }) => {
    await page.goto('/');

    // Check main heading (in main content, not nav)
    await expect(page.locator('main h1')).toContainText(
      'Welcome to AI App Platform'
    );

    // Check description
    await expect(
      page.locator('text=A production-ready modular monolith')
    ).toBeVisible();

    // Check navigation links
    await expect(
      page.getByRole('link', { name: 'View Projects' })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  });

  test('should navigate to projects page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'View Projects' }).click();

    // Should redirect to sign in page since not authenticated
    await page.waitForURL('**/auth/signin*', { timeout: 12000 });
    await expect(page).toHaveURL(/\/auth\/signin(\?.*)?$/);
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Sign In' }).click();

    await expect(page).toHaveURL('/auth/signin');
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');

    // Check feature cards by targeting the headings specifically
    await expect(
      page.getByRole('heading', { name: 'Authentication' })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Database' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Job Queue' })
    ).toBeVisible();
  });

  test('should have responsive navigation', async ({ page }) => {
    await page.goto('/');

    // Check navigation bar
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav h1')).toContainText('AI App Platform');
  });
});
