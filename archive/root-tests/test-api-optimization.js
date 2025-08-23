const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testOptimization() {
  console.log('🔍 Testing Single API Call Optimization...\n');
  
  // Supabase configuration
  const SUPABASE_URL = 'https://fyihypkigbcmsxyvseca.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQyNDIzNTcsImV4cCI6MjAzOTgxODM1N30.7o8ZRhJJgOxBtUfz6wnE6KKc6jmkP8y4qJL5vxbvdJw';
  
  // Test data
  const testPayload = {
    storyId: 'test-optimization-story-id',
    choiceIndex: 0
  };
  
  console.log('📊 Starting performance test...');
  console.log(`Target: ${SUPABASE_URL}/functions/v1/generate-story-segment`);
  console.log(`Payload: ${JSON.stringify(testPayload)}\n`);
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-story-segment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(testPayload)
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ Response Time: ${duration}ms (${(duration/1000).toFixed(2)}s)`);
    console.log(`📡 Status Code: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error Response: ${errorText}`);
      return;
    }
    
    const result = await response.json();
    console.log(`📋 Response Preview:`);
    console.log(`   Success: ${result.success}`);
    
    // Check for optimization indicators in response
    if (result.performance) {
      console.log('\n🚀 OPTIMIZATION DETECTED!');
      console.log(`   Method: ${result.performance.method}`);
      console.log(`   API Calls: ${result.performance.api_calls_made}`);
      console.log(`   Optimization Active: ${result.performance.optimization_active}`);
      console.log(`   Speed Improvement: ${result.performance.estimated_speed_improvement || 'N/A'}`);
    } else {
      console.log('\n⚠️  No performance data in response - may be using fallback method');
    }
    
    if (result.segment) {
      console.log(`   Story Text Length: ${result.segment.segment_text?.length || 0} chars`);
      console.log(`   Choices Generated: ${result.segment.choices?.length || 0}`);
      
      if (result.segment.choices?.length >= 3) {
        console.log('✅ Choice generation successful');
        result.segment.choices.forEach((choice, index) => {
          console.log(`     ${index + 1}. ${choice.text.substring(0, 30)}${choice.text.length > 30 ? '...' : ''}`);
        });
      }
    }
    
    // Performance analysis
    console.log('\n📈 PERFORMANCE ANALYSIS:');
    if (duration < 10000) {
      console.log('🚀 EXCELLENT: Single API call optimization likely working');
      console.log('   Expected behavior: Combined story + choices in one call');
    } else if (duration < 15000) {
      console.log('✅ GOOD: Within expected optimized range');
      console.log('   May be single API call or fast dual calls');
    } else if (duration > 20000) {
      console.log('⚠️  SLOW: Likely using fallback dual API call method');
      console.log('   Expected behavior: Two sequential API calls');
    } else {
      console.log('📊 MODERATE: Performance within normal range');
    }
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ Failed after: ${duration}ms (${(duration/1000).toFixed(2)}s)`);
    console.log(`❌ Error: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('🔧 Note: Make sure the Supabase service is running');
    }
  }
}

testOptimization().catch(console.error);