// Debug Script: AI Pipeline Issues Investigation
// Run this in browser console at localhost:3001 (or whatever port your app runs on)
// This will test both text generation and image generation

console.log('🔍 AI Pipeline Diagnostics - Ultra Debug Mode');
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

// Function to test story creation
async function testStoryCreation() {
  console.log('\n🤖 Testing Story Creation (GPT-4o)...');
  
  const token = getAuthToken();
  if (!token) {
    console.log('❌ No auth token found - please log in first');
    return;
  }

  try {
    const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify({
        title: 'Debug Test - Julius & Kevin AI Pipeline',
        description: 'Testing AI pipeline consistency',
        genre: 'adventure',
        target_age: 8,
        theme: 'friendship',
        setting: 'Enchanted Forest',
        time_period: 'Future',
        atmosphere: 'Mysterious',
        characters: [
          { name: 'Julius', role: 'Hero', traits: 'Curious, Clever' },
          { name: 'Kevin', role: 'Best Friend', traits: 'Funny, Clever' }
        ],
        conflict: 'protecting nature',
        quest: 'Save the magical creatures',
        moral_lesson: 'Friendship conquers all challenges',
        additional_details: 'Focus on teamwork and problem-solving',
        words_per_chapter: 120
      })
    });

    console.log('📡 Story Creation Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Story Creation SUCCESS');
      console.log('📊 Model Used:', data.model);
      console.log('📝 Story ID:', data.story?.id);
      console.log('🎯 First Segment Content Preview:', data.firstSegment?.content?.substring(0, 200) + '...');
      console.log('🔗 Choices Generated:', data.firstSegment?.choices?.map(c => c.text));
      
      // Test choices quality
      const choices = data.firstSegment?.choices || [];
      const isGeneric = choices.some(choice => 
        choice.text.includes('Continue the adventure') || 
        choice.text.includes('Explore a different path') ||
        choice.text.includes('Try something unexpected')
      );
      
      if (isGeneric) {
        console.log('⚠️ CHOICES ARE GENERIC - AI not generating contextual choices');
      } else {
        console.log('✅ Choices appear to be AI-generated and contextual');
      }
      
      return { storyId: data.story?.id, segmentId: data.firstSegment?.id };
    } else {
      const error = await response.text();
      console.log('❌ Story Creation FAILED:', error);
      return null;
    }
  } catch (error) {
    console.log('❌ Story Creation ERROR:', error.message);
    return null;
  }
}

// Function to test story segment generation
async function testSegmentGeneration(storyId) {
  console.log('\n🔄 Testing Story Segment Generation (GPT-4o)...');
  
  const token = getAuthToken();
  if (!token || !storyId) {
    console.log('❌ Missing auth token or story ID');
    return;
  }

  try {
    const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/generate-story-segment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify({
        storyId: storyId,
        choiceIndex: 0 // Select the first choice
      })
    });

    console.log('📡 Segment Generation Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Segment Generation SUCCESS');
      console.log('📝 New Segment Preview:', data.segment?.content?.substring(0, 200) + '...');
      console.log('🔗 New Choices Generated:', data.segment?.choices?.map(c => c.text));
      
      // Test choices quality
      const choices = data.segment?.choices || [];
      const isGeneric = choices.some(choice => 
        choice.text.includes('Continue the adventure') || 
        choice.text.includes('Explore a different path') ||
        choice.text.includes('Try something unexpected')
      );
      
      if (isGeneric) {
        console.log('❌ SEGMENT CHOICES ARE GENERIC - This confirms the GPT-4o fix is needed!');
      } else {
        console.log('✅ Segment choices appear to be AI-generated and contextual');
      }
      
      return data.segment?.id;
    } else {
      const error = await response.text();
      console.log('❌ Segment Generation FAILED:', error);
      return null;
    }
  } catch (error) {
    console.log('❌ Segment Generation ERROR:', error.message);
    return null;
  }
}

// Function to test image generation
async function testImageGeneration(segmentId) {
  console.log('\n🖼️ Testing Image Generation (OVH Stable Diffusion)...');
  
  const token = getAuthToken();
  if (!token || !segmentId) {
    console.log('❌ Missing auth token or segment ID');
    return;
  }

  try {
    const startTime = Date.now();
    
    const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/generate-story-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify({
        segmentId: segmentId,
        imagePrompt: 'Julius and Kevin exploring a magical enchanted forest with glowing plants and friendly creatures'
      })
    });

    const duration = Date.now() - startTime;
    console.log('📡 Image Generation Response Status:', response.status);
    console.log('⏱️ Response Time:', duration + 'ms');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Image Generation SUCCESS');
      console.log('🖼️ Image URL:', data.imageUrl);
      console.log('📝 Enhanced Prompt:', data.prompt);
      
      // Test if image URL is accessible
      if (data.imageUrl) {
        try {
          const imgResponse = await fetch(data.imageUrl, { method: 'HEAD' });
          if (imgResponse.ok) {
            console.log('✅ Image is accessible at URL');
          } else {
            console.log('⚠️ Image URL returned but image not accessible');
          }
        } catch (e) {
          console.log('⚠️ Could not verify image accessibility');
        }
      }
    } else {
      const error = await response.text();
      console.log('❌ Image Generation FAILED:', error);
      
      // Parse common error types
      if (error.includes('MISSING_IMAGE_API_KEY')) {
        console.log('🔑 DIAGNOSIS: OVH API key not configured in Supabase secrets');
      } else if (error.includes('SDXL API error')) {
        console.log('🔌 DIAGNOSIS: OVH Stable Diffusion service issue');
      }
    }
  } catch (error) {
    console.log('❌ Image Generation ERROR:', error.message);
  }
}

// Main diagnostic function
async function runFullDiagnostics() {
  console.log('🚀 Starting Full AI Pipeline Diagnostics...');
  
  // Test 1: Story Creation
  const storyResult = await testStoryCreation();
  
  if (storyResult?.storyId) {
    console.log('\n⏱️ Waiting 2 seconds before next test...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Segment Generation
    const segmentId = await testSegmentGeneration(storyResult.storyId);
    
    if (segmentId) {
      console.log('\n⏱️ Waiting 2 seconds before image test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test 3: Image Generation
      await testImageGeneration(segmentId);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Diagnostics Complete');
  console.log('Key Issues to Look For:');
  console.log('1. Generic choices = GPT-4o-mini instead of GPT-4o');
  console.log('2. Image generation failures = OVH API key issues');
  console.log('3. Slow responses = API connectivity/rate limits');
}

// Auto-run diagnostics
console.log('⏳ Starting diagnostics in 1 second...');
setTimeout(runFullDiagnostics, 1000);