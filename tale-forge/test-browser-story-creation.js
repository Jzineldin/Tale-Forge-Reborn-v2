// COPY AND PASTE THIS ENTIRE SCRIPT INTO YOUR BROWSER CONSOLE AT localhost:3001
// This will test story creation using your active browser session

console.log('🧪 Testing Story Creation with Browser Session');

async function testStoryCreation() {
  try {
    // Method 1: Check React Query cache for existing session data
    console.log('--- Step 1: Check React App Session ---');
    
    // Look for React Query cache or global state
    const reactQueryCache = window.__REACT_QUERY_CACHE__ || window.__REACT_QUERY_CLIENT__;
    if (reactQueryCache) {
      console.log('✅ React Query cache found');
    } else {
      console.log('⚠️ No React Query cache found');
    }
    
    // Method 2: Try to access the app's supabase client
    console.log('\n--- Step 2: Find App Supabase Client ---');
    
    // Check for exposed supabase in dev tools
    const possibleSupabase = [
      window.supabase,
      window._supabase,
      window.__SUPABASE_CLIENT__,
    ].filter(Boolean)[0];
    
    if (!possibleSupabase) {
      console.log('❌ No Supabase client exposed to window');
      console.log('💡 We need to create our own client and test manually');
      
      // Create our own supabase client
      if (window.supabase?.createClient) {
        const testClient = window.supabase.createClient(
          'https://fyihypkigbcmsxyvseca.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
        );
        
        const { data: { session } } = await testClient.auth.getSession();
        
        if (session?.access_token) {
          console.log('✅ Manual client has session!');
          console.log('User:', session.user.email);
          console.log('Token length:', session.access_token.length);
          
          // Test story creation with manual session
          await testCreateStory(session);
        } else {
          console.log('❌ Manual client has no session either');
          console.log('💡 Session persistence issue - try refreshing page');
        }
      } else {
        console.log('❌ No Supabase createClient available');
      }
    } else {
      console.log('✅ Found app Supabase client');
      const { data: { session } } = await possibleSupabase.auth.getSession();
      
      if (session?.access_token) {
        console.log('✅ App client has session!');
        await testCreateStory(session);
      } else {
        console.log('❌ App client has no session');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testCreateStory(session) {
  console.log('\n--- Step 3: Test Story Creation API ---');
  
  const testStoryData = {
    title: 'Browser Test - Julius & Kevin Adventure',
    description: 'Test story from browser console',
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
  
  try {
    const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify(testStoryData)
    });
    
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response OK:', response.ok);
    
    const responseText = await response.text();
    console.log('📡 Response Body:', responseText.substring(0, 500) + '...');
    
    if (response.ok) {
      console.log('🎉 SUCCESS! Story creation worked!');
      
      try {
        const data = JSON.parse(responseText);
        console.log('📖 Story Created:', {
          id: data.story?.id,
          title: data.story?.title,
          hasSegment: !!data.segment,
          segmentContent: data.segment?.content?.substring(0, 100) + '...'
        });
        
        // Check if it used your custom settings
        if (data.segment?.content) {
          const content = data.segment.content.toLowerCase();
          const settingsUsed = {
            usedFuture: content.includes('future') || content.includes('2154') || content.includes('advanced'),
            usedEnchanted: content.includes('enchanted') || content.includes('magical'),
            usedJulius: content.includes('julius'),
            usedKevin: content.includes('kevin'),
            usedNature: content.includes('nature') || content.includes('forest')
          };
          
          console.log('🎯 Custom Settings Check:', settingsUsed);
          
          if (Object.values(settingsUsed).some(Boolean)) {
            console.log('✅ AI used your custom settings!');
          } else {
            console.log('⚠️ AI might not have used all custom settings');
          }
        }
        
      } catch (parseError) {
        console.log('⚠️ Could not parse response as JSON');
      }
      
    } else {
      console.log('❌ Story creation failed');
      console.log('Error details:', responseText);
    }
    
  } catch (fetchError) {
    console.log('❌ Fetch failed:', fetchError.message);
  }
}

// Run the test
testStoryCreation();