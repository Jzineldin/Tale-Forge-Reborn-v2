// Manual Story Verification - Run this in browser console
// Direct API verification of the created stories

console.log('🔍 MANUAL STORY VERIFICATION');
console.log('=' .repeat(50));

// Story IDs from successful template creations
const storyIds = [
  { id: 'beea88f3-3846-4b0d-823b-cc25b99c3c07', template: 'Magical Adventure' },
  { id: 'a244ac38-d03a-4385-bbc4-a2a02c29adad', template: 'Time Travel Adventure' },
  { id: '2b23744b-82b6-463d-ae04-a09dcc9df2cf', template: 'Animal Rescue Mission' },
  { id: '867cc5f1-9986-4943-b712-0cd1676b1979', template: 'Underwater Kingdom' }
];

// Get auth token from localStorage
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
    } catch (e) {}
  }
  return null;
}

// Verify each story
async function verifyAllStories() {
  const token = getAuthToken();
  if (!token) {
    console.log('❌ No auth token found');
    return;
  }

  console.log('✅ Auth token found');
  console.log('\nVERIFYING CREATED STORIES:');
  
  for (let i = 0; i < storyIds.length; i++) {
    const story = storyIds[i];
    console.log(`\n📖 ${i + 1}/${storyIds.length}: ${story.template}`);
    console.log(`🆔 ID: ${story.id}`);
    
    try {
      const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/get-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
        },
        body: JSON.stringify({ storyId: story.id })
      });
      
      console.log(`📡 Response: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Error: ${errorText}`);
        continue;
      }
      
      const data = await response.json();
      const storyData = data.story;
      
      if (!storyData) {
        console.log('❌ No story data returned');
        continue;
      }
      
      console.log('✅ Story found!');
      console.log(`📝 Title: ${storyData.title}`);
      console.log(`🎭 Genre: ${storyData.genre || 'Not specified'}`);
      console.log(`👶 Target Age: ${storyData.age_group || storyData.target_age || 'Not specified'}`);
      console.log(`📊 Segments: ${storyData.segments?.length || 0}`);
      console.log(`🤖 AI Model: ${storyData.ai_model_used || 'Not specified'}`);
      
      if (storyData.segments && storyData.segments.length > 0) {
        const firstSegment = storyData.segments[0];
        console.log('\n📄 FIRST SEGMENT:');
        console.log(`📝 Content: ${firstSegment.content?.substring(0, 200)}...`);
        console.log(`🎯 Choices: ${firstSegment.choices?.length || 0}`);
        
        if (firstSegment.choices && firstSegment.choices.length > 0) {
          console.log('🎲 Choice Examples:');
          firstSegment.choices.forEach((choice, idx) => {
            console.log(`   ${idx + 1}. ${choice.substring(0, 60)}...`);
          });
          
          // Check if choices are contextual
          const hasGenericChoices = firstSegment.choices.some(choice => 
            choice.includes('Continue the adventure') || 
            choice.includes('See what happens next') ||
            choice.includes('Move forward')
          );
          
          console.log(`🎯 Choice Quality: ${hasGenericChoices ? '⚠️ Generic' : '✅ Contextual'}`);
        }
        
        console.log(`🖼️ Has Image: ${firstSegment.image_url ? '✅ Yes' : '❌ No'}`);
        if (firstSegment.image_url) {
          console.log(`🖼️ Image URL: ${firstSegment.image_url}`);
        }
        
        // Theme analysis
        const content = firstSegment.content?.toLowerCase() || '';
        console.log('\n🎯 THEME ANALYSIS:');
        
        // Define expected themes per template
        const expectedThemes = {
          'Magical Adventure': ['magic', 'crystal', 'wizard', 'spell', 'enchanted', 'potion'],
          'Time Travel Adventure': ['time', 'travel', 'future', 'past', 'journey', 'adventure'],
          'Animal Rescue Mission': ['animal', 'rescue', 'help', 'save', 'wildlife', 'nature'],
          'Underwater Kingdom': ['underwater', 'ocean', 'sea', 'fish', 'kingdom', 'water']
        };
        
        const themes = expectedThemes[story.template] || [];
        const foundThemes = themes.filter(theme => content.includes(theme.toLowerCase()));
        
        console.log(`🔍 Expected Themes: [${themes.join(', ')}]`);
        console.log(`✅ Found Themes: [${foundThemes.join(', ')}] (${foundThemes.length}/${themes.length})`);
        console.log(`📊 Theme Match: ${((foundThemes.length / themes.length) * 100).toFixed(1)}%`);
        
      } else {
        console.log('❌ No segments found');
      }
      
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ VERIFICATION COMPLETE');
  console.log('Check console output above for detailed results');
}

// Run verification
verifyAllStories();