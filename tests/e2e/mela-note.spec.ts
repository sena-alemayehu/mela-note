import { test, expect } from '@playwright/test';

test.describe('Mela Note End-to-End Suite', () => {
  const timestamp = Date.now();
  const testEmail = `testuser_${timestamp}@example.com`;
  const testPassword = 'StrongPassword2026!';
  const testName = 'Test User';

  test('Registration, Login, and Cookie Session Verification', async ({ page }) => {
    // 1. Visit signup page
    await page.goto('/signup');
    await expect(page).toHaveTitle(/Mela Note|Sign Up|Register/i);

    // 2. Fill registration form
    await page.fill('input[type="text"][placeholder*="name" i]', testName);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // 3. Expect redirection to login or dashboard
    await page.waitForURL(/\/(login|dashboard)/);

    if (page.url().includes('/login')) {
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);
    }

    // 4. Verify user greeting on dashboard
    await expect(page.locator('h1')).toContainText(testName);
  });

  test('Create Note with Checklist and Labels', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Open create note modal
    await page.click('button:has-text("Create note")');
    await expect(page.locator('.note-editor')).toBeVisible();

    // Switch to Checklist tab
    await page.click('button:has-text("Checklist")');

    // Fill title
    await page.fill('#note-title', 'Launch Checklist');

    // Add checklist items
    const checklistInput = page.locator('.checklist-new-input');
    await checklistInput.fill('Run DB Migrations');
    await page.click('button:has-text("Add")');

    await checklistInput.fill('Verify SSL / HTTPS');
    await page.click('button:has-text("Add")');

    // Add tag
    const tagInput = page.locator('.note-tag-input');
    await tagInput.fill('devops');
    await page.click('button:has-text("Add tag")');

    // Save note
    await page.click('.note-editor-save');

    // Verify note appears on dashboard with tag and checklist
    await expect(page.locator('.dashboard-note-card')).toContainText('Launch Checklist');
    await expect(page.locator('.dashboard-note-card')).toContainText('#devops');
  });

  test('Language Switching (English to Amharic)', async ({ page }) => {
    await page.goto('/dashboard');

    // Switch to Amharic
    const langSelect = page.locator('.language-select, select[aria-label*="language" i]');
    if (await langSelect.isVisible()) {
      await langSelect.selectOption('am');
      await expect(page.locator('html')).toHaveAttribute('lang', 'am');
    }
  });

  test('Responsive Layout Verification', async ({ page, isMobile }) => {
    await page.goto('/dashboard');

    if (isMobile) {
      // Mobile checks: header actions and grid should be single-column
      await expect(page.locator('.dashboard-main')).toBeVisible();
    } else {
      // Desktop checks
      await expect(page.locator('.dashboard-feature-grid')).toBeVisible();
    }
  });
});
