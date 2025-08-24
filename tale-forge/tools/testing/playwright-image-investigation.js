// Deep Investigation: Image Rendering Issue with Playwright
// This script will thoroughly analyze the image display timing problem

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function deepInvestigateImageRendering() {
  console.log('🔍 DEEP INVESTIGATION: Image Rendering Issue');
  console.log('=' .repeat(60));
  
  // Create results directory
  const resultsDir = './playwright-results';
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }
  
  const browser = await chromium.launch({ 
    headless: false, // Visual mode for debugging
    slowMo: 500 // Slow down actions for observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: resultsDir,
      size: { width: 1280, height: 720 }
    }
  });
  
  const page = await context.newPage();
  
  // Set up comprehensive monitoring
  const events = [];
  const logEvent = (type, message, data = null) => {
    const timestamp = Date.now();
    const event = { timestamp, type, message, data };
    events.push(event);
    console.log(`[${new Date().toISOString()}] ${type}: ${message}`);
  };
  
  // Monitor all console messages
  page.on('console', msg => {
    logEvent('CONSOLE', `${msg.type()}: ${msg.text()}`);
  });
  
  // Monitor network requests
  page.on('request', request => {
    if (request.url().includes('story-images') || request.url().includes('image')) {
      logEvent('NETWORK_REQUEST', `Image request: ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('story-images') || response.url().includes('image')) {
      logEvent('NETWORK_RESPONSE', `Image response: ${response.status()} - ${response.url()}`);
    }
  });
  
  // Monitor DOM mutations for image elements
  await page.addInitScript(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.target.tagName === 'IMG') {
          console.log('🔄 IMG_MUTATION:', {
            attribute: mutation.attributeName,
            src: mutation.target.src,
            style: mutation.target.style.cssText,
            opacity: getComputedStyle(mutation.target).opacity,
            display: getComputedStyle(mutation.target).display
          });
        }
        
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.tagName === 'IMG') {
              console.log('➕ IMG_ADDED:', {
                src: node.src,
                style: node.style.cssText,
                opacity: getComputedStyle(node).opacity,
                display: getComputedStyle(node).display
              });
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['style', 'class', 'src']
    });
  });
  
  try {
    logEvent('START', 'Navigating to Tale Forge');
    
    // Navigate to the app
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ path: `${resultsDir}/01-initial-load.png`, fullPage: true });
    logEvent('SCREENSHOT', 'Initial load captured');
    
    // Check if we need to login by looking for "Sign In" button
    const signInButton = page.locator('button:has-text("Sign In")').first();
    const needsLogin = await signInButton.isVisible();
    
    if (needsLogin) {
      logEvent('AUTH', 'Clicking Sign In button');
      await signInButton.click();
      
      // Wait for login form and fill it
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      await page.fill('input[type="email"]', 'jzineldin@gmail.com');
      await page.fill('input[type="password"]', 'Rashzin1996!');
      
      // Look for the submit button - prioritize the form submit button
      const submitButton = page.locator('form button[type="submit"]').first()
        .or(page.locator('button[type="submit"]').first())
        .or(page.locator('form button:has-text("Sign In")').first());
      
      await submitButton.click();
      
      // Wait for login to complete - look for authenticated content
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: `${resultsDir}/02-after-login.png`, fullPage: true });
      logEvent('SCREENSHOT', 'After login captured');
    }
    
    // Look for existing stories to test with
    let storyUrl;
    
    // Look for existing story cards in the dashboard
    const storyCards = page.locator('.story-card, [class*="card"]').filter({ hasText: /My Magical Story|story/i });
    const hasExistingStories = await storyCards.count() > 0;
    
    if (hasExistingStories) {
      logEvent('STORY', `Found ${await storyCards.count()} existing stories`);
      
      // Click on the first story card
      await storyCards.first().click();
      await page.waitForTimeout(2000);
      storyUrl = page.url();
      
      logEvent('STORY', 'Clicked on existing story');
      await page.screenshot({ path: `${resultsDir}/03-story-opened.png`, fullPage: true });
    } else {
      // Look for "Continue Story" button if we're in a story continuation flow
      const continueButton = page.locator('button:has-text("Continue Story")');
      if (await continueButton.isVisible()) {
        logEvent('STORY', 'Clicking Continue Story button');
        await continueButton.click();
        await page.waitForTimeout(2000);
        storyUrl = page.url();
      } else {
        // Try to create a new story as fallback
        const createButton = page.locator('button:has-text("Create New Story")').or(page.locator('text=Create New Story'));
        if (await createButton.isVisible()) {
          logEvent('STORY', 'No existing stories found, creating new one');
          await createButton.click();
          await page.waitForTimeout(3000);
          
          // Quick story creation
          await page.fill('input[placeholder*="title"], input[name*="title"]', 'Playwright Test Story').catch(() => {});
          await page.fill('textarea[placeholder*="description"]', 'Test story for image investigation').catch(() => {});
          
          const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Generate")').first();
          await submitButton.click().catch(() => {});
          await page.waitForTimeout(5000);
          storyUrl = page.url();
        } else {
          logEvent('STORY', 'Could not find way to open or create story');
          storyUrl = page.url();
        }
      }
    }
    
    logEvent('STORY_URL', `Story URL: ${storyUrl}`);
    
    // Wait for story content to load - look for story reader elements
    try {
      await page.waitForTimeout(3000); // Give page time to load
      
      // Look for story content indicators
      const storyContentSelectors = [
        'text="Creating illustration..."',
        'img[alt*="Illustration"]',
        'img[alt*="segment"]',
        '[class*="story-image"]',
        '[class*="segment"]',
        'text="What should happen next?"'
      ];
      
      let foundContent = false;
      for (const selector of storyContentSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          logEvent('UI', `Found story content: ${selector}`);
          foundContent = true;
          break;
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!foundContent) {
        logEvent('UI', 'No specific story content found, proceeding with current page');
      }
      
      await page.screenshot({ path: `${resultsDir}/04-story-content.png`, fullPage: true });
      
    } catch (e) {
      logEvent('UI', `Story content loading timeout: ${e.message}`);
      await page.screenshot({ path: `${resultsDir}/04-story-timeout.png`, fullPage: true });
    }
    
    // Monitor image loading in real-time
    let imageFound = false;
    let imageVisible = false;
    let iterationCount = 0;
    const maxIterations = 120; // 2 minutes with 1-second intervals
    
    while (iterationCount < maxIterations && (!imageFound || !imageVisible)) {
      iterationCount++;
      
      // Check if image element exists and has src
      const imageElement = await page.locator('img[alt*="Illustration"]').first();
      const hasImage = await imageElement.count() > 0;
      
      if (hasImage) {
        const imageSrc = await imageElement.getAttribute('src');
        const imageStyle = await imageElement.evaluate(el => ({
          opacity: getComputedStyle(el).opacity,
          display: getComputedStyle(el).display,
          visibility: getComputedStyle(el).visibility,
          width: getComputedStyle(el).width,
          height: getComputedStyle(el).height,
          position: el.getBoundingClientRect()
        }));
        
        if (!imageFound && imageSrc && !imageSrc.includes('data:')) {
          imageFound = true;
          logEvent('IMAGE_FOUND', `Image element found with src: ${imageSrc}`, imageStyle);
          await page.screenshot({ path: `${resultsDir}/05-image-found-${iterationCount}.png`, fullPage: true });
        }
        
        // Check if image is actually visible
        const isVisible = imageStyle.opacity !== '0' && 
                          imageStyle.display !== 'none' && 
                          imageStyle.visibility !== 'hidden' &&
                          imageStyle.position.width > 0 &&
                          imageStyle.position.height > 0;
        
        if (imageFound && isVisible && !imageVisible) {
          imageVisible = true;
          logEvent('IMAGE_VISIBLE', 'Image is now visible!', imageStyle);
          await page.screenshot({ path: `${resultsDir}/06-image-visible-${iterationCount}.png`, fullPage: true });
          break;
        }
        
        // Log current state every 10 iterations
        if (iterationCount % 10 === 0) {
          logEvent('IMAGE_STATE', `Iteration ${iterationCount}: Found=${imageFound}, Visible=${isVisible}`, imageStyle);
        }
      }
      
      await page.waitForTimeout(1000);
    }
    
    if (imageFound && !imageVisible) {
      logEvent('BUG_CONFIRMED', '🚨 BUG CONFIRMED: Image loaded but not visible');
      
      // Test the tab switching fix
      logEvent('TAB_TEST', 'Testing tab switching to force visibility');
      
      // Create a new tab
      const newPage = await context.newPage();
      await newPage.goto('about:blank');
      
      // Switch to new tab for 2 seconds
      await newPage.bringToFront();
      await page.waitForTimeout(2000);
      
      // Switch back to original tab
      await page.bringToFront();
      await page.waitForTimeout(1000);
      
      // Check if image is now visible
      const imageElement = await page.locator('img[alt*="Illustration"]').first();
      const postTabImageStyle = await imageElement.evaluate(el => ({
        opacity: getComputedStyle(el).opacity,
        display: getComputedStyle(el).display,
        visibility: getComputedStyle(el).visibility,
        position: el.getBoundingClientRect()
      }));
      
      const isNowVisible = postTabImageStyle.opacity !== '0' && 
                          postTabImageStyle.display !== 'none' && 
                          postTabImageStyle.visibility !== 'hidden' &&
                          postTabImageStyle.position.width > 0;
      
      if (isNowVisible) {
        logEvent('TAB_FIX_CONFIRMED', '✅ Tab switching made image visible!', postTabImageStyle);
        await page.screenshot({ path: `${resultsDir}/07-after-tab-switch.png`, fullPage: true });
      } else {
        logEvent('TAB_FIX_FAILED', '❌ Tab switching did not fix visibility', postTabImageStyle);
      }
      
      // Test scroll fix
      logEvent('SCROLL_TEST', 'Testing scroll to force repaint');
      await page.evaluate(() => window.scrollBy(0, 100));
      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollBy(0, -100));
      await page.waitForTimeout(1000);
      
      const postScrollImageStyle = await imageElement.evaluate(el => ({
        opacity: getComputedStyle(el).opacity,
        display: getComputedStyle(el).display,
        visibility: getComputedStyle(el).visibility
      }));
      
      const isVisibleAfterScroll = postScrollImageStyle.opacity !== '0' && 
                                   postScrollImageStyle.display !== 'none' && 
                                   postScrollImageStyle.visibility !== 'hidden';
      
      if (isVisibleAfterScroll && !isNowVisible) {
        logEvent('SCROLL_FIX_CONFIRMED', '✅ Scrolling made image visible!', postScrollImageStyle);
        await page.screenshot({ path: `${resultsDir}/08-after-scroll.png`, fullPage: true });
      }
      
      // Test click/interaction fix
      logEvent('CLICK_TEST', 'Testing click interaction');
      await page.click('body');
      await page.waitForTimeout(1000);
      
      const postClickImageStyle = await imageElement.evaluate(el => ({
        opacity: getComputedStyle(el).opacity,
        display: getComputedStyle(el).display,
        visibility: getComputedStyle(el).visibility
      }));
      
      const isVisibleAfterClick = postClickImageStyle.opacity !== '0' && 
                                  postClickImageStyle.display !== 'none' && 
                                  postClickImageStyle.visibility !== 'hidden';
      
      if (isVisibleAfterClick && !isVisibleAfterScroll && !isNowVisible) {
        logEvent('CLICK_FIX_CONFIRMED', '✅ Click interaction made image visible!', postClickImageStyle);
        await page.screenshot({ path: `${resultsDir}/09-after-click.png`, fullPage: true });
      }
      
      // Analyze the CSS and layout
      const cssAnalysis = await imageElement.evaluate(el => {
        const computed = getComputedStyle(el);
        const parent = el.parentElement;
        const parentComputed = parent ? getComputedStyle(parent) : null;
        
        return {
          element: {
            tagName: el.tagName,
            src: el.src,
            complete: el.complete,
            naturalWidth: el.naturalWidth,
            naturalHeight: el.naturalHeight,
            clientWidth: el.clientWidth,
            clientHeight: el.clientHeight
          },
          computed: {
            opacity: computed.opacity,
            display: computed.display,
            visibility: computed.visibility,
            position: computed.position,
            zIndex: computed.zIndex,
            transform: computed.transform,
            overflow: computed.overflow
          },
          parent: parentComputed ? {
            opacity: parentComputed.opacity,
            display: parentComputed.display,
            visibility: parentComputed.visibility,
            overflow: parentComputed.overflow,
            position: parentComputed.position,
            zIndex: parentComputed.zIndex
          } : null,
          boundingRect: el.getBoundingClientRect()
        };
      });
      
      logEvent('CSS_ANALYSIS', 'Detailed CSS analysis of image element', cssAnalysis);
    }
    
    // Final screenshot
    await page.screenshot({ path: `${resultsDir}/10-final-state.png`, fullPage: true });
    
    // Write detailed log
    const logData = {
      investigation: 'Image Rendering Issue Deep Dive',
      timestamp: new Date().toISOString(),
      storyUrl,
      results: {
        imageFound,
        imageVisible,
        iterationsRequired: iterationCount
      },
      events,
      conclusion: imageFound && !imageVisible ? 
        'BUG CONFIRMED: Images load but are not visible until user interaction' :
        imageFound && imageVisible ?
        'Images displayed correctly' :
        'Could not reproduce - no images generated'
    };
    
    fs.writeFileSync(`${resultsDir}/investigation-log.json`, JSON.stringify(logData, null, 2));
    
    logEvent('COMPLETE', `Investigation complete. Results saved to ${resultsDir}/`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 INVESTIGATION SUMMARY:');
    console.log(`📁 Results saved to: ${resultsDir}/`);
    console.log(`🖼️ Image found: ${imageFound ? '✅' : '❌'}`);
    console.log(`👁️ Image visible: ${imageVisible ? '✅' : '❌'}`);
    console.log(`⏱️ Iterations required: ${iterationCount}`);
    
    if (imageFound && !imageVisible) {
      console.log('🚨 BUG CONFIRMED: Images load but require user interaction to become visible');
    }
    
  } catch (error) {
    logEvent('ERROR', `Investigation failed: ${error.message}`);
    console.error('Investigation error:', error);
  } finally {
    await browser.close();
  }
}

// Run the investigation
deepInvestigateImageRendering().catch(console.error);