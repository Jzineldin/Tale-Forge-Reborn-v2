import { test, expect } from './fixtures/base-fixtures';

test.describe('Authenticated Home Page Tests', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });
  
  test('should show user is logged in', async ({ homePage }) => {
    const isLoggedIn = await homePage.isSignedIn();
    expect(isLoggedIn).toBeTruthy();
  });
  
  test('should navigate to create story page when authenticated', async ({ homePage, page }) => {
    await homePage.clickCreateStory();
    await expect(page).toHaveURL(/.*\/create/);
    
    // Verify we're on the create page
    const heading = page.locator('h1, h2').filter({ hasText: /create|story|wizard/i }).first();
    await expect(heading).toBeVisible();
  });
  
  test('should navigate to dashboard when authenticated', async ({ homePage, page }) => {
    await homePage.clickViewStories();
    
    // When logged in, should go to stories (which serves as dashboard)
    await expect(page).toHaveURL(/.*\/stories/);
    
    // Verify dashboard elements - stories page serves as user dashboard
    const dashboardTitle = page.locator('h1, h2').filter({ hasText: /stories|universe|dashboard/i }).first();
    await expect(dashboardTitle).toBeVisible();
  });
  
  test('should not show sign in button when authenticated', async ({ homePage }) => {
    // Sign in button should not be visible when logged in
    const signInVisible = await homePage.signInButton.isVisible().catch(() => false);
    expect(signInVisible).toBeFalsy();
  });
  
  test('should show dashboard link when authenticated', async ({ page }) => {
    // Look for dashboard navigation link
    const dashboardLink = page.locator('a[href="/dashboard"], button:has-text("Dashboard")').first();
    await expect(dashboardLink).toBeVisible();
  });
});