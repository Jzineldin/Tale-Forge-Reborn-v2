// Debug script to check story segments and identify issues

const SUPABASE_URL = 'https://fyihypkigbcmsxyvseca.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg';

const TEST_USER = {
  email: 'jzineldin@gmail.com',
  password: 'Rashzin1996!'
};

const STORY_ID = 'ff5544be-4674-4136-b2fe-b82d63f9d529'; // User's story ID

let authToken = null;

console.log('🔍 DEBUGGING STORY SEGMENTS ISSUE');
console.log('================================\n');

// Authenticate
async function authenticate() {
  console.log('🔐 Authenticating...');
  
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password
    })
  });
  
  const authData = await response.json();
  authToken = authData.access_token;
  console.log('✅ Authenticated\n');
}

// Check the problematic story
async function debugStory() {
  console.log(`📖 Checking story: ${STORY_ID}`);
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/get-story`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      storyId: STORY_ID
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Failed to get story:', errorText);
    return;
  }
  
  const story = await response.json();
  
  console.log('📊 STORY ANALYSIS:');
  console.log('==================');
  console.log(`Title: "${story.title}"`);
  console.log(`Genre: ${story.genre}`);
  console.log(`Total segments: ${story.segments?.length || 0}`);
  console.log(`Story status: ${story.status || 'unknown'}`);
  console.log(`Is completed: ${story.is_completed}`);
  console.log();
  
  if (story.segments && story.segments.length > 0) {
    console.log('🔍 SEGMENTS BREAKDOWN:');
    story.segments.forEach((segment, index) => {
      console.log(`\nSegment ${index + 1}:`);
      console.log(`  ID: ${segment.id}`);
      console.log(`  Position: ${segment.position}`);
      console.log(`  Content length: ${segment.content?.length || 0} chars`);
      console.log(`  Choices: ${segment.choices?.length || 0}`);
      console.log(`  Has image: ${!!segment.image_url}`);
      console.log(`  Is end: ${segment.is_end || false}`);
      
      if (segment.choices && segment.choices.length > 0) {
        console.log('  Available choices:');
        segment.choices.forEach((choice, i) => {
          console.log(`    ${i + 1}. "${choice.text}"`);
        });
      }
    });
  }
  
  console.log('\n🚨 ISSUE ANALYSIS:');
  console.log('==================');
  
  const issues = [];
  
  if (!story.segments || story.segments.length === 0) {
    issues.push('❌ No segments found');
  } else if (story.segments.length < 3) {
    issues.push(`⚠️ Only ${story.segments.length} segments (expected more for interactive story)`);
  }
  
  const lastSegment = story.segments?.[story.segments.length - 1];
  if (lastSegment) {
    if (!lastSegment.choices || lastSegment.choices.length === 0) {
      issues.push('❌ Last segment has no choices (story ended abruptly)');
    } else if (lastSegment.choices.length < 3) {
      issues.push(`⚠️ Last segment only has ${lastSegment.choices.length} choices`);
    }
  }
  
  if (issues.length === 0) {
    console.log('✅ No obvious issues detected');
  } else {
    issues.forEach(issue => console.log(issue));
  }
  
  return story;
}

// Test continuing the story
async function testContinuation() {
  console.log('\n🔄 TESTING STORY CONTINUATION...');
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-story-segment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      storyId: STORY_ID,
      choiceIndex: 0 // Try first choice
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Continuation failed:', errorText);
    return;
  }
  
  const result = await response.json();
  
  console.log('✅ Successfully generated new segment!');
  console.log(`New segment ID: ${result.segment?.id}`);
  console.log(`Content length: ${result.segment?.content?.length || 0} chars`);
  console.log(`New choices: ${result.segment?.choices?.length || 0}`);
  
  return result.segment;
}

// Main debug function
async function debugStoryIssues() {
  try {
    await authenticate();
    const story = await debugStory();
    
    if (story && story.segments && story.segments.length > 0) {
      const lastSegment = story.segments[story.segments.length - 1];
      if (lastSegment.choices && lastSegment.choices.length > 0) {
        console.log('\n🧪 Attempting to continue story...');
        await testContinuation();
        
        // Check story again after continuation
        console.log('\n📖 Checking story after continuation...');
        await debugStory();
      }
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('===================');
    console.log('1. Add "End Story" button to allow users to conclude stories');
    console.log('2. Implement story ending generation function');
    console.log('3. Remove any artificial segment limits');
    console.log('4. Add visual indicators for story completion');
    console.log('5. Fix any styling issues in the story reader');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugStoryIssues();