// Debug Script: Database vs Frontend Choices Investigation  
// Run this in browser console to check what choices are actually stored vs displayed

console.log('🔍 DATABASE CHOICES INVESTIGATION');
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

// Function to test the entire data flow
async function debugChoicesDataFlow() {
  console.log('\n🧪 Testing Full Choices Data Flow...');
  
  const token = getAuthToken();
  if (!token) {
    console.log('❌ No auth token found - please log in first');
    return;
  }

  try {
    // Step 1: Create a test story
    console.log('\n📝 Step 1: Creating test story...');
    const createResponse = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify({
        title: 'Database Debug Test - Choices Analysis',
        description: 'Testing where choices go wrong',
        genre: 'adventure',
        target_age: 8,
        theme: 'friendship',
        setting: 'Magic Kingdom',
        time_period: 'Present',
        atmosphere: 'Exciting',
        characters: [
          { name: 'Julius', role: 'Hero', traits: 'Brave, Smart' },
          { name: 'Kevin', role: 'Friend', traits: 'Funny, Loyal' }
        ],
        conflict: 'solve mystery',
        quest: 'find treasure',
        moral_lesson: 'teamwork wins',
        additional_details: 'Focus on specific contextual choices',
        words_per_chapter: 120
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.log('❌ Story Creation FAILED:', error);
      return;
    }

    const createData = await createResponse.json();
    console.log('✅ Story Created Successfully');
    console.log('📊 Story ID:', createData.story?.id);
    console.log('🤖 AI Model Used:', createData.model);
    
    // Check what choices were actually returned from AI
    console.log('\n🎯 CHOICES FROM CREATE-STORY API:');
    console.log('Raw firstSegment choices:', JSON.stringify(createData.firstSegment?.choices, null, 2));
    
    const storyId = createData.story?.id;
    if (!storyId) {
      console.log('❌ No story ID returned');
      return;
    }

    // Step 2: Wait a moment then fetch the story via get-story API
    console.log('\n⏱️ Waiting 2 seconds before fetching story...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n📖 Step 2: Fetching story via get-story API...');
    const getResponse = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/get-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify({ storyId })
    });

    if (!getResponse.ok) {
      const error = await getResponse.text();
      console.log('❌ Get Story FAILED:', error);
      return;
    }

    const getData = await getResponse.json();
    console.log('✅ Story Fetched Successfully');
    
    // Step 3: Analyze the data flow
    console.log('\n🎯 CHOICES FROM GET-STORY API:');
    const segments = getData.story?.segments || [];
    if (segments.length > 0) {
      console.log('First segment choices:', JSON.stringify(segments[0]?.choices, null, 2));
      
      // Check if choices match what was created
      const originalChoices = createData.firstSegment?.choices || [];
      const fetchedChoices = segments[0]?.choices || [];
      
      console.log('\n🔄 COMPARISON:');
      console.log('Original choices count:', originalChoices.length);
      console.log('Fetched choices count:', fetchedChoices.length);
      
      if (originalChoices.length === fetchedChoices.length) {
        for (let i = 0; i < originalChoices.length; i++) {
          const original = originalChoices[i]?.text || '';
          const fetched = fetchedChoices[i]?.text || '';
          const match = original === fetched;
          console.log(`Choice ${i + 1}: ${match ? '✅' : '❌'} "${original}" vs "${fetched}"`);
        }
      } else {
        console.log('❌ CHOICE COUNT MISMATCH!');
      }
      
      // Check what React Query would see
      const formattedChoices = segments[0]?.choices?.map((choice, index) => ({
        id: choice.id || `choice-${index}`,
        text: choice.text
      })) || [];
      
      console.log('\n🖥️ FORMATTED FOR FRONTEND:');
      console.log('Formatted choices:', JSON.stringify(formattedChoices, null, 2));
      
      // Test if any are generic fallback
      const isGeneric = formattedChoices.some(choice => 
        choice.text.includes('Continue the adventure') || 
        choice.text.includes('Explore a different path') ||
        choice.text.includes('Try something unexpected')
      );
      
      if (isGeneric) {
        console.log('❌ GENERIC CHOICES DETECTED - AI pipeline issue!');
      } else {
        console.log('✅ All choices appear to be contextual AI-generated content');
      }
      
    } else {
      console.log('❌ No segments found in fetched story');
    }

    // Step 4: Test what happens when user makes choice
    if (segments.length > 0 && segments[0]?.choices?.length > 0) {
      console.log('\n🔄 Step 3: Testing choice selection and new segment generation...');
      
      const segmentResponse = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/generate-story-segment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
        },
        body: JSON.stringify({
          storyId: storyId,
          choiceIndex: 0 // Select first choice
        })
      });

      if (segmentResponse.ok) {
        const segmentData = await segmentResponse.json();
        console.log('✅ New Segment Generated');
        console.log('🎯 New segment choices:', JSON.stringify(segmentData.segment?.choices, null, 2));
        
        // Check if new choices are generic
        const newChoices = segmentData.segment?.choices || [];
        const newIsGeneric = newChoices.some(choice => 
          choice.text.includes('Continue the adventure') || 
          choice.text.includes('Explore a different path') ||
          choice.text.includes('Try something unexpected')
        );
        
        if (newIsGeneric) {
          console.log('❌ NEW SEGMENT CHOICES ARE GENERIC - GPT-4o fix not working!');
        } else {
          console.log('✅ New segment choices are contextual - GPT-4o fix working!');
        }
      } else {
        const error = await segmentResponse.text();
        console.log('❌ Segment generation failed:', error);
      }
    }

  } catch (error) {
    console.log('❌ Debug test error:', error.message);
  }
}

// Function to check current React app state
function checkCurrentStoryDisplay() {
  console.log('\n🖥️ CHECKING CURRENT REACT APP STATE...');
  
  // Check if React Query cache has story data
  const reactQueryCache = window.__REACT_QUERY_DEVTOOLS_CACHE__ || window.queryClient?._queryCache;
  if (reactQueryCache) {
    console.log('✅ React Query cache found');
    // Try to find story query
    const queries = Array.from(reactQueryCache._queries || new Map());
    const storyQueries = queries.filter(([key]) => key.includes('story'));
    console.log(`Found ${storyQueries.length} story-related queries`);
    
    storyQueries.forEach(([key, query]) => {
      if (query.state?.data?.segments) {
        console.log('Story data found in cache:', key);
        const segments = query.state.data.segments;
        if (segments.length > 0) {
          console.log('Cached choices:', JSON.stringify(segments[0]?.choices, null, 2));
        }
      }
    });
  } else {
    console.log('⚠️ React Query cache not accessible');
  }
}

// Auto-run both tests
console.log('⏳ Starting database investigation in 1 second...');
setTimeout(() => {
  debugChoicesDataFlow();
  checkCurrentStoryDisplay();
}, 1000);