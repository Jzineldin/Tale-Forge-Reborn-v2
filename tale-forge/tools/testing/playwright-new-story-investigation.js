// Comprehensive New Story Creation Investigation with Playwright
// This script creates a new story and monitors every aspect of the process

import { chromium } from 'playwright';
import fs from 'fs';

async function comprehensiveNewStoryInvestigation() {
  console.log('🔬 COMPREHENSIVE NEW STORY INVESTIGATION');
  console.log('=' .repeat(70));
  
  const resultsDir = './new-story-results';
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down to observe everything
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    recordVideo: { dir: resultsDir }
  });
  
  const page = await context.newPage();
  
  const logs = [];
  let storyCreationData = {};
  
  const log = (type, message, data = null) => {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, type, message, data };
    logs.push(entry);
    console.log(`[${timestamp}] ${type}: ${message}`);
    if (data) console.log('  Data:', data);
  };
  
  // Monitor all network activity
  page.on('request', request => {
    if (request.url().includes('create-story') || 
        request.url().includes('get-story') ||
        request.url().includes('story-images') ||
        request.url().includes('generate')) {
      log('NETWORK_REQUEST', `${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('create-story') || 
        response.url().includes('get-story') ||
        response.url().includes('story-images') ||
        response.url().includes('generate')) {
      
      const responseData = {
        url: response.url(),
        status: response.status(),
        headers: await response.allHeaders(),
        text: null
      };
      
      try {
        responseData.text = await response.text();
      } catch (e) {
        responseData.text = `Could not read response: ${e.message}`;
      }
      
      log('NETWORK_RESPONSE', `${response.status()} ${response.url()}`, responseData);
    }
  });
  
  // Monitor console
  page.on('console', msg => {
    if (msg.text().includes('create') || 
        msg.text().includes('story') || 
        msg.text().includes('choice') ||
        msg.text().includes('image') ||
        msg.text().includes('🎯') ||
        msg.text().includes('⚠️') ||
        msg.text().includes('✅') ||
        msg.text().includes('❌')) {
      log('CONSOLE', `${msg.type()}: ${msg.text()}`);
    }
  });
  
  try {
    log('START', 'Navigating to Tale Forge');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${resultsDir}/01-initial.png`, fullPage: true });
    
    // Login
    log('AUTH', 'Logging in');
    await page.locator('button:has-text("Sign In")').first().click();
    await page.fill('input[type="email"]', 'jzineldin@gmail.com');
    await page.fill('input[type="password"]', 'Rashzin1996!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${resultsDir}/02-logged-in.png`, fullPage: true });
    
    // Navigate to create story
    log('NAVIGATION', 'Going to create new story');
    await page.goto('http://localhost:3001/create', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${resultsDir}/03-create-page.png`, fullPage: true });
    
    // Choose story creation method
    log('CHOICE', 'Analyzing story creation options');
    
    // Test both template and custom creation
    const testBoth = true;
    
    if (testBoth) {
      // First test: Use a pre-made template
      log('TEMPLATE', 'Testing template-based story creation');
      
      const spaceTemplate = page.locator('text="Space Explorer"').first();
      if (await spaceTemplate.isVisible()) {
        await spaceTemplate.click();
        log('TEMPLATE', 'Selected Space Explorer template');
        
        await page.screenshot({ path: `${resultsDir}/04a-template-selected.png`, fullPage: true });
        
        // Look for the "Select This" or similar button
        const selectButton = page.locator('button:has-text("Select"), button:has-text("Choose"), button:has-text("Start")').first();
        if (await selectButton.isVisible()) {
          await selectButton.click();
          log('TEMPLATE', 'Clicked template select button');
          
          // Monitor template-based creation
          await page.waitForTimeout(3000);
          
          // Check if we're redirected to a story or need more input
          const currentUrl = page.url();
          log('TEMPLATE', `After template selection, URL: ${currentUrl}`);
          
          await page.screenshot({ path: `${resultsDir}/05a-template-result.png`, fullPage: true });
          
          // If this worked, we'll have a story. Otherwise, continue to custom
          const hasStoryContent = await page.locator('img[alt*="Illustration"], text="What should happen next?"').count() > 0;
          if (hasStoryContent) {
            log('TEMPLATE', '✅ Template creation successful');
            storyCreationData.templateSuccess = true;
          } else {
            log('TEMPLATE', '⚠️ Template creation did not immediately create story, trying custom');
          }
        }
      }
      
      // Wait a bit then try custom creation
      await page.waitForTimeout(2000);
      
      // Navigate back to create page if needed
      if (!page.url().includes('/create')) {
        await page.goto('http://localhost:3001/create', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
      }
    }
    
    // Second test: Custom story creation
    log('CUSTOM', 'Testing custom story creation');
    
    const customButton = page.locator('button:has-text("Start Custom Creation")').or(page.locator('text="Create Custom Story"'));
    if (await customButton.count() > 0) {
      await customButton.first().click();
      log('CUSTOM', 'Clicked custom creation button');
      
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${resultsDir}/04b-custom-form.png`, fullPage: true });
      
      // Now look for the actual form fields
      const titleInput = page.locator('input[name="title"], input[placeholder*="title"], input[placeholder*="Title"]');
      const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="description"], textarea[placeholder*="Description"]');
      
      if (await titleInput.count() > 0) {
        const storyTitle = `Playwright Investigation ${Date.now()}`;
        const storyDescription = 'A comprehensive test story to investigate the image rendering and choice generation process in Tale Forge';
        
        await titleInput.fill(storyTitle);
        await descriptionInput.fill(storyDescription);
        log('CUSTOM', `Filled form with title: ${storyTitle}`);
        
        // Look for genre/age selections
        const genreButtons = page.locator('button:has-text("Adventure"), button:has-text("Fantasy"), [data-genre]');
        const ageButtons = page.locator('button:has-text("7-9"), button:has-text("Age"), [data-age]');
        
        if (await genreButtons.count() > 0) {
          await genreButtons.first().click();
          log('CUSTOM', 'Selected genre');
        }
        
        if (await ageButtons.count() > 0) {
          await ageButtons.first().click();
          log('CUSTOM', 'Selected age group');
        }
        
        await page.screenshot({ path: `${resultsDir}/04c-custom-filled.png`, fullPage: true });
        
        // Submit the custom form
        const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Generate"), button:has-text("Start")').last();
        await submitButton.click();
        log('CUSTOM', 'Submitted custom story form');
        
      } else {
        log('CUSTOM', '❌ Could not find custom story form fields');
        
        // Try the templates approach as fallback
        log('FALLBACK', 'Falling back to template selection');
        const anyTemplate = page.locator('.card, [class*="template"], button').filter({ hasText: /Adventure|Fantasy|Space|Magic/ }).first();
        if (await anyTemplate.count() > 0) {
          await anyTemplate.click();
          log('FALLBACK', 'Selected template as fallback');
        }
      }
    } else {
      log('CUSTOM', 'No custom creation button found, trying direct template selection');
      
      // Direct template selection
      const templates = [
        'Space Explorer',
        'Magical Adventure', 
        'Pirate Treasure Hunt',
        'Time Travel Adventure'
      ];
      
      for (const templateName of templates) {
        const template = page.locator(`text="${templateName}"`);
        if (await template.count() > 0) {
          await template.click();
          log('TEMPLATE', `Selected ${templateName} template`);
          break;
        }
      }
    }
    
    log('CREATE', 'Form submitted, monitoring creation process...');
    
    // Monitor creation process with multiple screenshots
    let creationComplete = false;
    let iterations = 0;
    const maxIterations = 60; // 2 minutes
    let storyId = null;
    
    while (!creationComplete && iterations < maxIterations) {
      iterations++;
      await page.waitForTimeout(2000);
      
      // Check current URL for story ID
      const currentUrl = page.url();
      const storyIdMatch = currentUrl.match(/stories\/([a-f0-9-]+)/);
      if (storyIdMatch && !storyId) {
        storyId = storyIdMatch[1];
        log('CREATE', `Story ID detected: ${storyId}`);
        storyCreationData.id = storyId;
      }
      
      // Take periodic screenshots
      if (iterations % 5 === 0) {
        await page.screenshot({ path: `${resultsDir}/creation-${iterations.toString().padStart(2, '0')}.png`, fullPage: true });
      }
      
      // Check for completion indicators
      const hasChoices = await page.locator('text="What should happen next?"').count() > 0;
      const hasImage = await page.locator('img[alt*="Illustration"], img[alt*="segment"]').count() > 0;
      const hasContent = await page.locator('text="Creating illustration..."').count() === 0;
      
      if (hasChoices || (hasImage && hasContent)) {
        creationComplete = true;
        log('CREATE', `Story creation completed at iteration ${iterations}`);
      }
      
      // Log current state every 10 iterations
      if (iterations % 10 === 0) {
        log('STATUS', `Iteration ${iterations}: choices=${hasChoices}, image=${hasImage}, content=${hasContent}`);
      }
    }
    
    // Final screenshot and analysis
    await page.screenshot({ path: `${resultsDir}/05-creation-complete.png`, fullPage: true });
    
    if (storyId) {
      // Use page evaluation to run the debug script in browser context
      log('DEBUG', 'Running deep debug analysis in browser');
      
      const debugResults = await page.evaluate(async (storyId) => {
        // Browser-based debug function
        function getAuthToken() {
          const keys = Object.keys(localStorage).filter(k => 
            k.includes('supabase') || k.includes('sb-')
          );
          
          for (const key of keys) {
            const value = localStorage.getItem(key);
            try {
              const parsed = JSON.parse(value);
              if (parsed?.access_token) {
                return parsed.access_token;
              }
            } catch (e) {
              // Not JSON, skip
            }
          }
          return null;
        }
        
        const token = getAuthToken();
        if (!token) {
          return { error: 'No auth token found' };
        }
        
        try {
          // Check get-story API
          const getResponse = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/get-story', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
            },
            body: JSON.stringify({ storyId })
          });
          
          const data = await getResponse.json();
          const story = data.story;
          
          return {
            success: true,
            storyInfo: {
              id: story.id,
              title: story.title,
              segmentCount: story.segments?.length || 0,
              segments: story.segments?.map(s => ({
                id: s.id,
                content: s.content?.substring(0, 100) + '...',
                choices: s.choices,
                hasImage: !!s.image_url,
                imageUrl: s.image_url
              })) || [],
              status: story.status,
              isCompleted: story.is_completed,
              aiModelUsed: story.ai_model_used
            }
          };
        } catch (error) {
          return { error: error.message };
        }
      }, storyId);
      
      storyCreationData.debugResults = debugResults;
      log('DEBUG', 'Debug analysis complete', debugResults);
    }
    
    // Analyze the final state
    const finalAnalysis = await page.evaluate(() => {
      // Check for images
      const images = Array.from(document.querySelectorAll('img[alt*="Illustration"], img[alt*="segment"]'));
      const imageInfo = images.map(img => ({
        src: img.src,
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        visible: img.offsetWidth > 0 && img.offsetHeight > 0,
        style: {
          opacity: getComputedStyle(img).opacity,
          display: getComputedStyle(img).display,
          visibility: getComputedStyle(img).visibility
        }
      }));
      
      // Check for choices
      const choiceButtons = Array.from(document.querySelectorAll('button:has-text("A"), button:has-text("B"), button:has-text("C"), [class*="choice"]'));
      const choiceInfo = choiceButtons.map(btn => ({
        text: btn.textContent.trim(),
        visible: btn.offsetWidth > 0 && btn.offsetHeight > 0
      }));
      
      return {
        images: imageInfo,
        choices: choiceInfo,
        url: window.location.href
      };
    });
    
    storyCreationData.finalAnalysis = finalAnalysis;
    log('ANALYSIS', 'Final state analysis', finalAnalysis);
    
    // Save comprehensive results
    const fullResults = {
      investigation: 'Comprehensive New Story Creation',
      timestamp: new Date().toISOString(),
      storyTitle,
      storyDescription,
      storyCreationData,
      creationTime: `${iterations * 2} seconds`,
      logs,
      success: creationComplete
    };
    
    fs.writeFileSync(`${resultsDir}/investigation-results.json`, JSON.stringify(fullResults, null, 2));
    
    console.log('\n' + '='.repeat(70));
    console.log('🎯 COMPREHENSIVE INVESTIGATION SUMMARY:');
    console.log(`📁 Results: ${resultsDir}/`);
    console.log(`⏱️  Creation time: ${iterations * 2} seconds`);
    console.log(`✅ Success: ${creationComplete ? 'YES' : 'NO'}`);
    console.log(`🆔 Story ID: ${storyId || 'Not detected'}`);
    console.log(`🖼️  Images found: ${finalAnalysis.images.length}`);
    console.log(`🎯 Choices found: ${finalAnalysis.choices.length}`);
    
    if (finalAnalysis.images.length > 0) {
      console.log('\n📸 IMAGE ANALYSIS:');
      finalAnalysis.images.forEach((img, i) => {
        console.log(`  Image ${i + 1}:`);
        console.log(`    ✅ Loaded: ${img.complete}`);
        console.log(`    👁️  Visible: ${img.visible}`);
        console.log(`    🎨 Opacity: ${img.style.opacity}`);
        console.log(`    📐 Size: ${img.naturalWidth}x${img.naturalHeight}`);
      });
    }
    
    if (finalAnalysis.choices.length > 0) {
      console.log('\n🎯 CHOICE ANALYSIS:');
      finalAnalysis.choices.forEach((choice, i) => {
        console.log(`  Choice ${i + 1}: ${choice.text.substring(0, 50)}...`);
      });
    }
    
  } catch (error) {
    log('ERROR', `Investigation failed: ${error.message}`);
    console.error('Full error:', error);
  } finally {
    await browser.close();
  }
}

// Run the comprehensive investigation
comprehensiveNewStoryInvestigation().catch(console.error);