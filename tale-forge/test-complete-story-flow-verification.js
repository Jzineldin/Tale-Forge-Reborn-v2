#!/usr/bin/env node

/**
 * Complete Story Flow Verification Test
 * Tests the entire story creation pipeline with specific settings:
 * - Age 3 with 30 words per chapter
 * - Verifies word count enforcement
 * - Checks story context continuity
 * - Tests completion flow
 */

import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables manually
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    lines.forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }
}

loadEnvFile();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '❌ Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test story settings - the exact scenario that was failing
const testStorySettings = {
  title: "My Little Adventure",
  description: "A simple story for a young child",
  genre: "adventure",
  age_group: "3-4",  // Expected field name
  theme: "friendship",
  setting: "playground",
  characters: [],
  conflict: "lost toy",
  quest: "find a lost toy",
  moral_lesson: "sharing is caring",
  additional_details: "For very young children",
  setting_description: "a friendly playground",
  time_period: "present day",
  atmosphere: "cheerful and safe",
  target_age: 3,  // Very young age
  words_per_chapter: 30,  // Very short chapters
};

let testStoryId = null;
let testResults = [];
let testSession = null;

function logResult(test, success, message, details = null) {
  const result = {
    test,
    success,
    message,
    details,
    timestamp: new Date().toISOString()
  };
  testResults.push(result);
  
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${test}: ${message}`);
  if (details) {
    console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
  }
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

async function testStoryCreation() {
  console.log('\n🧪 Testing Story Creation with Age 3, 30 Words Settings...\n');
  
  try {
    // Test 1: Create story with specific settings
    console.log('1️⃣ Creating story with test settings...');
    
    // Create a temporary user session for testing
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    
    if (authError) {
      logResult('Authentication', false, 'Failed to create test session', authError);
      return false;
    }
    
    const session = authData.session;
    testSession = session;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/create-story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify(testStorySettings)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logResult('Story Creation', false, `HTTP ${response.status}: ${errorText}`);
      return false;
    }
    
    const storyData = await response.json();
    testStoryId = storyData.story?.id;
    
    if (!testStoryId) {
      logResult('Story Creation', false, 'No story ID returned', storyData);
      return false;
    }
    
    logResult('Story Creation', true, `Story created with ID: ${testStoryId}`);
    
    // Test 2: Verify story settings were saved correctly
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', testStoryId)
      .single();
    
    if (storyError) {
      logResult('Settings Storage', false, 'Failed to fetch story', storyError);
      return false;
    }
    
    const settingsCorrect = story.target_age === 3 && 
                           story.words_per_chapter === 30 &&
                           story.generation_settings?.target_age === 3 &&
                           story.generation_settings?.words_per_chapter === 30;
    
    logResult('Settings Storage', settingsCorrect, 
      settingsCorrect ? 'All settings saved correctly' : 'Settings mismatch',
      {
        stored_target_age: story.target_age,
        stored_words_per_chapter: story.words_per_chapter,
        generation_settings: story.generation_settings
      });
    
    // Test 3: Check initial segment word count
    const { data: segments, error: segmentsError } = await supabase
      .from('story_segments')
      .select('*')
      .eq('story_id', testStoryId)
      .order('position', { ascending: true });
    
    if (segmentsError) {
      logResult('Initial Segment', false, 'Failed to fetch segments', segmentsError);
      return false;
    }
    
    if (segments.length === 0) {
      logResult('Initial Segment', false, 'No segments found');
      return false;
    }
    
    const firstSegment = segments[0];
    const wordCount = countWords(firstSegment.content);
    const wordCountOk = wordCount <= 40; // Allow some flexibility (30 + 10 tolerance)
    
    logResult('Word Count Enforcement', wordCountOk, 
      `First segment: ${wordCount} words (target: 30)`,
      { content: firstSegment.content });
    
    // Test 4: Check age-appropriate language
    const content = firstSegment.content.toLowerCase();
    const hasSimpleWords = !content.includes('magnificent') && 
                          !content.includes('extraordinary') &&
                          !content.includes('adventure') && // Complex for age 3
                          content.split('.').every(sentence => sentence.split(' ').length <= 8);
    
    logResult('Age-Appropriate Language', hasSimpleWords, 
      hasSimpleWords ? 'Language appropriate for age 3' : 'Language too complex',
      { sample_content: firstSegment.content.substring(0, 100) + '...' });
    
    return true;
    
  } catch (error) {
    logResult('Story Creation', false, 'Exception occurred', error.message);
    return false;
  }
}

async function testStoryProgression() {
  if (!testStoryId) {
    console.log('⏭️ Skipping progression test - no story created');
    return false;
  }
  
  console.log('\n🧪 Testing Story Progression and Context Continuity...\n');
  
  try {
    // Test 5: Generate next segment
    console.log('2️⃣ Generating next story segment...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-story-segment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testSession.access_token}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        storyId: testStoryId,
        selectedChoice: "look for the toy"
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logResult('Segment Generation', false, `HTTP ${response.status}: ${errorText}`);
      return false;
    }
    
    const segmentData = await response.json();
    logResult('Segment Generation', true, 'Second segment generated successfully');
    
    // Test 6: Verify word count consistency
    const { data: allSegments, error: segmentsError } = await supabase
      .from('story_segments')
      .select('*')
      .eq('story_id', testStoryId)
      .order('position', { ascending: true });
    
    if (segmentsError || allSegments.length < 2) {
      logResult('Segment Consistency', false, 'Failed to fetch updated segments');
      return false;
    }
    
    const secondSegment = allSegments[1];
    const secondWordCount = countWords(secondSegment.content);
    const consistentWordCount = secondWordCount <= 40;
    
    logResult('Word Count Consistency', consistentWordCount,
      `Second segment: ${secondWordCount} words (target: 30)`,
      { content: secondSegment.content });
    
    // Test 7: Check story context continuity
    const firstContent = allSegments[0].content.toLowerCase();
    const secondContent = secondSegment.content.toLowerCase();
    
    // Look for common elements that suggest continuity
    const hasCharacterContinuity = (firstContent.includes('toy') && secondContent.includes('toy')) ||
                                  (firstContent.includes('playground') && secondContent.includes('playground'));
    
    logResult('Story Context Continuity', hasCharacterContinuity,
      hasCharacterContinuity ? 'Story elements maintained between segments' : 'Context may have been lost',
      { 
        first_segment: allSegments[0].content.substring(0, 50) + '...',
        second_segment: secondSegment.content.substring(0, 50) + '...'
      });
    
    return true;
    
  } catch (error) {
    logResult('Story Progression', false, 'Exception occurred', error.message);
    return false;
  }
}

async function testStoryCompletion() {
  if (!testStoryId) {
    console.log('⏭️ Skipping completion test - no story created');
    return false;
  }
  
  console.log('\n🧪 Testing Story Completion Flow...\n');
  
  try {
    // Test 8: Generate story ending
    console.log('3️⃣ Generating story ending...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-story-ending`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testSession.access_token}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        storyId: testStoryId
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logResult('Story Ending', false, `HTTP ${response.status}: ${errorText}`);
      return false;
    }
    
    const endingData = await response.json();
    logResult('Story Ending', true, 'Story ending generated successfully');
    
    // Test 9: Verify ending properties
    const { data: finalSegments, error: segmentsError } = await supabase
      .from('story_segments')
      .select('*')
      .eq('story_id', testStoryId)
      .order('position', { ascending: true });
    
    if (segmentsError) {
      logResult('Ending Verification', false, 'Failed to fetch final segments');
      return false;
    }
    
    const endingSegment = finalSegments[finalSegments.length - 1];
    const isMarkedAsEnd = endingSegment.is_end === true;
    const hasNoChoices = !endingSegment.choices || endingSegment.choices.length === 0;
    const endingWordCount = countWords(endingSegment.content);
    
    logResult('Ending Properties', isMarkedAsEnd && hasNoChoices,
      `Ending marked properly: ${isMarkedAsEnd}, No choices: ${hasNoChoices}, Words: ${endingWordCount}`,
      { 
        is_end: endingSegment.is_end,
        choices: endingSegment.choices,
        content_preview: endingSegment.content.substring(0, 100) + '...'
      });
    
    return true;
    
  } catch (error) {
    logResult('Story Completion', false, 'Exception occurred', error.message);
    return false;
  }
}

