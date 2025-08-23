const { chromium } = require('playwright');

async function testStoryGeneration() {
  console.log('🚀 Starting Tale Forge optimization test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to Tale Forge
    console.log('📍 Navigating to Tale Forge...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Log in with test credentials
    console.log('🔐 Logging in...');
    
    // Check if we're already logged in or need to log in
    const isLoggedIn = await page.locator('[data-testid="dashboard"]').count() > 0 ||
                       await page.locator('text=Create Story').count() > 0 ||
                       await page.locator('text=My Stories').count() > 0;
    
    if (!isLoggedIn) {
      // Look for sign in button or login form
      await page.click('text=Sign In', { timeout: 5000 }).catch(() => {});
      await page.click('text=Login', { timeout: 5000 }).catch(() => {});
      await page.click('[data-testid="sign-in-button"]', { timeout: 5000 }).catch(() => {});
      
      // Wait for login form to appear
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Fill login form
      await page.fill('input[type="email"]', 'jzineldin@gmail.com');
      await page.fill('input[type="password"]', 'Rashzin1996!');
      
      // Submit login
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      
      // Wait for dashboard to load
      await page.waitForSelector('text=Create Story', { timeout: 15000 });
    }
    
    console.log('✅ Successfully logged in');
    
    // Create a new story
    console.log('📖 Creating a new test story...');
    await page.click('text=Create Story');
    await page.waitForLoadState('networkidle');
    
    // Fill story creation form
    await page.fill('input[name="title"]', 'API Optimization Test Story');
    await page.fill('textarea[name="description"]', 'Testing the single API call optimization for story generation.');
    
    // Select story settings
    await page.selectOption('select[name="genre"]', 'fantasy');
    await page.selectOption('select[name="target_age"]', '7-9');
    
    // Create the story
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Story created successfully');
    
    // Wait for story to be ready and generate first segment
    console.log('⏱️ Starting story segment generation - monitoring performance...');
    
    const startTime = Date.now();
    
    // Start generation and monitor network
    await page.click('text=Start Story', { timeout: 10000 });
    
    // Wait for segment generation to complete
    await page.waitForSelector('.story-segment', { timeout: 60000 });
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`📊 Story segment generation completed in ${totalTime}ms (${(totalTime/1000).toFixed(2)}s)`);
    
    // Check if choices were generated
    const choicesCount = await page.locator('.choice-button').count();
    console.log(`🎯 Generated ${choicesCount} choices`);
    
    if (choicesCount >= 3) {
      console.log('✅ Choice generation successful');
      
      // Generate second segment to test continued optimization
      console.log('🔄 Testing second segment generation...');
      const secondStartTime = Date.now();
      
      // Click the first choice
      await page.click('.choice-button:first-child');
      await page.waitForSelector('.story-segment:nth-child(2)', { timeout: 60000 });
      
      const secondEndTime = Date.now();
      const secondTotalTime = secondEndTime - secondStartTime;
      
      console.log(`📊 Second segment generated in ${secondTotalTime}ms (${(secondTotalTime/1000).toFixed(2)}s)`);
      
      // Performance analysis
      console.log('\n📈 PERFORMANCE ANALYSIS:');
      console.log(`First segment: ${(totalTime/1000).toFixed(2)}s`);
      console.log(`Second segment: ${(secondTotalTime/1000).toFixed(2)}s`);
      console.log(`Average: ${((totalTime + secondTotalTime)/2000).toFixed(2)}s`);
      
      if (totalTime < 15000 && secondTotalTime < 15000) {
        console.log('🚀 OPTIMIZATION SUCCESS: Both segments generated in under 15 seconds');
        console.log('   Expected: Single API call optimization is working');
      } else if (totalTime > 20000 || secondTotalTime > 20000) {
        console.log('⚠️  POTENTIAL FALLBACK: Longer generation time detected');
        console.log('   Expected: Falling back to dual API call method');
      } else {
        console.log('📊 MODERATE PERFORMANCE: Generation time in expected range');
      }
    } else {
      console.log('❌ Choice generation failed');
    }
    
    // Take screenshot for verification
    await page.screenshot({ path: 'optimization-test-result.png', fullPage: true });
    console.log('📷 Screenshot saved as optimization-test-result.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'optimization-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the test
testStoryGeneration().catch(console.error);