// Intelligent Image Prompt Builder Service
// Creates coherent, stylistically consistent image prompts for children's story illustrations
// Integrates with story context, character consistency, and SDXL best practices

import { Story, Segment, Character } from '../types/interfaces.ts';

export interface ImagePromptBuilderService {
  buildImagePrompt(
    story: Story,
    segmentText: string,
    previousSegments?: Segment[],
    userCharacters?: Character[]
  ): string;
}

export class ImagePromptBuilder implements ImagePromptBuilderService {
  
  /**
   * Build intelligent image prompt synchronized with story content
   */
  buildImagePrompt(
    story: Story,
    segmentText: string,
    previousSegments: Segment[] = [],
    userCharacters: Character[] = []
  ): string {
    console.log('🎨 Building intelligent image prompt...');
    
    // Extract key visual elements from the segment
    const visualElements = this.extractVisualElements(segmentText);
    
    // Get character descriptions for consistency
    const characterDescriptions = this.buildCharacterDescriptions(userCharacters, segmentText);
    
    // Determine optimal art style for the story
    const artStyle = this.determineArtStyle(story);
    
    // Build scene composition
    const sceneComposition = this.buildSceneComposition(visualElements, segmentText);
    
    // Apply children's book illustration best practices
    const enhancedPrompt = this.applyChildrensBookTechniques(
      sceneComposition,
      characterDescriptions,
      artStyle,
      story.target_age || '7-9'
    );
    
    console.log('🎨 Generated intelligent image prompt:', enhancedPrompt.substring(0, 100) + '...');
    return enhancedPrompt;
  }

  /**
   * Extract visual elements from story text using NLP-like analysis
   */
  private extractVisualElements(text: string): {
    setting: string;
    atmosphere: string;
    characters: string[];
    actions: string[];
    objects: string[];
  } {
    // Extract key visual components from the text
    const setting = this.extractSetting(text);
    const atmosphere = this.extractAtmosphere(text);
    const characters = this.extractCharacterMentions(text);
    const actions = this.extractActions(text);
    const objects = this.extractImportantObjects(text);
    
    return { setting, atmosphere, characters, actions, objects };
  }

  /**
   * Extract setting/location from text - ENHANCED WITH SCENE DETECTION
   */
  private extractSetting(text: string): string {
    const lowercaseText = text.toLowerCase();
    
    // Priority settings (more specific scenes first)
    const settingKeywords = {
      // Indoor/specific locations
      'bedroom': ['bedroom', 'bed room', 'his room', 'her room', 'slept', 'pillow', 'bedside'],
      'classroom': ['classroom', 'class room', 'teacher', 'students', 'school', 'desk', 'blackboard'],
      'laboratory': ['laboratory', 'lab', 'experiment', 'beaker', 'microscope', 'test tube'],
      'library': ['library', 'books', 'shelves', 'reading', 'librarian'],
      'computer room': ['computer', 'typed', 'keyboard', 'screen', 'internet', 'website'],
      
      // Outdoor/fantasy locations
      'space': ['space', 'galaxy', 'stars', 'planet', 'nebula', 'spacecraft', 'universe', 'cosmic'],
      'city': ['city', 'skyline', 'buildings', 'street', 'urban', 'downtown'],
      'forest': ['forest', 'woods', 'trees', 'woodland', 'grove'],
      'ocean': ['ocean', 'sea', 'beach', 'shore', 'waves', 'underwater'],
      'castle': ['castle', 'palace', 'tower', 'throne room', 'courtyard'],
      'village': ['village', 'town', 'cottage', 'marketplace'],
      'mountain': ['mountain', 'peak', 'cliff', 'valley', 'cave'],
      'magical realm': ['magical', 'enchanted', 'mystical', 'glowing', 'shimmering', 'portal']
    };

    // Check for specific scene indicators first
    for (const [setting, keywords] of Object.entries(settingKeywords)) {
      if (keywords.some(keyword => lowercaseText.includes(keyword))) {
        return setting;
      }
    }
    
    return 'mysterious place';
  }

