import { test, expect } from '@playwright/test';

test.describe('LLM Test page', () => {
  test('should display LLM test interface', async ({ page }) => {
    await page.goto('/llm-test');

    // Check main heading
    await expect(page.locator('h1')).toContainText('LiteLLM Model Test');

    // Check form elements are present
    await expect(page.locator('select')).toBeVisible(); // Model selector
    await expect(page.locator('input[type="number"]').first()).toBeVisible(); // Temperature input
    await expect(page.locator('textarea')).toBeVisible(); // Prompt input
    await expect(page.locator('button[type="submit"]')).toBeVisible(); // Send button

    // Check initial state
    await expect(page.locator('button[type="submit"]')).toBeDisabled(); // Should be disabled when prompt is empty
  });

  test('should enable submit button when prompt is entered', async ({ page }) => {
    await page.goto('/llm-test');

    // Initially disabled
    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    // Fill in prompt
    await page.fill('textarea', 'Hello, this is a test prompt');

    // Should now be enabled
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('should have correct default values', async ({ page }) => {
    await page.goto('/llm-test');

    // Check default model
    await expect(page.locator('select')).toHaveValue('gpt-3.5-turbo');

    // Check default temperature
    await expect(page.locator('input[type="number"]').first()).toHaveValue('0.7');

    // Check default max tokens
    await expect(page.locator('input[type="number"]').nth(1)).toHaveValue('150');
  });

  test('should allow changing model selection', async ({ page }) => {
    await page.goto('/llm-test');

    // Change model
    await page.selectOption('select', 'gpt-4');
    await expect(page.locator('select')).toHaveValue('gpt-4');

    // Change to Claude
    await page.selectOption('select', 'claude-3-sonnet');
    await expect(page.locator('select')).toHaveValue('claude-3-sonnet');
  });

  test('should validate temperature input range', async ({ page }) => {
    await page.goto('/llm-test');

    const temperatureInput = page.locator('input[type="number"]').first();

    // Check min/max attributes
    await expect(temperatureInput).toHaveAttribute('min', '0');
    await expect(temperatureInput).toHaveAttribute('max', '2');
    await expect(temperatureInput).toHaveAttribute('step', '0.1');
  });

  test('should validate max tokens input', async ({ page }) => {
    await page.goto('/llm-test');

    const maxTokensInput = page.locator('input[type="number"]').nth(1);

    // Check min/max attributes
    await expect(maxTokensInput).toHaveAttribute('min', '1');
    await expect(maxTokensInput).toHaveAttribute('max', '4000');
  });

  test('should show loading state when submitting', async ({ page }) => {
    await page.goto('/llm-test');

    // Mock the API endpoint to delay response
    await page.route('/api/llm', async (route) => {
      // Delay response to test loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            response: {
              choices: [{
                message: {
                  role: 'assistant',
                  content: 'This is a test response from the mock API.'
                }
              }],
              usage: {
                prompt_tokens: 5,
                completion_tokens: 10,
                total_tokens: 15
              }
            },
            metrics: {
              latency: 500,
              cost: 0.0001
            }
          }
        })
      });
    });

    // Fill form and submit
    await page.fill('textarea', 'Test prompt');
    
    // Click submit and immediately check for loading state
    const submitPromise = page.click('button[type="submit"]');
    
    // Check loading state appears
    await expect(page.locator('button:has-text("Sending...")')).toBeVisible();
    
    // Wait for submit to complete
    await submitPromise;
    
    // Check that loading state is gone and response is shown
    await expect(page.locator('button:has-text("Send Request")')).toBeVisible();
    await expect(page.locator('text=This is a test response')).toBeVisible();
  });

  test('should display error message on API failure', async ({ page }) => {
    await page.goto('/llm-test');

    // Mock API to return error
    await page.route('/api/llm', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Test error message'
        })
      });
    });

    // Fill form and submit
    await page.fill('textarea', 'Test prompt');
    await page.click('button[type="submit"]');

    // Check error message appears
    await expect(page.locator('text=Error')).toBeVisible();
    await expect(page.locator('text=Test error message')).toBeVisible();
  });

  test('should display success response with metrics', async ({ page }) => {
    await page.goto('/llm-test');

    // Mock successful API response
    await page.route('/api/llm', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            response: {
              choices: [{
                message: {
                  role: 'assistant',
                  content: 'Hello! This is a test response.'
                }
              }],
              usage: {
                prompt_tokens: 8,
                completion_tokens: 12,
                total_tokens: 20
              }
            },
            metrics: {
              latency: 750,
              cost: 0.00025
            }
          }
        })
      });
    });

    // Fill form and submit
    await page.fill('textarea', 'Hello, test!');
    await page.click('button[type="submit"]');

    // Wait for response
    await expect(page.locator('text=Hello! This is a test response.')).toBeVisible();

    // Check metrics are displayed
    await expect(page.locator('text=750ms')).toBeVisible(); // Latency
    await expect(page.locator('text=$0.0003')).toBeVisible(); // Cost (rounded)
    await expect(page.locator('text=8')).toBeVisible(); // Input tokens
    await expect(page.locator('text=12')).toBeVisible(); // Output tokens
  });
});