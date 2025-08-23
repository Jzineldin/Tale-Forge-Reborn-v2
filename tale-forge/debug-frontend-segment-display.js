// Debug the current segment being displayed in the frontend
// COPY AND PASTE INTO BROWSER CONSOLE

console.log('🔍 Frontend Segment Display Debug');

// Check what segment the frontend thinks it should show
const currentUrl = window.location.href;
const urlParts = currentUrl.split('/');
const storyId = urlParts[urlParts.length - 1];

console.log('📖 Current Story ID from URL:', storyId);

// Try to access React component state (if React DevTools is available)
async function debugFrontendSegment() {
  
  // First, let's get the story data the same way the frontend does
  const authData = localStorage.getItem('sb-fyihypkigbcmsxyvseca-auth-token');
  const sessionData = JSON.parse(authData);
  const accessToken = sessionData.access_token;
  
  const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/get-story', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
    },
    body: JSON.stringify({ storyId })
  });
  
  const data = await response.json();
  const story = data.story;
  
  console.log('\n📋 FRONTEND SEGMENT LOGIC SIMULATION:');
  console.log('Total segments available:', story.segments?.length || 0);
  
  // Simulate the frontend logic
  const currentSegmentIndex = 0; // This is what StoryReaderPage starts with
  console.log('Frontend currentSegmentIndex:', currentSegmentIndex);
  
  // Get current segment (this is what the component tries to show)
  const currentSegment = story.segments?.[currentSegmentIndex] || null;
  console.log('Current segment from frontend logic:', currentSegment ? 'EXISTS' : 'NULL');
  
  if (currentSegment) {
    console.log('\n🎯 CURRENT SEGMENT DETAILS:');
    console.log('Segment ID:', currentSegment.id);
    console.log('Position:', currentSegment.position);
    console.log('Content preview:', currentSegment.content?.substring(0, 100) + '...');
    console.log('Has choices:', !!currentSegment.choices);
    console.log('Choices count:', currentSegment.choices?.length || 0);
    
    // Simulate the choices formatting logic from StoryReaderPage
    const formattedChoices = currentSegment?.choices?.map((choice, index) => ({
      id: choice.id || `choice-${index}`,
      text: choice.text
    })) || [];
    
    console.log('\n🔧 FORMATTED CHOICES FOR COMPONENT:');
    console.log('Formatted choices count:', formattedChoices.length);
    formattedChoices.forEach((choice, idx) => {
      console.log(`  ${idx + 1}. ${choice.text} (ID: ${choice.id})`);
    });
    
    // Simulate the StoryChoices component filtering
    const validChoices = formattedChoices.filter(choice => 
      choice && choice.text && choice.text.trim().length > 0
    );
    
    console.log('\n✅ FINAL VALIDATION:');
    console.log('Valid choices after filtering:', validChoices.length);
    
    if (validChoices.length === 0) {
      console.log('❌ This is why you see "The end of your story!"');
      console.log('🔍 Debugging individual choice validation:');
      formattedChoices.forEach((choice, idx) => {
        const issues = [];
        if (!choice) issues.push('choice is null/undefined');
        if (!choice?.text) issues.push('missing text property');  
        if (choice?.text && !choice.text.trim()) issues.push('text is empty/whitespace');
        
        console.log(`  Choice ${idx + 1}: ${issues.length === 0 ? '✅ VALID' : '❌ ' + issues.join(', ')}`);
      });
    } else {
      console.log('✅ Choices should be displayed correctly!');
      console.log('🤔 If choices aren\'t showing, the issue is elsewhere in the React component rendering');
    }
    
    // Check for ending condition
    const isEnding = currentSegment.is_end === true || (currentSegment.choices && currentSegment.choices.length === 0);
    console.log('\n🏁 ENDING CHECK:');
    console.log('Is ending segment:', isEnding);
    console.log('is_end flag:', currentSegment.is_end);
    console.log('Has no choices:', currentSegment.choices && currentSegment.choices.length === 0);
    
  } else {
    console.log('❌ Current segment is NULL - this means array access failed');
    console.log('🔍 Debugging segment array access:');
    console.log('story.segments exists:', !!story.segments);
    console.log('story.segments is array:', Array.isArray(story.segments));
    console.log('Trying to access index:', currentSegmentIndex);
    console.log('Array length:', story.segments?.length || 0);
    
    if (story.segments && story.segments.length > 0) {
      console.log('Available segments:');
      story.segments.forEach((seg, idx) => {
        console.log(`  [${idx}]: ${seg.id} (pos: ${seg.position})`);
      });
    }
  }
}

debugFrontendSegment();