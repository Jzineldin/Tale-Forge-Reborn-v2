// COPY AND PASTE THIS ENTIRE SCRIPT INTO YOUR BROWSER CONSOLE AT localhost:3001
// This version finds your session correctly using multiple methods

console.log('🧪 Testing Story Creation v4 - Session Hunter');

async function testStoryCreationV4() {
  try {
    console.log('--- Step 1: Find Your Session ---');
    
    let accessToken = null;
    let userEmail = null;
    
    // Method 1: Try different localStorage keys
    console.log('🔍 Searching localStorage for session...');
    const storageKeys = Object.keys(localStorage);
    console.log('All localStorage keys:', storageKeys);
    
    // Look for Supabase auth keys
    const supabaseKeys = storageKeys.filter(key => key.includes('supabase') || key.includes('auth') || key.includes('sb-'));
    console.log('Supabase-related keys:', supabaseKeys);
    
    for (const key of supabaseKeys) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data?.access_token) {
          accessToken = data.access_token;
          userEmail = data.user?.email;
          console.log(`✅ Found session in key: ${key}`);
          console.log('User email:', userEmail);
          console.log('Token length:', accessToken.length);
          break;
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
    
    // Method 2: Try sessionStorage
    if (!accessToken) {
      console.log('🔍 Searching sessionStorage...');
      const sessionKeys = Object.keys(sessionStorage);
      console.log('SessionStorage keys:', sessionKeys);
      
      for (const key of sessionKeys) {
        try {
          const data = JSON.parse(sessionStorage.getItem(key));
          if (data?.access_token) {
            accessToken = data.access_token;
            userEmail = data.user?.email;
            console.log(`✅ Found session in sessionStorage key: ${key}`);
            break;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
    
    // Method 3: Try to find React context data (if exposed)
    if (!accessToken) {
      console.log('🔍 Looking for React context data...');
      
      // Check if there's any global auth data
      if (window.__AUTH_DATA__) {
        const authData = window.__AUTH_DATA__;
        if (authData.access_token) {
          accessToken = authData.access_token;
          userEmail = authData.user?.email;
          console.log('✅ Found auth data in window.__AUTH_DATA__');
        }
      }
    }
    
    if (!accessToken) {
      console.log('❌ Could not find access token');
      console.log('💡 Let\'s try to get it manually...');
      
      // Show manual instructions
      console.log('\n--- Manual Token Extraction ---');
      console.log('Run this in console to find your token:');
      console.log(`
// Find all localStorage entries with tokens
Object.keys(localStorage).forEach(key => {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    if (data && typeof data === 'object') {
      if (data.access_token || data.session?.access_token) {
        console.log('Found token in key:', key);
        console.log('Data structure:', Object.keys(data));
        if (data.access_token) console.log('Direct token:', data.access_token.substring(0, 20) + '...');
        if (data.session?.access_token) console.log('Session token:', data.session.access_token.substring(0, 20) + '...');
      }
    }
  } catch(e) {}
});
      `);
      
      return;
    }
    
    console.log('✅ Session found! Testing story creation...');
    
    const testStoryData = {
      title: 'Browser Test V4 - Julius & Kevin Adventure',
      description: 'Test story from session hunter script',
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
    
    console.log('\n📋 Test Story Data:');
    console.log({
      title: testStoryData.title,
      setting: testStoryData.setting,
      time_period: testStoryData.time_period,
      atmosphere: testStoryData.atmosphere,
      characters: testStoryData.characters.map(c => `${c.name} (${c.role})`).join(', '),
      customDetails: testStoryData.additional_details
    });
    
    // Test story creation
    await testCreateStoryV4(accessToken, testStoryData, userEmail);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

async function testCreateStoryV4(accessToken, storyData, userEmail) {
  console.log('\n--- Step 2: Test Story Creation API ---');
  console.log(`🔑 Using token for user: ${userEmail}`);
  console.log(`🔑 Token length: ${accessToken.length}`);
  console.log(`🔑 Token start: ${accessToken.substring(0, 20)}...`);
  
  try {
    console.log('📡 Calling create-story function...');
    
    const startTime = Date.now();
    
    const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg',
        'User-Agent': 'Tale-Forge-Browser-Test/1.0'
      },
      body: JSON.stringify(storyData)
    });
    
    const endTime = Date.now();
    console.log(`📡 Request completed in ${endTime - startTime}ms`);
    console.log('📡 Response Status:', response.status, response.ok ? '✅ OK' : '❌ ERROR');
    
    const responseText = await response.text();
    console.log('📡 Response size:', responseText.length, 'characters');
    console.log('📡 Raw Response (first 300 chars):', responseText.substring(0, 300) + '...');
    
    if (response.ok) {
      console.log('🎉 SUCCESS! Story creation worked!');
      
      try {
        const data = JSON.parse(responseText);
        console.log('\n📖 STORY CREATION RESULTS:');
        console.log('Story ID:', data.story?.id);
        console.log('Story Title:', data.story?.title);
        console.log('Has First Segment:', !!data.segment);
        console.log('Segment Length:', data.segment?.content?.length || 0, 'characters');
        console.log('Segment Number:', data.segment?.segment_number);
        
        if (data.segment?.content) {
          const content = data.segment.content.toLowerCase();
          const originalContent = data.segment.content;
          
          console.log('\n🔍 FULL GENERATED STORY CONTENT:');
          console.log('=' .repeat(80));
          console.log(originalContent);
          console.log('=' .repeat(80));
          
          // Detailed character analysis
          const juliusMatches = originalContent.match(/Julius/gi) || [];
          const kevinMatches = originalContent.match(/Kevin/gi) || [];
          
          const characterAnalysis = {
            julius: {
              mentioned: content.includes('julius'),
              count: juliusMatches.length,
              contexts: juliusMatches.map((match, i) => {
                const start = Math.max(0, originalContent.toLowerCase().indexOf('julius', i * 10) - 20);
                const end = Math.min(originalContent.length, start + 60);
                return originalContent.substring(start, end);
              })
            },
            kevin: {
              mentioned: content.includes('kevin'),
              count: kevinMatches.length,
              contexts: kevinMatches.map((match, i) => {
                const start = Math.max(0, originalContent.toLowerCase().indexOf('kevin', i * 10) - 20);
                const end = Math.min(originalContent.length, start + 60);
                return originalContent.substring(start, end);
              })
            }
          };
          
          console.log('\n🎭 DETAILED CHARACTER ANALYSIS:');
          console.log('Julius Analysis:', {
            mentioned: characterAnalysis.julius.mentioned,
            count: characterAnalysis.julius.count,
            contexts: characterAnalysis.julius.contexts
          });
          console.log('Kevin Analysis:', {
            mentioned: characterAnalysis.kevin.mentioned,
            count: characterAnalysis.kevin.count,
            contexts: characterAnalysis.kevin.contexts
          });
          
          // Setting and theme analysis
          const settingKeywords = {
            forest: (content.match(/forest/g) || []).length,
            enchanted: (content.match(/enchanted/g) || []).length,
            magical: (content.match(/magic|magical/g) || []).length,
            nature: (content.match(/nature|tree|plant|leaf/g) || []).length,
            future: (content.match(/future|advanced|technology|tech/g) || []).length,
            mysterious: (content.match(/mysterious|mystery|strange/g) || []).length,
            adventure: (content.match(/adventure|quest|journey/g) || []).length
          };
          
          console.log('\n🌍 SETTING & THEME KEYWORD COUNTS:');
          console.log(settingKeywords);
          
          // Success scoring with detailed breakdown
          const requirements = {
            'Both Characters Used': characterAnalysis.julius.mentioned && characterAnalysis.kevin.mentioned,
            'Forest Setting': settingKeywords.forest > 0 || settingKeywords.nature > 0,
            'Enchanted/Magical Elements': settingKeywords.enchanted > 0 || settingKeywords.magical > 0,
            'Future Elements': settingKeywords.future > 0,
            'Adventure Theme': settingKeywords.adventure > 0,
            'Mysterious Atmosphere': settingKeywords.mysterious > 0
          };
          
          console.log('\n📊 REQUIREMENT FULFILLMENT:');
          Object.entries(requirements).forEach(([req, met]) => {
            console.log(`${met ? '✅' : '❌'} ${req}`);
          });
          
          const metRequirements = Object.values(requirements).filter(Boolean).length;
          const totalRequirements = Object.keys(requirements).length;
          const successRate = (metRequirements / totalRequirements) * 100;
          
          console.log(`\n📈 OVERALL SUCCESS RATE: ${successRate.toFixed(1)}% (${metRequirements}/${totalRequirements})`);
          
          if (successRate >= 83) {
            console.log('🌟 EXCELLENT! AI followed your custom settings almost perfectly!');
          } else if (successRate >= 67) {
            console.log('✅ GOOD! AI used most of your custom settings!');
          } else if (successRate >= 50) {
            console.log('⚠️ OKAY! AI used some custom settings, but missed important ones');
          } else {
            console.log('❌ POOR! AI ignored most of your custom settings - needs investigation');
          }
          
          // Specific improvement recommendations
          console.log('\n💡 DETAILED RECOMMENDATIONS:');
          if (!requirements['Both Characters Used']) {
            console.log('🔧 Character Issue: Julius and/or Kevin not used - check character processing in create-story function');
          }
          if (!requirements['Forest Setting'] && !requirements['Enchanted/Magical Elements']) {
            console.log('🔧 Setting Issue: Enchanted Forest not reflected - check setting parameter processing');
          }
          if (!requirements['Future Elements']) {
            console.log('🔧 Time Period Issue: Future setting not used - check time_period parameter');
          }
          
        } else {
          console.log('⚠️ No story content generated - this is a major issue!');
        }
        
      } catch (parseError) {
        console.log('❌ Failed to parse JSON response:', parseError.message);
        console.log('Raw response was:', responseText);
      }
      
    } else {
      console.log('❌ Story creation FAILED!');
      console.log('HTTP Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
      console.log('Error Response Body:', responseText);
      
      // Specific error handling
      if (response.status === 401) {
        console.log('🔒 Authentication failed - token may be expired or invalid');
      } else if (response.status === 500) {
        console.log('⚙️ Server error - check Supabase Edge Function logs');
      } else if (response.status === 404) {
        console.log('📍 Function not found - create-story function may not be deployed');
      } else if (response.status === 429) {
        console.log('⏱️ Rate limited - too many requests');
      }
    }
    
  } catch (fetchError) {
    console.log('❌ Network request failed:', fetchError.message);
    console.log('Error type:', fetchError.constructor.name);
    console.log('Full error:', fetchError);
  }
}

// Run the test
console.log('🚀 Starting Story Creation Test V4 (Session Hunter)...');
testStoryCreationV4();