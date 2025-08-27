// Test ALL AI story creation pipelines
// Tests: Easy Mode, Template Mode, and Advanced Mode
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test user for authentication
const TEST_USER_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

async function testAllPipelines() {
  console.log('🚀 Testing ALL AI Story Creation Pipelines...\n');
  console.log('=' .repeat(60));
  
  // Test 1: EASY MODE
  await testEasyMode();
  
  // Test 2: TEMPLATE MODE
  await testTemplateMode();
  
  // Test 3: ADVANCED MODE
  await testAdvancedMode();
  
  // Test 4: Story Generation (segment creation)
  await testStoryGeneration();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 ALL AI PIPELINE TESTS COMPLETE!\n');
}

// TEST 1: Easy Mode Pipeline
async function testEasyMode() {
  console.log('\n📗 TESTING EASY MODE PIPELINE');
  console.log('-'.repeat(40));
  
  try {
    // Easy Mode typically uses generate-story-seeds-safe
    const response = await fetch('http://localhost:54321/functions/v1/generate-story-seeds-safe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        genre: 'fantasy',
        difficulty: 5, // 1-10 scale
        childName: 'Alex'
      })
    });

    const result = await response.json();
    
    if (response.ok && result.seeds) {
      console.log('✅ Easy Mode: SUCCESS');
      console.log('   Generated seeds:', result.seeds.length);
      console.log('   Sample seed:', result.seeds[0]?.substring(0, 100) + '...');
    } else {
      console.log('❌ Easy Mode: FAILED');
      console.log('   Error:', result.error || result.message);
    }
  } catch (error) {
    console.log('❌ Easy Mode: CONNECTION ERROR');
    console.log('   Error:', error.message);
  }
}

// TEST 2: Template Mode Pipeline
async function testTemplateMode() {
  console.log('\n📘 TESTING TEMPLATE MODE PIPELINE');
  console.log('-'.repeat(40));
  
  try {
    // Template Mode uses pre-built templates and create-story
    const response = await fetch('http://localhost:54321/functions/v1/create-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        title: 'Template Test Story',
        description: 'Testing template-based story creation',
        genre: 'adventure',
        age_group: '7-9',
        theme: 'friendship',
        setting: 'magical forest',
        characters: [
          { name: 'Luna', description: 'A brave young explorer', role: 'protagonist' }
        ],
        conflict: 'Finding the lost treasure',
        quest: 'Help the forest animals',
        moral_lesson: 'Teamwork makes dreams work',
        story_type: 'short',
        include_images: true,
        include_audio: false
      })
    });

    const result = await response.json();
    
    if (response.ok && result.story) {
      console.log('✅ Template Mode: SUCCESS');
      console.log('   Story ID:', result.story.id);
      console.log('   Title:', result.story.title);
      console.log('   Credits used:', result.creditsUsed);
      
      // Clean up test story
      await supabase.from('stories').delete().eq('id', result.story.id);
    } else {
      console.log('❌ Template Mode: FAILED');
      console.log('   Error:', result.error || result.message);
    }
  } catch (error) {
    console.log('❌ Template Mode: CONNECTION ERROR');
    console.log('   Error:', error.message);
  }
}

