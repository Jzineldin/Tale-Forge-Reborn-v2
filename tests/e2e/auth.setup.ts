import { test as setup } from '@playwright/test';
import { AuthHelper } from './helpers/auth';

const authFile = 'tests/e2e/.auth/user.json';

/**
 * Setup authentication before running tests
 * This runs once and saves the authentication state
 */
setup('authenticate', async ({ page }) => {
  console.log('🚀 Setting up authentication...');
  
  // Use the provided credentials
  const email = 'jzineldin@gmail.com';
  const password = 'Rashzin1996!';
  
  try {
    // Perform login
    await AuthHelper.login(page, email, password);
    
    // Verify login was successful
    const isLoggedIn = await AuthHelper.isLoggedIn(page);
    
    if (!isLoggedIn) {
      throw new Error('Login verification failed - user does not appear to be logged in');
    }
    
    // Save storage state
    await page.context().storageState({ path: authFile });
    
    console.log('✅ Authentication setup completed successfully');
  } catch (error) {
    console.error('❌ Authentication setup failed:', error);
    throw error;
  }
});