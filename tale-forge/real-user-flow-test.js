// Real User Flow Test - Create → Template → Story Creation → Image Issue
import { chromium } from 'playwright';

async function testRealUserFlow() {
  console.log('🔥 REAL USER FLOW TEST - Create → Template → Story → Image');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  // Monitor image-related console logs only
  page.on('console', msg => {
    if (msg.text().includes('Image') || msg.text().includes('🖼️') || msg.text().includes('Creating illustration')) {
      console.log(`🖥️  IMAGE: ${msg.text()}`);
    }
  });
  
  // Monitor image network requests
  page.on('response', response => {
    if (response.url().includes('.png') || response.url().includes('.jpg') || response.url().includes('illustration') || response.url().includes('ovhcloud') || response.url().includes('supabase')) {
      if (!response.url().includes('favicon')) {
        console.log(`🌐 IMAGE: ${response.status()} - ${response.url().substring(response.url().lastIndexOf('/') + 1)}`);
      }
    }
  });
  
  try {
    // Step 1: Login
    console.log('🔐 Step 1: Logging in...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.locator('button:has-text("Sign In")').first().click();
    await page.fill('input[type="email"]', 'jzineldin@gmail.com');
    await page.fill('input[type="password"]', 'Rashzin1996!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    console.log('✅ Logged in');
    
    // Step 2: Click Create in header
    console.log('📝 Step 2: Clicking Create in header...');
    await page.locator('a[href="/create"]').first().click();
    await page.waitForTimeout(2000);
    console.log('✅ On create page');
    
    // Step 3: Select Magical Adventure template (click the template card directly)
    console.log('🧙 Step 3: Selecting Magical Adventure template...');
    await page.locator('.glass-enhanced:has-text("Magical Adventure")').first().click();
    await page.waitForTimeout(2000);
    console.log('✅ Template selected');
    
    // Step 4: Click "Create My Story! 🪄" button
    console.log('🚀 Step 4: Clicking Create My Story button...');
    await page.locator('button:has-text("Create My Story")').first().click();
    await page.waitForTimeout(3000);
    console.log('✅ Story creation initiated');
    
    // Step 5: Monitor the story creation and image generation
    console.log('⏳ Step 5: Monitoring story creation and image generation...');
    
    // Wait for story to be created and user to be redirected to story page
    let storyUrl = null;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!storyUrl && attempts < maxAttempts) {
      const currentUrl = page.url();
      if (currentUrl.includes('/stories/')) {
        storyUrl = currentUrl;
        console.log(`📖 Redirected to story: ${storyUrl}`);
        break;
      }
      await page.waitForTimeout(2000);
      attempts++;
      console.log(`⏳ Waiting for story creation... (${attempts}/${maxAttempts})`);
    }
    
    if (!storyUrl) {
      console.log('❌ Story creation timed out');
      return;
    }
    
    // Step 6: Monitor image loading behavior in detail
    console.log('🖼️ Step 6: Monitoring image loading behavior...');
    
    let imageFoundTime = null;
    let imageVisibleTime = null;
    let imageDisappearedTime = null;
    
    // Monitor for 60 seconds
    for (let i = 0; i < 60; i++) {
      const imageState = await page.evaluate(() => {
        // Look for story image
        const imgs = Array.from(document.querySelectorAll('img'));
        const storyImg = imgs.find(img => 
          img.alt?.includes('Illustration') || 
          img.src?.includes('ovhcloud') ||
          img.src?.includes('supabase') ||
          img.src?.includes('segment-images')
        );
        
        if (storyImg) {
          const rect = storyImg.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(storyImg);
          const isVisible = rect.width > 0 && rect.height > 0 && 
                           computedStyle.opacity !== '0' && 
                           computedStyle.display !== 'none' &&
                           computedStyle.visibility !== 'hidden';
          
          return {
            found: true,
            visible: isVisible,
            complete: storyImg.complete,
            naturalWidth: storyImg.naturalWidth,
            naturalHeight: storyImg.naturalHeight,
            displayWidth: rect.width,
            displayHeight: rect.height,
            opacity: computedStyle.opacity,
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            src: storyImg.src.substring(storyImg.src.lastIndexOf('/') + 1, storyImg.src.lastIndexOf('/') + 20)
          };
        }
        
        // Check for "Creating illustration..." loading state
        const allElements = Array.from(document.querySelectorAll('p, div, span'));
        const loadingText = allElements.find(el => 
          el.textContent?.includes('Creating illustration') || 
          el.textContent?.includes('Creating image')
        );
        
        return { 
          found: false, 
          totalImgs: imgs.length,
          hasLoadingText: !!loadingText
        };
      });
      
      if (imageState.found) {
        if (!imageFoundTime) {
          imageFoundTime = i;
          console.log(`📸 ${i}s: Image FOUND - Complete: ${imageState.complete}, Natural: ${imageState.naturalWidth}x${imageState.naturalHeight}`);
        }
        
        if (imageState.visible && !imageVisibleTime) {
          imageVisibleTime = i;
          console.log(`👁️ ${i}s: Image BECAME VISIBLE - Size: ${imageState.displayWidth}x${imageState.displayHeight}, Opacity: ${imageState.opacity}`);
        }
        
        if (!imageState.visible && imageVisibleTime && !imageDisappearedTime) {
          imageDisappearedTime = i;
          console.log(`👻 ${i}s: Image DISAPPEARED - Display: ${imageState.display}, Visibility: ${imageState.visibility}, Opacity: ${imageState.opacity}`);
        }
        
        const status = imageState.visible ? '✅ VISIBLE' : '❌ HIDDEN';
        if (i % 5 === 0 || !imageState.visible) { // Log every 5 seconds or when hidden
          console.log(`📸 ${i}s: ${status} | ${imageState.displayWidth}x${imageState.displayHeight} | Opacity: ${imageState.opacity}`);
        }
        
        // Test interaction at specific times
        if (i === 15 && !imageState.visible) {
          console.log('🖱️ Testing interaction at 15s (image hidden)...');
          await page.mouse.click(700, 400);
          await page.keyboard.press('Tab');
        }
        
        if (i === 30 && !imageState.visible) {
          console.log('🔄 Testing tab switch simulation at 30s...');
          await page.evaluate(() => {
            document.dispatchEvent(new Event('visibilitychange'));
            window.dispatchEvent(new Event('focus'));
          });
        }
        
      } else {
        if (imageState.hasLoadingText) {
          console.log(`⏳ ${i}s: Still generating image... (${imageState.totalImgs} total images)`);
        } else {
          console.log(`📭 ${i}s: No story image found (${imageState.totalImgs} total images)`);
        }
      }
      
      await page.waitForTimeout(1000);
    }
    
    // Summary
    console.log('\n📊 IMAGE BEHAVIOR SUMMARY:');
    console.log(`📸 Image found at: ${imageFoundTime !== null ? imageFoundTime + 's' : 'Never'}`);
    console.log(`👁️ Image visible at: ${imageVisibleTime !== null ? imageVisibleTime + 's' : 'Never'}`);
    console.log(`👻 Image disappeared at: ${imageDisappearedTime !== null ? imageDisappearedTime + 's' : 'Never'}`);
    
    // Final test: Manual interaction
    console.log('\n🖱️ FINAL TEST: Manual interaction...');
    await page.click('body');
    await page.keyboard.press('Space');
    await page.waitForTimeout(2000);
    
    const finalState = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      const storyImg = imgs.find(img => 
        img.alt?.includes('Illustration') || 
        img.src?.includes('ovhcloud') ||
        img.src?.includes('supabase')
      );
      
      if (storyImg) {
        const rect = storyImg.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(storyImg);
        return {
          found: true,
          visible: rect.width > 0 && rect.height > 0 && computedStyle.opacity !== '0',
          opacity: computedStyle.opacity
        };
      }
      return { found: false };
    });
    
    console.log(`📊 AFTER MANUAL INTERACTION: ${finalState.found ? (finalState.visible ? '✅ VISIBLE' : '❌ HIDDEN') : '❌ NOT FOUND'}`);
    
    console.log('\n🔍 Keeping browser open for manual inspection...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testRealUserFlow().catch(console.error);