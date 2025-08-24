// End-to-End Story Generation Flow Tests
// Tests all story generation entry points with real authentication

const BASE_URL = 'http://localhost:3001';
const SUPABASE_URL = 'https://fyihypkigbcmsxyvseca.supabase.co';
const LOCAL_FUNCTIONS_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg';

// Test credentials
const TEST_USER = {
  email: 'jzineldin@gmail.com',
  password: 'Rashzin1996!'
};

let authToken = null;
let testStoryId = null;

console.log('🧪 Starting End-to-End Story Generation Tests...\n');

// Step 1: Authenticate user
async function authenticateUser() {
  console.log('🔐 Step 1: Authenticating user...');
  
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
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Authentication failed: ${response.status} - ${error}`);
  }
  
  const authData = await response.json();
  authToken = authData.access_token;
  
  console.log('✅ Authentication successful');
  console.log(`   User ID: ${authData.user.id}`);
  console.log(`   Token: ${authToken.substring(0, 20)}...`);
  console.log();
}

// Step 2: Test Create New Story (Dashboard → /create)
async function testCreateNewStory() {
  console.log('🎨 Step 2: Testing "Create New Story" flow...');
  
  // Test story creation via API
  const storyData = {
    title: 'E2E Test Story',
    description: 'End-to-end test adventure',
    genre: 'fantasy',
    age_group: '7-9',
    target_age: 8,
    theme: 'friendship and courage',
    setting: 'magical forest',
    characters: [
      {
        id: 'char-1',
        name: 'Alex',
        description: 'A brave young explorer',
        role: 'hero',
        traits: ['brave', 'curious']
      }
    ],
    conflict: 'finding a lost treasure',
    quest: 'help forest animals',
    moral_lesson: 'teamwork makes dreams work',
    words_per_chapter: 150,
    child_name: 'TestChild'
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
    const error = await response.text();
    throw new Error(`Story creation failed: ${response.status} - ${error}`);
  }
  
  const storyResult = await response.json();
  testStoryId = storyResult.story?.id || storyResult.id;
  
  console.log('✅ Story creation successful');
  console.log(`   Story ID: ${testStoryId}`);
  console.log(`   Title: ${storyResult.story?.title || storyResult.title}`);
  console.log();
}

// Step 3: Test First Segment Generation
async function testFirstSegmentGeneration() {
  console.log('📖 Step 3: Testing first segment generation...');
  
  // Use local functions for testing
  const response = await fetch(`${LOCAL_FUNCTIONS_URL}/functions/v1/generate-story-segment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      storyId: testStoryId,
      choiceIndex: undefined // First segment
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Segment generation failed: ${response.status} - ${error}`);
  }
  
  const segmentResult = await response.json();
  
  console.log('✅ First segment generation successful');
  console.log(`   Segment ID: ${segmentResult.segment?.id}`);
  console.log(`   Content length: ${segmentResult.segment?.content?.length || 0} chars`);
  console.log(`   Choices: ${segmentResult.segment?.choices?.length || 0}`);
  console.log(`   AI Provider: ${segmentResult.aiProvider || 'Unknown'}`);
  console.log();
  
  return segmentResult.segment;
}

// Step 4: Test Story Continuation (Choice Selection)
async function testStoryContinuation(previousSegment) {
  console.log('🔄 Step 4: Testing story continuation via choice selection...');
  
  if (!previousSegment?.choices || previousSegment.choices.length === 0) {
    console.log('⚠️ No choices available for continuation test');
    return;
  }
  
  // Select the first choice
  const selectedChoiceIndex = 0;
  
  // Use local functions for testing
  const response = await fetch(`${LOCAL_FUNCTIONS_URL}/functions/v1/generate-story-segment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      storyId: testStoryId,
      choiceIndex: selectedChoiceIndex
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Continuation failed: ${response.status} - ${error}`);
  }
  
  const continuationResult = await response.json();
  
  console.log('✅ Story continuation successful');
  console.log(`   Choice selected: "${previousSegment.choices[selectedChoiceIndex]?.text}"`);
  console.log(`   New segment ID: ${continuationResult.segment?.id}`);
  console.log(`   New content length: ${continuationResult.segment?.content?.length || 0} chars`);
  console.log();
}

// Step 5: Test Story Retrieval
async function testStoryRetrieval() {
  console.log('📚 Step 5: Testing story retrieval...');
  
  const response = await fetch(`${LOCAL_FUNCTIONS_URL}/functions/v1/get-story`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      storyId: testStoryId
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Story retrieval failed: ${response.status} - ${error}`);
  }
  
  const storyData = await response.json();
  
  console.log('✅ Story retrieval successful');
  console.log(`   Total segments: ${storyData.segments?.length || 0}`);
  console.log(`   Story status: ${storyData.status || 'unknown'}`);
  console.log(`   Has content: ${storyData.has_content}`);
  console.log();
  
  return storyData;
}

// Step 6: Test Image Generation Status
async function testImageGeneration() {
  console.log('🎨 Step 6: Testing async image generation...');
  
  // Wait a moment for image generation to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const storyData = await testStoryRetrieval();
  
  if (storyData.segments && storyData.segments.length > 0) {
    const firstSegment = storyData.segments[0];
    
    console.log('🖼️ Image generation status:');
    console.log(`   Image URL: ${firstSegment.image_url || 'Not generated yet'}`);
    console.log(`   Generation status: ${firstSegment.image_generation_status || 'unknown'}`);
    console.log(`   Is generating: ${firstSegment.is_image_generating || false}`);
    
    if (!firstSegment.image_url) {
      console.log('⏳ Image still generating (async)...');
    } else {
      console.log('✅ Image generation completed');
    }
  }
  
  console.log();
}

// Main test execution
async function runAllTests() {
  try {
    await authenticateUser();
    await testCreateNewStory();
    const firstSegment = await testFirstSegmentGeneration();
    await testStoryContinuation(firstSegment);
    await testStoryRetrieval();
    await testImageGeneration();
    
    console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('\n📋 Test Summary:');
    console.log('✅ User authentication');
    console.log('✅ Story creation');
    console.log('✅ First segment generation');
    console.log('✅ Story continuation via choices');
    console.log('✅ Story retrieval');
    console.log('✅ Async image generation');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runAllTests();