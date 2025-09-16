import { test, expect } from '@playwright/test';

test.describe('Project management', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/auth/signin');

    await page.fill('input[type="email"]', 'demo@example.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');

    // Wait for navigation to projects page
    await expect(page).toHaveURL('/projects');
  });

  test('should display projects page after login', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Projects');
    await expect(page.locator('text=Manage your projects')).toBeVisible();
    await expect(page.locator('text=Create Project')).toBeVisible();
  });

  test('should create a new project', async ({ page }) => {
    const projectName = `Test Project ${Date.now()}`;
    const projectDescription = 'This is a test project created by e2e tests';

    // Open create project form
    await page.click('text=Create Project');

    await expect(page.locator('text=Create New Project')).toBeVisible();

    // Fill in project details
    await page.fill('input[id="name"]', projectName);
    await page.fill('textarea[id="description"]', projectDescription);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for project to be created and form to close
    await expect(page.locator('text=Create New Project')).not.toBeVisible();

    // Check if project appears in the list
    await expect(page.locator(`text=${projectName}`)).toBeVisible();
    await expect(page.locator(`text=${projectDescription}`)).toBeVisible();
  });

  test('should show validation error for empty project name', async ({
    page,
  }) => {
    // Open create project form
    await page.click('text=Create Project');

    // Try to submit without filling name
    await page.click('button[type="submit"]');

    // Check for HTML5 validation (required field)
    const nameInput = page.locator('input[id="name"]');
    await expect(nameInput).toHaveAttribute('required');
  });

  test('should cancel project creation', async ({ page }) => {
    // Open create project form
    await page.click('text=Create Project');

    await expect(page.locator('text=Create New Project')).toBeVisible();

    // Cancel form
    await page.click('text=Cancel');

    // Form should be hidden
    await expect(page.locator('text=Create New Project')).not.toBeVisible();
  });

  test('should delete a project', async ({ page }) => {
    // First create a project to delete
    const projectName = `Delete Test ${Date.now()}`;

    await page.click('text=Create Project');
    await page.fill('input[id="name"]', projectName);
    await page.click('button[type="submit"]');

    // Wait for project to appear
    await expect(page.locator(`text=${projectName}`)).toBeVisible();

    // Delete the project
    const projectCard = page
      .locator('div')
      .filter({ hasText: projectName })
      .first();
    await projectCard.locator('text=Delete').click();

    // Handle confirmation dialog
    page.on('dialog', (dialog) => dialog.accept());

    // Project should be removed
    await expect(page.locator(`text=${projectName}`)).not.toBeVisible();
  });

  test('should display demo project from seed data', async ({ page }) => {
    // The seed script creates a demo project
    await expect(page.locator('text=Demo Project')).toBeVisible();
    await expect(
      page.locator('text=A sample project to demonstrate')
    ).toBeVisible();
  });

  test('should show project status badges', async ({ page }) => {
    // Check for status badges (at least the demo project should have one)
    await expect(
      page.locator('span').filter({ hasText: 'active' })
    ).toBeVisible();
  });

  test('should navigate back to home', async ({ page }) => {
    await page.click('text=← Back to home');
    await expect(page).toHaveURL('/');
  });
});