// TEST 3: Advanced Mode Pipeline
async function testAdvancedMode() {
  console.log('\n📕 TESTING ADVANCED MODE PIPELINE');
  console.log('-'.repeat(40));
  
  try {
    // Advanced Mode uses full customization with create-story
    const response = await fetch('http://localhost:54321/functions/v1/create-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        title: 'Advanced Custom Story',
        description: 'A fully customized story with detailed settings',
        genre: 'science',
        age_group: '10-12',
        theme: 'discovery and innovation',
        setting: 'futuristic space station',
        characters: [
          { 
            name: 'Captain Nova', 
            description: 'Experienced space explorer with a heart of gold', 
            role: 'mentor',
            traits: ['wise', 'patient', 'innovative']
          },
          {
            name: 'Zara',
            description: 'Young scientist eager to make discoveries',
            role: 'protagonist',
            traits: ['curious', 'brave', 'creative']
          }
        ],
        conflict: 'Solving the mystery of the disappearing stars',
        quest: 'Restore light to the galaxy',
        moral_lesson: 'Persistence and teamwork lead to great discoveries',
        additional_details: 'Include puzzles and scientific explanations suitable for kids',
        setting_description: 'A gleaming space station orbiting Earth in 2150',
        time_period: 'Future - Year 2150',
        atmosphere: 'Hopeful and exciting with moments of wonder',
        words_per_chapter: 500,
        child_name: 'Sam',
        story_type: 'medium',
        include_images: true,
        include_audio: true
      })
    });

    const result = await response.json();
    
    if (response.ok && result.story) {
      console.log('✅ Advanced Mode: SUCCESS');
      console.log('   Story ID:', result.story.id);
      console.log('   Title:', result.story.title);
      console.log('   Customizations applied:', Object.keys(result.story).length);
      console.log('   Credits used:', result.creditsUsed);
      
      // Clean up test story
      await supabase.from('stories').delete().eq('id', result.story.id);
    } else {
      console.log('❌ Advanced Mode: FAILED');
      console.log('   Error:', result.error || result.message);
    }
  } catch (error) {
    console.log('❌ Advanced Mode: CONNECTION ERROR');
    console.log('   Error:', error.message);
  }
}

// TEST 4: Story Generation (Segment Creation)
async function testStoryGeneration() {
  console.log('\n📖 TESTING STORY SEGMENT GENERATION');
  console.log('-'.repeat(40));
  
  try {
    // First create a story
    const { data: story } = await supabase
      .from('stories')
      .insert({
        title: 'Segment Test Story',
        description: 'Testing segment generation',
        genre: 'fantasy',
        target_age: '7-9',
        user_id: TEST_USER_ID
      })
      .select()
      .single();
    
    if (!story) {
      console.log('❌ Failed to create test story');
      return;
    }
    
    // Generate a segment
    const response = await fetch('http://localhost:54321/functions/v1/generate-story-segment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        storyId: story.id
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Segment Generation: SUCCESS');
      console.log('   Segment ID:', result.segment.id);
      console.log('   Content length:', result.segment.content.length, 'characters');
      console.log('   Choices generated:', result.segment.choices.length);
      console.log('   AI Provider:', result.aiMetrics.provider);
    } else {
      console.log('❌ Segment Generation: FAILED');
      console.log('   Error:', result.error || result.message);
    }
    
    // Clean up
    await supabase.from('stories').delete().eq('id', story.id);
    
  } catch (error) {
    console.log('❌ Segment Generation: CONNECTION ERROR');
    console.log('   Error:', error.message);
  }
}

// Check if Edge Functions are running
async function checkEdgeFunctions() {
  try {
    const response = await fetch('http://localhost:54321/functions/v1/api-health');
    // 401 means it's running but needs auth, which is fine
    if (response.status === 401 || response.ok) {
      return true;
    }
    console.error('\n⚠️  Edge Functions not running!');
    console.log('   Start them with: supabase functions serve --env-file supabase/functions/.env');
    return false;
  } catch (error) {
    console.error('\n⚠️  Edge Functions not running!');
    console.log('   Error:', error.message);
    console.log('   Start them with: supabase functions serve --env-file supabase/functions/.env');
    return false;
  }
}

// Main execution
async function main() {
  console.log('\n🔍 Checking Edge Functions status...');
  const functionsRunning = await checkEdgeFunctions();
  
  if (!functionsRunning) {
    console.log('\n❌ Please start Edge Functions first!');
    process.exit(1);
  }
  
  console.log('✅ Edge Functions are running!\n');
  await testAllPipelines();
}

main().catch(console.error);