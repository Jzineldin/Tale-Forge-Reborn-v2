// Comprehensive Production Diagnostics
// COPY AND PASTE INTO BROWSER CONSOLE

console.log('🔍 PRODUCTION DIAGNOSTICS STARTING...');

async function diagnoseProductionIssues() {
  const authData = localStorage.getItem('sb-fyihypkigbcmsxyvseca-auth-token');
  if (!authData) {
    console.log('❌ No auth data found');
    return;
  }

  const sessionData = JSON.parse(authData);
  const accessToken = sessionData.access_token;

  console.log('\n🧪 TEST 1: Create Fresh Story with Full Diagnostics');
  
  const diagnosticStoryData = {
    title: "Production Diagnostic Test",
    description: "Testing real production environment",
    genre: "adventure",  
    target_age: "5-7",
    theme: "Friendship",
    characters: [
      { name: "Julius", role: "hero", description: "A brave explorer" },
      { name: "Kevin", role: "friend", description: "A wise companion" }
    ],
    setting: "Magical Forest",
    time_period: "Present",
    atmosphere: "Cheerful", 
    conflict: "Solving puzzles",
    quest: "Find treasure",
    moral_lesson: "Teamwork wins",
    words_per_chapter: 120
  };

  try {
    console.log('📤 Creating diagnostic story...');
    const startTime = Date.now();
    
    const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify(diagnosticStoryData)
    });

    const createTime = Date.now() - startTime;
    console.log(`⏱️ Story creation took: ${createTime}ms`);

    if (!response.ok) {
      console.log('❌ Story creation failed:', response.status);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      return;
    }

    const data = await response.json();
    
    if (data.success && data.firstSegment) {
      console.log('\n✅ STORY CREATED - DETAILED ANALYSIS:');
      
      // AI Provider Analysis
      console.log('\n🤖 AI PROVIDER ANALYSIS:');
      console.log('Model used:', data.model);
      console.log('Expected OpenAI primary?', data.model?.includes('OpenAI'));
      console.log('Using OVH fallback?', data.model?.includes('OVH'));
      console.log('Tokens used:', data.tokensUsed);
      
      // Choices Analysis
      console.log('\n🎯 CHOICES DETAILED ANALYSIS:');
      if (data.firstSegment.choices) {
        console.log('Total choices:', data.firstSegment.choices.length);
        
        data.firstSegment.choices.forEach((choice, idx) => {
          console.log(`\n📋 Choice ${idx + 1}:`);
          console.log('  Text:', choice.text);
          console.log('  ID:', choice.id);
          
          // Check if it's a generic fallback choice
          const genericFallbacks = [
            'Continue the adventure',
            'Explore a different path', 
            'Try something unexpected',
            'Continue the story',
            'Explore somewhere new',
            'Try something different'
          ];
          
          const isGeneric = genericFallbacks.some(generic => choice.text === generic);
          console.log('  Status:', isGeneric ? '❌ GENERIC FALLBACK' : '✅ CONTEXTUAL AI');
          
          // Check contextual relevance 
          const storyWords = ['julius', 'kevin', 'forest', 'treasure', 'puzzle', 'magic', 'friend'];
          const choiceWords = choice.text.toLowerCase();
          const hasContext = storyWords.some(word => choiceWords.includes(word));
          console.log('  Context:', hasContext ? '✅ STORY-RELEVANT' : '⚠️ GENERIC');
        });
        
        // Overall choice assessment
        const allGeneric = data.firstSegment.choices.every(choice => 
          ['Continue the adventure', 'Explore a different path', 'Try something unexpected',
           'Continue the story', 'Explore somewhere new', 'Try something different'].includes(choice.text)
        );
        
        console.log('\n🏁 CHOICES VERDICT:', allGeneric ? '❌ ALL GENERIC FALLBACKS' : '✅ AI-GENERATED DETECTED');
        
      } else {
        console.log('❌ No choices found in response');
      }
      
      // Image Generation Analysis
      console.log('\n🖼️ IMAGE GENERATION ANALYSIS:');
      console.log('Segment ID:', data.firstSegment.id);
      console.log('Has image prompt:', !!data.firstSegment.image_prompt);
      console.log('Message includes "image generation started":', data.message?.includes('image generation started'));
      
      if (data.message?.includes('image generation started')) {
        console.log('✅ Image generation was triggered');
        
        // Wait and check image generation progress
        console.log('\n⏳ Monitoring image generation progress...');
        await monitorImageGeneration(data.story.id, accessToken, 0);
        
      } else {
        console.log('❌ Image generation was NOT triggered');
      }
      
      // Story Content Analysis
      console.log('\n📖 STORY CONTENT ANALYSIS:');
      const content = data.firstSegment.content || '';
      console.log('Content length:', content.length);
      console.log('Contains Julius:', content.includes('Julius'));
      console.log('Contains Kevin:', content.includes('Kevin'));
      console.log('Contains forest:', content.toLowerCase().includes('forest'));
      console.log('Content preview:', content.substring(0, 200) + '...');
      
    } else {
      console.log('❌ Story creation response invalid:');
      console.log('Success:', data.success);
      console.log('Error:', data.error);
      console.log('Full response:', data);
    }
    
  } catch (error) {
    console.log('❌ Network error:', error);
  }
}

// Helper function to monitor image generation
async function monitorImageGeneration(storyId, accessToken, checkCount) {
  if (checkCount >= 12) { // Max 2 minutes of checking
    console.log('❌ Image generation monitoring timeout after 2 minutes');
    return;
  }
  
  try {
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
    if (data.success && data.story?.segments?.[0]) {
      const segment = data.story.segments[0];
      
      console.log(`📊 Check ${checkCount + 1}/12 - Image Status:`);
      console.log('  Image URL:', segment.image_url || 'Not set');
      console.log('  Generation status:', segment.image_generation_status || 'Not set');
      console.log('  Is generating:', segment.is_image_generating || false);
      
      if (segment.image_url) {
        console.log('🎉 IMAGE GENERATED SUCCESSFULLY!');
        console.log('🖼️ Final URL:', segment.image_url);
        console.log(`⏱️ Generated after ${(checkCount + 1) * 10} seconds`);
        return;
      } else if (segment.image_generation_status === 'failed') {
        console.log('❌ IMAGE GENERATION FAILED');
        console.log('💡 Check Supabase function logs for error details');
        return;
      } else if (segment.is_image_generating) {
        console.log('🔄 Still generating, checking again in 10 seconds...');
        setTimeout(() => monitorImageGeneration(storyId, accessToken, checkCount + 1), 10000);
      } else {
        console.log('⚠️ Image generation may not have started properly');
        setTimeout(() => monitorImageGeneration(storyId, accessToken, checkCount + 1), 10000);
      }
    }
  } catch (error) {
    console.log('❌ Error checking image progress:', error);
  }
}

// Start diagnostics
diagnoseProductionIssues();

console.log('\n💡 This script will:');
console.log('1. Create a test story with the new AI system');
console.log('2. Analyze which AI provider is being used'); 
console.log('3. Check if choices are AI-generated or fallback');
console.log('4. Monitor image generation progress for 2 minutes');
console.log('5. Provide detailed diagnostics of any issues');