// Choice Parser Service
// Ultra-robust choice parsing with multiple methods and contextual fallbacks
// Extracted from main function for better testability and maintainability

import { ChoiceParserService, Choice } from '../types/interfaces.ts';

export class ChoiceParser implements ChoiceParserService {
  
  /**
   * Main entry point for parsing choices from AI response
   * Uses multiple parsing methods with fallbacks for maximum reliability
   */
  async parseChoices(aiResponse: string, storyText: string): Promise<Choice[]> {
    console.log(`🔍 Original AI response length: ${aiResponse.length} characters`);
    console.log(`🔍 Original AI response: "${aiResponse}"`);
    
    let rawChoices = await this.parseChoicesWithMultipleMethods(aiResponse);
    
    // If we don't have 3 choices, use contextual fallbacks
    if (rawChoices.length < 3) {
      console.log(`⚠️ FALLBACK TRIGGERED: Only got ${rawChoices.length} choices from AI`);
      console.log(`⚠️ Original AI response: "${aiResponse}"`);
      console.log(`⚠️ Parsed choices: ${JSON.stringify(rawChoices)}`);
      
      const contextualFallbacks = this.generateContextualFallbacks(storyText);
      
      // Fill missing choices with fallbacks
      while (rawChoices.length < 3 && contextualFallbacks.length > 0) {
        rawChoices.push(contextualFallbacks.shift()!);
      }
      
      console.log(`✅ Added fallback choices: ${JSON.stringify(rawChoices)}`);
    }
    
    // Convert to Choice objects
    const choices = rawChoices.map((text, index) => ({
      id: `choice-${Date.now()}-${index}`,
      text: text,
      next_segment_id: null
    }));
    
    console.log(`🎯 Final choices generated: ${choices.length} [${choices.map(c => c.text).join(' | ')}]`);
    
    return choices;
  }

  /**
   * Parse choices using multiple methods for maximum reliability
   */
  private async parseChoicesWithMultipleMethods(choicesText: string): Promise<string[]> {
    console.log(`🔍 DEBUG: Raw AI response: "${choicesText}"`);
    console.log(`🔍 DEBUG: Response length: ${choicesText.length} characters`);
    
    let rawChoices: string[] = [];
    
    // Method 1: Enhanced splitting with cleanup
    rawChoices = this.parseMethodEnhancedSplitting(choicesText);
    console.log(`🔍 Method 1 (enhanced splitting) found choices: ${rawChoices.length} [${rawChoices.join(' | ')}]`);
    
    // Method 2: Sentence extraction if Method 1 didn't find enough
    if (rawChoices.length < 3) {
      console.log('🔍 Trying Method 2: sentence extraction...');
      const sentenceChoices = this.parseMethodSentenceExtraction(choicesText);
      
      if (sentenceChoices.length >= 3) {
        rawChoices = sentenceChoices.slice(0, 3);
        console.log(`✅ Method 2 found choices: ${rawChoices.length} [${rawChoices.join(' | ')}]`);
      }
    }
    
    // Method 3: Word-based extraction if still not enough
    if (rawChoices.length < 3) {
      console.log('🔍 Trying Method 3: word-based extraction...');
      const wordChoices = this.parseMethodWordBased(choicesText);
      
      if (wordChoices.length >= rawChoices.length) {
        rawChoices = wordChoices.slice(0, 3);
        console.log(`✅ Method 3 found choices: ${rawChoices.length} [${rawChoices.join(' | ')}]`);
      }
    }
    
    return rawChoices;
  }

