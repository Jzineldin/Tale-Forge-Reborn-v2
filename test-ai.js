// Test AI story generation with REAL API keys
import fetch from 'node-fetch';

async function testAIGeneration() {
  console.log('🚀 Testing AI Story Generation with REAL API keys...\n');
  
  const testPrompt = {
    prompt: "A young explorer discovers a magical forest filled with talking animals",
    target_age: "7-9",
    genre: "fantasy"
  };

  try {
    console.log('📝 Test prompt:', testPrompt.prompt);
    console.log('🎯 Target age:', testPrompt.target_age);
    console.log('📚 Genre:', testPrompt.genre);
    console.log('\n⏳ Calling AI generation endpoint...');
    
    const response = await fetch('http://localhost:54321/functions/v1/generate-story-segment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
      },
      body: JSON.stringify(testPrompt)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('\n✅ SUCCESS! AI is now working!\n');
      console.log('📖 Generated story segment:');
      console.log('   ', result.story?.substring(0, 150) + '...\n');
      console.log('🎮 Generated choices:');
      result.choices?.forEach((choice, i) => {
        console.log(`   ${i + 1}. ${choice}`);
      });
      console.log('\n🎉 YOUR AI PIPELINE IS FIXED!');
    } else {
      console.error('\n❌ AI generation failed:', result.error || result.message);
      console.log('\n🔍 Debug info:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('\n❌ Connection error:', error.message);
    console.log('\n💡 Make sure Supabase Edge Functions are running:');
    console.log('   supabase functions serve');
  }
}

// Run the test
testAIGeneration();