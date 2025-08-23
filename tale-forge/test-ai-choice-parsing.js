// Test AI choice parsing with improved logic
// COPY AND PASTE INTO BROWSER CONSOLE

console.log('🧪 Testing AI Choice Parsing Logic');

// Test the same data structure used in debugging
async function testChoiceParsing() {
  const authData = localStorage.getItem('sb-fyihypkigbcmsxyvseca-auth-token');
  if (!authData) {
    console.log('❌ No auth data found');
    return;
  }

  const sessionData = JSON.parse(authData);
  const accessToken = sessionData.access_token;

  // Create a new test story with the same characters
  const testStoryData = {
    title: "Choice Parsing Test Story",
    description: "Test AI choice parsing",
    genre: "bedtime",
    target_age: "5-7",
    theme: "Friendship",
    characters: [
      { name: "Julius", role: "main character", description: "A brave young explorer" },
      { name: "Kevin", role: "companion", description: "A wise woodland creature" }
    ],
    setting: "Enchanted Forest",
    time_period: "Past",
    atmosphere: "Peaceful",
    conflict: "Protecting Nature",
    quest: "Save the Day",
    moral_lesson: "Everyone is special in their own way",
    words_per_chapter: 120
  };

  console.log('📤 Creating test story to check choice parsing...');
  
  const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
    },
    body: JSON.stringify(testStoryData)
  });

  const data = await response.json();
  
  if (data.success && data.firstSegment) {
    console.log('✅ Story created successfully!');
    console.log('🎯 Choices generated:', data.firstSegment.choices?.length || 0);
    
    if (data.firstSegment.choices) {
      console.log('\n📋 CHOICE ANALYSIS:');
      data.firstSegment.choices.forEach((choice, idx) => {
        console.log(`${idx + 1}. "${choice.text}"`);
        
        // Check if it's a generic fallback choice
        const isGeneric = ['Continue the adventure', 'Explore a different path', 'Try something unexpected'].includes(choice.text);
        console.log(`   Type: ${isGeneric ? '❌ GENERIC FALLBACK' : '✅ AI GENERATED'}`);
      });
      
      const allGeneric = data.firstSegment.choices.every(choice => 
        ['Continue the adventure', 'Explore a different path', 'Try something unexpected'].includes(choice.text)
      );
      
      console.log(`\n🔍 RESULT: ${allGeneric ? '❌ ALL CHOICES ARE GENERIC FALLBACKS' : '✅ AI CHOICES DETECTED'}`);
      
      if (allGeneric) {
        console.log('💡 The improved parsing logic needs more work - check server logs for detailed parsing attempts');
      } else {
        console.log('🎉 SUCCESS! AI-generated choices are now working!');
      }
    }
    
    console.log('\n📖 Story content preview:', data.firstSegment.content?.substring(0, 200) + '...');
  } else {
    console.log('❌ Story creation failed:', data.error || data);
  }
}

testChoiceParsing();