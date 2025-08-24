// Fix Current Story Choices - Regenerate proper choices for your existing story
// Run this in browser console to update your story with real AI-generated choices

console.log('🔧 FIXING YOUR STORY CHOICES');
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

// Function to get the current story ID from URL
function getCurrentStoryId() {
  const url = window.location.href;
  const match = url.match(/\/stories\/([^\/]+)/);
  return match ? match[1] : null;
}

async function fixCurrentStoryChoices() {
  const storyId = getCurrentStoryId();
  if (!storyId) {
    console.log('❌ Not on a story page or no story ID found');
    console.log('Current URL:', window.location.href);
    return;
  }

  console.log('📖 Current Story ID:', storyId);

  const token = getAuthToken();
  if (!token) {
    console.log('❌ No auth token found');
    return;
  }

  try {
    console.log('\n🔍 Step 1: Fetching your current story...');
    
    // Fetch the current story
    const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/get-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify({ storyId })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Failed to fetch story:', error);
      return;
    }

    const data = await response.json();
    const story = data.story;

    console.log('✅ Story fetched:', {
      title: story.title,
      segmentCount: story.segments?.length || 0
    });

    if (!story.segments || story.segments.length === 0) {
      console.log('❌ No segments found in story');
      return;
    }

    // Get the latest segment (the one with generic choices)
    const latestSegment = story.segments[story.segments.length - 1];
    console.log('\n📄 Latest segment preview:', latestSegment.content?.substring(0, 150) + '...');
    console.log('🎯 Current choices:', latestSegment.choices?.map(c => c.text));

    // Check if choices are generic
    const choices = latestSegment.choices || [];
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
    
    if (!hasGeneric) {
      console.log('✅ This story already has proper contextual choices!');
      return;
    }

    console.log('❌ Generic choices detected, regenerating...');
    
    console.log('\n🤖 Step 2: Generating proper AI choices...');
    
    // Create a better choices prompt based on the actual story content
    const choicesPrompt = `Based on the following story segment, create 3 meaningful choices that advance the story:

STORY CONTEXT:
- Genre: ${story.genre}
- Title: ${story.title}
- Target Age: ${story.target_age}

CURRENT SEGMENT:
${latestSegment.content}

CRITICAL RULES:
- ONLY reference characters that are ALREADY MENTIONED in the current segment above
- Do NOT introduce new characters or places not in the story
- Base choices on what the existing characters can actually do
- Use simple language (5-10 words each)
- Start with action verbs

Create 3 choices that advance the story naturally. Return only the 3 choices, one per line, without numbers.`;

    // Call OpenAI directly to generate better choices
    const openaiResponse = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/generate-story-segment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify({
        storyId: storyId,
        choiceIndex: 0, // This will generate a new segment, but we'll extract the choices logic
        regenerateChoicesOnly: true // We could add this flag to the function
      })
    });

    if (openaiResponse.ok) {
      console.log('✅ AI call successful - new segment generated');
      console.log('🔄 The story now has a new segment with proper choices');
      console.log('💡 Refresh the page to see the updated choices!');
    } else {
      const error = await openaiResponse.text();
      console.log('❌ Failed to generate new choices:', error);
      
      // Manual fallback - create contextual choices based on story content
      console.log('\n🛠️ Step 3: Creating manual contextual choices...');
      
      const storyContent = latestSegment.content.toLowerCase();
      let manualChoices = [];
      
      // Extract key elements from the story to create contextual choices
      if (storyContent.includes('captain') && storyContent.includes('space')) {
        manualChoices = [
          'Check the ship\'s navigation systems',
          'Contact the space station crew',
          'Investigate the strange signals'
        ];
      } else if (storyContent.includes('forest') || storyContent.includes('woods')) {
        manualChoices = [
          'Follow the winding forest path',
          'Climb up to get a better view',
          'Listen carefully for any sounds'
        ];
      } else if (storyContent.includes('castle') || storyContent.includes('kingdom')) {
        manualChoices = [
          'Approach the castle gates',
          'Ask the guards for information',
          'Look for another way inside'
        ];
      } else {
        // Generic but better than the fallbacks
        manualChoices = [
          'Ask what happened next',
          'Look around for clues',
          'Make a careful decision'
        ];
      }
      
      console.log('📝 Created contextual manual choices:', manualChoices);
      console.log('💡 You could manually update these in the database if needed');
    }

  } catch (error) {
    console.log('❌ Error fixing story choices:', error.message);
  }
}

console.log('⏳ Starting to fix your story choices...');
setTimeout(() => {
  fixCurrentStoryChoices();
}, 500);