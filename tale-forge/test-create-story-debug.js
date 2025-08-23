// Test the create-story function directly and debug the response
// COPY AND PASTE INTO BROWSER CONSOLE

console.log('🔍 Testing create-story function with detailed debugging');

async function debugCreateStory() {
  try {
    // Get session data
    const authData = localStorage.getItem('sb-fyihypkigbcmsxyvseca-auth-token');
    const sessionData = JSON.parse(authData);
    const accessToken = sessionData.access_token;
    
    const testData = {
      title: 'Debug Test - Julius & Kevin',
      description: 'Testing create-story function debugging',
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
      additional_details: 'Debug test with Julius and Kevin',
      words_per_chapter: 70
    };
    
    console.log('📋 Sending request with data:', testData);
    
    const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📡 Raw response length:', responseText.length);
    console.log('📡 Full raw response:', responseText);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('\n🔍 PARSED RESPONSE ANALYSIS:');
        console.log('Response keys:', Object.keys(data));
        console.log('Has story:', !!data.story);
        console.log('Has segment:', !!data.segment);
        console.log('Has firstSegment:', !!data.firstSegment);
        console.log('Success flag:', data.success);
        console.log('Message:', data.message);
        console.log('Model used:', data.model);
        
        if (data.story) {
          console.log('\n📖 STORY DETAILS:');
          console.log('Story ID:', data.story.id);
          console.log('Story keys:', Object.keys(data.story));
        }
        
        if (data.segment) {
          console.log('\n📝 SEGMENT DETAILS:');
          console.log('Segment keys:', Object.keys(data.segment));
          console.log('Segment content length:', data.segment.content?.length || 0);
        }
        
        if (data.firstSegment) {
          console.log('\n📝 FIRST SEGMENT DETAILS:');
          console.log('First segment keys:', Object.keys(data.firstSegment));
          console.log('First segment content:', data.firstSegment.content?.substring(0, 100) + '...');
          console.log('First segment choices:', data.firstSegment.choices?.length || 0);
        }
        
        if (data.error) {
          console.log('\n❌ ERROR DETAILS:');
          console.log('Error message:', data.error);
          console.log('Segment error:', data.segmentError);
        }
        
      } catch (parseError) {
        console.log('❌ JSON parse error:', parseError.message);
      }
    } else {
      console.log('❌ Request failed with status:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Debug test failed:', error.message);
    console.log('Full error:', error);
  }
}

// Run the debug test
debugCreateStory();