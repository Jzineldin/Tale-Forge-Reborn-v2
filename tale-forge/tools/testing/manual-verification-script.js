// Manual Browser Console Verification Script
// Run this in the browser console while a story is being generated

console.log('🔬 MANUAL STORY GENERATION VERIFICATION');
console.log('=' .repeat(50));

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

// Test the create-story API directly
async function testCreateStoryAPI() {
  const token = getAuthToken();
  if (!token) {
    console.log('❌ No auth token found');
    return;
  }

  const testData = {
    title: "Manual Test Story",
    description: "Testing the create-story API directly from browser console",
    genre: "adventure", 
    target_age: "7-9",
    difficulty: "medium"
  };

  console.log('📡 Calling create-story API...');
  console.log('📋 Data:', testData);

  try {
    const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify(testData)
    });

    console.log('📡 Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error Response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Success Response:', data);
    
    if (data.story?.id) {
      console.log('🆔 Story ID:', data.story.id);
      
      // Now test the get-story API
      console.log('\n🔍 Testing get-story API...');
      
      const getResponse = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/get-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
        },
        body: JSON.stringify({ storyId: data.story.id })
      });
      
      const getStoryData = await getResponse.json();
      console.log('📖 Get Story Response:', getStoryData);
      
      if (getStoryData.story) {
        const story = getStoryData.story;
        console.log('\n📊 STORY ANALYSIS:');
        console.log('🏷️  Title:', story.title);
        console.log('📝 Segments:', story.segments?.length || 0);
        console.log('🎯 Has Choices:', story.segments?.[0]?.choices?.length > 0);
        console.log('🖼️  Has Image:', !!story.segments?.[0]?.image_url);
        console.log('🤖 AI Model:', story.ai_model_used);
        
        if (story.segments?.[0]) {
          const firstSegment = story.segments[0];
          console.log('\n📄 FIRST SEGMENT:');
          console.log('📝 Content:', firstSegment.content?.substring(0, 200) + '...');
          console.log('🎯 Choices:', firstSegment.choices);
          console.log('🖼️  Image URL:', firstSegment.image_url);
        }
        
        return story;
      }
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

// Run the test
testCreateStoryAPI().then(result => {
  if (result) {
    console.log('\n✅ VERIFICATION COMPLETE');
    console.log('🎯 Template creation appears to be working correctly!');
  } else {
    console.log('\n❌ VERIFICATION FAILED');
    console.log('🔧 Check Supabase logs for more details');
  }
});

// Also check current page state
console.log('\n🔍 CURRENT PAGE STATE:');
console.log('📍 URL:', window.location.href);
console.log('📋 Title:', document.title);

// Check for any story elements on current page
const storyElements = {
  hasChoices: document.querySelectorAll('button:contains("A"), button:contains("B"), [class*="choice"]').length,
  hasImages: document.querySelectorAll('img[alt*="Illustration"], img[alt*="segment"]').length,
  hasGenerating: document.querySelectorAll('*:contains("Creating illustration")').length,
  hasStoryText: document.querySelectorAll('div[class*="story"], p[class*="content"]').length
};

console.log('🔍 Page Elements:', storyElements);