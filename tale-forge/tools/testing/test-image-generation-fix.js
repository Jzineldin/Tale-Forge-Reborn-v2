// Test the image generation fix
// COPY AND PASTE INTO BROWSER CONSOLE

console.log('🖼️ Testing Image Generation Fix');

async function testImageGenerationFix() {
  const authData = localStorage.getItem('sb-fyihypkigbcmsxyvseca-auth-token');
  if (!authData) {
    console.log('❌ No auth data found');
    return;
  }

  const sessionData = JSON.parse(authData);
  const accessToken = sessionData.access_token;

  // Create a new test story to verify image generation
  const testStoryData = {
    title: "Image Generation Test",
    description: "Test image generation fix",
    genre: "adventure",
    target_age: "5-7",
    theme: "Magic",
    characters: [
      { name: "Julius", role: "hero", description: "A brave young wizard" },
      { name: "Kevin", role: "companion", description: "A magical talking fox" }
    ],
    setting: "Enchanted Forest",
    time_period: "Medieval",
    atmosphere: "Magical",
    conflict: "Learning spells",
    quest: "Find the magic crystal",
    moral_lesson: "Practice makes perfect",
    words_per_chapter: 100
  };

  console.log('📤 Creating test story with image generation...');
  
  try {
    const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify(testStoryData)
    });

    if (!response.ok) {
      console.log('❌ Response not OK:', response.status);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      return;
    }

    const data = await response.json();
    
    if (data.success && data.firstSegment) {
      console.log('✅ Story created successfully!');
      console.log('Story ID:', data.story?.id);
      console.log('Segment ID:', data.firstSegment?.id);
      console.log('Image prompt created:', !!data.firstSegment?.image_prompt);
      console.log('Message:', data.message);
      
      // Check if image generation was triggered
      if (data.message.includes('image generation started')) {
        console.log('🎨 Image generation was triggered!');
        
        // Wait a few seconds and check the segment status
        console.log('⏳ Waiting 10 seconds to check image generation progress...');
        setTimeout(async () => {
          await checkImageGenerationProgress(data.story.id, accessToken);
        }, 10000);
        
        // Also provide immediate feedback
        console.log('\n💡 To check progress:');
        console.log('1. Refresh the story page in a few seconds');
        console.log('2. Or run this: checkImageGenerationProgress("' + data.story.id + '")');
        console.log('3. Check the Supabase dashboard for function logs');
        
      } else {
        console.log('❌ Image generation was NOT triggered');
        console.log('Expected message to contain "image generation started"');
      }
      
    } else {
      console.log('❌ Story creation failed:');
      console.log('Success:', data.success);
      console.log('Error:', data.error);
      console.log('Full response:', data);
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error);
  }
}

// Helper function to check image generation progress
window.checkImageGenerationProgress = async function(storyId, accessToken = null) {
  if (!accessToken) {
    const authData = localStorage.getItem('sb-fyihypkigbcmsxyvseca-auth-token');
    if (!authData) {
      console.log('❌ No auth data found');
      return;
    }
    const sessionData = JSON.parse(authData);
    accessToken = sessionData.access_token;
  }
  
  console.log('🔍 Checking image generation progress for story:', storyId);
  
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
    if (data.success && data.story && data.story.segments) {
      const segment = data.story.segments[0];
      console.log('\n📊 IMAGE GENERATION STATUS:');
      console.log('Image URL:', segment.image_url || 'Not set yet');
      console.log('Image generation status:', segment.image_generation_status || 'Not set');
      console.log('Is generating:', segment.is_image_generating || false);
      
      if (segment.image_url) {
        console.log('🎉 IMAGE GENERATED SUCCESSFULLY!');
        console.log('🖼️ View image at:', segment.image_url);
      } else if (segment.is_image_generating) {
        console.log('🔄 Image is still being generated...');
        console.log('💡 Try checking again in a few seconds');
      } else if (segment.image_generation_status === 'failed') {
        console.log('❌ Image generation failed');
        console.log('💡 Check function logs for error details');
      } else {
        console.log('⏳ Image generation may not have started yet');
      }
    }
  } catch (error) {
    console.log('❌ Failed to check progress:', error);
  }
};

testImageGenerationFix();