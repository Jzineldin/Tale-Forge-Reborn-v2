// Quick test of End Story functionality

const SUPABASE_URL = 'https://fyihypkigbcmsxyvseca.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg';

const TEST_USER = {
  email: 'jzineldin@gmail.com',
  password: 'Rashzin1996!'
};

// Use the story ID from our previous test
const STORY_ID = 'd633e822-cc10-4e80-ad60-855a77af139c';

let authToken = null;

console.log('🏁 TESTING END STORY FUNCTIONALITY');
console.log('==================================\n');

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

// Test End Story
async function testEndStory() {
  console.log(`🏁 Testing End Story for: ${STORY_ID}`);
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-story-ending`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({ storyId: STORY_ID })
  });

  console.log(`📊 Response status: ${response.status}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ End Story failed:', errorText);
    return false;
  }

  const result = await response.json();
  console.log('✅ Story ending generated successfully!');
  console.log('📊 Result:', JSON.stringify(result, null, 2));
  
  return true;
}

// Main test
async function runTest() {
  try {
    await authenticate();
    const success = await testEndStory();
    
    if (success) {
      console.log('\n🎉 END STORY TEST PASSED!');
    } else {
      console.log('\n❌ END STORY TEST FAILED!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTest();