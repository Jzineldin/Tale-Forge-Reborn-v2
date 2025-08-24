// Debug the get-story function response in detail
// COPY AND PASTE INTO BROWSER CONSOLE

console.log('🔍 Debugging get-story Function Response');

async function debugGetStoryDetailed() {
  try {
    // Get the latest created story
    const authData = localStorage.getItem('sb-fyihypkigbcmsxyvseca-auth-token');
    const sessionData = JSON.parse(authData);
    const accessToken = sessionData.access_token;
    
    console.log('📡 Making get-story request...');
    console.log('🔑 Using token start:', accessToken.substring(0, 20) + '...');
    
    const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/get-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify({ 
        storyId: 'da50eed1-70c1-4ba2-bde4-c46ccb100b75'
      })
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📡 Raw response length:', responseText.length);
    console.log('📡 Raw response (first 500 chars):', responseText.substring(0, 500) + '...');
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('\n🔍 RESPONSE STRUCTURE ANALYSIS:');
        console.log('Top level keys:', Object.keys(data));
        console.log('Success:', data.success);
        console.log('Message:', data.message);
        
        if (data.story) {
          console.log('\n📖 STORY OBJECT ANALYSIS:');
          console.log('Story keys:', Object.keys(data.story));
          console.log('Story ID:', data.story.id);
          console.log('Story Title:', data.story.title);
          console.log('Has segments property:', 'segments' in data.story);
          console.log('Segments type:', typeof data.story.segments);
          console.log('Segments is array:', Array.isArray(data.story.segments));
          console.log('Segments length:', data.story.segments?.length || 0);
          console.log('Segment count field:', data.story.segment_count);
          
          if (data.story.segments) {
            console.log('\n📋 SEGMENTS DETAILED ANALYSIS:');
            data.story.segments.forEach((segment, index) => {
              console.log(`\n--- SEGMENT ${index + 1} ---`);
              console.log('Segment keys:', Object.keys(segment));
              console.log('ID:', segment.id);
              console.log('Position:', segment.position);
              console.log('Content length:', segment.content?.length || 0);
              console.log('Content preview:', segment.content?.substring(0, 100) + '...');
              
              console.log('\n🎯 CHOICES IN THIS SEGMENT:');
              console.log('Raw choices:', segment.choices);
              console.log('Choices type:', typeof segment.choices);
              console.log('Is array:', Array.isArray(segment.choices));
              
              if (segment.choices && Array.isArray(segment.choices)) {
                console.log('Number of choices:', segment.choices.length);
                segment.choices.forEach((choice, choiceIdx) => {
                  console.log(`  Choice ${choiceIdx + 1}:`, {
                    id: choice.id,
                    text: choice.text,
                    textLength: choice.text?.length,
                    valid: !!(choice && choice.text && choice.text.trim().length > 0)
                  });
                });
              } else if (typeof segment.choices === 'string') {
                console.log('Choices is string - attempting to parse...');
                try {
                  const parsed = JSON.parse(segment.choices);
                  console.log('Parsed choices:', parsed);
                } catch (e) {
                  console.log('Failed to parse choices:', e.message);
                  console.log('Raw choices text (first 200 chars):', segment.choices.substring(0, 200));
                }
              }
            });
          } else {
            console.log('❌ No segments array found in story object');
          }
          
        } else {
          console.log('❌ No story object in response');
        }
        
      } catch (parseError) {
        console.log('❌ Failed to parse JSON:', parseError.message);
        console.log('Full raw response:', responseText);
      }
    } else {
      console.log('❌ Request failed');
      console.log('Error response:', responseText);
    }
    
  } catch (error) {
    console.log('❌ Debug failed:', error.message);
    console.log('Full error:', error);
  }
}

// Also debug what the frontend StoryReaderPage sees
console.log('\n🔍 FRONTEND DATA DEBUGGING:');
console.log('Current URL:', window.location.href);

// Check if we can access React DevTools data
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('✅ React DevTools available');
} else {
  console.log('⚠️ React DevTools not available');
}

// Run the detailed debug
debugGetStoryDetailed();