// Server-side debugging tool to analyze AI generation issues
// This can run in Node.js environment without browser dependencies

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AIGenerationDebugger {
  constructor() {
    this.genericPatterns = [
      'Continue the adventure',
      'Explore a different path', 
      'Try something unexpected',
      'Make a brave decision',
      'Explore somewhere new',
      'Try something different',
      'Look around carefully',
      'Make a thoughtful choice'
    ];
  }

  // Analyze the choice parsing logic from the AI function
  analyzeChoiceParsing(aiResponseText) {
    console.log('🔍 ANALYZING CHOICE PARSING');
    console.log('='.repeat(50));
    console.log(`📝 AI Response Text (${aiResponseText.length} chars):`);
    console.log(aiResponseText);
    console.log('\n' + '='.repeat(50));

    // Simulate the exact parsing logic from generate-story-segment/index.ts
    let rawChoices = [];
    
    console.log('🔍 METHOD 1: Enhanced splitting...');
    // Method 1: Split by any common separators and clean up
    rawChoices = aiResponseText
      .split(/[\n\r]+/) // Split by newlines/returns
      .map(text => text.trim())
      .map(text => text.replace(/^\d+[\.\)\:]?\s*/, '')) // Remove numbering
      .map(text => text.replace(/^[A-Za-z][\.\)\:]?\s*/, '')) // Remove lettering
      .map(text => text.replace(/^[-•*\.\+]\s*/, '')) // Remove bullets
      .map(text => text.replace(/^["'`](.*)["'`]$/, '$1')) // Remove quotes
      .map(text => text.trim())
      .filter(text => text.length > 5) // Must be at least 5 characters
      .filter(text => !text.match(/^\d+\.?\s*$/)) // Remove pure numbers
      .slice(0, 3);
    
    console.log(`   Result: ${rawChoices.length} choices found`);
    rawChoices.forEach((choice, i) => console.log(`   ${i + 1}: "${choice}"`));
    
    if (rawChoices.length < 3) {
      console.log('\n🔍 METHOD 2: Sentence extraction...');
      
      const sentences = aiResponseText
        .replace(/[\n\r]+/g, ' ') // Join lines
        .split(/[.!?]+/) // Split by sentence endings
        .map(s => s.trim())
        .filter(s => s.length > 5)
        .filter(s => s.length < 100) // Not too long
        .slice(0, 3);
        
      console.log(`   Result: ${sentences.length} sentences found`);
      sentences.forEach((sentence, i) => console.log(`   ${i + 1}: "${sentence}"`));
      
      if (sentences.length >= 3) {
        rawChoices = sentences.slice(0, 3);
      }
    }
    
    if (rawChoices.length < 3) {
      console.log('\n🔍 METHOD 3: Word-based extraction...');
      
      const parts = aiResponseText
        .split(/[,;\n\r\-\|]+/)
        .map(text => text.trim())
        .map(text => text.replace(/^\d+[\.\)\:]?\s*/, ''))
        .map(text => text.replace(/^[A-Za-z][\.\)\:]?\s*/, ''))
        .filter(text => text.length > 3 && text.length < 50)
        .slice(0, 3);
        
      console.log(`   Result: ${parts.length} parts found`);
      parts.forEach((part, i) => console.log(`   ${i + 1}: "${part}"`));
      
      if (parts.length >= rawChoices.length) {
        rawChoices = parts.slice(0, 3);
      }
    }
    
    console.log('\n📊 FINAL PARSING RESULT:');
    console.log(`   Choices extracted: ${rawChoices.length}`);
    
    if (rawChoices.length < 3) {
      console.log('❌ PARSING FAILED - Would trigger generic fallbacks');
      console.log('💡 Generic fallbacks that would be used:');
      this.genericPatterns.slice(0, 3 - rawChoices.length).forEach((fallback, i) => {
        console.log(`   ${rawChoices.length + i + 1}: "${fallback}"`);
      });
    } else {
      console.log('✅ PARSING SUCCEEDED - Would use extracted choices');
    }
    
    return rawChoices;
  }

  // Test different AI response formats
  testChoiceFormats() {
    console.log('\n🧪 TESTING DIFFERENT AI RESPONSE FORMATS');
    console.log('='.repeat(60));
    
    const testCases = [
      {
        name: "Embedded in story (current issue)",
        response: `Luna looked at the magical forest path ahead. The ancient trees whispered secrets in the wind.

Choose what Luna should do:
- Search for the crystal in the Whispering Grove
- Ask the wise owl for guidance  
- Follow the glowing mushroom trail

The adventure continues...`
      },
      {
        name: "Simple list format",
        response: `Search for the crystal in the Whispering Grove
Ask the wise owl for guidance
Follow the glowing mushroom trail`
      },
      {
        name: "Numbered list format", 
        response: `1. Search for the crystal in the Whispering Grove
2. Ask the wise owl for guidance
3. Follow the glowing mushroom trail`
      },
      {
        name: "Bullet points format",
        response: `• Search for the crystal in the Whispering Grove
• Ask the wise owl for guidance
• Follow the glowing mushroom trail`
      },
      {
        name: "JSON format (would work with single API call)",
        response: `{
  "story_text": "Luna looked at the magical forest...",
  "choices": [
    "Search for the crystal in the Whispering Grove",
    "Ask the wise owl for guidance", 
    "Follow the glowing mushroom trail"
  ]
}`
      }
    ];

    testCases.forEach((testCase, index) => {
      console.log(`\n📋 TEST CASE ${index + 1}: ${testCase.name}`);
      console.log('-'.repeat(40));
      const result = this.analyzeChoiceParsing(testCase.response);
      console.log(`Result: ${result.length >= 3 ? '✅ SUCCESS' : '❌ WOULD FAIL'}`);
    });
  }

  // Analyze actual test results from the comprehensive test
  analyzeTestResults() {
    console.log('\n📈 ANALYZING ACTUAL TEST RESULTS');
    console.log('='.repeat(50));
    
    try {
      const testResultsPath = path.join(__dirname, 'ultimate-test-results', 'comprehensive-test-results.json');
      
      if (fs.existsSync(testResultsPath)) {
        const data = fs.readFileSync(testResultsPath, 'utf8');
        
        // Extract stories with generic choices
        const genericChoicePattern = /"Continue the adventure"|"Try something different"|"Explore a different path"/g;
        const matches = data.match(genericChoicePattern);
        
        if (matches) {
          console.log(`❌ Found ${matches.length} instances of generic choices in test results`);
          
          // Try to extract story context around generic choices
          const stories = data.split('"story_text":');
          let genericStoryCount = 0;
          
          stories.forEach((storySection, index) => {
            if (storySection.includes('Continue the adventure') || 
                storySection.includes('Try something different')) {
              genericStoryCount++;
              
              // Extract a sample of the story text
              const storyMatch = storySection.match(/"([^"]+)"/);
              if (storyMatch) {
                const storyText = storyMatch[1].substring(0, 200);
                console.log(`\n📖 Generic Story Example ${genericStoryCount}:`);
                console.log(`   Story text: "${storyText}..."`);
                
                // Check if the story text actually contains good embedded choices
                if (storyText.includes('Choose') || storyText.includes('decision') || storyText.includes('-')) {
                  console.log('   💡 ISSUE: Story contains embedded choices but parsing failed!');
                }
              }
            }
          });
          
          console.log(`\n📊 Summary: ${genericStoryCount} stories with generic choices found`);
        } else {
          console.log('✅ No generic choices found in test results');
        }
      } else {
        console.log('⚠️ Test results file not found');
      }
    } catch (error) {
      console.log(`❌ Error analyzing test results: ${error.message}`);
    }
  }

  // Generate a fix recommendation
  generateFixRecommendation() {
    console.log('\n🔧 FIX RECOMMENDATION');
    console.log('='.repeat(50));
    
    console.log('📋 IMMEDIATE FIXES NEEDED:');
    console.log('');
    console.log('1. 🎯 IMPROVE CHOICE PARSING LOGIC:');
    console.log('   - Add regex to extract embedded choices from story text');
    console.log('   - Look for patterns like "Choose:", "Options:", followed by dashes');
    console.log('   - Extract text between dashes as choices');
    console.log('');
    console.log('2. 🔄 FIX AI PROMPT SEPARATION:');
    console.log('   - Ensure story generation and choice generation use separate, focused prompts');
    console.log('   - Story prompt: Generate story text only, no choices');
    console.log('   - Choice prompt: Generate 3 choices based on the story text');
    console.log('');
    console.log('3. ✅ VALIDATE CHOICE QUALITY:');
    console.log('   - Check if extracted choices are contextual (mention story elements)');
    console.log('   - Reject generic patterns before falling back');
    console.log('   - Only use fallbacks as absolute last resort');
    console.log('');
    console.log('4. 📊 ADD DEBUGGING:');
    console.log('   - Log exact AI responses for analysis');
    console.log('   - Track parsing success/failure rates');
    console.log('   - Alert when fallbacks are triggered');
    console.log('');
    console.log('🚀 EXPECTED OUTCOME:');
    console.log('   - 95%+ contextual choices instead of generic ones');
    console.log('   - Stories will have relevant, story-specific decision points');
    console.log('   - Better user engagement and story quality');
  }

  // Run complete analysis
  runCompleteAnalysis() {
    console.log('🔍 AI GENERATION DEBUGGING ANALYSIS');
    console.log('='.repeat(60));
    console.log('Purpose: Identify why AI generates generic instead of contextual choices');
    console.log('');
    
    this.testChoiceFormats();
    this.analyzeTestResults();
    this.generateFixRecommendation();
    
    console.log('\n✅ ANALYSIS COMPLETE');
    console.log('Next step: Apply recommended fixes to generate-story-segment/index.ts');
  }
}

// Run the analysis
const aiDebugger = new AIGenerationDebugger();
aiDebugger.runCompleteAnalysis();