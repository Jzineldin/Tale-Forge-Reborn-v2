// Debug the choices structure in your story segments
// COPY AND PASTE INTO BROWSER CONSOLE

console.log('🔍 Debugging Choices Structure');

async function debugChoicesStructure() {
  try {
    // Get the latest created story
    const authData = localStorage.getItem('sb-fyihypkigbcmsxyvseca-auth-token');
    const sessionData = JSON.parse(authData);
    const accessToken = sessionData.access_token;
    
    console.log('📡 Fetching latest story...');
    
    // Get your stories to find the latest one
    const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/get-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify({ 
        storyId: 'da50eed1-70c1-4ba2-bde4-c46ccb100b75' // From your console logs
      })
    });
    
    if (!response.ok) {
      console.log('❌ Failed to fetch story');
      return;
    }
    
    const storyData = await response.json();
    console.log('✅ Story fetched successfully');
    
    if (storyData.segments && storyData.segments.length > 0) {
      console.log(`📚 Found ${storyData.segments.length} segments`);
      
      storyData.segments.forEach((segment, index) => {
        console.log(`\n--- SEGMENT ${index + 1} ---`);
        console.log('Segment ID:', segment.id);
        console.log('Position:', segment.position);
        console.log('Content preview:', segment.content?.substring(0, 100) + '...');
        
        console.log('\n🎯 CHOICES ANALYSIS:');
        console.log('Raw choices data:', segment.choices);
        console.log('Choices type:', typeof segment.choices);
        console.log('Choices is array:', Array.isArray(segment.choices));
        
        if (segment.choices) {
          if (Array.isArray(segment.choices)) {
            console.log(`📋 Found ${segment.choices.length} choices:`);
            segment.choices.forEach((choice, choiceIndex) => {
              console.log(`  Choice ${choiceIndex + 1}:`, {
                id: choice.id,
                text: choice.text,
                hasText: !!choice.text,
                textLength: choice.text?.length || 0,
                isValid: !!(choice && choice.text && choice.text.trim().length > 0)
              });
            });
            
            // Test the filtering logic from StoryChoices component
            const validChoices = segment.choices.filter(choice => 
              choice && choice.text && choice.text.trim().length > 0
            );
            console.log(`🔍 Valid choices after filtering: ${validChoices.length}`);
            
            if (validChoices.length === 0) {
              console.log('❌ NO VALID CHOICES - This is why "The end of your story!" shows');
              console.log('🔧 Checking for common issues:');
              
              segment.choices.forEach((choice, idx) => {
                console.log(`  Choice ${idx + 1} issues:`);
                if (!choice) console.log('    - Choice is null/undefined');
                if (!choice?.text) console.log('    - Missing text property');
                if (choice?.text && !choice.text.trim()) console.log('    - Text is empty/whitespace');
                if (typeof choice?.text !== 'string') console.log('    - Text is not a string:', typeof choice.text);
              });
            }
            
          } else {
            console.log('❌ Choices is not an array:', segment.choices);
            
            // Check if it's a string that needs parsing
            if (typeof segment.choices === 'string') {
              console.log('🔍 Choices appears to be a string, trying to parse...');
              try {
                const parsedChoices = JSON.parse(segment.choices);
                console.log('✅ Parsed choices:', parsedChoices);
              } catch (e) {
                console.log('❌ Failed to parse choices as JSON');
                console.log('Raw choices string:', segment.choices);
              }
            }
          }
        } else {
          console.log('❌ No choices property found');
        }
        
        console.log('─'.repeat(50));
      });
      
    } else {
      console.log('❌ No segments found in story');
      console.log('Story data keys:', Object.keys(storyData));
    }
    
  } catch (error) {
    console.log('❌ Debug failed:', error.message);
    console.log('Full error:', error);
  }
}

// Run the debug
debugChoicesStructure();