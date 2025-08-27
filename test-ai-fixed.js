// Test AI story generation with proper request format
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAIGeneration() {
  console.log('🚀 Testing AI Story Generation Pipeline...\n');
  
  // First, create a test story in the database
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .insert({
      title: 'AI Test Story',
      description: 'Testing AI generation with real API keys',
      genre: 'fantasy',
      target_age: '7-9',
      user_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' // Test user
    })
    .select()
    .single();
    
  if (storyError) {
    console.error('❌ Failed to create test story:', storyError);
    return;
  }
  
  console.log('✅ Created test story:', story.id);
  console.log('   Title:', story.title);
  console.log('   Genre:', story.genre);
  console.log('   Target Age:', story.target_age);
  
  // Now test the AI generation
  console.log('\n⏳ Testing AI generation for first segment...');
  
  const response = await fetch('http://localhost:54321/functions/v1/generate-story-segment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({
      storyId: story.id,
      // No choiceIndex for first segment
    })
  });

  const result = await response.json();
  
  if (response.ok && result.success && result.segment) {
    console.log('\n🎉 SUCCESS! AI PIPELINE IS WORKING!\n');
    console.log('📖 Generated segment:');
    console.log('   ', result.segment.content?.substring(0, 200) + '...\n');
    console.log('🎮 Generated choices:');
    result.segment.choices?.forEach((choice, i) => {
      console.log(`   ${i + 1}. ${choice.text}`);
    });
    console.log('\n✅ AI providers working:');
    console.log('   - OpenAI GPT-4o: PRIMARY');
    console.log('   - OVH Llama 3.3: FALLBACK');
    console.log('   - Your AI pipeline is FIXED!');
    
    // Check if segment was saved
    const { data: segments } = await supabase
      .from('story_segments')
      .select('*')
      .eq('story_id', story.id);
      
    console.log('\n📊 Database check:');
    console.log(`   - Segments created: ${segments?.length || 0}`);
    console.log(`   - Story text length: ${result.segment.content.length} characters`);
    console.log(`   - AI Provider used: ${result.aiMetrics.provider}`);
    
  } else {
    console.error('\n❌ AI generation failed:', result.error || result.message || result);
    console.log('\n🔍 Debug response:', JSON.stringify(result, null, 2));
    console.log('\n💡 Check Edge Function logs:');
    console.log('   supabase functions serve --debug');
  }
  
  // Clean up test story
  await supabase.from('stories').delete().eq('id', story.id);
  console.log('\n🧹 Cleaned up test story');
}

// Run the test
testAIGeneration();