// COPY AND PASTE THIS ENTIRE SCRIPT INTO YOUR BROWSER CONSOLE AT localhost:3001
// This version works with your actual React app structure

console.log('🧪 Testing Story Creation v2 - React App Access');

async function testStoryCreationV2() {
  try {
    // Method 1: Import Supabase directly using ES6 modules
    console.log('--- Step 1: Load Supabase Module ---');
    
    let supabase;
    try {
      // Try to import Supabase from your app's module
      const { createClient } = await import('https://unpkg.com/@supabase/supabase-js@2/dist/module/index.js');
      
      supabase = createClient(
        'https://fyihypkigbcmsxyvseca.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      );
      
      console.log('✅ Supabase client created via ES6 import');
      
    } catch (importError) {
      console.log('❌ ES6 import failed:', importError.message);
      console.log('💡 Trying alternative method...');
      return;
    }
    
    // Method 2: Check authentication
    console.log('\n--- Step 2: Check Authentication ---');
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
      return;
    }
    
    if (session?.access_token) {
      console.log('✅ User is authenticated!');
      console.log('User:', session.user.email);
      console.log('Token length:', session.access_token.length);
      
      // Test story creation
      await testCreateStoryV2(session);
      
    } else {
      console.log('❌ No active session');
      console.log('💡 Please sign in to the app first, then run this test again');
      
      // Show sign-in instructions
      console.log('\n--- Sign-in Instructions ---');
      console.log('1. Navigate to the Sign In page in the app');
      console.log('2. Sign in with your credentials');
      console.log('3. Come back to this console and run the test again');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure you are on the correct port and the app is loaded');
  }
}

async function testCreateStoryV2(session) {
  console.log('\n--- Step 3: Test Direct Story Creation ---');
  
  const testStoryData = {
    title: 'Browser Test V2 - Julius & Kevin Adventure',
    description: 'Test story from updated browser console script',
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
    additional_details: 'Test with custom Julius and Kevin characters in a future enchanted forest',
    words_per_chapter: 70
  };
  
  console.log('📋 Test Story Data:', {
    title: testStoryData.title,
    setting: testStoryData.setting,
    time_period: testStoryData.time_period,
    atmosphere: testStoryData.atmosphere,
    characters: testStoryData.characters.map(c => `${c.name} (${c.role})`).join(', '),
    customDetails: testStoryData.additional_details
  });
  
  try {
    console.log('📡 Calling create-story function...');
    
    const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify(testStoryData)
    });
    
    console.log('📡 Response Status:', response.status, response.ok ? '✅ OK' : '❌ ERROR');
    
    const responseText = await response.text();
    console.log('📡 Raw Response (first 300 chars):', responseText.substring(0, 300) + '...');
    
    if (response.ok) {
      console.log('🎉 SUCCESS! Story creation worked!');
      
      try {
        const data = JSON.parse(responseText);
        console.log('📖 Created Story Details:', {
          storyId: data.story?.id,
          storyTitle: data.story?.title,
          hasFirstSegment: !!data.segment,
          segmentLength: data.segment?.content?.length || 0
        });
        
        // Comprehensive custom settings analysis
        if (data.segment?.content) {
          const content = data.segment.content.toLowerCase();
          console.log('\n🔍 Full Generated Content (first 200 chars):');
          console.log(data.segment.content.substring(0, 200) + '...');
          
          const settingsAnalysis = {
            characters: {
              julius: content.includes('julius'),
              kevin: content.includes('kevin'),
              both: content.includes('julius') && content.includes('kevin')
            },
            setting: {
              enchanted: content.includes('enchanted'),
              forest: content.includes('forest'),
              magical: content.includes('magical') || content.includes('magic')
            },
            time: {
              future: content.includes('future'),
              advanced: content.includes('advanced'),
              tech: content.includes('technology') || content.includes('tech')
            },
            atmosphere: {
              mysterious: content.includes('mysterious') || content.includes('mystery'),
              adventure: content.includes('adventure')
            },
            theme: {
              nature: content.includes('nature'),
              protecting: content.includes('protect')
            }
          };
          
          console.log('\n🎯 Custom Settings Analysis:', settingsAnalysis);
          
          // Overall success score
          const usedSettings = [
            settingsAnalysis.characters.both,
            settingsAnalysis.setting.forest,
            settingsAnalysis.time.future,
            settingsAnalysis.atmosphere.mysterious,
            settingsAnalysis.theme.nature
          ];
          
          const successRate = usedSettings.filter(Boolean).length / usedSettings.length * 100;
          console.log(`\n📊 AI Custom Settings Usage: ${successRate.toFixed(0)}% (${usedSettings.filter(Boolean).length}/${usedSettings.length})`);
          
          if (successRate >= 60) {
            console.log('✅ AI successfully used most custom settings!');
          } else if (successRate >= 40) {
            console.log('⚠️ AI used some custom settings, but could be better');
          } else {
            console.log('❌ AI did not use many custom settings - possible issue');
          }
          
        } else {
          console.log('⚠️ No story content generated to analyze');
        }
        
      } catch (parseError) {
        console.log('⚠️ Could not parse response as JSON:', parseError.message);
        console.log('Raw response was:', responseText);
      }
      
    } else {
      console.log('❌ Story creation failed');
      console.log('Error details:', responseText);
      
      // Common error analysis
      if (response.status === 401) {
        console.log('💡 Authentication issue - try signing in again');
      } else if (response.status === 500) {
        console.log('💡 Server error - AI service might be down');
      } else if (response.status === 404) {
        console.log('💡 Function not found - deployment issue');
      }
    }
    
  } catch (fetchError) {
    console.log('❌ Network request failed:', fetchError.message);
    console.log('💡 Check internet connection and Supabase service status');
  }
}

// Run the test
console.log('🚀 Starting Story Creation Test V2...');
testStoryCreationV2();