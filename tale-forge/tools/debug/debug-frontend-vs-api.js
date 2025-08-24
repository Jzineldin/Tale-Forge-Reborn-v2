// Debug: Compare Frontend Request vs Direct API Call
// Run this to see exactly what's different between working debug script and failing frontend

console.log('🔍 COMPARING FRONTEND VS API REQUESTS');
console.log('='.repeat(50));

// Function to get auth token from localStorage
function getAuthToken() {
  const keys = Object.keys(localStorage).filter(k => 
    k.includes('supabase') || k.includes('sb-')
  );
  
  for (const key of keys) {
    const value = localStorage.getItem(key);
    try {
      const parsed = JSON.parse(value);
      if (parsed?.access_token) {
        return parsed.access_token;
      }
    } catch (e) {
      // Not JSON, skip
    }
  }
  return null;
}

async function compareRequests() {
  const token = getAuthToken();
  if (!token) {
    console.log('❌ No auth token found');
    return;
  }

  console.log('🧪 TEST 1: Frontend-style request (what your app sends)');
  
  // Simulate exactly what your frontend sends
  const frontendRequest = {
    title: 'Test Frontend Style',
    description: 'Animal Care and Environment', // Same as your app
    genre: 'Adventure', // Capitalized like your app
    age_group: '4-6',
    target_age: '4-6',
    theme: 'Animal Care and Environment',
    setting: 'Wildlife Sanctuary', 
    time_period: 'Present',
    atmosphere: 'Caring and Educational',
    characters: [
      { name: 'Dr. Maya', role: 'Veterinarian', traits: 'Kind, Smart' }
    ],
    conflict: 'help injured animals',
    quest: 'save the wildlife sanctuary',
    moral_lesson: 'caring for animals',
    words_per_chapter: 150
  };

  try {
    const frontendResponse = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify(frontendRequest)
    });

    if (frontendResponse.ok) {
      const frontendData = await frontendResponse.json();
      console.log('✅ Frontend-style request succeeded');
      console.log('🎯 Choices:', JSON.stringify(frontendData.firstSegment?.choices?.map(c => c.text), null, 2));
      console.log('🤖 Model:', frontendData.model);
    } else {
      const error = await frontendResponse.text();
      console.log('❌ Frontend-style request failed:', error);
    }
  } catch (error) {
    console.log('❌ Frontend-style request error:', error.message);
  }

  console.log('\n🧪 TEST 2: API-style request (what worked in debug script)');

  // Exactly what worked in the debug script
  const apiRequest = {
    title: 'Test API Style',
    description: 'Testing where choices go wrong',
    genre: 'adventure', // lowercase like debug script
    target_age: 8, // number like debug script
    theme: 'friendship',
    setting: 'Magic Kingdom',
    time_period: 'Present',
    atmosphere: 'Exciting',
    characters: [
      { name: 'Julius', role: 'Hero', traits: 'Brave, Smart' }
    ],
    conflict: 'solve mystery',
    quest: 'find treasure',
    moral_lesson: 'teamwork wins',
    additional_details: 'Focus on specific contextual choices',
    words_per_chapter: 120
  };

  try {
    const apiResponse = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify(apiRequest)
    });

    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log('✅ API-style request succeeded');
      console.log('🎯 Choices:', JSON.stringify(apiData.firstSegment?.choices?.map(c => c.text), null, 2));
      console.log('🤖 Model:', apiData.model);
    } else {
      const error = await apiResponse.text();
      console.log('❌ API-style request failed:', error);
    }
  } catch (error) {
    console.log('❌ API-style request error:', error.message);
  }

  console.log('\n📊 ANALYSIS:');
  console.log('If frontend-style fails but API-style works, the issue is in the request format.');
  console.log('If both fail, the issue is in the backend function.');
  console.log('If both work, the issue is in your React app state/caching.');
}

console.log('⏳ Starting comparison test...');
setTimeout(compareRequests, 1000);