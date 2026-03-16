import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5177';

test.describe('Login Demo Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  });

  test('Demo Admin button should fill credentials', async ({ page }) => {
    // Click Demo Admin button
    await page.click('text=Demo Admin');

    // Check email field
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveValue('admin2@qgocargo.com');

    // Check password field
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveValue('demo123');

    console.log('✅ Demo Admin credentials filled');
  });

  test('Demo Surveyor button should fill credentials', async ({ page }) => {
    // Click Demo Surveyor button
    await page.click('text=Demo Surveyor');

    // Check email field
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveValue('surveyor@qgocargo.com');

    // Check password field
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveValue('demo123');

    console.log('✅ Demo Surveyor credentials filled');
  });

  test('Admin login should redirect to admin dashboard', async ({ page }) => {
    // Capture console errors
    page.on('console', msg => {
      console.log(`🔍 Console [${msg.type()}]:`, msg.text());
    });

    // Click Demo Admin button
    await page.click('text=Demo Admin');
    await page.waitForTimeout(500);

    // Click Sign In
    await page.click('button:has-text("Sign In")');

    // Wait for button to change to "Signing in..."
    await page.waitForSelector('button:has-text("Signing in...")', { timeout: 5000 });
    console.log('✅ Button changed to Signing in...');

    // Wait for redirect to admin dashboard (longer timeout)
    await page.waitForURL('**/admin**', { timeout: 60000 });

    // Verify we're on admin page
    expect(page.url()).toContain('/admin');
    console.log('✅ Admin login successful - redirected to /admin');
  });

  test('Surveyor login should redirect to surveyor dashboard', async ({ page }) => {
    // Capture console errors
    page.on('console', msg => {
      console.log(`🔍 Console [${msg.type()}]:`, msg.text());
    });

    // Click Demo Surveyor button
    await page.click('text=Demo Surveyor');
    await page.waitForTimeout(500);

    // Click Sign In
    await page.click('button:has-text("Sign In")');

    // Wait for button to change to "Signing in..."
    await page.waitForSelector('button:has-text("Signing in...")', { timeout: 5000 });
    console.log('✅ Button changed to Signing in...');

    // Wait for redirect to surveyor dashboard (longer timeout)
    await page.waitForURL('**/surveyor**', { timeout: 60000 });

    // Verify we're on surveyor page
    expect(page.url()).toContain('/surveyor');
    console.log('✅ Surveyor login successful - redirected to /surveyor');
  });
});
