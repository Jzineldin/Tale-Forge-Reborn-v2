#!/usr/bin/env node

/**
 * Fixed Story Flow Test
 * Tests story creation with correct schema and field mappings
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

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test settings matching the user's original issue: age 3, 30 words
const testStorySettings = {
  title: "My Little Adventure Test",
  description: "A simple test story for age 3",
  genre: "adventure",
  target_age: "3-4",  // Database format (string) - now supported!
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
  words_per_chapter: 30,  // Very short for age 3
};

let testResults = [];

function logResult(test, success, message, details = null) {
  const result = { test, success, message, details, timestamp: new Date().toISOString() };
  testResults.push(result);
  
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${test}: ${message}`);
  if (details) {
    console.log(`   Details:`, details);
  }
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

async function testFixedStoryFlow() {
  console.log('🧪 Testing Fixed Story Flow\n');
  console.log('Target: Age 3, 30 words per chapter\n');

  try {
    // Test 1: Create a temporary user
    console.log('1️⃣ Setting up test user...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: undefined  // Skip email verification
      }
    });
    
    if (signUpError) {
      console.log('⚠️ User creation failed, trying direct database test...');
      
      // Try direct database insert instead
      const directTestStory = {
        title: testStorySettings.title,
        description: testStorySettings.description,
        genre: testStorySettings.genre,
        user_id: null, // Anonymous story
        target_age: testStorySettings.target_age,
        story_mode: 'interactive',
        is_completed: false,
        is_public: false,
        language: 'en',
        content_rating: 'G',
        generation_settings: {
          theme: testStorySettings.theme,
          setting: testStorySettings.setting,
          quest: testStorySettings.quest,
          moral_lesson: testStorySettings.moral_lesson,
          words_per_chapter: testStorySettings.words_per_chapter,
          target_age: testStorySettings.target_age
        }
      };
      
      // All fields should now match the database schema
      
      const { data: directStory, error: directError } = await supabase
        .from('stories')
        .insert(directTestStory)
        .select()
        .single();
      
      if (directError) {
        logResult('Direct Story Creation', false, 'Database insert failed', directError);
        return;
      }
      
      logResult('Direct Story Creation', true, 'Story created directly in database');
      console.log(`   Story ID: ${directStory.id}`);
      console.log(`   Settings: age ${directStory.target_age}, words ${directStory.generation_settings?.words_per_chapter}`);
      
      // Test story segment generation
      await testSegmentGeneration(directStory.id, null);
      
      // Cleanup
      await supabase.from('story_segments').delete().eq('story_id', directStory.id);
      await supabase.from('stories').delete().eq('id', directStory.id);
      
      return;
    }
    
    const session = signUpData.session;
    logResult('User Creation', true, 'Test user created');
    
    // Test 2: Test create-story function
    console.log('\n2️⃣ Testing create-story function...');
    
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
      logResult('Story Creation Function', false, `HTTP ${response.status}: ${errorText}`);
      
      // Cleanup user and exit
      await supabase.auth.admin.deleteUser(signUpData.user.id);
      return;
    }
    
    const storyData = await response.json();
    logResult('Story Creation Function', true, 'Story created via function');
    
    const storyId = storyData.story?.id;
    console.log(`   Story ID: ${storyId}`);
    console.log(`   Settings saved:`, {
      target_age: storyData.story?.target_age,
      generation_settings: storyData.story?.generation_settings
    });
    
    // Test 3: Verify story was saved correctly
    const { data: savedStory } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();
    
    const settingsOk = savedStory?.target_age === testStorySettings.target_age &&
                      savedStory?.generation_settings?.words_per_chapter === testStorySettings.words_per_chapter;
    
    logResult('Settings Storage', settingsOk, 
      settingsOk ? 'All settings saved correctly' : 'Settings mismatch',
      {
        expected: { target_age: testStorySettings.target_age, words: testStorySettings.words_per_chapter },
        actual: { target_age: savedStory?.target_age, words: savedStory?.generation_settings?.words_per_chapter }
      });
    
    // Test 4: Verify first segment was created with correct word count
    const { data: segments } = await supabase
      .from('story_segments')
      .select('*')
      .eq('story_id', storyId)
      .order('position', { ascending: true });
    
    if (segments && segments.length > 0) {
      const firstSegment = segments[0];
      const wordCount = countWords(firstSegment.content);
      const wordCountOk = wordCount <= 40; // 30 + 10 tolerance
      
      logResult('Initial Word Count', wordCountOk, 
        `First segment: ${wordCount} words (target: 30, tolerance: ≤40)`);
      
      console.log(`   Content preview: "${firstSegment.content.substring(0, 100)}..."`);
      
      // Check age-appropriate language
      const content = firstSegment.content.toLowerCase();
      const hasSimpleLanguage = !content.includes('magnificent') && 
                               !content.includes('extraordinary') && 
                               content.split('.').every(sentence => sentence.split(' ').length <= 10);
      
      logResult('Age Appropriateness', hasSimpleLanguage, 
        hasSimpleLanguage ? 'Language appropriate for age 3' : 'Language too complex');
      
      // Test 5: Generate second segment
      await testSegmentGeneration(storyId, session.access_token);
      
      // Test 6: Generate story ending
      await testStoryEnding(storyId, session.access_token);
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await supabase.from('story_segments').delete().eq('story_id', storyId);
    await supabase.from('stories').delete().eq('id', storyId);
    await supabase.auth.admin.deleteUser(signUpData.user.id);
    console.log('✅ Cleanup completed');
    
  } catch (error) {
    logResult('Test Execution', false, 'Unexpected error', error.message);
  }
  
  // Generate summary
  generateTestSummary();
}

async function testSegmentGeneration(storyId, accessToken) {
  console.log('\n3️⃣ Testing segment generation...');
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-story-segment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken}` : `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        storyId: storyId,
        selectedChoice: "continue the adventure"
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logResult('Segment Generation', false, `HTTP ${response.status}: ${errorText}`);
      return;
    }
    
    logResult('Segment Generation', true, 'Second segment generated');
    
    // Verify the new segment
    const { data: allSegments } = await supabase
      .from('story_segments')
      .select('*')
      .eq('story_id', storyId)
      .order('position', { ascending: true });
    
    if (allSegments && allSegments.length >= 2) {
      const secondSegment = allSegments[1];
      const wordCount = countWords(secondSegment.content);
      const wordCountOk = wordCount <= 40;
      
      logResult('Second Segment Word Count', wordCountOk, 
        `Second segment: ${wordCount} words (target: 30)`);
      
      // Check story continuity
      const firstContent = allSegments[0].content.toLowerCase();
      const secondContent = secondSegment.content.toLowerCase();
      
      const hasContinuity = 
        (firstContent.includes('toy') && secondContent.includes('toy')) ||
        (firstContent.includes('playground') && secondContent.includes('playground')) ||
        (firstContent.includes('friend') && secondContent.includes('friend'));
      
      logResult('Story Continuity', hasContinuity, 
        hasContinuity ? 'Story elements maintained' : 'Context may be lost');
    }
    
  } catch (error) {
    logResult('Segment Generation', false, 'Error occurred', error.message);
  }
}

async function testStoryEnding(storyId, accessToken) {
  console.log('\n4️⃣ Testing story ending...');
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-story-ending`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        storyId: storyId
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logResult('Story Ending', false, `HTTP ${response.status}: ${errorText}`);
      return;
    }
    
    logResult('Story Ending', true, 'Story ending generated');
    
    // Verify ending properties
    const { data: finalSegments } = await supabase
      .from('story_segments')
      .select('*')
      .eq('story_id', storyId)
      .order('position', { ascending: true });
    
    if (finalSegments && finalSegments.length > 0) {
      const ending = finalSegments[finalSegments.length - 1];
      const isProperEnding = ending.is_end === true && (!ending.choices || ending.choices.length === 0);
      
      logResult('Ending Properties', isProperEnding,
        `Proper ending: is_end=${ending.is_end}, choices=${ending.choices?.length || 0}`);
    }
    
  } catch (error) {
    logResult('Story Ending', false, 'Error occurred', error.message);
  }
}

function generateTestSummary() {
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.filter(r => !r.success).forEach((result, index) => {
      console.log(`${index + 1}. ${result.test}: ${result.message}`);
    });
  }
  
  console.log('\n🎯 KEY FINDINGS:');
  console.log('================');
  
  const keyTests = [
    'Story Creation Function',
    'Settings Storage', 
    'Initial Word Count',
    'Age Appropriateness',
    'Segment Generation',
    'Story Continuity',
    'Story Ending'
  ];
  
  keyTests.forEach(testName => {
    const result = testResults.find(r => r.test === testName);
    if (result) {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${testName}: ${result.success ? 'WORKING' : 'NEEDS FIX'}`);
    }
  });
  
  console.log('\nThe story creation system should now properly:');
  console.log('• Handle age 3 settings correctly');
  console.log('• Enforce ~30 word count per segment');
  console.log('• Maintain story context between segments');
  console.log('• Generate proper story endings');
  console.log('• Store settings in the correct database fields');
}

testFixedStoryFlow();