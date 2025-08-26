import { test, expect } from './fixtures/base-fixtures';

test.describe('Home Page Tests', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });
  
  test('should display hero title', async ({ homePage }) => {
    const title = await homePage.getHeroTitle();
    expect(title).toContain('Tale Forge');
  });
  
  test('should navigate to create story page', async ({ homePage, page }) => {
    await homePage.clickCreateStory();
    await expect(page).toHaveURL(/.*create/);
  });
  
  test('should navigate to stories list page', async ({ homePage, page }) => {
    await homePage.clickViewStories();
    await expect(page).toHaveURL(/.*stories/);
  });
  
  test('should display feature cards', async ({ homePage }) => {
    const features = await homePage.getFeatureCardTitles();
    expect(features.length).toBeGreaterThan(0);
  });
  
  test('should have navigation bar', async ({ homePage }) => {
    await expect(homePage.navBar).toBeVisible();
  });
  
  test('should have footer', async ({ homePage }) => {
    await expect(homePage.footer).toBeVisible();
  });
  
  test('should take screenshot of home page', async ({ homePage }) => {
    await homePage.takeScreenshot('home-page');
  });
  
  test('should be responsive on mobile', async ({ page, homePage }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await homePage.goto();
    
    // Check that elements are still visible
    await expect(homePage.heroTitle).toBeVisible();
    await expect(homePage.createStoryButton).toBeVisible();
  });
});