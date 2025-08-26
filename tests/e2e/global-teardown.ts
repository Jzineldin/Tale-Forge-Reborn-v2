import { FullConfig } from '@playwright/test';

/**
 * Global teardown function that runs once after all tests
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Running global teardown...');
  
  // Perform any cleanup operations here
  // For example: Clean up test data from database, remove temp files, etc.
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;