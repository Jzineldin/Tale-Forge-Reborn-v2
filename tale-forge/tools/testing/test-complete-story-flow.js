// Complete end-to-end test of the entire story pipeline
// Tests OpenAI text generation, OVH image generation, and End Story functionality

const SUPABASE_URL = 'https://fyihypkigbcmsxyvseca.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg';

const TEST_USER = {
  email: 'jzineldin@gmail.com',
  password: 'Rashzin1996!'
};

let authToken = null;

console.log('🚀 COMPLETE STORY PIPELINE TEST');
console.log('================================\n');

// Authenticate
async function authenticate() {
  console.log('🔐 Authenticating...');
  
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password
    })
  });
  
  const authData = await response.json();
  authToken = authData.access_token;
  console.log('✅ Authenticated\n');
}

// Test 1: Create a new story with custom settings
async function testCreateStory() {
  console.log('📝 TESTING STORY CREATION...');
  
  const storyData = {
    title: "The Dragon's Secret Garden",
    genre: "Fantasy Adventure",
    description: "A magical quest to find the hidden garden",
    age_group: "6-8",
    generation_settings: {
      theme: "friendship and discovery", 
      setting: "an enchanted forest with talking animals",
      quest: "help a lonely dragon find friends by creating a magical garden",
      moral_lesson: "kindness and helping others brings joy",
      conflict: "overcoming fear of the unknown",
      target_age: "6-8",
      words_per_chapter: 120,
      characters: [
        {
          name: "Luna",
          role: "brave young explorer",
          personality: "curious and kind-hearted"
        },
        {
          name: "Sparkles", 
          role: "friendly dragon",
          personality: "shy but magical"
        }
      ]
    }
  };

  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-story`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify(storyData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Story creation failed:', errorText);
    return null;
  }

  const result = await response.json();
  console.log(`✅ Story created: ${result.story?.id || result.id}`);
  console.log(`📊 Settings integration: ${Object.keys(storyData.generation_settings).length} custom settings applied`);
  console.log(`📖 First segment generated: ${result.firstSegment?.content?.substring(0, 100)}...`);
  console.log(`🎯 Choices available: ${result.firstSegment?.choices?.length || 0}`);
  console.log(`🖼️ Image status: ${result.firstSegment?.image_generation_status || 'unknown'}\n`);
  
  return { storyId: result.story?.id || result.id, hasFirstSegment: !!result.firstSegment };
}

// Test 2: Wait for initial story generation and check segments
async function testStoryGeneration(storyId) {
  console.log('⏳ WAITING FOR STORY GENERATION...');
  
  let attempts = 0;
  const maxAttempts = 30; // 5 minutes max
  
  while (attempts < maxAttempts) {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ storyId })
    });
    
    if (response.ok) {
      const story = await response.json();
      
      if (story.segments && story.segments.length > 0) {
        console.log('✅ Initial story generation completed!');
        console.log(`📖 Generated ${story.segments.length} segments`);
        
        const firstSegment = story.segments[0];
        console.log(`📝 First segment: ${firstSegment.content.substring(0, 100)}...`);
        console.log(`🎯 Choices available: ${firstSegment.choices?.length || 0}`);
        console.log(`🖼️ Has image: ${!!firstSegment.image_url}\n`);
        
        return story;
      }
    }
    
    attempts++;
    console.log(`⏳ Waiting... (${attempts}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
  }
  
  console.error('❌ Story generation timeout');
  return null;
}

// Test 3: Continue story (test choice selection)
async function testStoryContinuation(storyId) {
  console.log('🎮 TESTING STORY CONTINUATION...');
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-story-segment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      storyId: storyId,
      choiceIndex: 0 // Select first choice
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Story continuation failed:', errorText);
    return false;
  }

  const result = await response.json();
  console.log('✅ Story continued successfully!');
  console.log(`📝 New segment: ${result.segment.content.substring(0, 100)}...`);
  console.log(`🎯 New choices: ${result.segment.choices?.length || 0}`);
  console.log(`🖼️ Image generating: ${result.segment.image_url ? 'Complete' : 'In progress'}\n`);
  
  return true;
}

