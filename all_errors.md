Yousef@MacBook-Pro-tilhrende-Yousef ai-app-platform % 
npm run e2e -- tests/projects.spec.ts

> ai-app-platform@1.0.0 e2e
> npm run e2e --workspace=tests/e2e tests/projects.spec.ts


> @ai-app-platform/tests-e2e@1.0.0 e2e
> playwright test tests/projects.spec.ts


Running 24 tests using 4 workers
  1) [chromium] › tests/projects.spec.ts:42:7 › Project management › should create a new project 

    Error: expect(locator).not.toBeVisible() failed

    Locator:  getByText('Create New Project')
    Expected: not visible
    Received: visible
    Timeout:  5000ms

    Call log:
      - Expect "not toBeVisible" with timeout 5000ms
      - waiting for getByText('Create New Project')
        9 × locator resolved to <h3 class="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
          - unexpected value "visible"


      57 |
      58 |     // Wait for project to be created and form to close
    > 59 |     await expect(page.getByText('Create New Project')).not.toBeVisible();
         |                                                            ^
      60 |
      61 |     // Check if project appears in the list (use stable data-testid selectors)
      62 |     const createdCard = page
        at /Users/Yousef_1/Documents/GitHub/ai-app-platform/tests/e2e/tests/projects.spec.ts:59:60

    Error Context: test-results/projects-Project-management-should-create-a-new-project-chromium/error-context.md

  2) [chromium] › tests/projects.spec.ts:98:7 › Project management › should delete a project 

    TimeoutError: page.waitForResponse: Timeout 20000ms exceeded while waiting for event "response"

      119 |
      120 |     // Wait for the list to refresh (GET /api/projects) then card should disappear
    > 121 |     await page.waitForResponse((res) => res.request().method() === 'GET' && res.url().includes('/api/projects') && res.ok(), { timeout: 20000 });
          |                ^
      122 |     await expect(projectCardsByName).toHaveCount(0, { timeout: 20000 });
      123 |   });
      124 |
        at /Users/Yousef_1/Documents/GitHub/ai-app-platform/tests/e2e/tests/projects.spec.ts:121:16

    Error Context: test-results/projects-Project-management-should-delete-a-project-chromium/error-context.md

  3) [webkit] › tests/projects.spec.ts:138:7 › Project management › should navigate back to home 

    TimeoutError: page.waitForResponse: Timeout 20000ms exceeded while waiting for event "response"

      13 |
      14 |     // Wait for the credentials callback to complete (sets auth cookies)
    > 15 |     await page.waitForResponse(
         |                ^
      16 |       (res) =>
      17 |         res.request().method() === 'POST' &&
      18 |         res.url().includes('/api/auth/callback/credentials') &&
        at /Users/Yousef_1/Documents/GitHub/ai-app-platform/tests/e2e/tests/projects.spec.ts:15:16

    Error Context: test-results/projects-Project-management-should-navigate-back-to-home-webkit/error-context.md

  3 failed
    [chromium] › tests/projects.spec.ts:42:7 › Project management › should create a new project 
    [chromium] › tests/projects.spec.ts:98:7 › Project management › should delete a project 
    [webkit] › tests/projects.spec.ts:138:7 › Project management › should navigate back to home 
  21 passed (1.0m)

  Serving HTML report at http://localhost:58368. Press Ctrl+C to quit.