async function cleanupTestData() {
  if (!testStoryId) {
    return;
  }
  
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Delete segments first (foreign key constraint)
    await supabase
      .from('story_segments')
      .delete()
      .eq('story_id', testStoryId);
    
    // Delete the story
    await supabase
      .from('stories')
      .delete()
      .eq('id', testStoryId);
    
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.log('⚠️ Cleanup failed:', error.message);
  }
}

async function generateTestReport() {
  console.log('\n📊 TEST RESULTS SUMMARY\n');
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);
  
  if (failedTests > 0) {
    console.log('🚨 FAILED TESTS:\n');
    testResults.filter(r => !r.success).forEach((result, index) => {
      console.log(`${index + 1}. ${result.test}: ${result.message}`);
      if (result.details) {
        console.log(`   ${JSON.stringify(result.details, null, 2)}\n`);
      }
    });
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, 'story-flow-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      success_rate: ((passedTests / totalTests) * 100).toFixed(1) + '%',
      test_story_id: testStoryId,
      timestamp: new Date().toISOString()
    },
    results: testResults
  }, null, 2));
  
  console.log(`📋 Detailed report saved to: ${reportPath}`);
  
  return failedTests === 0;
}

async function runCompleteTest() {
  console.log('🚀 Starting Complete Story Flow Verification Test\n');
  console.log('Testing scenario: Age 3, 30 words per chapter\n');
  
  try {
    const creationSuccess = await testStoryCreation();
    const progressionSuccess = await testStoryProgression();
    const completionSuccess = await testStoryCompletion();
    
    const allTestsPassed = await generateTestReport();
    
    await cleanupTestData();
    
    if (allTestsPassed) {
      console.log('\n🎉 ALL TESTS PASSED! Story flow is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Check the report for details.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Test execution failed:', error);
    await cleanupTestData();
    process.exit(1);
  }
}

// Run the test
runCompleteTest();