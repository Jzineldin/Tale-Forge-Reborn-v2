import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup function that runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Running global setup...');
  
  // Example: Set up authentication state that can be reused
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to your app and perform any setup
  // For example, login and save authentication state
  try {
    await page.goto(config.projects[0].use.baseURL || 'http://localhost:3000');
    
    // Example: Check if app is accessible
    await page.waitForLoadState('networkidle');
    
    // You can save authentication state here if needed
    // await page.context().storageState({ path: 'tests/e2e/auth.json' });
    
    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;