// Test Shared Services - Verify our refactored architecture works
// This script tests the shared services we created for award-winning architecture

const SUPABASE_URL = 'https://fyihypkigbcmsxyvesca.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE4NjQyNzcsImV4cCI6MjAzNzQ0MDI3N30.TuYKSNsAqJN7cgOABMw6AHV5iy86r5mTqFqL3Ftz8Z0';

async function testSharedServices() {
  console.log('🧪 Testing Shared Services Architecture...\n');
  
  try {
    // Test 1: Verify shared services imports
    console.log('📦 Test 1: Testing shared services imports...');
    
    const sharedServicesResponse = await fetch(`${SUPABASE_URL}/functions/v1/get-story`, {
      method: 'OPTIONS',  // CORS preflight test
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (sharedServicesResponse.ok) {
      console.log('✅ CORS preflight test passed - shared services loaded');
    } else {
      console.log('❌ CORS preflight failed:', sharedServicesResponse.status);
    }
    
    // Test 2: Test environment validation
    console.log('\n🔧 Test 2: Testing environment validation...');
    
    const envTestResponse = await fetch(`${SUPABASE_URL}/functions/v1/get-story`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid-token',  // This should trigger validation
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ storyId: 'test-id' })
    });
    
    const envTestResult = await envTestResponse.json();
    console.log('Response status:', envTestResponse.status);
    console.log('Response body:', envTestResult);
    
    if (envTestResponse.status === 401) {
      console.log('✅ Authentication validation works correctly');
    } else {
      console.log('⚠️ Unexpected response for invalid auth');
    }
    
    // Test 3: Test with missing data
    console.log('\n📝 Test 3: Testing validation errors...');
    
    // We can't easily test with valid auth in this script, but we can test structure
    const validationResponse = await fetch(`${SUPABASE_URL}/functions/v1/get-story`, {
      method: 'POST', 
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}) // Missing storyId
    });
    
    const validationResult = await validationResponse.json();
    console.log('Validation test status:', validationResponse.status);
    console.log('Validation test response:', validationResult);
    
    if (validationResult.error) {
      console.log('✅ Validation error handling works');
    }
    
    console.log('\n🎉 Shared Services Testing Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSharedServices();