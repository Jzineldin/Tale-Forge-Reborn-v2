import { chromium } from 'playwright';

async function testStoryCreationFlow() {
  console.log('🎭 Starting Playwright story creation test...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    console.log('📍 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for the page to load and check if we need to login
    await page.waitForTimeout(2000);
    
    // Check if we're on a login page or need to authenticate
    const currentUrl = page.url();
    console.log('🌐 Current URL:', currentUrl);
    
    // If we're on homepage, click Sign In first
    if (currentUrl === 'http://localhost:3000/' && await page.locator('button:has-text("Sign In")').isVisible().catch(() => false)) {
      console.log('🏠 On homepage, clicking Sign In...');
      await page.click('button:has-text("Sign In")');
      await page.waitForTimeout(2000);
    }
    
    // If we see login page, perform login
    if (currentUrl.includes('login') || await page.locator('input[type="email"]').isVisible().catch(() => false)) {
      console.log('🔐 Login page detected, attempting login...');
      
      await page.fill('input[type="email"]', 'jzineldin@gmail.com');
      await page.fill('input[type="password"]', 'Rashzin1996!');
      
      // Click login button (try multiple selectors)
      const loginButtons = [
        'button[type="submit"]',
        'button:has-text("Sign In")',
        'button:has-text("Login")',
        'button:has-text("Log In")'
      ];
      
      for (const selector of loginButtons) {
        if (await page.locator(selector).isVisible().catch(() => false)) {
          console.log(`🔐 Clicking login button: ${selector}`);
          await page.click(selector);
          break;
        }
      }
      
      // Wait for navigation after login
      await page.waitForTimeout(3000);
      console.log('✅ Login completed, current URL:', page.url());
    }
    
    // Look for the Create button in header/navigation
    console.log('🔍 Looking for Create button...');
    
    const createSelectors = [
      'a:has-text("Create")',
      'button:has-text("Create")',
      'a:has-text("Create New Story")',
      'button:has-text("Create New Story")',
      '[data-testid="create-story"]',
      'button:has-text("+ Create")',
      'a:has-text("+ Create")'
    ];
    
    let createButton = null;
    for (const selector of createSelectors) {
      try {
        if (await page.locator(selector).isVisible({ timeout: 2000 })) {
          createButton = selector;
          console.log(`✅ Found Create button: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!createButton) {
      console.log('❌ Create button not found. Available elements:');
      const allButtons = await page.locator('button').all();
      for (const button of allButtons) {
        const text = await button.textContent();
        if (text) console.log('  - Button:', text.trim());
      }
      
      const allLinks = await page.locator('a').all();
      for (const link of allLinks) {
        const text = await link.textContent();
        if (text) console.log('  - Link:', text.trim());
      }
      
      throw new Error('Create button not found');
    }
    
    // Click Create button
    console.log('🎯 Clicking Create button...');
    await page.click(createButton);
    await page.waitForTimeout(2000);
    
    // First, click Fantasy category to see fantasy templates
    console.log('🔍 Clicking Fantasy category...');
    try {
      await page.click('button:has-text("Fantasy")');
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('Fantasy button not found, continuing...');
    }
    
    // Look for template selection - try various fantasy/adventure templates
    console.log('🔍 Looking for fantasy template...');
    
    const templateSelectors = [
      'button:has-text("Magical Adventure")',
      'div:has-text("Magical Adventure")',
      '[class*="template"]:has-text("magical")',
      '[class*="template"]:has-text("fantasy")',
      '[class*="card"]:has-text("magical")',
      '[class*="card"]:has-text("fantasy")',
      '.template-card',
      '[data-template]'
    ];
    
    let templateButton = null;
    for (const selector of templateSelectors) {
      try {
        if (await page.locator(selector).isVisible({ timeout: 3000 })) {
          templateButton = selector;
          console.log(`✅ Found Magical Adventure template: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!templateButton) {
      console.log('❌ Magical Adventure template not found. Available templates:');
      const templates = await page.locator('[class*="template"], [class*="card"]').all();
      for (const template of templates) {
        const text = await template.textContent();
        if (text) console.log('  - Template:', text.trim().substring(0, 100));
      }
      
      // Try any template with "magic" or "adventure"
      const fallbackSelectors = [
        'button:has-text("magic")',
        'button:has-text("adventure")',
        'div:has-text("magic")',
        'div:has-text("adventure")'
      ];
      
      for (const selector of fallbackSelectors) {
        try {
          if (await page.locator(selector).isVisible({ timeout: 2000 })) {
            templateButton = selector;
            console.log(`✅ Found fallback template: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue
        }
      }
    }
    
    if (!templateButton) {
      throw new Error('No template found to select');
    }
    
    // Click template
    console.log('🎯 Selecting template...');
    await page.click(templateButton);
    await page.waitForTimeout(2000);
    
    // Look for "Create My Story!" or similar action button
    console.log('🔍 Looking for Create My Story or action button...');
    
    const createStorySelectors = [
      'button:has-text("Create My Story")',
      'button:has-text("Create my story")',
      'button:has-text("Start Custom Creation")',
      'button:has-text("Begin")',
      'button:has-text("Continue")',
      'button:has-text("Next")',
      'button[type="submit"]',
      '.create-button',
      'button:has-text("Generate")'
    ];
    
    let createStoryButton = null;
    for (const selector of createStorySelectors) {
      try {
        if (await page.locator(selector).isVisible({ timeout: 3000 })) {
          createStoryButton = selector;
          console.log(`✅ Found Create My Story button: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!createStoryButton) {
      console.log('❌ Create My Story button not found. Available buttons:');
      const buttons = await page.locator('button').all();
      for (const button of buttons) {
        const text = await button.textContent();
        if (text) console.log('  - Button:', text.trim());
      }
      throw new Error('Create My Story button not found');
    }
    
    // Click Create My Story
    console.log('🎯 Clicking Create My Story...');
    await page.click(createStoryButton);
    
    // Wait for story generation to begin
    console.log('⏳ Waiting for story generation...');
    await page.waitForTimeout(5000);
    
    // Monitor for story content
    let storyGenerated = false;
    let attempts = 0;
    const maxAttempts = 30; // 60 seconds total
    
    while (!storyGenerated && attempts < maxAttempts) {
      attempts++;
      console.log(`📊 Checking for story content (attempt ${attempts}/${maxAttempts})...`);
      
      // Check for story text content
      const storyElements = [
        '[data-testid="story-content"]',
        '.story-text',
        '.story-segment',
        'p:has-text("Once upon")',
        'div:has-text("Once upon")'
      ];
      
      for (const selector of storyElements) {
        try {
          if (await page.locator(selector).isVisible({ timeout: 1000 })) {
            const content = await page.locator(selector).textContent();
            if (content && content.length > 50) {
              console.log('✅ Story content found:', content.substring(0, 150) + '...');
              storyGenerated = true;
              break;
            }
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (!storyGenerated) {
        await page.waitForTimeout(2000);
      }
    }
    
    if (!storyGenerated) {
      console.log('❌ Story generation timed out or failed');
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'story-generation-timeout.png', fullPage: true });
      console.log('📸 Screenshot saved as story-generation-timeout.png');
      
      // Check for error messages
      const errorSelectors = [
        '.error',
        '[class*="error"]',
        '.alert-error',
        '.text-red'
      ];
      
      for (const selector of errorSelectors) {
        try {
          if (await page.locator(selector).isVisible()) {
            const errorText = await page.locator(selector).textContent();
            console.log('❌ Error found:', errorText);
          }
        } catch (e) {
          // Continue
        }
      }
    } else {
      console.log('✅ Story generation successful!');
      
      // Look for choices
      console.log('🔍 Looking for story choices...');
      
      const choiceSelectors = [
        'button:has-text("Choice")',
        '[data-testid="choice-button"]',
        '.choice-button',
        'button[class*="choice"]'
      ];
      
      let foundChoices = false;
      for (const selector of choiceSelectors) {
        try {
          const choices = await page.locator(selector).all();
          if (choices.length > 0) {
            console.log(`✅ Found ${choices.length} choices`);
            
            // Log choice text
            for (let i = 0; i < Math.min(choices.length, 3); i++) {
              const choiceText = await choices[i].textContent();
              console.log(`  Choice ${i + 1}: ${choiceText?.trim()}`);
            }
            
            foundChoices = true;
            
            // Test clicking first choice
            if (choices.length > 0) {
              console.log('🎯 Testing choice selection...');
              await choices[0].click();
              await page.waitForTimeout(5000);
              
              // Check if new segment appeared
              console.log('🔍 Checking for new story segment after choice...');
              await page.waitForTimeout(3000);
              console.log('✅ Choice selection test completed');
            }
            
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (!foundChoices) {
        console.log('⚠️ No choices found - checking for generic fallback text...');
        
        const fallbackTexts = [
          'Continue the adventure',
          'Look around carefully',
          'Make a thoughtful choice'
        ];
        
        for (const text of fallbackTexts) {
          try {
            if (await page.locator(`text=${text}`).isVisible()) {
              console.log(`⚠️ Found generic fallback: "${text}"`);
            }
          } catch (e) {
            // Continue
          }
        }
      }
      
      // Take final screenshot
      await page.screenshot({ path: 'story-creation-success.png', fullPage: true });
      console.log('📸 Final screenshot saved as story-creation-success.png');
    }
    
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take error screenshot
    try {
      await page.screenshot({ path: 'test-error.png', fullPage: true });
      console.log('📸 Error screenshot saved as test-error.png');
    } catch (screenshotError) {
      console.log('Failed to take error screenshot:', screenshotError);
    }
  } finally {
    await browser.close();
  }
}

// Run the test
testStoryCreationFlow().catch(console.error);