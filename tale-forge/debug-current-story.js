// Debug Your Current Story - Real Issues
// Run this to check what's wrong with the story you're actually seeing

console.log('🔍 DEBUGGING YOUR CURRENT STORY');
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

async function debugCurrentStory() {
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
    // Fetch the current story
    console.log('\n🔍 Fetching current story...');
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

    console.log('✅ Story fetched successfully');
    console.log('📋 Story Info:', {
      title: story.title,
      segmentCount: story.segments?.length || 0,
      aiModel: story.ai_model_used
    });

    // Check all segments and their choices
    if (story.segments && story.segments.length > 0) {
      console.log('\n🎯 ANALYZING ALL SEGMENTS:');
      
      story.segments.forEach((segment, index) => {
        console.log(`\n--- Segment ${index + 1} ---`);
        console.log('Content preview:', segment.content?.substring(0, 100) + '...');
        console.log('Image URL:', segment.image_url || 'No image');
        console.log('Image status:', segment.image_generation_status || 'Unknown');
        console.log('Choices:', JSON.stringify(segment.choices, null, 2));
        
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
          console.log('❌ GENERIC CHOICES DETECTED in segment', index + 1);
        } else {
          console.log('✅ Contextual choices in segment', index + 1);
        }
      });

      // Check the current segment being displayed
      console.log('\n🖥️ FRONTEND DISPLAY CHECK:');
      const choiceButtons = document.querySelectorAll('[class*="choice"], [class*="Button"], button');
      console.log(`Found ${choiceButtons.length} potential choice buttons on page`);
      
      choiceButtons.forEach((button, index) => {
        const text = button.textContent?.trim();
        if (text && text.length > 10 && !text.includes('End Story') && !text.includes('Read Again')) {
          console.log(`Choice button ${index + 1}: "${text}"`);
        }
      });

    } else {
      console.log('❌ No segments found in story');
    }

    // Check React Query cache
    console.log('\n🧠 REACT QUERY CACHE CHECK:');
    try {
      // Try to access React Query cache through window
      const reactApp = document.querySelector('#root')?._reactInternalFiber?.child?.stateNode;
      console.log('React app found:', !!reactApp);
      
      // Look for any exposed cache or query client
      const possibleCaches = [
        window.queryClient,
        window.__REACT_QUERY_DEVTOOLS_CACHE__,
        window.__REACT_QUERY_CACHE__
      ];
      
      possibleCaches.forEach((cache, index) => {
        if (cache) {
          console.log(`Cache ${index + 1} found:`, typeof cache);
        }
      });
      
    } catch (e) {
      console.log('Could not access React cache');
    }

  } catch (error) {
    console.log('❌ Error debugging current story:', error.message);
  }
}

// Also check for image loading issues
function checkImageLoadingIssues() {
  console.log('\n🖼️ IMAGE LOADING DIAGNOSIS:');
  
  const images = document.querySelectorAll('img');
  console.log(`Found ${images.length} images on page`);
  
  images.forEach((img, index) => {
    console.log(`Image ${index + 1}:`, {
      src: img.src,
      loaded: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      loading: img.loading
    });
  });

  // Check for loading spinners or indicators
  const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="animate"]');
  console.log(`Found ${loadingElements.length} loading indicators`);
}

// Run diagnostics
console.log('⏳ Starting current story diagnostics...');
setTimeout(() => {
  debugCurrentStory();
  checkImageLoadingIssues();
}, 500);