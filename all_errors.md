Yousef@MacBook-Pro-tilhrende-Yousef ai-app-platform %  npm run e2e

> ai-app-platform@1.0.0 e2e
> npm run e2e --workspace=tests/e2e


> @ai-app-platform/tests-e2e@1.0.0 e2e
> playwright test


Running 66 tests using 4 workers
  1) [chromium] › tests/projects.spec.ts:32:7 › Project management › should create a new project 

    Error: expect(locator).toContainText(expected) failed

    Locator: locator('main h1')
    Expected string: "Projects"
    Received: <element(s) not found>
    Timeout: 5000ms

    Call log:
      - Expect "toContainText" with timeout 5000ms
      - waiting for locator('main h1')


      21 |
      22 |     // Ensure projects page content is visible
    > 23 |     await expect(page.locator('main h1')).toContainText('Projects');
         |                                           ^
      24 |   });
      25 |
      26 |   test('should display projects page after login', async ({ page }) => {
        at /Users/Yousef_1/Documents/GitHub/ai-app-platform/tests/e2e/tests/projects.spec.ts:23:43

    Error Context: test-results/projects-Project-management-should-create-a-new-project-chromium/error-context.md

  2) [chromium] › tests/projects.spec.ts:61:7 › Project management › should show validation error for empty project name 

    Error: expect(locator).toContainText(expected) failed

    Locator: locator('main h1')
    Expected string: "Projects"
    Received: <element(s) not found>
    Timeout: 5000ms

    Call log:
      - Expect "toContainText" with timeout 5000ms
      - waiting for locator('main h1')


      21 |
      22 |     // Ensure projects page content is visible
    > 23 |     await expect(page.locator('main h1')).toContainText('Projects');
         |                                           ^
      24 |   });
      25 |
      26 |   test('should display projects page after login', async ({ page }) => {
        at /Users/Yousef_1/Documents/GitHub/ai-app-platform/tests/e2e/tests/projects.spec.ts:23:43

    Error Context: test-results/projects-Project-managemen-0ae90-rror-for-empty-project-name-chromium/error-context.md

  3) [chromium] › tests/projects.spec.ts:88:7 › Project management › should delete a project 

    Test timeout of 30000ms exceeded.

    Error: page.waitForResponse: Test timeout of 30000ms exceeded.

      109 |
      110 |     // Wait for DELETE request to finish successfully
    > 111 |     await page.waitForResponse((res) => {
          |                ^
      112 |       return res.request().method() === 'DELETE' && res.url().includes('/api/projects/') && res.ok();
      113 |     });
      114 |
        at /Users/Yousef_1/Documents/GitHub/ai-app-platform/tests/e2e/tests/projects.spec.ts:111:16

    Error Context: test-results/projects-Project-management-should-delete-a-project-chromium/error-context.md

  4) [webkit] › tests/projects.spec.ts:26:7 › Project management › should display projects page after login 

    Error: page.goto: Navigation to "http://localhost:3000/projects" is interrupted by another navigation to "http://localhost:3000/projects"
    Call log:
      - navigating to "http://localhost:3000/projects", waiting until "load"


      18 |
      19 |     // Navigate deterministically to projects after session is established
    > 20 |     await page.goto('/projects');
         |                ^
      21 |
      22 |     // Ensure projects page content is visible
      23 |     await expect(page.locator('main h1')).toContainText('Projects');
        at /Users/Yousef_1/Documents/GitHub/ai-app-platform/tests/e2e/tests/projects.spec.ts:20:16

    Error Context: test-results/projects-Project-managemen-0542f-y-projects-page-after-login-webkit/error-context.md

  5) [webkit] › tests/projects.spec.ts:32:7 › Project management › should create a new project 

    Error: page.goto: Navigation to "http://localhost:3000/projects" is interrupted by another navigation to "http://localhost:3000/projects"
    Call log:
      - navigating to "http://localhost:3000/projects", waiting until "load"


      18 |
      19 |     // Navigate deterministically to projects after session is established
    > 20 |     await page.goto('/projects');
         |                ^
      21 |
      22 |     // Ensure projects page content is visible
      23 |     await expect(page.locator('main h1')).toContainText('Projects');
        at /Users/Yousef_1/Documents/GitHub/ai-app-platform/tests/e2e/tests/projects.spec.ts:20:16

    Error Context: test-results/projects-Project-management-should-create-a-new-project-webkit/error-context.md

  6) [webkit] › tests/projects.spec.ts:61:7 › Project management › should show validation error for empty project name 

    Error: page.goto: Navigation to "http://localhost:3000/projects" is interrupted by another navigation to "http://localhost:3000/projects"
    Call log:
      - navigating to "http://localhost:3000/projects", waiting until "load"


      18 |
      19 |     // Navigate deterministically to projects after session is established
    > 20 |     await page.goto('/projects');
         |                ^
      21 |
      22 |     // Ensure projects page content is visible
      23 |     await expect(page.locator('main h1')).toContainText('Projects');
        at /Users/Yousef_1/Documents/GitHub/ai-app-platform/tests/e2e/tests/projects.spec.ts:20:16

    Error Context: test-results/projects-Project-managemen-0ae90-rror-for-empty-project-name-webkit/error-context.md

  7) [webkit] › tests/projects.spec.ts:88:7 › Project management › should delete a project 

    Error: page.goto: Navigation to "http://localhost:3000/projects" is interrupted by another navigation to "http://localhost:3000/projects"
    Call log:
      - navigating to "http://localhost:3000/projects", waiting until "load"


      18 |
      19 |     // Navigate deterministically to projects after session is established
    > 20 |     await page.goto('/projects');
         |                ^
      21 |
      22 |     // Ensure projects page content is visible
      23 |     await expect(page.locator('main h1')).toContainText('Projects');
        at /Users/Yousef_1/Documents/GitHub/ai-app-platform/tests/e2e/tests/projects.spec.ts:20:16

    Error Context: test-results/projects-Project-management-should-delete-a-project-webkit/error-context.md

  8) [webkit] › tests/projects.spec.ts:127:7 › Project management › should show project status badges 

    Error: page.goto: Navigation to "http://localhost:3000/projects" is interrupted by another navigation to "http://localhost:3000/projects"
    Call log:
      - navigating to "http://localhost:3000/projects", waiting until "load"


      18 |
      19 |     // Navigate deterministically to projects after session is established
    > 20 |     await page.goto('/projects');
         |                ^
      21 |
      22 |     // Ensure projects page content is visible
      23 |     await expect(page.locator('main h1')).toContainText('Projects');
        at /Users/Yousef_1/Documents/GitHub/ai-app-platform/tests/e2e/tests/projects.spec.ts:20:16

    Error Context: test-results/projects-Project-managemen-0434a--show-project-status-badges-webkit/error-context.md

  9) [webkit] › tests/projects.spec.ts:119:7 › Project management › should display demo project from seed data 

    Error: page.goto: Navigation to "http://localhost:3000/projects" is interrupted by another navigation to "http://localhost:3000/projects"
    Call log:
      - navigating to "http://localhost:3000/projects", waiting until "load"


      18 |
      19 |     // Navigate deterministically to projects after session is established
    > 20 |     await page.goto('/projects');
         |                ^
      21 |
      22 |     // Ensure projects page content is visible
      23 |     await expect(page.locator('main h1')).toContainText('Projects');
        at /Users/Yousef_1/Documents/GitHub/ai-app-platform/tests/e2e/tests/projects.spec.ts:20:16

    Error Context: test-results/projects-Project-managemen-534e0-demo-project-from-seed-data-webkit/error-context.md

  10) [webkit] › tests/projects.spec.ts:132:7 › Project management › should navigate back to home 

    Error: page.goto: Navigation to "http://localhost:3000/projects" is interrupted by another navigation to "http://localhost:3000/projects"
    Call log:
      - navigating to "http://localhost:3000/projects", waiting until "load"


      18 |
      19 |     // Navigate deterministically to projects after session is established
    > 20 |     await page.goto('/projects');
         |                ^
      21 |
      22 |     // Ensure projects page content is visible
      23 |     await expect(page.locator('main h1')).toContainText('Projects');
        at /Users/Yousef_1/Documents/GitHub/ai-app-platform/tests/e2e/tests/projects.spec.ts:20:16

    Error Context: test-results/projects-Project-management-should-navigate-back-to-home-webkit/error-context.md

  11) [webkit] › tests/projects.spec.ts:75:7 › Project management › should cancel project creation 

    Test timeout of 30000ms exceeded while running "beforeEach" hook.

      2 |
      3 | test.describe('Project management', () => {
    > 4 |   test.beforeEach(async ({ page }) => {
        |        ^
      5 |     // Sign in before each test
      6 |     await page.goto('/auth/signin');
      7 |
        at /Users/Yousef_1/Documents/GitHub/ai-app-platform/tests/e2e/tests/projects.spec.ts:4:8

    Error: page.waitForResponse: Test timeout of 30000ms exceeded.

      13 |
      14 |     // Wait for credentials callback to complete successfully
    > 15 |     await page.waitForResponse((res) => {
         |                ^
      16 |       return res.url().includes('/api/auth/callback/credentials') && res.ok();
      17 |     });
      18 |
        at /Users/Yousef_1/Documents/GitHub/ai-app-platform/tests/e2e/tests/projects.spec.ts:15:16

    Error Context: test-results/projects-Project-management-should-cancel-project-creation-webkit/error-context.md

  11 failed
    [chromium] › tests/projects.spec.ts:32:7 › Project management › should create a new project 
    [chromium] › tests/projects.spec.ts:61:7 › Project management › should show validation error for empty project name 
    [chromium] › tests/projects.spec.ts:88:7 › Project management › should delete a project 
    [webkit] › tests/projects.spec.ts:26:7 › Project management › should display projects page after login 
    [webkit] › tests/projects.spec.ts:32:7 › Project management › should create a new project 
    [webkit] › tests/projects.spec.ts:61:7 › Project management › should show validation error for empty project name 
    [webkit] › tests/projects.spec.ts:75:7 › Project management › should cancel project creation 
    [webkit] › tests/projects.spec.ts:88:7 › Project management › should delete a project 
    [webkit] › tests/projects.spec.ts:119:7 › Project management › should display demo project from seed data 
    [webkit] › tests/projects.spec.ts:127:7 › Project management › should show project status badges 
    [webkit] › tests/projects.spec.ts:132:7 › Project management › should navigate back to home 
  55 passed (1.6m)

  Serving HTML report at http://localhost:9323. Press Ctrl+C to quit.
