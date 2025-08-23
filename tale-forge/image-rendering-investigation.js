// Deep Image Rendering Investigation - Real-time Monitoring
import { chromium } from 'playwright';

async function investigateImageRendering() {
  console.log('🖼️ INVESTIGATING IMAGE RENDERING ISSUE');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  // Monitor all console activity
  page.on('console', msg => {
    console.log(`🖥️  ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  
  // Monitor network activity
  page.on('response', response => {
    if (response.url().includes('image') || response.url().includes('illustration')) {
      console.log(`🌐 IMAGE NETWORK: ${response.status()} - ${response.url()}`);
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
    
    console.log('✅ Logged in, going to create new story');
    
    // Navigate to create story
    await page.locator('a[href="/create"]').first().click();
    await page.waitForTimeout(2000);
    
    // Select a template to trigger story creation
    console.log('🎯 Selecting Magical Adventure template...');
    await page.locator('button:has-text("Magical Adventure")').click();
    await page.waitForTimeout(1000);
    
    // Click Create Story button
    await page.locator('button:has-text("Create My Story!")').click();
    
    console.log('🚀 Story creation initiated - monitoring image behavior...');
    
    // Real-time monitoring of image element states
    const monitorImages = async () => {
      const imageData = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        const storyImg = imgs.find(img => 
          img.alt?.includes('Illustration') || 
          img.src?.includes('illustration') ||
          img.className?.includes('story')
        );
        
        if (storyImg) {
          const computedStyle = window.getComputedStyle(storyImg);
          const rect = storyImg.getBoundingClientRect();
          
          return {
            found: true,
            src: storyImg.src,
            alt: storyImg.alt,
            loaded: storyImg.complete,
            naturalWidth: storyImg.naturalWidth,
            naturalHeight: storyImg.naturalHeight,
            displayWidth: rect.width,
            displayHeight: rect.height,
            visible: rect.width > 0 && rect.height > 0,
            opacity: computedStyle.opacity,
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            zIndex: computedStyle.zIndex,
            position: computedStyle.position
          };
        }
        
        return { found: false };
      });
      
      return imageData;
    };
    
    // Monitor every 2 seconds for 60 seconds
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(2000);
      const imageState = await monitorImages();
      
      if (imageState.found) {
        console.log(`📸 IMAGE STATE at ${i*2}s:`, {
          loaded: imageState.loaded,
          visible: imageState.visible,
          opacity: imageState.opacity,
          display: imageState.display,
          dimensions: `${imageState.displayWidth}x${imageState.displayHeight}`,
          naturalDimensions: `${imageState.naturalWidth}x${imageState.naturalHeight}`
        });
        
        // Test interaction triggers
        if (i === 10 && !imageState.visible) {
          console.log('🔄 Testing tab switch simulation...');
          await page.evaluate(() => {
            // Simulate tab becoming hidden then visible
            document.dispatchEvent(new Event('visibilitychange'));
            window.dispatchEvent(new Event('focus'));
          });
        }
        
        if (i === 15 && !imageState.visible) {
          console.log('🖱️ Testing mouse interaction...');
          await page.mouse.move(100, 100);
          await page.mouse.click(100, 100);
        }
        
        if (i === 20 && !imageState.visible) {
          console.log('📱 Testing resize trigger...');
          await page.setViewportSize({ width: 1401, height: 901 });
          await page.waitForTimeout(500);
          await page.setViewportSize({ width: 1400, height: 900 });
        }
        
      } else {
        console.log(`⏳ Waiting for image... (${i*2}s)`);
      }
    }
    
    console.log('🔍 Final image state check...');
    const finalState = await monitorImages();
    console.log('📊 FINAL IMAGE STATE:', finalState);
    
    // Take screenshots before and after interaction
    await page.screenshot({ path: './ultimate-test-results/image-before-interaction.png', fullPage: true });
    
    console.log('🖱️ Simulating user interaction (click + key press)...');
    await page.click('body');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(1000);
    
    const afterInteractionState = await monitorImages();
    console.log('📊 AFTER INTERACTION STATE:', afterInteractionState);
    
    await page.screenshot({ path: './ultimate-test-results/image-after-interaction.png', fullPage: true });
    
    console.log('🔍 Keeping browser open for manual inspection...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  } finally {
    await browser.close();
  }
}

investigateImageRendering().catch(console.error);