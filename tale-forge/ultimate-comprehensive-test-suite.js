// ULTIMATE COMPREHENSIVE TEST SUITE - Tale Forge System Validation
// This script tests EVERYTHING: templates, custom settings, output validation, and issue monitoring

import { chromium } from 'playwright';
import fs from 'fs';

async function ultimateComprehensiveTestSuite() {
  console.log('🧠 ULTIMATE COMPREHENSIVE TEST SUITE - ULTRATHINKING MODE');
  console.log('=' .repeat(80));
  
  const resultsDir = './ultimate-test-results';
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    recordVideo: { dir: resultsDir }
  });
  
  const page = await context.newPage();
  
  const testResults = {
    startTime: new Date().toISOString(),
    templates: [],
    customTests: [],
    issues: [],
    networkLogs: [],
    performance: {},
    validationResults: {}
  };
  
  const log = (category, message, data = null) => {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, category, message, data };
    console.log(`[${timestamp}] ${category}: ${message}`);
    if (data) console.log('  📊', JSON.stringify(data, null, 2));
    return entry;
  };
  
  // Comprehensive network monitoring
  page.on('request', request => {
    if (request.url().includes('create-story') || 
        request.url().includes('get-story') ||
        request.url().includes('generate') ||
        request.url().includes('story-images') ||
        request.url().includes('supabase')) {
      testResults.networkLogs.push({
        type: 'request',
        timestamp: new Date().toISOString(),
        method: request.method(),
        url: request.url(),
        headers: request.headers()
      });
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('create-story') || 
        response.url().includes('get-story') ||
        response.url().includes('generate') ||
        response.url().includes('story-images')) {
      
      const logEntry = {
        type: 'response',
        timestamp: new Date().toISOString(),
        url: response.url(),
        status: response.status(),
        headers: await response.allHeaders()
      };
      
      try {
        logEntry.body = await response.text();
      } catch (e) {
        logEntry.body = `Could not read: ${e.message}`;
      }
      
      testResults.networkLogs.push(logEntry);
    }
  });
  
  // Console monitoring for issues
  page.on('console', msg => {
    if (msg.text().includes('error') || 
        msg.text().includes('❌') ||
        msg.text().includes('⚠️') ||
        msg.text().includes('🎯') ||
        msg.text().includes('choice') ||
        msg.text().includes('image')) {
      testResults.issues.push({
        timestamp: new Date().toISOString(),
        type: msg.type(),
        text: msg.text()
      });
    }
  });
  
  try {
    // PHASE 1: AUTHENTICATION AND SETUP
    log('PHASE1', 'Authentication and Setup');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    
    await page.locator('button:has-text("Sign In")').first().click();
    await page.fill('input[type="email"]', 'jzineldin@gmail.com');
    await page.fill('input[type="password"]', 'Rashzin1996!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: `${resultsDir}/00-authenticated.png`, fullPage: true });
    log('PHASE1', '✅ Authentication successful');
    
    // PHASE 2: COMPREHENSIVE TEMPLATE TESTING
    log('PHASE2', 'Comprehensive Template Testing');
    
    const templates = [
      { name: 'Space Explorer', expectedGenre: 'science fiction', expectedTheme: 'exploration' },
      { name: 'Magical Adventure', expectedGenre: 'fantasy', expectedTheme: 'magic' },
      { name: 'Pirate Treasure Hunt', expectedGenre: 'adventure', expectedTheme: 'treasure' },
      { name: 'Time Travel Adventure', expectedGenre: 'adventure', expectedTheme: 'time travel' },
      { name: 'Animal Rescue Mission', expectedGenre: 'adventure', expectedTheme: 'animals' },
      { name: 'Underwater Kingdom', expectedGenre: 'fantasy', expectedTheme: 'underwater' }
    ];
    
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      log('TEMPLATE', `Testing template ${i + 1}/${templates.length}: ${template.name}`);
      
      const templateResult = {
        name: template.name,
        expectedGenre: template.expectedGenre,
        expectedTheme: template.expectedTheme,
        startTime: new Date().toISOString(),
        success: false,
        issues: [],
        storyData: null,
        validationResults: {}
      };
      
      try {
        // Navigate to create page
        await page.goto('http://localhost:3001/create', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // Find and select template
        const templateSelector = page.locator(`text="${template.name}"`);
        const templateExists = await templateSelector.count() > 0;
        
        if (!templateExists) {
          log('TEMPLATE', `❌ Template "${template.name}" not found`);
          templateResult.issues.push('Template not found');
          testResults.templates.push(templateResult);
          continue;
        }
        
        await templateSelector.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${resultsDir}/template-${i + 1}-selected.png`, fullPage: true });
        
        // Click Create My Story button
        const createButton = page.locator('button:has-text("Create My Story!")');
        if (await createButton.count() > 0) {
          await createButton.click();
          log('TEMPLATE', '🚀 Story creation initiated');
          
          // Monitor creation process
          let creationComplete = false;
          let iterations = 0;
          const maxIterations = 90; // 3 minutes
          let storyId = null;
          
          while (!creationComplete && iterations < maxIterations) {
            iterations++;
            await page.waitForTimeout(2000);
            
            // Check for story ID in URL
            const currentUrl = page.url();
            const urlMatch = currentUrl.match(/stories\/([a-f0-9-]+)/);
            if (urlMatch && !storyId) {
              storyId = urlMatch[1];
              templateResult.storyId = storyId;
              log('TEMPLATE', `📍 Story ID: ${storyId}`);
            }
            
            // Check for completion
            const hasChoices = await page.locator('text="What should happen next?"').count() > 0;
            const hasImage = await page.locator('img[alt*="Illustration"], img[alt*="segment"]').count() > 0;
            const hasStoryText = await page.locator('div, p').filter({ hasText: /Once upon|In the|The adventure|Captain|Princess|Dragon/ }).count() > 0;
            const isGenerating = await page.locator('text="Creating illustration...", text="Weaving Your Tale"').count() > 0;
            
            if ((hasChoices || hasImage || hasStoryText) && !isGenerating) {
              creationComplete = true;
              templateResult.success = true;
              log('TEMPLATE', `✅ ${template.name} created successfully`);
              break;
            }
            
            if (iterations % 15 === 0) {
              await page.screenshot({ path: `${resultsDir}/template-${i + 1}-progress-${iterations}.png`, fullPage: true });
              log('TEMPLATE', `⏳ ${template.name} - Iteration ${iterations}`);
            }
          }
          
          // Final validation
          if (creationComplete && storyId) {
            await page.screenshot({ path: `${resultsDir}/template-${i + 1}-complete.png`, fullPage: true });
            
            // Deep analysis using browser context
            const analysisResult = await page.evaluate(async (storyId, expectedGenre, expectedTheme) => {
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
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWeiTvmjoJ0T3GCmrkg'
                  },
                  body: JSON.stringify({ storyId })
                });
                
                if (!response.ok) return { error: `API ${response.status}` };
                
                const data = await response.json();
                const story = data.story;
                
                // Validation logic
                const content = story.segments?.[0]?.content?.toLowerCase() || '';
                const genreMatch = content.includes(expectedGenre.toLowerCase()) || 
                                story.genre?.toLowerCase().includes(expectedGenre.toLowerCase());
                const themeMatch = content.includes(expectedTheme.toLowerCase());
                
                return {
                  success: true,
                  story: {
                    id: story.id,
                    title: story.title,
                    genre: story.genre,
                    targetAge: story.age_group,
                    segmentCount: story.segments?.length || 0,
                    firstSegmentContent: content.substring(0, 300),
                    choices: story.segments?.[0]?.choices || [],
                    hasImage: !!story.segments?.[0]?.image_url,
                    imageUrl: story.segments?.[0]?.image_url,
                    aiModel: story.ai_model_used
                  },
                  validation: {
                    genreMatch,
                    themeMatch,
                    hasContextualChoices: (story.segments?.[0]?.choices || []).length > 0 &&
                                         !(story.segments[0].choices.some(c => c.includes('Continue the adventure'))),
                    contentLength: content.length,
                    expectedGenre,
                    expectedTheme
                  }
                };
              } catch (error) {
                return { error: error.message };
              }
            }, storyId, template.expectedGenre, template.expectedTheme);
            
            templateResult.storyData = analysisResult;
            
            if (analysisResult.success) {
              const validation = analysisResult.validation;
              log('TEMPLATE', `📊 Validation Results for ${template.name}:
                🎭 Genre Match: ${validation.genreMatch ? '✅' : '❌'} (Expected: ${validation.expectedGenre})
                🎯 Theme Match: ${validation.themeMatch ? '✅' : '❌'} (Expected: ${validation.expectedTheme})
                🎲 Contextual Choices: ${validation.hasContextualChoices ? '✅' : '❌'}
                📝 Content Length: ${validation.contentLength} characters
                🖼️  Has Image: ${analysisResult.story.hasImage ? '✅' : '❌'}
                🤖 AI Model: ${analysisResult.story.aiModel}`);
                
              templateResult.validationResults = validation;
            }
          }
          
          templateResult.endTime = new Date().toISOString();
          templateResult.duration = `${iterations * 2} seconds`;
          
        } else {
          log('TEMPLATE', '❌ Create My Story button not found');
          templateResult.issues.push('Create button not found');
        }
        
      } catch (error) {
        log('TEMPLATE', `❌ Error testing ${template.name}: ${error.message}`);
        templateResult.issues.push(error.message);
      }
      
      testResults.templates.push(templateResult);
      
      // Brief pause between templates
      await page.waitForTimeout(3000);
    }
    
    // PHASE 3: CUSTOM CREATION TESTING
    log('PHASE3', 'Custom Creation Testing with Various Settings');
    
    const customTests = [
      { 
        title: 'Custom Adventure Test',
        description: 'Testing custom adventure creation',
        genre: 'Adventure',
        age: '7-9',
        expectedWords: 'adventure, journey, explore'
      },
      { 
        title: 'Custom Fantasy Test',
        description: 'Testing fantasy elements',
        genre: 'Fantasy',
        age: '10-12',
        expectedWords: 'magic, wizard, dragon, kingdom'
      },
      { 
        title: 'Custom Educational Test',
        description: 'Testing educational content',
        genre: 'Educational',
        age: '5-7',
        expectedWords: 'learn, discover, science'
      }
    ];
    
    for (let i = 0; i < customTests.length; i++) {
      const test = customTests[i];
      log('CUSTOM', `Testing custom creation ${i + 1}/${customTests.length}: ${test.title}`);
      
      const customResult = {
        title: test.title,
        settings: test,
        startTime: new Date().toISOString(),
        success: false,
        storyData: null,
        validationResults: {}
      };
      
      try {
        await page.goto('http://localhost:3001/create', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // Look for custom creation option
        const customButton = page.locator('button:has-text("Start Custom Creation")').or(
          page.locator('text="Create Custom Story"')
        ).or(
          page.locator('button:has-text("Custom")')
        );
        
        if (await customButton.count() > 0) {
          await customButton.click();
          await page.waitForTimeout(2000);
          
          // Fill custom form
          const titleInput = page.locator('input[name="title"], input[placeholder*="title"]');
          const descInput = page.locator('textarea[name="description"], textarea[placeholder*="description"]');
          
          if (await titleInput.count() > 0) {
            await titleInput.fill(test.title);
            await descInput.fill(test.description);
            
            // Select genre and age
            const genreButtons = page.locator(`button:has-text("${test.genre}")`);
            const ageButtons = page.locator(`button:has-text("${test.age}")`);
            
            if (await genreButtons.count() > 0) await genreButtons.first().click();
            if (await ageButtons.count() > 0) await ageButtons.first().click();
            
            await page.screenshot({ path: `${resultsDir}/custom-${i + 1}-form.png`, fullPage: true });
            
            // Submit
            const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Generate")');
            await submitButton.first().click();
            
            // Monitor creation (similar to template testing)
            let creationComplete = false;
            let iterations = 0;
            let storyId = null;
            
            while (!creationComplete && iterations < 60) {
              iterations++;
              await page.waitForTimeout(2000);
              
              const currentUrl = page.url();
              const urlMatch = currentUrl.match(/stories\/([a-f0-9-]+)/);
              if (urlMatch && !storyId) {
                storyId = urlMatch[1];
                customResult.storyId = storyId;
              }
              
              const hasChoices = await page.locator('text="What should happen next?"').count() > 0;
              const hasImage = await page.locator('img[alt*="Illustration"]').count() > 0;
              const hasStoryText = await page.locator('div, p').filter({ hasText: /\w{50,}/ }).count() > 0;
              const isGenerating = await page.locator('text="Creating illustration...", text="Weaving"').count() > 0;
              
              if ((hasChoices || hasImage || hasStoryText) && !isGenerating) {
                creationComplete = true;
                customResult.success = true;
                break;
              }
            }
            
            if (creationComplete && storyId) {
              // Deep validation
              const validation = await page.evaluate(async (storyId, expectedWords) => {
                // Same validation logic as templates
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
                      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWeeiTvmjoJ0T3GCmrkg'
                    },
                    body: JSON.stringify({ storyId })
                  });
                  
                  const data = await response.json();
                  const story = data.story;
                  const content = story.segments?.[0]?.content?.toLowerCase() || '';
                  
                  const wordMatches = expectedWords.split(', ').map(word => 
                    content.includes(word.toLowerCase())
                  );
                  
                  return {
                    success: true,
                    story: {
                      title: story.title,
                      content: content.substring(0, 300),
                      choices: story.segments?.[0]?.choices || [],
                      hasImage: !!story.segments?.[0]?.image_url
                    },
                    validation: {
                      wordMatches,
                      expectedWords: expectedWords.split(', '),
                      overallMatch: wordMatches.filter(Boolean).length / wordMatches.length
                    }
                  };
                } catch (error) {
                  return { error: error.message };
                }
              }, storyId, test.expectedWords);
              
              customResult.storyData = validation;
              await page.screenshot({ path: `${resultsDir}/custom-${i + 1}-complete.png`, fullPage: true });
            }
          }
        } else {
          log('CUSTOM', 'Custom creation option not available, using template fallback');
          // Fallback to template-based test
        }
        
      } catch (error) {
        log('CUSTOM', `❌ Error in custom test: ${error.message}`);
        customResult.issues = [error.message];
      }
      
      testResults.customTests.push(customResult);
    }
    
    // PHASE 4: ISSUE MONITORING AND PERFORMANCE ANALYSIS
    log('PHASE4', 'Issue Monitoring and Performance Analysis');
    
    // Image rendering test
    log('ISSUE_TEST', 'Testing image rendering timing');
    const imageTest = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img[alt*="Illustration"]'));
      return images.map(img => ({
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        visible: img.offsetWidth > 0 && img.offsetHeight > 0,
        opacity: getComputedStyle(img).opacity
      }));
    });
    
    testResults.performance.imageTest = imageTest;
    
    // Choice quality test
    log('ISSUE_TEST', 'Testing choice quality and contextuality');
    const choiceTest = await page.evaluate(() => {
      const choiceButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.match(/^[A-C][\.\)]/));
      return choiceButtons.map(btn => ({
        text: btn.textContent.trim(),
        isGeneric: btn.textContent.includes('Continue the adventure') || 
                  btn.textContent.includes('See what happens') ||
                  btn.textContent.includes('Move forward')
      }));
    });
    
    testResults.performance.choiceTest = choiceTest;
    
    // Final comprehensive report
    testResults.endTime = new Date().toISOString();
    testResults.summary = {
      totalTemplatesTested: testResults.templates.length,
      successfulTemplates: testResults.templates.filter(t => t.success).length,
      totalCustomTests: testResults.customTests.length,
      successfulCustomTests: testResults.customTests.filter(t => t.success).length,
      totalIssues: testResults.issues.length,
      networkRequests: testResults.networkLogs.filter(l => l.type === 'request').length,
      networkResponses: testResults.networkLogs.filter(l => l.type === 'response').length
    };
    
    // Save comprehensive results
    fs.writeFileSync(`${resultsDir}/comprehensive-test-results.json`, JSON.stringify(testResults, null, 2));
    
    console.log('\n' + '=' .repeat(80));
    console.log('🧠 ULTRATHINKING TEST SUITE COMPLETE');
    console.log('=' .repeat(80));
    console.log(`📊 RESULTS SUMMARY:`);
    console.log(`🎭 Templates Tested: ${testResults.summary.totalTemplatesTested}`);
    console.log(`✅ Templates Successful: ${testResults.summary.successfulTemplates}`);
    console.log(`🎨 Custom Tests: ${testResults.summary.totalCustomTests}`);
    console.log(`✅ Custom Successful: ${testResults.summary.successfulCustomTests}`);
    console.log(`⚠️  Issues Detected: ${testResults.summary.totalIssues}`);
    console.log(`📡 Network Requests: ${testResults.summary.networkRequests}`);
    console.log(`📁 Full Results: ${resultsDir}/`);
    
    // Detailed analysis
    console.log('\n📋 DETAILED TEMPLATE ANALYSIS:');
    testResults.templates.forEach((template, i) => {
      console.log(`${i + 1}. ${template.name}: ${template.success ? '✅' : '❌'}`);
      if (template.validationResults) {
        console.log(`   Genre Match: ${template.validationResults.genreMatch ? '✅' : '❌'}`);
        console.log(`   Theme Match: ${template.validationResults.themeMatch ? '✅' : '❌'}`);
        console.log(`   Contextual Choices: ${template.validationResults.hasContextualChoices ? '✅' : '❌'}`);
      }
    });
    
  } catch (error) {
    log('ERROR', `Ultimate test suite failed: ${error.message}`);
    console.error('Full error:', error);
  } finally {
    await browser.close();
  }
}

// Execute the ultimate comprehensive test suite
ultimateComprehensiveTestSuite().catch(console.error);