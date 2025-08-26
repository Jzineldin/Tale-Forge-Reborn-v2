import { test, expect } from '@playwright/test';

test.describe('Templates Page', () => {
  test('should load without errors', async ({ page }) => {
    // Go to the templates page
    await page.goto('http://localhost:3004/templates');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Tale Forge/i);
    
    // Check that the main heading is present
    await expect(page.locator('h1')).toContainText('Template Marketplace');
    
    // Check that no console errors occurred
    const logs = await page.evaluate(() => console);
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/templates-page.png', fullPage: true });
    
    console.log('✅ Templates page loaded successfully!');
  });
  
  test('should have working navigation', async ({ page }) => {
    await page.goto('http://localhost:3004/');
    
    // Find and click the Templates link in navigation
    await page.click('text=Templates');
    
    // Verify we're on the templates page
    await expect(page).toHaveURL(/templates/);
    await expect(page.locator('h1')).toContainText('Template Marketplace');
    
    console.log('✅ Navigation to Templates page works!');
  });
  
  test('should display template categories', async ({ page }) => {
    await page.goto('http://localhost:3004/templates');
    await page.waitForLoadState('networkidle');
    
    // Check that filter categories are present
    const categories = ['All', 'Fantasy', 'Science Fiction', 'Adventure'];
    
    for (const category of categories) {
      await expect(page.locator(`button:has-text("${category}")`)).toBeVisible();
    }
    
    console.log('✅ Template categories are displayed!');
  });
});