  /**
   * Method 1: Enhanced splitting with comprehensive cleanup
   */
  private parseMethodEnhancedSplitting(choicesText: string): string[] {
    return choicesText
      .split(/[\n\r]+/) // Split by newlines/returns
      .map(text => text.trim())
      .map(text => text.replace(/^\d+[\.\)\:]?\s*/, '')) // Remove numbering: "1.", "1)", "1:"
      .map(text => text.replace(/^[A-Za-z][\.\)\:]\s+/, '')) // Remove lettering ONLY if followed by punctuation AND space: "A. ", "A) ", "A: "  
      .map(text => text.replace(/^[-•*\.\+]\s*/, '')) // Remove bullets: "-", "•", "*", ".", "+"
      .map(text => text.replace(/^["'`](.*)["'`]$/, '$1')) // Remove quotes
      .map(text => text.trim())
      .filter(text => text.length > 5) // Must be at least 5 characters
      .filter(text => !text.match(/^\d+\.?\s*$/)) // Remove pure numbers
      .slice(0, 3);
  }

  /**
   * Method 2: Sentence extraction for natural language responses
   */
  private parseMethodSentenceExtraction(choicesText: string): string[] {
    return choicesText
      .replace(/[\n\r]+/g, ' ') // Join lines
      .split(/[.!?]+/) // Split by sentence endings
      .map(s => s.trim())
      .filter(s => s.length > 5)
      .filter(s => s.length < 100) // Not too long
      .slice(0, 3);
  }

  /**
   * Method 3: Word-based extraction for delimiter-separated responses
   */
  private parseMethodWordBased(choicesText: string): string[] {
    return choicesText
      .split(/[,;\n\r\-\|]+/)
      .map(text => text.trim())
      .map(text => text.replace(/^\d+[\.\)\:]?\s*/, ''))
      .map(text => text.replace(/^[A-Za-z][\.\)\:]?\s*/, ''))
      .filter(text => text.length > 3 && text.length < 50)
      .slice(0, 3);
  }

  /**
   * Generate contextual fallback choices based on story content
   * Analyzes story text to provide relevant, story-appropriate choices
   */
  generateContextualFallbacks(storyText: string): string[] {
    const storyLower = storyText.toLowerCase();
    let fallbacks: string[] = [];
    
    // Context-aware fallbacks based on story content
    if (storyLower.includes('door') || storyLower.includes('entrance')) {
      fallbacks = ['Go through the door', 'Look for another way', 'Wait and listen first'];
    } else if (storyLower.includes('magic') || storyLower.includes('spell')) {
      fallbacks = ['Use magic to help', 'Be careful with the magic', 'Ask about the magic'];
    } else if (storyLower.includes('forest') || storyLower.includes('woods')) {
      fallbacks = ['Follow the forest path', 'Look for hidden trails', 'Call out for help'];
    } else if (storyLower.includes('castle') || storyLower.includes('tower')) {
      fallbacks = ['Explore the castle', 'Find another entrance', 'Look for a way up'];
    } else if (storyLower.includes('dragon') || storyLower.includes('creature')) {
      fallbacks = ['Approach carefully', 'Try to communicate', 'Find a safe distance'];
    } else if (storyLower.includes('treasure') || storyLower.includes('chest')) {
      fallbacks = ['Open the treasure', 'Check for traps first', 'Look around more'];
    } else if (storyLower.includes('friend') || storyLower.includes('friendship')) {
      fallbacks = ['Help your friend', 'Ask for help', 'Work together'];
    } else if (storyLower.includes('scared') || storyLower.includes('afraid')) {
      fallbacks = ['Take a deep breath', 'Find courage within', 'Ask for support'];
    } else if (storyLower.includes('lost') || storyLower.includes('confused')) {
      fallbacks = ['Look for clues', 'Ask for directions', 'Stay calm and think'];
    } else if (storyLower.includes('adventure') || storyLower.includes('journey')) {
      fallbacks = ['Continue exploring', 'Look for new paths', 'Be brave and curious'];
    } else {
      // Final generic fallbacks
      console.log('🚨 USING FINAL GENERIC FALLBACKS - AI parsing completely failed');
      fallbacks = ['Continue the adventure', 'Look around carefully', 'Make a thoughtful choice'];
    }
    
    console.log(`🎯 Generated contextual fallbacks for story content: ${JSON.stringify(fallbacks)}`);
    return fallbacks;
  }

  /**
   * Validate that choices are appropriate and meaningful
   */
  private validateChoices(choices: string[]): boolean {
    return choices.length >= 1 && 
           choices.every(choice => 
             choice.length >= 5 && 
             choice.length <= 100 && 
             choice.trim().length > 0
           );
  }

  /**
   * Get debugging info about choice parsing
   */
  getParsingStats(aiResponse: string): {
    responseLength: number;
    hasNewlines: boolean;
    hasNumbering: boolean;
    hasBullets: boolean;
    estimatedMethod: string;
  } {
    return {
      responseLength: aiResponse.length,
      hasNewlines: /[\n\r]/.test(aiResponse),
      hasNumbering: /\d+[\.\)\:]/.test(aiResponse),
      hasBullets: /[-•*]/.test(aiResponse),
      estimatedMethod: this.estimateBestParsingMethod(aiResponse)
    };
  }

  /**
   * Estimate which parsing method will work best for a given response
   */
  private estimateBestParsingMethod(aiResponse: string): string {
    if (/\d+[\.\)\:]/.test(aiResponse)) return 'enhanced-splitting-numbered';
    if (/[-•*]/.test(aiResponse)) return 'enhanced-splitting-bullets';
    if (/[.!?]/.test(aiResponse)) return 'sentence-extraction';
    return 'word-based-extraction';
  }
}

// Export singleton instance for use in main function
export const choiceParser = new ChoiceParser();