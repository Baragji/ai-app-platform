import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('should display welcome message', async ({ page }) => {
    await page.goto('/');

    // Check main heading
    await expect(page.locator('h1')).toContainText(
      'Welcome to AI App Platform'
    );

    // Check description
    await expect(
      page.locator('text=A production-ready modular monolith')
    ).toBeVisible();

    // Check navigation links
    await expect(page.locator('text=View Projects')).toBeVisible();
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('should navigate to projects page', async ({ page }) => {
    await page.goto('/');

    await page.click('text=View Projects');

    // Should redirect to sign in page since not authenticated
    await expect(page).toHaveURL('/auth/signin');
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/');

    await page.click('text=Sign In');

    await expect(page).toHaveURL('/auth/signin');
    await expect(page.locator('h2')).toContainText('Sign In');
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');

    // Check feature cards
    await expect(page.locator('text=Authentication')).toBeVisible();
    await expect(page.locator('text=Database')).toBeVisible();
    await expect(page.locator('text=Job Queue')).toBeVisible();
  });

  test('should have responsive navigation', async ({ page }) => {
    await page.goto('/');

    // Check navigation bar
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=AI App Platform').first()).toBeVisible();
  });
});
