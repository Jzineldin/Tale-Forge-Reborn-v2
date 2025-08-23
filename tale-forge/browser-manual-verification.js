// Browser Manual Verification - Automated execution of console script
import { chromium } from 'playwright';
import fs from 'fs';

async function runManualVerification() {
  console.log('🚀 RUNNING MANUAL STORY VERIFICATION IN BROWSER');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  // Listen to console logs from the page
  page.on('console', msg => {
    console.log(`🖥️  BROWSER: ${msg.text()}`);
  });
  
  try {
    // Login first
    console.log('🔐 Logging in...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.locator('button:has-text("Sign In")').first().click();
    await page.fill('input[type="email"]', 'jzineldin@gmail.com');
    await page.fill('input[type="password"]', 'Rashzin1996!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    
    console.log('✅ Logged in successfully');
    
    // Read the manual verification script
    const scriptContent = fs.readFileSync('./manual-story-verification.js', 'utf8');
    
    // Execute the script in browser console
    console.log('🔍 Executing verification script in browser console...');
    await page.evaluate(scriptContent);
    
    // Wait for the verification to complete
    await page.waitForTimeout(15000);
    
    console.log('✅ Manual verification completed - check browser console output above');
    
    // Keep browser open for manual inspection
    console.log('🔍 Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Browser verification failed:', error);
  } finally {
    await browser.close();
  }
}

// Execute verification
runManualVerification().catch(console.error);