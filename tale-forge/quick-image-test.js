// Quick Image Investigation - Navigate to existing story
import { chromium } from 'playwright';

async function quickImageTest() {
  console.log('🖼️ QUICK IMAGE TEST - Navigate to existing story');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  // Monitor console and network
  page.on('console', msg => {
    if (msg.text().includes('Image') || msg.text().includes('image') || msg.text().includes('🖼️')) {
      console.log(`🖥️  IMAGE LOG: ${msg.text()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('.png') || response.url().includes('.jpg') || response.url().includes('illustration')) {
      console.log(`🌐 IMAGE NETWORK: ${response.status()} - ${response.url().substring(response.url().lastIndexOf('/') + 1)}`);
    }
  });
  
  try {
    // Login
    console.log('🔐 Logging in...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.locator('button:has-text("Sign In")').first().click();
    await page.fill('input[type="email"]', 'jzineldin@gmail.com');
    await page.fill('input[type="password"]', 'Rashzin1996!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    
    // Go directly to one of the validated stories
    const storyId = 'beea88f3-3846-4b0d-823b-cc25b99c3c07'; // Magical Adventure
    console.log(`📖 Navigating to story: ${storyId}`);
    
    await page.goto(`http://localhost:3000/stories/${storyId}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('🔍 Starting image state monitoring...');
    
    // Monitor image state every second for 30 seconds
    for (let i = 0; i < 30; i++) {
      const imageState = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        const storyImg = imgs.find(img => 
          img.alt?.includes('Illustration') || 
          img.src?.includes('illustration') ||
          img.className?.includes('story') ||
          img.src?.includes('ovhcloud') ||
          img.src?.includes('supabase')
        );
        
        if (storyImg) {
          const rect = storyImg.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(storyImg);
          
          return {
            found: true,
            src: storyImg.src.substring(storyImg.src.lastIndexOf('/') + 1, storyImg.src.lastIndexOf('/') + 50),
            complete: storyImg.complete,
            naturalWidth: storyImg.naturalWidth,
            naturalHeight: storyImg.naturalHeight,
            displayWidth: rect.width,
            displayHeight: rect.height,
            visible: rect.width > 0 && rect.height > 0 && computedStyle.opacity !== '0' && computedStyle.display !== 'none',
            opacity: computedStyle.opacity,
            display: computedStyle.display,
            visibility: computedStyle.visibility
          };
        }
        
        return { found: false, totalImgs: imgs.length };
      });
      
      if (imageState.found) {
        const status = imageState.visible ? '✅ VISIBLE' : '❌ HIDDEN';
        console.log(`📸 ${i}s: ${status} | Complete: ${imageState.complete} | Size: ${imageState.displayWidth}x${imageState.displayHeight} | Opacity: ${imageState.opacity}`);
        
        // If invisible at 10 seconds, try interactions
        if (i === 10 && !imageState.visible) {
          console.log('🖱️ Testing mouse interaction at 10s...');
          await page.mouse.move(700, 400);
          await page.mouse.click(700, 400);
        }
        
        if (i === 15 && !imageState.visible) {
          console.log('⌨️ Testing keyboard interaction at 15s...');
          await page.keyboard.press('Tab');
        }
        
        if (i === 20 && !imageState.visible) {
          console.log('🔄 Testing visibility change at 20s...');
          await page.evaluate(() => {
            window.dispatchEvent(new Event('focus'));
            document.dispatchEvent(new Event('visibilitychange'));
          });
        }
        
      } else {
        console.log(`⏳ ${i}s: No story image found (total imgs: ${imageState.totalImgs})`);
      }
      
      await page.waitForTimeout(1000);
    }
    
    // Final screenshot and state
    console.log('📷 Taking final screenshots...');
    await page.screenshot({ path: './ultimate-test-results/final-image-state.png', fullPage: true });
    
    console.log('🖱️ Manual interaction test - clicking and checking...');
    await page.click('body');
    await page.keyboard.press('Space');
    await page.waitForTimeout(2000);
    
    const finalState = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      const storyImg = imgs.find(img => 
        img.alt?.includes('Illustration') || 
        img.src?.includes('illustration') ||
        img.src?.includes('ovhcloud') ||
        img.src?.includes('supabase')
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
    
    console.log('📊 FINAL STATE AFTER INTERACTION:', finalState);
    await page.screenshot({ path: './ultimate-test-results/after-manual-interaction.png', fullPage: true });
    
    console.log('🔍 Keeping browser open for 15 seconds...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

quickImageTest().catch(console.error);