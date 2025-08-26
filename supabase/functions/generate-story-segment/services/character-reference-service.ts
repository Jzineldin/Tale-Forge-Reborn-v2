// Character Reference Service
// Manages character consistency across story segments

export interface CharacterReference {
  id: string;
  story_id: string;
  character_name: string;
  reference_image_url: string;
  first_segment_id: string;
  created_at: string;
}

export interface CharacterConsistencyService {
  getCharacterReference(storyId: string): Promise<CharacterReference | null>;
  createCharacterReference(storyId: string, segmentId: string, imageUrl: string, characterName?: string): Promise<CharacterReference>;
  needsCharacterConsistency(segmentText: string, imagePrompt: string): boolean;
}

export class CharacterReferenceManager implements CharacterConsistencyService {
  
  /**
   * Check if a story already has a character reference
   */
  async getCharacterReference(storyId: string): Promise<CharacterReference | null> {
    try {
      // For now, we'll use the first segment's image as character reference
      // In Phase 2, we'll create a dedicated character_references table
      
      return null; // Will implement database lookup in Phase 2
    } catch (error) {
      console.error('Error getting character reference:', error);
      return null;
    }
  }
  
  /**
   * Create a character reference from the first segment
   */
  async createCharacterReference(
    storyId: string, 
    segmentId: string, 
    imageUrl: string, 
    characterName: string = 'Main Character'
  ): Promise<CharacterReference> {
    console.log(`📸 Creating character reference for ${characterName} in story ${storyId}`);
    
    // For Phase 1, we'll store this in memory/logs
    // Phase 2 will implement proper database storage
    const reference: CharacterReference = {
      id: `char-ref-${Date.now()}`,
      story_id: storyId,
      character_name: characterName,
      reference_image_url: imageUrl,
      first_segment_id: segmentId,
      created_at: new Date().toISOString()
    };
    
    console.log('✅ Character reference created:', reference);
    return reference;
  }
  
  /**
   * Analyze if this segment needs character consistency
   */
  needsCharacterConsistency(segmentText: string, imagePrompt: string): boolean {
    const text = segmentText.toLowerCase();
    const prompt = imagePrompt.toLowerCase();
    
    // Check for character-focused content
    const characterIndicators = [
      // Main character actions
      'aiden', 'protagonist', 'hero', 'main character',
      // Character actions  
      'he ', 'she ', 'his ', 'her ',
      // Scene types that usually show characters
      'stood', 'walked', 'looked', 'smiled', 'spoke', 'thought',
      'gazed', 'rushed', 'decided', 'realized', 'felt'
    ];
    
    const hasCharacterFocus = characterIndicators.some(indicator => 
      text.includes(indicator) || prompt.includes(indicator)
    );
    
    // Check if it's a scene type that typically shows characters
    const characterScenes = [
      'bedroom', 'classroom', 'computer room', 'laboratory'
    ];
    
    const isCharacterScene = characterScenes.some(scene => 
      text.includes(scene) || prompt.includes(scene)
    );
    
    const needsConsistency = hasCharacterFocus || isCharacterScene;
    
    if (needsConsistency) {
      console.log('🎯 Character consistency needed for this segment');
    }
    
    return needsConsistency;
  }
  
  /**
   * Extract main character name from text
   */
  extractMainCharacter(text: string): string {
    // Look for proper names (capitalized words)
    const namePattern = /\b[A-Z][a-z]+\b/g;
    const matches = text.match(namePattern) || [];
    
    // Common words to exclude
    const commonWords = new Set([
      'The', 'And', 'But', 'Or', 'As', 'In', 'On', 'At', 'To', 'For',
      'This', 'That', 'He', 'She', 'It', 'They', 'One', 'Two', 'First'
    ]);
    
    // Find the most likely character name
    for (const match of matches) {
      if (!commonWords.has(match) && match.length > 2) {
        return match;
      }
    }
    
    return 'Main Character';
  }
}

// Export singleton instance
export const characterReferenceManager = new CharacterReferenceManager();