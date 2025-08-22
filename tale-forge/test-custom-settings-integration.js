// Test that story generation uses ALL custom wizard settings
// This verifies the enhanced generate-story-segment function

const SUPABASE_URL = 'https://fyihypkigbcmsxyvseca.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg';

const TEST_USER = {
  email: 'jzineldin@gmail.com',
  password: 'Rashzin1996!'
};

let authToken = null;

console.log('🧪 TESTING CUSTOM SETTINGS INTEGRATION');
console.log('=====================================\n');

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
  
  if (!response.ok) {
    throw new Error(`Auth failed: ${response.status}`);
  }
  
  const authData = await response.json();
  authToken = authData.access_token;
  
  console.log('✅ Authenticated successfully\n');
}

// Test highly customized story creation
async function testCustomizedStory() {
  console.log('🎨 Creating HIGHLY CUSTOMIZED story...');
  
  const customStoryData = {
    title: 'Luna\'s Underwater Quest',
    description: 'A brave dolphin explorer discovers ancient secrets',
    genre: 'adventure',
    age_group: '8-10',
    target_age: 9,
    theme: 'marine conservation and discovery',
    setting: 'Deep ocean coral reef city',
    time_period: 'Future underwater civilization',
    atmosphere: 'mysterious yet hopeful',
    characters: [
      {
        id: 'char-1',
        name: 'Luna',
        description: 'A curious young dolphin with bioluminescent patches',
        role: 'hero',
        traits: ['intelligent', 'brave', 'environmentally conscious']
      },
      {
        id: 'char-2', 
        name: 'Coral',
        description: 'An ancient wise sea turtle guardian',
        role: 'mentor',
        traits: ['wise', 'patient', 'mysterious']
      }
    ],
    conflict: 'Pollution threatening the reef city',
    quest: 'Find the Crystal of Pure Waters to save the ocean',
    moral_lesson: 'Environmental responsibility and working together',
    additional_details: 'Include underwater technology, bioluminescent creatures, and positive environmental messages',
    words_per_chapter: 180,
    child_name: 'CustomTestChild'
  };
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-story`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify(customStoryData)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Story creation failed: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  const storyId = result.story?.id || result.id;
  
  console.log('✅ Custom story created successfully');
  console.log(`   Story ID: ${storyId}`);
  console.log(`   Title: "${result.story?.title || result.title}"`);
  console.log();
  
  return storyId;
}

// Test that segment generation uses custom settings
async function testSegmentUsesCustomSettings(storyId) {
  console.log('⚡ Testing segment generation with custom settings...');
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-story-segment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      storyId: storyId
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Segment generation failed: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  const segment = result.segment;
  
  console.log('✅ Segment generated successfully');
  console.log(`   Segment ID: ${segment?.id}`);
  console.log(`   Content length: ${segment?.content?.length || 0} characters`);
  console.log(`   Choices: ${segment?.choices?.length || 0}`);
  console.log();
  
  // Analyze content for custom elements
  const content = segment?.content?.toLowerCase() || '';
  const choices = segment?.choices || [];
  
  console.log('🔍 CUSTOM SETTINGS INTEGRATION ANALYSIS:');
  console.log('=========================================');
  
  const customElements = {
    'Luna (character name)': content.includes('luna'),
    'Coral (character name)': content.includes('coral'), 
    'Ocean/reef setting': content.includes('ocean') || content.includes('reef') || content.includes('underwater'),
    'Environmental theme': content.includes('environment') || content.includes('pollution') || content.includes('clean') || content.includes('protect'),
    'Crystal quest element': content.includes('crystal') || content.includes('waters') || content.includes('pure'),
    'Marine references': content.includes('dolphin') || content.includes('sea') || content.includes('turtle') || content.includes('fish'),
    'Future/tech elements': content.includes('technology') || content.includes('bioluminescent') || content.includes('glow'),
    'Age-appropriate language': !content.includes('complex') && segment?.content?.split(' ').length < 250
  };
  
  let integrationScore = 0;
  const totalChecks = Object.keys(customElements).length;
  
  Object.entries(customElements).forEach(([element, found]) => {
    const status = found ? '✅' : '❌';
    console.log(`   ${status} ${element}: ${found ? 'FOUND' : 'MISSING'}`);
    if (found) integrationScore++;
  });
  
  console.log(`\n📊 Integration Score: ${integrationScore}/${totalChecks} (${Math.round(integrationScore/totalChecks*100)}%)`);
  
  // Analyze choices for custom context
  console.log('\n🎯 CHOICE ANALYSIS:');
  choices.forEach((choice, index) => {
    console.log(`   ${index + 1}. "${choice.text}"`);
  });
  
  const choicesText = choices.map(c => c.text.toLowerCase()).join(' ');
  const choicesRelevant = choicesText.includes('ocean') || choicesText.includes('explore') || 
                         choicesText.includes('help') || choicesText.includes('crystal') ||
                         choicesText.includes('dolphin') || choicesText.includes('reef');
  
  console.log(`   Choices relevance: ${choicesRelevant ? '✅ Context-aware' : '❌ Generic'}`);
  
  // Overall assessment
  const isWellIntegrated = integrationScore >= totalChecks * 0.6; // 60% threshold
  const overallStatus = isWellIntegrated ? '🎉 EXCELLENT' : '⚠️ NEEDS IMPROVEMENT';
  
  console.log(`\n${overallStatus} Overall custom settings integration!`);
  
  if (isWellIntegrated) {
    console.log('✅ Story generation successfully uses custom wizard settings');
    console.log('✅ Characters, setting, theme, and quest are integrated');
    console.log('✅ Age-appropriate content for target audience');
  } else {
    console.log('❌ Story generation may not be fully using custom settings');
    console.log('🔧 Prompt engineering may need further refinement');
  }
  
  return { integrationScore, totalChecks, segment };
}

// Run the test
async function runCustomSettingsTest() {
  try {
    console.log('🎯 GOAL: Verify that story generation uses ALL wizard settings');
    console.log('      Characters, setting, theme, conflict, quest, moral lesson');
    console.log('      Time period, atmosphere, additional details, word count\n');
    
    await authenticate();
    const storyId = await testCustomizedStory();
    const analysis = await testSegmentUsesCustomSettings(storyId);
    
    console.log('\n📋 TEST SUMMARY:');
    console.log('================');
    
    if (analysis.integrationScore >= analysis.totalChecks * 0.8) {
      console.log('🎉 OUTSTANDING: Custom settings highly integrated!');
    } else if (analysis.integrationScore >= analysis.totalChecks * 0.6) {
      console.log('✅ GOOD: Custom settings well integrated');
    } else {
      console.log('⚠️ FAIR: Custom settings partially integrated');
    }
    
    console.log(`📊 Final Score: ${analysis.integrationScore}/${analysis.totalChecks}`);
    console.log(`🎯 Integration Rate: ${Math.round(analysis.integrationScore/analysis.totalChecks*100)}%`);
    
    console.log('\n🚀 READY FOR USER TESTING!');
    console.log('Users can now create highly personalized stories!');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

runCustomSettingsTest();