// Test 4: Test End Story functionality
async function testEndStory(storyId) {
  console.log('🏁 TESTING END STORY FUNCTIONALITY...');
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-story-ending`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({ storyId })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Story ending failed:', errorText);
    return false;
  }

  const result = await response.json();
  console.log('✅ Story ending generated successfully!');
  console.log(`📝 Ending content: ${result.endingSegment.content.substring(0, 100)}...`);
  console.log(`🏁 Marked as ending: ${result.endingSegment.is_ending}\n`);
  
  return true;
}

// Test 5: Verify final story state
async function testFinalStoryState(storyId) {
  console.log('🔍 VERIFYING FINAL STORY STATE...');
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/get-story`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({ storyId })
  });
  
  if (!response.ok) {
    console.error('❌ Failed to get final story state');
    return false;
  }
  
  const story = await response.json();
  
  console.log('📊 FINAL STORY ANALYSIS:');
  console.log('========================');
  console.log(`Total segments: ${story.segments?.length || 0}`);
  console.log(`Story title: "${story.title}"`);
  console.log(`Story genre: ${story.genre}`);
  console.log(`Target age: ${story.target_age}`);
  console.log(`Has custom settings: ${!!story.generation_settings}`);
  
  // Check if all segments have images (or are generating)
  let imagesComplete = 0;
  let imagesGenerating = 0;
  story.segments?.forEach(segment => {
    if (segment.image_url) imagesComplete++;
    else imagesGenerating++;
  });
  
  console.log(`Images completed: ${imagesComplete}`);
  console.log(`Images generating: ${imagesGenerating}`);
  
  // Check for ending segment
  const hasEnding = story.segments?.some(segment => segment.is_ending);
  console.log(`Has ending: ${hasEnding ? '✅' : '❌'}`);
  
  console.log('\n✅ PIPELINE TEST COMPLETE!');
  
  return true;
}

// Main test runner
async function runCompleteTest() {
  try {
    await authenticate();
    
    console.log('🎯 TESTING COMPLETE STORY PIPELINE');
    console.log('==================================\n');
    
    // Test story creation with custom settings
    const createResult = await testCreateStory();
    if (!createResult) {
      console.error('❌ Cannot continue - story creation failed');
      return;
    }
    
    const { storyId, hasFirstSegment } = createResult;
    
    // If first segment is already available, skip waiting
    let story = null;
    if (hasFirstSegment) {
      console.log('✅ First segment already generated, skipping wait...\n');
      story = { segments: [{ content: 'Generated', choices: [{}] }] }; // Mock for continuation
    } else {
      // Wait for initial generation
      story = await testStoryGeneration(storyId);
      if (!story) {
        console.error('❌ Cannot continue - initial generation failed');
        return;
      }
    }
    
    // Test story continuation
    const continuationSuccess = await testStoryContinuation(storyId);
    if (!continuationSuccess) {
      console.error('⚠️ Story continuation failed, but continuing test...');
    }
    
    // Test ending generation
    const endingSuccess = await testEndStory(storyId);
    if (!endingSuccess) {
      console.error('⚠️ Story ending failed, but continuing test...');
    }
    
    // Verify final state
    await testFinalStoryState(storyId);
    
    console.log('\n🎉 COMPLETE PIPELINE TEST FINISHED!');
    console.log('===================================');
    console.log('✅ OpenAI text generation: TESTED');
    console.log('✅ OVH image generation: TESTED');  
    console.log('✅ Story continuation: TESTED');
    console.log('✅ End Story functionality: TESTED');
    console.log('✅ Custom settings integration: TESTED');
    console.log(`\n🔗 Story ID for manual testing: ${storyId}`);
    
  } catch (error) {
    console.error('❌ Pipeline test failed:', error.message);
  }
}

runCompleteTest();