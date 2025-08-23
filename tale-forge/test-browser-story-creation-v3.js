// COPY AND PASTE THIS ENTIRE SCRIPT INTO YOUR BROWSER CONSOLE AT localhost:3001
// This version bypasses imports and uses fetch directly with hardcoded token

console.log('🧪 Testing Story Creation v3 - Direct Fetch');

async function testStoryCreationV3() {
  try {
    console.log('--- Step 1: Direct Story Creation Test ---');
    
    // I can see from your console logs that you're signed in as jzineldin@gmail.com
    // Let's test the story creation API directly
    
    const testStoryData = {
      title: 'Browser Test V3 - Julius & Kevin Adventure',
      description: 'Test story from direct fetch console script',
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
      additional_details: 'Test with custom Julius and Kevin characters in a future enchanted forest setting',
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
    
    // Get current session from browser storage
    console.log('\n--- Step 2: Extract Session from Local Storage ---');
    
    let sessionData = null;
    try {
      // Try to get session from Supabase local storage
      const supabaseAuthKey = `sb-${btoa('fyihypkigbcmsxyvseca')}-auth-token`;
      const authData = localStorage.getItem(supabaseAuthKey);
      if (authData) {
        sessionData = JSON.parse(authData);
        console.log('✅ Found session in localStorage');
        console.log('User:', sessionData.user?.email);
        console.log('Has access token:', !!sessionData.access_token);
      } else {
        console.log('⚠️ No session found in localStorage');
      }
    } catch (storageError) {
      console.log('❌ Error reading localStorage:', storageError.message);
    }
    
    if (!sessionData?.access_token) {
      console.log('❌ No access token found');
      console.log('💡 Make sure you are signed in to the app');
      return;
    }
    
    // Test story creation
    await testCreateStoryV3(sessionData.access_token, testStoryData);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testCreateStoryV3(accessToken, storyData) {
  console.log('\n--- Step 3: Call Create Story API ---');
  
  try {
    console.log('📡 Calling create-story function...');
    console.log('🔑 Using access token length:', accessToken.length);
    
    const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify(storyData)
    });
    
    console.log('📡 Response Status:', response.status, response.ok ? '✅ OK' : '❌ ERROR');
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📡 Raw Response (first 500 chars):', responseText.substring(0, 500) + '...');
    
    if (response.ok) {
      console.log('🎉 SUCCESS! Story creation worked!');
      
      try {
        const data = JSON.parse(responseText);
        console.log('📖 Created Story Details:', {
          storyId: data.story?.id,
          storyTitle: data.story?.title,
          hasFirstSegment: !!data.segment,
          segmentLength: data.segment?.content?.length || 0,
          segmentNumber: data.segment?.segment_number
        });
        
        // Comprehensive custom settings analysis
        if (data.segment?.content) {
          const content = data.segment.content.toLowerCase();
          const originalContent = data.segment.content;
          
          console.log('\n🔍 FULL GENERATED STORY CONTENT:');
          console.log('=' .repeat(60));
          console.log(originalContent);
          console.log('=' .repeat(60));
          
          // Character analysis
          const characterAnalysis = {
            julius: {
              mentioned: content.includes('julius'),
              count: (content.match(/julius/g) || []).length,
              asHero: content.includes('julius') && (content.includes('brave') || content.includes('hero') || content.includes('curious'))
            },
            kevin: {
              mentioned: content.includes('kevin'),
              count: (content.match(/kevin/g) || []).length,
              asFriend: content.includes('kevin') && (content.includes('friend') || content.includes('funny') || content.includes('clever'))
            }
          };
          
          // Setting analysis
          const settingAnalysis = {
            forest: content.includes('forest'),
            enchanted: content.includes('enchanted'),
            magical: content.includes('magical') || content.includes('magic'),
            nature: content.includes('nature') || content.includes('tree') || content.includes('plant'),
            future: content.includes('future') || content.includes('advanced') || content.includes('technology')
          };
          
          // Theme analysis
          const themeAnalysis = {
            adventure: content.includes('adventure'),
            mysterious: content.includes('mysterious') || content.includes('mystery'),
            protecting: content.includes('protect') || content.includes('save'),
            friendship: content.includes('friend') || content.includes('together')
          };
          
          console.log('\n🎭 CHARACTER ANALYSIS:');
          console.log('Julius:', characterAnalysis.julius);
          console.log('Kevin:', characterAnalysis.kevin);
          
          console.log('\n🌍 SETTING ANALYSIS:');
          console.log(settingAnalysis);
          
          console.log('\n🎯 THEME ANALYSIS:');
          console.log(themeAnalysis);
          
          // Overall success scoring
          const criticalSettings = [
            characterAnalysis.julius.mentioned && characterAnalysis.kevin.mentioned, // Both characters used
            settingAnalysis.forest, // Forest setting
            settingAnalysis.future || settingAnalysis.magical, // Future or magical elements
            themeAnalysis.adventure, // Adventure theme
            themeAnalysis.protecting // Protecting nature theme
          ];
          
          const bonusPoints = [
            characterAnalysis.julius.asHero, // Julius portrayed as hero
            characterAnalysis.kevin.asFriend, // Kevin as friend
            settingAnalysis.enchanted, // Specifically enchanted
            themeAnalysis.mysterious, // Mysterious atmosphere
            themeAnalysis.friendship // Friendship theme
          ];
          
          const criticalScore = criticalSettings.filter(Boolean).length;
          const bonusScore = bonusPoints.filter(Boolean).length;
          const totalPossible = criticalSettings.length;
          const successRate = (criticalScore / totalPossible) * 100;
          
          console.log('\n📊 AI CUSTOM SETTINGS SUCCESS ANALYSIS:');
          console.log(`Critical Settings Used: ${criticalScore}/${totalPossible} (${successRate.toFixed(0)}%)`);
          console.log(`Bonus Elements: ${bonusScore}/${bonusPoints.length}`);
          
          if (successRate >= 80) {
            console.log('🌟 EXCELLENT! AI used almost all custom settings perfectly!');
          } else if (successRate >= 60) {
            console.log('✅ GOOD! AI used most custom settings successfully!');
          } else if (successRate >= 40) {
            console.log('⚠️ PARTIAL! AI used some custom settings, needs improvement');
          } else {
            console.log('❌ POOR! AI ignored most custom settings - major issue');
          }
          
          // Specific recommendations
          console.log('\n💡 RECOMMENDATIONS:');
          if (!characterAnalysis.julius.mentioned || !characterAnalysis.kevin.mentioned) {
            console.log('- Character names not used properly - check character input processing');
          }
          if (!settingAnalysis.forest && !settingAnalysis.enchanted) {
            console.log('- Setting not reflected - check setting input processing');
          }
          if (!themeAnalysis.adventure) {
            console.log('- Adventure theme missing - check theme processing');
          }
          
        } else {
          console.log('⚠️ No story content generated to analyze');
        }
        
      } catch (parseError) {
        console.log('⚠️ Could not parse response as JSON:', parseError.message);
        console.log('Raw response:', responseText);
      }
      
    } else {
      console.log('❌ Story creation FAILED');
      console.log('Error details:', responseText);
      
      // Detailed error analysis
      if (response.status === 401) {
        console.log('💡 Authentication issue - session may be expired');
      } else if (response.status === 500) {
        console.log('💡 Server error - AI service or database issue');
      } else if (response.status === 404) {
        console.log('💡 Function not found - deployment or routing issue');
      } else if (response.status === 429) {
        console.log('💡 Rate limited - too many requests');
      }
    }
    
  } catch (fetchError) {
    console.log('❌ Network request failed:', fetchError.message);
    console.log('💡 Possible network connectivity or CORS issue');
  }
}

// Run the test
console.log('🚀 Starting Story Creation Test V3 (Direct Fetch)...');
testStoryCreationV3();