// Debug the exact AI response and parsing logic
// COPY AND PASTE INTO BROWSER CONSOLE

console.log('🔍 Detailed AI Response Debug');

async function debugDetailedResponse() {
  const authData = localStorage.getItem('sb-fyihypkigbcmsxyvseca-auth-token');
  if (!authData) {
    console.log('❌ No auth data found');
    return;
  }

  const sessionData = JSON.parse(authData);
  const accessToken = sessionData.access_token;

  // Create a minimal test story to debug AI response
  const testStoryData = {
    title: "AI Response Debug Story",
    description: "Debug AI parsing",
    genre: "adventure",
    target_age: "5-7",
    theme: "Friendship",
    characters: [
      { name: "Julius", role: "hero", description: "A brave explorer" },
      { name: "Kevin", role: "friend", description: "A wise companion" }
    ],
    setting: "Magical Castle",
    time_period: "Past",
    atmosphere: "Mysterious",
    conflict: "Learning Magic",
    quest: "Master magical skills",
    moral_lesson: "Everyone is special",
    words_per_chapter: 120
  };

  console.log('📤 Creating debug story to examine AI response...');
  
  try {
    const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify(testStoryData)
    });

    if (!response.ok) {
      console.log('❌ Response not OK:', response.status);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      return;
    }

    const data = await response.json();
    
    if (data.success && data.firstSegment) {
      console.log('✅ Story created successfully!');
      console.log('\n📊 DETAILED ANALYSIS:');
      console.log('Story ID:', data.story?.id);
      console.log('Model used:', data.model);
      console.log('Choices count:', data.firstSegment.choices?.length);
      
      if (data.firstSegment.choices) {
        console.log('\n🎯 EXACT CHOICES RECEIVED:');
        data.firstSegment.choices.forEach((choice, idx) => {
          console.log(`${idx + 1}. ID: "${choice.id}"`);
          console.log(`   Text: "${choice.text}"`);
          console.log(`   Next segment: ${choice.next_segment_id || 'null'}`);
          
          // Check against known fallback patterns
          const isFallback = [
            'Continue the adventure',
            'Explore a different path', 
            'Try something unexpected'
          ].includes(choice.text);
          
          console.log(`   Status: ${isFallback ? '❌ FALLBACK' : '✅ AI GENERATED'}`);
          console.log('');
        });
        
        // Check if these choices look contextually appropriate
        const storyContent = data.firstSegment.content || '';
        console.log('\n📖 STORY CONTENT ANALYSIS:');
        console.log('Content length:', storyContent.length);
        console.log('Mentions Julius:', storyContent.includes('Julius'));
        console.log('Mentions Kevin:', storyContent.includes('Kevin'));
        console.log('Mentions castle:', storyContent.toLowerCase().includes('castle'));
        
        console.log('\n🔍 CONTEXTUAL CHOICE ANALYSIS:');
        data.firstSegment.choices.forEach((choice, idx) => {
          const text = choice.text.toLowerCase();
          const hasContext = text.includes('castle') || text.includes('magic') || text.includes('wizard') || text.includes('library') || text.includes('garden');
          console.log(`Choice ${idx + 1}: ${hasContext ? '✅ CONTEXTUAL' : '❌ GENERIC'} - "${choice.text}"`);
        });
        
        // Final assessment
        const allContextual = data.firstSegment.choices.every(choice => {
          const text = choice.text.toLowerCase();
          return text.includes('castle') || text.includes('magic') || text.includes('wizard') || text.includes('library') || text.includes('garden') || text.includes('explore');
        });
        
        console.log(`\n🎉 FINAL ASSESSMENT: ${allContextual ? '✅ CHOICES APPEAR TO BE AI-GENERATED AND CONTEXTUAL!' : '❌ CHOICES ARE GENERIC OR NON-CONTEXTUAL'}`);
        
        if (allContextual) {
          console.log('💡 The parsing logic IS working! These are not the old fallback choices.');
          console.log('🔧 The issue might be elsewhere - perhaps the frontend display or React Query cache.');
        }
      }
      
    } else {
      console.log('❌ Story creation failed:');
      console.log('Success:', data.success);
      console.log('Error:', data.error);
      console.log('Full response:', data);
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error);
  }
}

debugDetailedResponse();