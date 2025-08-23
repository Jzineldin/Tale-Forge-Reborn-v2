// Story Validation Script - Deep Analysis of Created Stories
// Validates that template outputs match expected themes, genres, and settings

import { chromium } from 'playwright';
import fs from 'fs';

async function validateCreatedStories() {
  console.log('🔍 STORY VALIDATION - Template Output Analysis');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  // Story IDs from successful template creations
  const storiesToValidate = [
    { 
      id: 'beea88f3-3846-4b0d-823b-cc25b99c3c07', 
      template: 'Magical Adventure',
      expectedGenre: 'fantasy',
      expectedThemes: ['magic', 'crystal', 'adventure', 'wizard', 'spell', 'enchanted'],
      expectedAge: '4-12'
    },
    { 
      id: 'a244ac38-d03a-4385-bbc4-a2a02c29adad', 
      template: 'Time Travel Adventure',
      expectedGenre: 'adventure',
      expectedThemes: ['time', 'travel', 'adventure', 'journey', 'future', 'past'],
      expectedAge: '4-12'
    },
    { 
      id: '2b23744b-82b6-463d-ae04-a09dcc9df2cf', 
      template: 'Animal Rescue Mission',
      expectedGenre: 'adventure',
      expectedThemes: ['animal', 'rescue', 'help', 'save', 'wildlife', 'nature'],
      expectedAge: '4-12'
    },
    { 
      id: '867cc5f1-9986-4943-b712-0cd1676b1979', 
      template: 'Underwater Kingdom',
      expectedGenre: 'fantasy',
      expectedThemes: ['underwater', 'ocean', 'sea', 'fish', 'kingdom', 'water'],
      expectedAge: '4-12'
    }
  ];
  
  const validationResults = [];
  
  try {
    // Login first
    console.log('🔐 Authenticating...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.locator('button:has-text("Sign In")').first().click();
    await page.fill('input[type="email"]', 'jzineldin@gmail.com');
    await page.fill('input[type="password"]', 'Rashzin1996!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    
    // Validate each story
    for (let i = 0; i < storiesToValidate.length; i++) {
      const story = storiesToValidate[i];
      console.log(`\n📖 VALIDATING ${i + 1}/${storiesToValidate.length}: ${story.template}`);
      console.log(`🆔 Story ID: ${story.id}`);
      
      const result = {
        template: story.template,
        storyId: story.id,
        expectedGenre: story.expectedGenre,
        expectedThemes: story.expectedThemes,
        validation: {
          accessible: false,
          hasContent: false,
          hasChoices: false,
          hasImage: false,
          themeMatch: 0,
          genreMatch: false,
          ageAppropriate: false,
          choiceQuality: 'unknown'
        },
        storyData: null,
        issues: []
      };
      
      try {
        // Navigate to story
        await page.goto(`http://localhost:3001/stories/${story.id}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // Check if story is accessible
        const hasStoryContent = await page.locator('div, p').filter({ hasText: /\\w{50,}/ }).count() > 0;
        const hasErrorMessage = await page.locator('text="Story not found", text="Access denied", text="Error"').count() > 0;
        
        if (hasErrorMessage) {
          result.issues.push('Story not accessible or not found');
          console.log('❌ Story not accessible');
        } else if (hasStoryContent) {
          result.validation.accessible = true;
          console.log('✅ Story accessible');
          
          await page.screenshot({ path: `./ultimate-test-results/validation-${i + 1}-${story.template.replace(/\\s+/g, '-')}.png`, fullPage: true });
          
          // Deep analysis using browser context
          const analysis = await page.evaluate(async ({ storyId, expectedThemes, expectedGenre }) => {
            // Get auth token
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
              // Fetch story data
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
              const story = data.story;
              
              if (!story || !story.segments || story.segments.length === 0) {
                return { error: 'No story data or segments found' };
              }
              
              const firstSegment = story.segments[0];
              const content = firstSegment.content || '';
              const contentLower = content.toLowerCase();
              
              // Theme validation
              const themeMatches = expectedThemes.filter(theme => 
                contentLower.includes(theme.toLowerCase())
              );
              
              // Genre validation  
              const genreMatch = contentLower.includes(expectedGenre.toLowerCase()) || 
                               (story.genre && story.genre.toLowerCase().includes(expectedGenre.toLowerCase()));
              
              // Choice analysis
              const choices = firstSegment.choices || [];
              const hasContextualChoices = choices.length > 0 && 
                                         !choices.some(choice => 
                                           choice.includes('Continue the adventure') || 
                                           choice.includes('See what happens next')
                                         );
              
              // Age appropriateness check (basic - no violence, appropriate language)
              const hasViolentContent = contentLower.includes('kill') || 
                                       contentLower.includes('death') || 
                                       contentLower.includes('blood');
              const hasComplexLanguage = content.split(' ').some(word => word.length > 12);
              
              // Get page elements for additional validation
              const pageElements = {
                storyTitle: document.querySelector('h1, h2')?.textContent || '',
                visibleChoices: Array.from(document.querySelectorAll('button')).filter(btn => 
                  btn.textContent.match(/^[A-C][\\.\\)]/)).length,
                imageElement: !!document.querySelector('img[alt*="Illustration"]'),
                imageVisible: (() => {
                  const img = document.querySelector('img[alt*="Illustration"]');
                  return img ? img.offsetWidth > 0 && img.offsetHeight > 0 : false;
                })()
              };
              
              return {
                success: true,
                story: {
                  id: story.id,
                  title: story.title,
                  genre: story.genre,
                  targetAge: story.age_group || story.target_age,
                  segmentCount: story.segments.length,
                  content: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
                  choices: choices,
                  hasImage: !!firstSegment.image_url,
                  imageUrl: firstSegment.image_url,
                  aiModel: story.ai_model_used,
                  wordCount: content.split(' ').length
                },
                validation: {
                  themeMatches: themeMatches,
                  themeMatchCount: themeMatches.length,
                  themeMatchPercentage: (themeMatches.length / expectedThemes.length) * 100,
                  genreMatch: genreMatch,
                  hasContextualChoices: hasContextualChoices,
                  ageAppropriate: !hasViolentContent && !hasComplexLanguage,
                  contentLength: content.length,
                  choiceCount: choices.length
                },
                pageElements: pageElements
              };
              
            } catch (error) {
              return { error: error.message };
            }
          }, { 
            storyId: story.id, 
            expectedThemes: story.expectedThemes, 
            expectedGenre: story.expectedGenre 
          });
          
          if (analysis.success) {
            result.storyData = analysis.story;
            result.validation = {
              ...result.validation,
              accessible: true,
              hasContent: analysis.story.content.length > 100,
              hasChoices: analysis.story.choices.length > 0,
              hasImage: analysis.story.hasImage,
              themeMatch: analysis.validation.themeMatchPercentage,
              genreMatch: analysis.validation.genreMatch,
              ageAppropriate: analysis.validation.ageAppropriate,
              choiceQuality: analysis.validation.hasContextualChoices ? 'contextual' : 'generic'
            };
            
            // Detailed logging
            console.log(`📊 ANALYSIS RESULTS:`);
            console.log(`   📝 Content Length: ${analysis.story.content.length} chars`);
            console.log(`   🎭 Genre Match: ${analysis.validation.genreMatch ? '✅' : '❌'} (Expected: ${story.expectedGenre})`);
            console.log(`   🎯 Theme Matches: ${analysis.validation.themeMatchCount}/${story.expectedThemes.length} (${analysis.validation.themeMatchPercentage.toFixed(1)}%)`);
            console.log(`   🎯 Found Themes: [${analysis.validation.themeMatches.join(', ')}]`);
            console.log(`   🎲 Choices: ${analysis.story.choices.length} (${analysis.validation.hasContextualChoices ? 'Contextual' : 'Generic'})`);
            console.log(`   🖼️  Has Image: ${analysis.story.hasImage ? '✅' : '❌'}`);
            console.log(`   👶 Age Appropriate: ${analysis.validation.ageAppropriate ? '✅' : '❌'}`);
            console.log(`   🤖 AI Model: ${analysis.story.aiModel}`);
            
            if (analysis.story.choices.length > 0) {
              console.log(`   📋 Sample Choices:`);
              analysis.story.choices.forEach((choice, idx) => {
                console.log(`      ${idx + 1}. ${choice.substring(0, 60)}...`);
              });
            }
            
          } else {
            result.issues.push(analysis.error);
            console.log(`❌ Analysis failed: ${analysis.error}`);
          }
        }
        
      } catch (error) {
        result.issues.push(error.message);
        console.log(`❌ Error validating ${story.template}: ${error.message}`);
      }
      
      validationResults.push(result);
    }
    
    // Generate comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      totalStories: validationResults.length,
      successfulValidations: validationResults.filter(r => r.validation.accessible).length,
      averageThemeMatch: validationResults.reduce((sum, r) => sum + (r.validation.themeMatch || 0), 0) / validationResults.length,
      genreAccuracy: validationResults.filter(r => r.validation.genreMatch).length / validationResults.length * 100,
      choiceQuality: validationResults.filter(r => r.validation.choiceQuality === 'contextual').length / validationResults.length * 100,
      results: validationResults
    };
    
    fs.writeFileSync('./ultimate-test-results/story-validation-report.json', JSON.stringify(report, null, 2));
    
    // Summary report
    console.log('\\n' + '=' .repeat(60));
    console.log('📊 STORY VALIDATION SUMMARY REPORT');
    console.log('=' .repeat(60));
    console.log(`📚 Stories Analyzed: ${report.totalStories}`);
    console.log(`✅ Successful Validations: ${report.successfulValidations}`);
    console.log(`🎯 Average Theme Match: ${report.averageThemeMatch.toFixed(1)}%`);
    console.log(`🎭 Genre Accuracy: ${report.genreAccuracy.toFixed(1)}%`);
    console.log(`🎲 Contextual Choice Quality: ${report.choiceQuality.toFixed(1)}%`);
    
    console.log('\\n📋 INDIVIDUAL STORY RESULTS:');
    validationResults.forEach((result, i) => {
      console.log(`${i + 1}. ${result.template}:`);
      console.log(`   🔑 Accessible: ${result.validation.accessible ? '✅' : '❌'}`);
      console.log(`   📝 Content: ${result.validation.hasContent ? '✅' : '❌'}`);
      console.log(`   🎯 Theme Match: ${result.validation.themeMatch.toFixed(1)}%`);
      console.log(`   🎭 Genre Match: ${result.validation.genreMatch ? '✅' : '❌'}`);
      console.log(`   🎲 Choice Quality: ${result.validation.choiceQuality}`);
      console.log(`   🖼️  Has Image: ${result.validation.hasImage ? '✅' : '❌'}`);
      if (result.issues.length > 0) {
        console.log(`   ⚠️  Issues: ${result.issues.join(', ')}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Validation suite failed:', error);
  } finally {
    await browser.close();
  }
}

// Execute validation
validateCreatedStories().catch(console.error);