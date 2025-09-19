import { test, expect } from '@playwright/test';

test.describe('Project management', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/auth/signin', { waitUntil: 'networkidle' });

    // Wait for the signin form to be ready
    await expect(page.locator('#email')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#password')).toBeVisible({ timeout: 10000 });

    await page.fill('#email', 'demo@example.com');
    await page.fill('#password', 'demo123');

    // Click submit and wait for navigation
    await Promise.all([
      page.waitForURL('**/projects*', {
        waitUntil: 'networkidle',
        timeout: 30000,
      }),
      page.click('button[type="submit"]'),
    ]);

    // Wait for projects API call to complete and page to be ready
    await page.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        res.url().includes('/api/projects') &&
        res.ok(),
      { timeout: 30000 }
    );

    // Projects heading should be visible now
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible({
      timeout: 30000,
    });
  });

  test('should display projects page after login', async ({ page }) => {
    await expect(page.locator('main h1')).toContainText('Projects');
    await expect(page.getByText('Manage your projects')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Create Project' })
    ).toBeVisible();
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
      .filter({
        has: page.locator('[data-testid="project-name"]', {
          hasText: projectName,
        }),
      })
      .first();

    await expect(createdCard).toBeVisible();
    await expect(
      createdCard.locator('[data-testid="project-description"]')
    ).toHaveText(projectDescription);
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

    // Wait for Create Project button to be available
    await expect(page.getByRole('button', { name: 'Create Project' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Create Project' }).click();
    
    // Wait for form to be visible
    await expect(page.locator('input[id="name"]')).toBeVisible({ timeout: 10000 });
    await page.fill('input[id="name"]', projectName);
    
    // Submit and wait for response
    await Promise.all([
      page.waitForResponse(
        (res) => res.request().method() === 'POST' && res.url().includes('/api/projects'),
        { timeout: 10000 }
      ),
      page.click('button[type="submit"]'),
    ]);

    // Wait for project to appear in the list
    await expect(page.locator(`text=${projectName}`)).toBeVisible({ timeout: 15000 });

    // Find the specific project card
    const projectCardsByName = page
      .locator('[data-testid="project-card"]')
      .filter({
        has: page.locator('[data-testid="project-name"]', {
          hasText: projectName,
        }),
      });

    // Ensure the card is present
    await expect(projectCardsByName).toHaveCount(1, { timeout: 10000 });

    // Click delete inside the specific card and wait for API response
    await Promise.all([
      page.waitForResponse(
        (res) => res.request().method() === 'DELETE' && res.url().includes('/api/projects'),
        { timeout: 10000 }
      ),
      projectCardsByName
        .first()
        .locator('[data-testid="delete-project"]')
        .click(),
    ]);

    // Wait for the UI to reflect deletion
    await expect(projectCardsByName).toHaveCount(0, { timeout: 30000 });
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