  /**
   * Extract atmospheric mood from text
   */
  private extractAtmosphere(text: string): string {
    const atmosphereKeywords = {
      'mysterious and enchanting': ['mysterious', 'secret', 'hidden', 'whispered'],
      'bright and cheerful': ['bright', 'sunny', 'cheerful', 'happy', 'joyful'],
      'magical and wondrous': ['magical', 'glowing', 'shimmering', 'sparkling'],
      'adventurous and exciting': ['adventure', 'exciting', 'thrilling', 'brave'],
      'peaceful and serene': ['peaceful', 'calm', 'gentle', 'quiet', 'serene'],
      'dramatic and epic': ['dramatic', 'epic', 'grand', 'magnificent']
    };

    const lowercaseText = text.toLowerCase();
    
    for (const [atmosphere, keywords] of Object.entries(atmosphereKeywords)) {
      if (keywords.some(keyword => lowercaseText.includes(keyword))) {
        return atmosphere;
      }
    }
    
    return 'warm and inviting';
  }

  /**
   * Extract character mentions from text - ENHANCED VERSION
   */
  private extractCharacterMentions(text: string): string[] {
    const characters: string[] = [];
    
    // Look for proper character names (keep original case)
    const characterPatterns = [
      /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g, // Multi-word names like "Neo Terra City", "Dr. Elara Nova"
      /\b[A-Z][a-z]+\b/g, // Single names like "Aiden", "Zorlon"
    ];
    
    // Common words to exclude (expanded list)
    const commonWords = new Set([
      'The', 'And', 'But', 'Or', 'As', 'In', 'On', 'At', 'To', 'For', 'With', 'By',
      'This', 'That', 'These', 'Those', 'He', 'She', 'It', 'They', 'We', 'You',
      'His', 'Her', 'Its', 'Their', 'Our', 'Your', 'One', 'Two', 'Three',
      'First', 'Second', 'Third', 'Next', 'Last', 'New', 'Old', 'Good', 'Great'
    ]);
    
    // Extract multi-word proper nouns first (higher priority)
    const multiWordMatches = text.match(characterPatterns[0]) || [];
    multiWordMatches.forEach(match => {
      if (!commonWords.has(match) && match.length > 2) {
        characters.push(match); // Keep original case for proper nouns
      }
    });
    
    // Then extract single words not already captured
    const singleWordMatches = text.match(characterPatterns[1]) || [];
    singleWordMatches.forEach(match => {
      if (!commonWords.has(match) && match.length > 2 && 
          !characters.some(existing => existing.includes(match))) {
        characters.push(match); // Keep original case
      }
    });
    
    return [...new Set(characters)]; // Remove duplicates
  }

  /**
   * Extract action words for dynamic composition
   */
  private extractActions(text: string): string[] {
    const actionWords = [
      'running', 'jumping', 'flying', 'swimming', 'climbing', 'dancing',
      'exploring', 'discovering', 'searching', 'fighting', 'protecting',
      'laughing', 'singing', 'playing', 'reading', 'writing', 'drawing',
      'standing', 'sitting', 'walking', 'looking', 'pointing', 'reaching'
    ];
    
    const lowercaseText = text.toLowerCase();
    return actionWords.filter(action => lowercaseText.includes(action));
  }

  /**
   * Extract important objects/props for the scene
   */
  private extractImportantObjects(text: string): string[] {
    const objectKeywords = [
      'sword', 'book', 'crystal', 'crown', 'staff', 'wand', 'scroll',
      'treasure', 'map', 'key', 'door', 'bridge', 'boat', 'horse',
      'flower', 'tree', 'stone', 'gem', 'mirror', 'lantern', 'candle'
    ];
    
    const lowercaseText = text.toLowerCase();
    return objectKeywords.filter(obj => lowercaseText.includes(obj));
  }

  /**
   * Build character descriptions for visual consistency
   */
  private buildCharacterDescriptions(characters: Character[], segmentText: string): string {
    if (characters.length === 0) {
      // Extract character details from text
      const mentionedCharacters = this.extractCharacterMentions(segmentText);
      if (mentionedCharacters.length > 0) {
        return `featuring ${mentionedCharacters.join(', ')}`;
      }
      return '';
    }
    
    // Build detailed character descriptions
    const descriptions = characters.map(char => {
      return `${char.name} (${char.description || 'a brave young protagonist'})`;
    }).join(', ');
    
    return `featuring ${descriptions}`;
  }

