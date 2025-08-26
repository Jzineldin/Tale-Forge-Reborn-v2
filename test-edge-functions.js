// Comprehensive Supabase Edge Functions Testing
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const edgeFunctions = [
  'admin-setup',
  'admin-sql', 
  'api-health',
  'create-checkout-session',
  'create-story',
  'delete-story',
  'generate-audio',
  'generate-story-ending',
  'generate-story-segment',
  'generate-tts-audio',
  'get-story-recommendations',
  'get-story',
  'handle-stripe-webhook',
  'list-stories',
  'manage-subscription',
  'regenerate-image',
  'update-story'
];

async function testEdgeFunctions() {
  console.log('🔍 Testing 17 Supabase Edge Functions...\n');
  
  const results = {
    accessible: [],
    errors: [],
    requiresAuth: [],
    requiresData: [],
    success: []
  };

  for (const functionName of edgeFunctions) {
    try {
      console.log(`📡 Testing ${functionName}...`);
      
      // Test basic function accessibility with different payloads
      let response;
      let testPayload = {};
      
      // Customize test payload based on function type
      switch (functionName) {
        case 'api-health':
          testPayload = {};
          break;
        case 'create-story':
          testPayload = {
            title: 'Test Story',
            target_age: 5,
            theme: 'adventure'
          };
          break;
        case 'get-story':
          testPayload = {
            story_id: 'test-id'
          };
          break;
        case 'list-stories':
          testPayload = {};
          break;
        case 'create-checkout-session':
          testPayload = {
            credits: 50,
            price_id: 'test'
          };
          break;
        default:
          testPayload = {};
      }
      
      // Test function endpoint
      response = await supabase.functions.invoke(functionName, {
        body: testPayload
      });
      
      const status = response.status || 'unknown';
      const hasData = !!response.data;
      const hasError = !!response.error;
      
      console.log(`  Status: ${status} | Data: ${hasData} | Error: ${hasError}`);
      
      if (status === 200 && !hasError) {
        results.success.push(functionName);
        console.log(`  ✅ ${functionName} - Success`);
      } else if (status === 401 || status === 403) {
        results.requiresAuth.push(functionName);
        console.log(`  🔐 ${functionName} - Requires Authentication`);
      } else if (status === 400 && response.error?.message?.includes('required')) {
        results.requiresData.push(functionName);
        console.log(`  📝 ${functionName} - Requires Valid Data`);
      } else {
        results.errors.push({
          function: functionName,
          status,
          error: response.error?.message || 'Unknown error'
        });
        console.log(`  ❌ ${functionName} - Error: ${response.error?.message || status}`);
      }
      
      results.accessible.push(functionName);
      
    } catch (error) {
      console.log(`  ❌ ${functionName} - Exception: ${error.message}`);
      results.errors.push({
        function: functionName,
        status: 'exception',
        error: error.message
      });
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Summary Report
  console.log('\n📊 EDGE FUNCTIONS TEST SUMMARY:');
  console.log(`  ✅ Successfully accessible: ${results.accessible.length}/17`);
  console.log(`  🎯 Successful responses: ${results.success.length}`);
  console.log(`  🔐 Require authentication: ${results.requiresAuth.length}`);
  console.log(`  📝 Require valid data: ${results.requiresData.length}`);
  console.log(`  ❌ Errors/Issues: ${results.errors.length}`);
  
  if (results.success.length > 0) {
    console.log(`\n✅ Working functions: ${results.success.join(', ')}`);
  }
  
  if (results.requiresAuth.length > 0) {
    console.log(`\n🔐 Auth-protected functions: ${results.requiresAuth.join(', ')}`);
  }
  
  if (results.requiresData.length > 0) {
    console.log(`\n📝 Data-dependent functions: ${results.requiresData.join(', ')}`);
  }
  
  if (results.errors.length > 0) {
    console.log('\n❌ Functions with errors:');
    results.errors.forEach(err => {
      console.log(`  - ${err.function}: ${err.error}`);
    });
  }
  
  return results;
}

// Run the test
testEdgeFunctions()
  .then(results => {
    console.log('\n🎉 Edge Functions Testing Complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Testing failed:', error);
    process.exit(1);
  });