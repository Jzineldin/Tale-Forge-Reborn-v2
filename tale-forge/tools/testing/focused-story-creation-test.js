// Focused Story Creation Test - Complete Flow with Proper Button Clicking
// This script handles the full UI flow including the "Create My Story!" button

import { chromium } from 'playwright';
import fs from 'fs';

async function focusedStoryCreationTest() {
  console.log('🎯 FOCUSED STORY CREATION TEST');
  console.log('=' .repeat(50));
  
  const resultsDir = './focused-test-results';
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  const log = (step, message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${step}: ${message}`);
    if (data) console.log('  📊', data);
  };
  
  let storyId = null;
  let networkLogs = [];
  
  // Monitor story creation network calls
  page.on('response', async response => {
    if (response.url().includes('create-story') || 
        response.url().includes('get-story') ||
        response.url().includes('story-images')) {
      
      const logEntry = {
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      };
      
      try {
        const responseText = await response.text();
        logEntry.responseText = responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '');
        
        // Extract story ID if this is a create-story response
        if (response.url().includes('create-story') && response.ok) {
          try {
            const jsonData = JSON.parse(responseText);
            if (jsonData.story?.id) {
              storyId = jsonData.story.id;
              log('NETWORK', `Story ID extracted from create-story response: ${storyId}`);
            }
          } catch (e) {}
        }
      } catch (e) {
        logEntry.responseText = `Could not read response: ${e.message}`;
      }
      
      networkLogs.push(logEntry);
      log('NETWORK', `${response.status()} ${response.url()}`);
    }
  });
  
  // Monitor console for debugging
  page.on('console', msg => {
    if (msg.text().includes('🎯') || 
        msg.text().includes('✅') || 
        msg.text().includes('❌') || 
        msg.text().includes('choice') ||
        msg.text().includes('story') ||
        msg.text().includes('create')) {
      log('CONSOLE', `${msg.type()}: ${msg.text()}`);
    }
  });
  
  try {
    // Step 1: Navigate and Login
    log('STEP1', 'Navigating to Tale Forge and logging in');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    
    await page.locator('button:has-text("Sign In")').first().click();
    await page.fill('input[type="email"]', 'jzineldin@gmail.com');
    await page.fill('input[type="password"]', 'Rashzin1996!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: `${resultsDir}/01-logged-in.png`, fullPage: true });
    
    // Step 2: Navigate to Create Page
    log('STEP2', 'Going to story creation page');
    await page.goto('http://localhost:3001/create', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${resultsDir}/02-create-page.png`, fullPage: true });
    
    // Step 3: Select Template
    log('STEP3', 'Selecting Space Explorer template');
    const spaceTemplate = page.locator('text="Space Explorer"');
    await spaceTemplate.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${resultsDir}/03-template-selected.png`, fullPage: true });
    
    // Step 4: CRITICAL - Click "Create My Story!" button
    log('STEP4', 'Looking for Create My Story button');
    
    const createButtons = [
      'button:has-text("Create My Story!")',
      'button:has-text("Create Story")', 
      'button:has-text("Generate Story")',
      'button:has-text("Start Creation")',
      '[class*="create"]:has-text("Create")'
    ];
    
    let createButtonFound = false;
    for (const buttonSelector of createButtons) {
      const button = page.locator(buttonSelector);
      if (await button.count() > 0 && await button.isVisible()) {
        log('STEP4', `Found and clicking: ${buttonSelector}`);
        await button.click();
        createButtonFound = true;
        break;
      }
    }
    
    if (!createButtonFound) {
      log('STEP4', '❌ No create button found, taking screenshot for debugging');
      await page.screenshot({ path: `${resultsDir}/04-no-create-button.png`, fullPage: true });
      
      // Try clicking any prominent button
      const anyButton = page.locator('button').filter({ hasText: /create|start|generate/i });
      if (await anyButton.count() > 0) {
        log('STEP4', 'Trying fallback button click');
        await anyButton.first().click();
        createButtonFound = true;
      }
    }
    
    if (createButtonFound) {
      log('STEP4', '✅ Create button clicked, monitoring story creation...');
      await page.screenshot({ path: `${resultsDir}/04-create-clicked.png`, fullPage: true });
      
      // Step 5: Monitor Story Creation Process
      log('STEP5', 'Monitoring story creation process');
      
      let creationComplete = false;
      let iterations = 0;
      const maxIterations = 90; // 3 minutes
      
      while (!creationComplete && iterations < maxIterations) {
        iterations++;
        await page.waitForTimeout(2000);
        
        // Check for story ID in URL
        const currentUrl = page.url();
        const urlStoryId = currentUrl.match(/stories\/([a-f0-9-]+)/);
        if (urlStoryId && !storyId) {
          storyId = urlStoryId[1];
          log('STEP5', `Story ID detected in URL: ${storyId}`);
        }
        
        // Check for story content indicators
        const hasChoices = await page.locator('text="What should happen next?"').count() > 0;
        const hasImage = await page.locator('img[alt*="Illustration"], img[alt*="segment"]').count() > 0;
        const hasStoryText = await page.locator('div:has-text("Once upon"), p:has-text("In a"), div:has-text("The")').count() > 0;
        const isGenerating = await page.locator('text="Creating illustration..."').count() > 0;
        
        // Take screenshots every 15 iterations
        if (iterations % 15 === 0) {
          await page.screenshot({ path: `${resultsDir}/creation-${iterations.toString().padStart(2, '0')}.png`, fullPage: true });
        }
        
        // Check for completion
        if ((hasChoices || hasImage || hasStoryText) && !isGenerating) {
          creationComplete = true;
          log('STEP5', `✅ Story creation completed at iteration ${iterations}`);
          break;
        }
        
        // Progress logging
        if (iterations % 10 === 0) {
          log('STEP5', `Iteration ${iterations}: choices=${hasChoices}, image=${hasImage}, text=${hasStoryText}, generating=${isGenerating}`);
        }
        
        // Check if we got stuck on an error page or login page
        const currentTitle = await page.title();
        if (currentTitle.includes('Sign') || currentTitle.includes('Login') || currentUrl.includes('/auth')) {
          log('STEP5', '❌ Redirected to login page - session expired');
          break;
        }
      }
      
      // Final screenshot and analysis
      await page.screenshot({ path: `${resultsDir}/05-final-result.png`, fullPage: true });
      
      // Step 6: Analyze Final Results
      if (storyId) {
        log('STEP6', `Running analysis for story ID: ${storyId}`);
        
        const analysisResults = await page.evaluate(async (storyId) => {
          // Browser context analysis
          function getAuthToken() {
            const keys = Object.keys(localStorage).filter(k => k.includes('supabase'));
            for (const key of keys) {
              try {
                const parsed = JSON.parse(localStorage.getItem(key));
                if (parsed?.access_token) return parsed.access_token;
              } catch (e) {}
            }
            return null;
          }
          
          const token = getAuthToken();
          if (!token) return { error: 'No auth token' };
          
          try {
            const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/get-story', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
              },
              body: JSON.stringify({ storyId })
            });
            
            if (!response.ok) {
              return { error: `API response ${response.status}` };
            }
            
            const data = await response.json();
            return {
              success: true,
              story: {
                id: data.story?.id,
                title: data.story?.title,
                segmentCount: data.story?.segments?.length || 0,
                hasSegments: (data.story?.segments?.length || 0) > 0,
                firstSegmentContent: data.story?.segments?.[0]?.content?.substring(0, 200),
                firstSegmentChoices: data.story?.segments?.[0]?.choices,
                firstSegmentImage: data.story?.segments?.[0]?.image_url,
                aiModel: data.story?.ai_model_used
              }
            };
          } catch (error) {
            return { error: error.message };
          }
        }, storyId);
        
        log('STEP6', 'API Analysis Results', analysisResults);
      }
      
      // Save comprehensive results
      const results = {
        timestamp: new Date().toISOString(),
        storyId,
        creationTime: `${iterations * 2} seconds`,
        success: creationComplete,
        networkLogs,
        totalIterations: iterations
      };
      
      fs.writeFileSync(`${resultsDir}/test-results.json`, JSON.stringify(results, null, 2));
      
      console.log('\n' + '=' .repeat(50));
      console.log('🎯 FOCUSED TEST RESULTS:');
      console.log(`⏱️  Total time: ${iterations * 2} seconds`);
      console.log(`✅ Success: ${creationComplete ? 'YES' : 'NO'}`);
      console.log(`🆔 Story ID: ${storyId || 'Not detected'}`);
      console.log(`📡 Network calls: ${networkLogs.length}`);
      console.log(`📁 Results: ${resultsDir}/`);
      
    } else {
      log('STEP4', '❌ Could not find create button - test failed');
    }
    
  } catch (error) {
    log('ERROR', `Test failed: ${error.message}`);
    console.error('Full error:', error);
  } finally {
    await browser.close();
  }
}

// Run the focused test
focusedStoryCreationTest().catch(console.error);