  /**
   * Determine optimal art style based on story context
   */
  private determineArtStyle(story: Story): string {
    const genre = story.story_mode || story.genre || 'fantasy';
    const ageGroup = story.target_age || '7-9';
    
    // Art style mapping based on genre and age
    const styleMap: { [key: string]: { [key: string]: string } } = {
      'fantasy': {
        '4-6': 'watercolor painting, soft pastel colors, whimsical style',
        '7-9': 'digital illustration, vibrant colors, detailed fantasy art',
        '10-12': 'digital fantasy art, rich colors, epic illustration style'
      },
      'adventure': {
        '4-6': 'cartoon illustration, bright cheerful colors, simple shapes',
        '7-9': 'adventure book illustration, dynamic composition, bold colors',
        '10-12': 'adventure comic style, detailed artwork, dramatic lighting'
      },
      'science fiction': {
        '4-6': 'cute sci-fi cartoon, pastel space colors, friendly robots',
        '7-9': 'sci-fi illustration, glowing effects, futuristic style',
        '10-12': 'detailed sci-fi art, cinematic lighting, space opera style'
      },
      'mystery': {
        '4-6': 'gentle mystery illustration, soft shadows, cozy atmosphere',
        '7-9': 'mystery book illustration, dramatic shadows, intriguing composition',
        '10-12': 'detective story art, noir influences, atmospheric lighting'
      }
    };
    
    return styleMap[genre.toLowerCase()]?.[ageGroup] || 
           'children\'s book illustration, watercolor style, warm inviting colors';
  }

  /**
   * Build scene composition based on visual elements - ENHANCED
   */
  private buildSceneComposition(visualElements: any, segmentText: string): string {
    const { setting, atmosphere, characters, actions, objects } = visualElements;
    
    // Build more natural composition
    let composition = `A ${atmosphere} scene in a ${setting}`;
    
    // Add main character (keep proper case)
    if (characters.length > 0) {
      const mainCharacter = characters[0];
      composition += ` featuring ${mainCharacter}`;
      
      // Add secondary characters if present
      if (characters.length > 1) {
        const secondaryChars = characters.slice(1, 3); // Max 2 additional
        composition += ` with ${secondaryChars.join(' and ')}`;
      }
    }
    
    // Add primary action if present
    if (actions.length > 0) {
      const action = actions[0];
      composition += ` ${action}ing`;
    }
    
    // Add key objects (limit to most relevant)
    if (objects.length > 0) {
      const keyObjects = objects.slice(0, 2);
      composition += ` with ${keyObjects.join(' and ')}`;
    }
    
    return composition;
  }

  /**
   * Apply SDXL children's book illustration best practices
   */
  private applyChildrensBookTechniques(
    sceneComposition: string,
    characterDescriptions: string,
    artStyle: string,
    ageGroup: string
  ): string {
    // Build the optimized prompt using 2025 SDXL best practices
    const basePrompt = `${sceneComposition}${characterDescriptions ? ', ' + characterDescriptions : ''}`;
    
    // Age-appropriate modifications
    const ageModifiers = {
      '4-6': 'simple shapes, thick bold lines, very bright happy colors, cute characters',
      '7-9': 'detailed illustration, vibrant colors, engaging characters, clear composition',
      '10-12': 'sophisticated artwork, rich detailed colors, complex composition, realistic proportions'
    };
    
    const ageModifier = ageModifiers[ageGroup as keyof typeof ageModifiers] || ageModifiers['7-9'];
    
    // Build final SDXL-optimized prompt
    const finalPrompt = [
      basePrompt,
      artStyle,
      ageModifier,
      'children\'s book illustration, storybook art, picture book style',
      'high quality, detailed, professional illustration',
      'warm lighting, inviting atmosphere, child-friendly'
    ].join(', ');
    
    // Add negative prompt elements inline
    const negativeElements = 'scary, violent, inappropriate, adult content, ugly, blurry, low quality, distorted, nsfw, dark, frightening';
    
    return `${finalPrompt}. NEGATIVE: ${negativeElements}`;
  }
}

// Export singleton instance
export const imagePromptBuilder = new ImagePromptBuilder();