// Test script to verify AI pipeline is working
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fyihypkigbcmsxyvseca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIzMzc2MCwiZXhwIjoyMDY2ODA5NzYwfQ.3w-YsZFoHGkQ_uBoZBVaV0fBShWm5o-w1xrTva-buL0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAIPipeline() {
  console.log('🧪 Testing AI Pipeline...');
  
  try {
    // Test 1: Create a simple story
    console.log('\n📝 Test 1: Creating a story...');
    
    const storyData = {
      title: 'Test Adventure',
      description: 'A simple test story',
      genre: 'adventure',
      age_group: '7-9',
      theme: 'friendship',
      setting: 'forest',
      characters: [{ name: 'Alex', description: 'A brave child' }],
      conflict: 'Lost in the woods',
      quest: 'Find the way home',
      moral_lesson: 'Friendship helps overcome challenges',
      additional_details: 'Test story for AI pipeline',
      setting_description: 'A magical forest',
      time_period: 'modern',
      atmosphere: 'mysterious',
      words_per_chapter: 100,
      target_age: 8
    };

    const { data: createResult, error: createError } = await supabase.functions.invoke('create-story', {
      body: storyData
    });

    if (createError) {
      console.error('❌ Create story failed:', createError);
      return;
    }

    console.log('✅ Story created successfully:', createResult?.story_id);
    const storyId = createResult?.story_id;

    if (!storyId) {
      console.error('❌ No story ID returned');
      return;
    }

    // Test 2: Generate a story segment
    console.log('\n🔄 Test 2: Generating story segment...');
    
    const { data: segmentResult, error: segmentError } = await supabase.functions.invoke('generate-story-segment', {
      body: { storyId, choiceIndex: 0 }
    });

    if (segmentError) {
      console.error('❌ Generate segment failed:', segmentError);
      return;
    }

    console.log('✅ Story segment generated successfully');
    console.log('Segment content:', segmentResult?.segment?.content?.substring(0, 100) + '...');

    // Test 3: Generate story ending
    console.log('\n🏁 Test 3: Generating story ending...');
    
    const { data: endingResult, error: endingError } = await supabase.functions.invoke('generate-story-ending', {
      body: { storyId }
    });

    if (endingError) {
      console.error('❌ Generate ending failed:', endingError);
      return;
    }

    console.log('✅ Story ending generated successfully');
    console.log('Ending content:', endingResult?.ending?.content?.substring(0, 100) + '...');

    console.log('\n🎉 AI Pipeline test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testAIPipeline();
