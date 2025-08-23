// Deep Debug - Check what's actually stored in database for new story
// Run this to see exactly what's in the database vs what the API returns

console.log('🔍 DEEP DEBUGGING NEW STORY');
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

async function deepDebugNewStory() {
  // Use the NEW story ID from your console logs
  const newStoryId = 'c1350ea3-30aa-482c-a3ec-dc002d386451';
  
  console.log('📖 New Story ID:', newStoryId);

  const token = getAuthToken();
  if (!token) {
    console.log('❌ No auth token found');
    return;
  }

  try {
    console.log('\n🔍 Step 1: Check what get-story API returns for new story...');
    
    const getResponse = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/get-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify({ storyId: newStoryId })
    });

    if (!getResponse.ok) {
      const error = await getResponse.text();
      console.log('❌ Failed to fetch story:', error);
      return;
    }

    const data = await getResponse.json();
    const story = data.story;

    console.log('📋 NEW STORY INFO:', {
      title: story.title,
      segmentCount: story.segments?.length || 0,
      aiModel: story.ai_model_used
    });

    if (story.segments && story.segments.length > 0) {
      const segment = story.segments[0];
      console.log('\n🎯 FIRST SEGMENT ANALYSIS:');
      console.log('Content preview:', segment.content?.substring(0, 150) + '...');
      console.log('Raw choices data:', JSON.stringify(segment.choices, null, 2));
      
      // Check if choices are generic
      const choices = segment.choices || [];
      const genericPatterns = [
        'Continue the adventure',
        'Explore a different path', 
        'Try something unexpected',
        'Make a brave decision',
        'Explore somewhere new',
        'Try something different'
      ];
      
      const hasGeneric = choices.some(choice => 
        genericPatterns.some(pattern => choice.text?.includes(pattern))
      );
      
      if (hasGeneric) {
        console.log('❌ NEW STORY HAS GENERIC CHOICES - Backend issue confirmed!');
        console.log('🔍 Let me check which part of create-story is failing...');
        
        // Let's simulate creating another story to see the error
        console.log('\n🧪 Step 2: Create test story to see backend logs...');
        
        const testResponse = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
          },
          body: JSON.stringify({
            title: 'Debug Test Story',
            description: 'Testing backend failure',
            genre: 'Fantasy',
            age_group: '7-9',
            target_age: '7-9',
            theme: 'Friendship and Magic',
            setting: 'Enchanted Forest',
            time_period: 'Present',
            atmosphere: 'Magical and Wonder',
            characters: [
              { name: 'Luna', role: 'Young Wizard', traits: 'Curious, Kind' }
            ],
            conflict: 'restore magic balance',
            quest: 'find the lost crystal',
            moral_lesson: 'friendship conquers all',
            words_per_chapter: 200
          })
        });

        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log('✅ Test story created');
          console.log('🤖 Model returned:', testData.model);
          console.log('🎯 Test choices:', JSON.stringify(testData.firstSegment?.choices?.map(c => c.text), null, 2));
          
          const testChoices = testData.firstSegment?.choices || [];
          const testHasGeneric = testChoices.some(choice => 
            genericPatterns.some(pattern => choice.text?.includes(pattern))
          );
          
          if (testHasGeneric) {
            console.log('❌ TEST STORY ALSO HAS GENERIC CHOICES');
            console.log('🔍 This means the create-story function is consistently failing');
            console.log('💡 Need to check Supabase function logs for actual error');
          } else {
            console.log('✅ Test story has good choices - inconsistent behavior detected');
          }
        } else {
          const testError = await testResponse.text();
          console.log('❌ Test story failed:', testError);
        }
        
      } else {
        console.log('✅ New story has contextual choices - different issue');
      }
    } else {
      console.log('❌ New story has no segments');
    }

    // Check what's being displayed in React app right now
    console.log('\n🖥️ Step 3: Check what React app is currently displaying...');
    
    const currentChoiceButtons = document.querySelectorAll('[class*="choice"], [class*="Button"], button');
    console.log(`Found ${currentChoiceButtons.length} buttons on current page`);
    
    const displayedChoices = [];
    currentChoiceButtons.forEach((button, index) => {
      const text = button.textContent?.trim();
      if (text && text.length > 10 && !text.includes('End Story') && !text.includes('Read Again') && !text.includes('Generate Audio') && !text.includes('main menu')) {
        displayedChoices.push(text.replace(/^[ABC]/, '')); // Remove A/B/C prefixes
        console.log(`Displayed choice ${index + 1}: "${text}"`);
      }
    });
    
    console.log('\n📊 FINAL ANALYSIS:');
    if (story.segments && story.segments.length > 0) {
      const dbChoices = story.segments[0].choices.map(c => c.text);
      
      console.log('Database choices:', JSON.stringify(dbChoices, null, 2));
      console.log('Displayed choices:', JSON.stringify(displayedChoices, null, 2));
      
      const choicesMatch = JSON.stringify(dbChoices) === JSON.stringify(displayedChoices);
      
      if (choicesMatch) {
        console.log('✅ Database and display match - backend issue confirmed');
      } else {
        console.log('❌ Database and display DON\'T match - frontend cache issue confirmed');
      }
    }

  } catch (error) {
    console.log('❌ Error debugging new story:', error.message);
  }
}

console.log('⏳ Starting deep debug of new story...');
setTimeout(deepDebugNewStory, 1000);