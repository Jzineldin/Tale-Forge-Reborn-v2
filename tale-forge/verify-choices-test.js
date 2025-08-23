import { chromium } from 'playwright';

async function verifyChoicesTest() {
  console.log('🎭 Starting choice verification test...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  
  try {
    // Navigate to localhost:3000 and login
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Quick login
    if (await page.locator('button:has-text("Sign In")').isVisible().catch(() => false)) {
      await page.click('button:has-text("Sign In")');
      await page.waitForTimeout(1000);
    }
    
    if (await page.locator('input[type="email"]').isVisible().catch(() => false)) {
      await page.fill('input[type="email"]', 'jzineldin@gmail.com');
      await page.fill('input[type="password"]', 'Rashzin1996!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    // Go to stories to find an existing story
    console.log('🔍 Looking for existing stories...');
    
    // Try to find Stories link
    if (await page.locator('a:has-text("Stories")').isVisible().catch(() => false)) {
      await page.click('a:has-text("Stories")');
      await page.waitForTimeout(2000);
    }
    
    // Look for a story to continue/read
    const storyLinks = [
      'a:has-text("Continue Story")',
      'a:has-text("Read Story")', 
      'a:has-text("View Story")',
      '[class*="story-card"]',
      '[data-story-id]'
    ];
    
    let storyFound = false;
    for (const selector of storyLinks) {
      try {
        if (await page.locator(selector).first().isVisible({ timeout: 2000 })) {
          console.log(`✅ Found story: ${selector}`);
          await page.click(selector, { timeout: 5000 });
          storyFound = true;
          await page.waitForTimeout(3000);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!storyFound) {
      console.log('⚠️ No existing story found, will check the generated one from previous test');
      // The previous test should have left us on a story page
    }
    
    // Look for choices and analyze them
    console.log('🔍 Looking for story choices...');
    
    const choiceSelectors = [
      'button[class*="choice"]',
      '[data-choice-id]',
      'button:has-text("swim")',
      'button:has-text("explore")',
      'button:has-text("talk")',
      'button[class*="bg-amber"]' // Based on the orange choices in screenshot
    ];
    
    let choices = [];
    for (const selector of choiceSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          console.log(`✅ Found ${elements.length} choices with selector: ${selector}`);
          
          for (let i = 0; i < elements.length; i++) {
            try {
              const choiceText = await elements[i].textContent();
              if (choiceText && choiceText.trim().length > 5) {
                choices.push(choiceText.trim());
              }
            } catch (e) {
              console.log('Error getting choice text:', e);
            }
          }
          
          if (choices.length > 0) break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    console.log('🎯 CHOICE ANALYSIS:');
    console.log('==================');
    
    if (choices.length === 0) {
      console.log('❌ No choices found');
      
      // Take screenshot to see what's on the page
      await page.screenshot({ path: 'no-choices-found.png', fullPage: true });
      console.log('📸 Screenshot saved as no-choices-found.png');
      
    } else {
      console.log(`✅ Found ${choices.length} choices:`);
      
      choices.forEach((choice, index) => {
        console.log(`  ${index + 1}. "${choice}"`);
      });
      
      // Analyze if choices are generic or contextual
      const genericPhrases = [
        'continue the adventure',
        'look around carefully', 
        'make a thoughtful choice',
        'ask what to do next',
        'think about it',
        'move forward'
      ];
      
      const isGeneric = choices.some(choice => 
        genericPhrases.some(phrase => 
          choice.toLowerCase().includes(phrase.toLowerCase())
        )
      );
      
      if (isGeneric) {
        console.log('⚠️ GENERIC CHOICES DETECTED - Our fix may need refinement');
      } else {
        console.log('✅ CHOICES ARE CONTEXTUAL - Our fix is working!');
      }
      
      // Test clicking the first choice if available
      if (choices.length > 0) {
        console.log('🎯 Testing choice selection...');
        
        try {
          const firstChoiceSelector = choiceSelectors.find(async selector => {
            return await page.locator(selector).first().isVisible().catch(() => false);
          });
          
          if (firstChoiceSelector) {
            await page.locator(firstChoiceSelector).first().click();
            console.log('✅ Successfully clicked first choice');
            
            // Wait a moment and check for new content
            await page.waitForTimeout(5000);
            
            console.log('🔍 Checking for new segment generation...');
            
            // Look for loading indicators or new content
            const loadingSelectors = [
              '[class*="loading"]',
              '[class*="generating"]',
              'text="Generating"',
              'text="Loading"'
            ];
            
            let isGenerating = false;
            for (const selector of loadingSelectors) {
              if (await page.locator(selector).isVisible().catch(() => false)) {
                console.log(`✅ Found loading indicator: ${selector}`);
                isGenerating = true;
                break;
              }
            }
            
            if (isGenerating) {
              console.log('✅ New segment generation started - choice selection working!');
            } else {
              console.log('⚠️ No loading indicator found - checking for immediate content update');
            }
            
          }
        } catch (e) {
          console.log('❌ Error testing choice selection:', e);
        }
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'choice-verification-final.png', fullPage: true });
    console.log('📸 Final screenshot saved as choice-verification-final.png');
    
    console.log('✅ Choice verification test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'choice-verification-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

verifyChoicesTest().catch(console.error);