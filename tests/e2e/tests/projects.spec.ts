import { test, expect } from '@playwright/test';

test.describe('Project management', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/auth/signin');

    await page.fill('#email', 'demo@example.com');
    await page.fill('#password', 'demo123');

    // Click submit
    await page.click('button[type="submit"]');

    // Wait for app navigation via router.push('/projects') and/or first projects fetch
    await Promise.race([
      page.waitForURL('**/projects*', { waitUntil: 'domcontentloaded', timeout: 20000 }),
      page.waitForResponse(
        (res) => res.request().method() === 'GET' && res.url().includes('/api/projects') && res.ok(),
        { timeout: 20000 }
      ),
    ]);

    // Projects heading should be visible now
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible({ timeout: 20000 });
  });

  test('should display projects page after login', async ({ page }) => {
    await expect(page.locator('main h1')).toContainText('Projects');
    await expect(page.getByText('Manage your projects')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Project' })).toBeVisible();
  });

  test('should create a new project', async ({ page }) => {
    const projectName = `Test Project ${Date.now()}`;
    const projectDescription = 'This is a test project created by e2e tests';

    // Open create project form
    await page.getByRole('button', { name: 'Create Project' }).click();

    await expect(page.getByText('Create New Project')).toBeVisible();

    // Fill in project details
    await page.fill('input[id="name"]', projectName);
    await page.fill('textarea[id="description"]', projectDescription);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for project to be created and form to close
    await expect(page.getByText('Create New Project')).not.toBeVisible();

    // Check if project appears in the list (use stable data-testid selectors)
    const createdCard = page
      .locator('[data-testid="project-card"]')
      .filter({ has: page.locator('[data-testid="project-name"]', { hasText: projectName }) })
      .first();

    await expect(createdCard).toBeVisible();
    await expect(createdCard.locator('[data-testid="project-description"]')).toHaveText(projectDescription);
  });

  test('should show validation error for empty project name', async ({
    page,
  }) => {
    // Open create project form
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Try to submit without filling name
    await page.click('button[type="submit"]');

    // Check for HTML5 validation (required field)
    const nameInput = page.locator('input[id="name"]');
    await expect(nameInput).toHaveAttribute('required');
  });

  test('should cancel project creation', async ({ page }) => {
    // Open create project form
    await page.getByRole('button', { name: 'Create Project' }).click();

    await expect(page.getByText('Create New Project')).toBeVisible();

    // Cancel form
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Form should be hidden
    await expect(page.getByText('Create New Project')).not.toBeVisible();
  });

  test('should delete a project', async ({ page }) => {
    // First create a project to delete
    const projectName = `Delete Test ${Date.now()}`;

    await page.getByRole('button', { name: 'Create Project' }).click();
    await page.fill('input[id="name"]', projectName);
    await page.click('button[type="submit"]');

    // Wait for project to appear
    await expect(page.locator(`text=${projectName}`)).toBeVisible();

    // Delete the project (confirmation removed in UI for test stability)
    const projectCardsByName = page
      .locator('[data-testid="project-card"]')
      .filter({ has: page.locator('[data-testid="project-name"]', { hasText: projectName }) });

    // Ensure the card is present
    await expect(projectCardsByName).toHaveCount(1);

    // Click delete inside the specific card
    await projectCardsByName.first().locator('[data-testid="delete-project"]').click();

    // Wait for the UI to reflect deletion
    await expect(projectCardsByName).toHaveCount(0, { timeout: 20000 });
  });

  test('should display demo project from seed data', async ({ page }) => {
    // The seed script creates a demo project
    await expect(page.locator('text=Demo Project')).toBeVisible();
    await expect(
      page.locator('text=A sample project to demonstrate')
    ).toBeVisible();
  });

  test('should show project status badges', async ({ page }) => {
    // Check for at least one status badge
    await expect(page.locator('.status-badge').first()).toBeVisible();
  });

  test('should navigate back to home', async ({ page }) => {
    await page.getByRole('link', { name: '← Back to home' }).click();
    await expect(page).toHaveURL('/');
  });
});
