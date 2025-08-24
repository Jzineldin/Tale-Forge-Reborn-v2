// STANDALONE TEST: Run this in Node.js to test story creation
// This bypasses browser requirements and tests the API directly

const fetch = require('node-fetch');

console.log('🧪 Standalone Story Creation Test');

async function testStoryCreation() {
  try {
    console.log('--- Testing Story Creation API Directly ---');
    
    const testStoryData = {
      title: 'Standalone Test - Julius & Kevin Adventure',
      description: 'Test story from Node.js script',
      genre: 'fantasy',
      target_age: 10,
      theme: 'adventure',
      setting: 'Enchanted Forest',
      time_period: 'Future',
      atmosphere: 'Mysterious',
      characters: [
        { name: 'Julius', role: 'Hero', traits: 'Curious, Clever' },
        { name: 'Kevin', role: 'Best Friend', traits: 'Funny, Clever' }
      ],
      conflict: 'protecting nature',
      quest: 'Save the day',
      moral_lesson: 'Friendship is important',
      additional_details: '',
      words_per_chapter: 70
    };
    
    console.log('📋 Story Settings:', {
      title: testStoryData.title,
      setting: testStoryData.setting,
      time_period: testStoryData.time_period,
      atmosphere: testStoryData.atmosphere,
      characters: testStoryData.characters.map(c => c.name).join(', ')
    });
    
    // Test WITHOUT authentication first (to see error message)
    console.log('\n🔒 Testing without authentication...');
    const responseNoAuth = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify(testStoryData)
    });
    
    console.log('📡 No-Auth Response Status:', responseNoAuth.status);
    const noAuthText = await responseNoAuth.text();
    console.log('📡 No-Auth Response:', noAuthText.substring(0, 300) + '...');
    
    // Test function availability without authentication
    console.log('\n📋 Function endpoint test complete');
    console.log('🔍 This test shows if the create-story function is deployed and responding');
    console.log('❌ Expected: Authentication error (which is normal)');
    console.log('✅ Success: Function is reachable and deployed');
    
    if (responseNoAuth.status === 401) {
      console.log('✅ Function is working - got expected auth error');
    } else if (responseNoAuth.status === 404) {
      console.log('❌ Function not found - deployment issue');
    } else {
      console.log(`⚠️ Unexpected response: ${responseNoAuth.status}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('🔍 This might indicate network issues or function deployment problems');
  }
}

testStoryCreation();