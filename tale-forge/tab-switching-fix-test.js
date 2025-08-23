// Tab Switching Fix Test - Simulate the exact user issue
import { chromium } from 'playwright';

async function testTabSwitchingFix() {
  console.log('🔄 TAB SWITCHING FIX TEST');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  // Monitor image console logs only
  page.on('console', msg => {
    if (msg.text().includes('Image') || msg.text().includes('🖼️') || msg.text().includes('👁️')) {
      console.log(`🖥️  LOG: ${msg.text()}`);
    }
  });
  
  try {
    // Complete user flow to get to image generation
    console.log('🔐 Logging in...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.locator('button:has-text("Sign In")').first().click();
    await page.fill('input[type="email"]', 'jzineldin@gmail.com');
    await page.fill('input[type="password"]', 'Rashzin1996!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    
    console.log('📝 Going to Create → Magical Adventure...');
    await page.locator('a[href="/create"]').first().click();
    await page.waitForTimeout(2000);
    await page.locator('.glass-enhanced:has-text("Magical Adventure")').first().click();
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Create My Story")').first().click();
    
    // Wait for story creation and redirect
    console.log('⏳ Waiting for story to be created...');
    let storyUrl = null;
    for (let i = 0; i < 15; i++) {
      const currentUrl = page.url();
      if (currentUrl.includes('/stories/')) {
        storyUrl = currentUrl;
        break;
      }
      await page.waitForTimeout(2000);
    }
    
    if (!storyUrl) {
      console.log('❌ Story creation failed');
      return;
    }
    
    console.log(`✅ Story created: ${storyUrl}`);
    
    // Monitor image state before tab switching
    console.log('🔍 Phase 1: Monitoring image before tab switching...');
    
    for (let i = 0; i < 30; i++) {
      const imageState = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        const storyImg = imgs.find(img => 
          img.src?.includes('supabase') && img.src?.includes('segment-images')
        );
        
        if (storyImg) {
          const rect = storyImg.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(storyImg);
          return {
            found: true,
            visible: rect.width > 0 && rect.height > 0 && computedStyle.opacity !== '0',
            opacity: computedStyle.opacity,
            display: computedStyle.display
          };
        }
        
        return { found: false };
      });
      
      if (imageState.found) {
        const status = imageState.visible ? '✅ VISIBLE' : '❌ HIDDEN';
        console.log(`📸 Before tab switch ${i}s: ${status} (opacity: ${imageState.opacity})`);
        
        if (imageState.visible) {
          console.log('✅ Image is already visible! Fix may have worked.');
          break;
        }
      } else {
        console.log(`⏳ ${i}s: Still generating or no image found`);
      }
      
      await page.waitForTimeout(1000);
    }
    
    // Simulate tab switching - the key test!
    console.log('\n🔄 Phase 2: SIMULATING TAB SWITCHING (the magic moment)...');
    
    // First, blur the page (simulate tab switching away)
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('blur'));
    });
    
    console.log('📱 Simulated: Tab switched AWAY');
    await page.waitForTimeout(1000);
    
    // Then, focus the page (simulate tab switching back)
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('focus'));
      window.dispatchEvent(new Event('pageshow'));
    });
    
    console.log('📱 Simulated: Tab switched BACK');
    
    // Monitor image state AFTER tab switching
    console.log('🔍 Phase 3: Monitoring image AFTER tab switching...');
    
    await page.waitForTimeout(1000); // Give the fix time to work
    
    for (let i = 0; i < 10; i++) {
      const imageState = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        const storyImg = imgs.find(img => 
          img.src?.includes('supabase') && img.src?.includes('segment-images')
        );
        
        if (storyImg) {
          const rect = storyImg.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(storyImg);
          return {
            found: true,
            visible: rect.width > 0 && rect.height > 0 && computedStyle.opacity !== '0',
            opacity: computedStyle.opacity,
            display: computedStyle.display
          };
        }
        
        return { found: false };
      });
      
      if (imageState.found) {
        const status = imageState.visible ? '✅ VISIBLE' : '❌ HIDDEN';
        console.log(`📸 After tab switch ${i}s: ${status} (opacity: ${imageState.opacity})`);
        
        if (imageState.visible) {
          console.log('🎉 SUCCESS! Image became visible after tab switch simulation!');
          break;
        }
      } else {
        console.log(`📭 ${i}s: No image found yet`);
      }
      
      await page.waitForTimeout(1000);
    }
    
    // Final test: Manual interaction
    console.log('\n🖱️ Phase 4: Manual interaction test...');
    await page.click('body');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(2000);
    
    const finalState = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      const storyImg = imgs.find(img => 
        img.src?.includes('supabase') && img.src?.includes('segment-images')
      );
      
      if (storyImg) {
        const rect = storyImg.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(storyImg);
        return {
          found: true,
          visible: rect.width > 0 && rect.height > 0 && computedStyle.opacity !== '0'
        };
      }
      return { found: false };
    });
    
    console.log(`📊 FINAL RESULT: ${finalState.found ? (finalState.visible ? '✅ IMAGE VISIBLE' : '❌ IMAGE STILL HIDDEN') : '❌ NO IMAGE FOUND'}`);
    
    console.log('\n🔍 Browser staying open for manual verification...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testTabSwitchingFix().catch(console.error);