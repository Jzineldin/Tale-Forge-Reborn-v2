// Prompt Builder Service
// Handles dynamic prompt generation with template system and placeholder replacement
// Extracted from main function for better testability and maintainability

import { 
  PromptBuilderService, 
  Story, 
  Segment, 
  Character 
} from '../types/interfaces.ts';

export class PromptBuilder implements PromptBuilderService {
  
  /**
   * Build complete prompt for AI generation with context and character data
   */
  buildPrompt(
    story: Story, 
    previousSegment?: Segment | null, 
    userChoice?: string, 
    userCharacters?: Character[],
    templateContext?: any
  ): string {
    console.log(`📝 Building prompt for story: ${story.title} (${story.target_age})`);
    
    // 🎯 USE TEMPLATE CONTEXT: Priority order: templateContext > story fields > defaults
    if (templateContext) {
      console.log('🎯 Using template context for enhanced prompt generation:', {
        setting: templateContext.setting,
        theme: templateContext.theme,
        characters: templateContext.characters?.length || 0,
        conflict: templateContext.conflict,
        quest: templateContext.quest
      });
    }
    
    // Get base template for genre and age with story type
    let prompt = this.getTemplateForGenreAndAge(story.story_mode || story.genre || 'fantasy', story.target_age || '7-9', story);
    
    // Replace placeholders with actual story data (prioritizing template context)
    prompt = this.replacePlaceholders(prompt, story, userCharacters, templateContext);
    
    // Add previous segment context if available
    if (previousSegment) {
      prompt += this.buildContextSection(previousSegment, userChoice);
    }
    
    console.log(`✅ Prompt built successfully (${prompt.length} characters)`);
    console.log(`📖 Prompt preview: ${prompt.substring(0, 150)}...`);
    
    return prompt;
  }

  /**
   * Get appropriate prompt template based on story genre and target age
   */
  getTemplateForGenreAndAge(genre: string, targetAge: string, story?: Story): string {
    console.log(`🎯 Selecting template for genre: ${genre}, age: ${targetAge}`);
    
    // Get word count and complexity based on story mode (Easy/Template/Advanced)
    const { wordLimit, complexityLevel, vocabularyLevel } = this.getWordLimitAndComplexity(story || {} as Story);
    
    const storyMode = story?.template_level || story?.difficulty_level ? 'Template/Advanced' : 'Easy';
    console.log(`📏 ${storyMode} Mode - Word limit: ${wordLimit} words, Complexity: ${complexityLevel.substring(0, 30)}...`);
    
    // Base template structure with dynamic word count and complexity
    const basePrompt = `Write the next segment of an engaging children's story for ages ${targetAge}. The story should be ${genre}-themed and focus on {theme} in {setting}. Include the main characters: {characters}.

WRITING REQUIREMENTS:
- Write exactly ${wordLimit} words (count carefully)
- Complexity: ${complexityLevel}
- Language: ${vocabularyLevel}
- End with an engaging moment that leads to choices
- Make it age-appropriate and educational`;
    
    // Genre-specific enhancements
    const genreEnhancements = this.getGenreSpecificEnhancements(genre, targetAge);
    
    return basePrompt + genreEnhancements;
  }

  /**
   * Get word count limits and complexity based on story mode and parameters
   */
  private getWordLimitAndComplexity(story: Story): { wordLimit: number; complexityLevel: string; vocabularyLevel: string } {
    // Check if this is Template Mode or Advanced Mode (both use levels)
    const templateLevel = story.template_level || story.difficulty_level;
    
    if (templateLevel && typeof templateLevel === 'number') {
      // Template/Advanced Mode: Level 1-10 scaling
      const wordLimit = Math.round(30 + (templateLevel - 1) * (200 - 30) / 9); // Scale 30-200 words
      
      let complexityLevel, vocabularyLevel;
      if (templateLevel <= 3) {
        complexityLevel = 'very simple concepts, basic emotions, clear cause and effect';
        vocabularyLevel = 'simple words, short sentences, repetitive structure';
      } else if (templateLevel <= 6) {
        complexityLevel = 'moderate concepts, problem-solving, character development';
        vocabularyLevel = 'age-appropriate vocabulary, varied sentence length, descriptive language';
      } else {
        complexityLevel = 'advanced themes, complex problem-solving, deeper character arcs';
        vocabularyLevel = 'rich vocabulary, complex sentences, literary devices';
      }
      
      return { wordLimit, complexityLevel, vocabularyLevel };
    }
    
    // Easy Mode: Traditional short/medium/long
    const wordLimit = this.getEasyModeWordLimit(story.story_type);
    const complexity = this.getEasyModeComplexity(story.story_type);
    
    return { 
      wordLimit, 
      complexityLevel: complexity.complexity, 
      vocabularyLevel: complexity.vocabulary 
    };
  }

  /**
   * Get word count limits for Easy Mode
   */
  private getEasyModeWordLimit(storyType?: 'short' | 'medium' | 'long'): number {
    switch (storyType) {
      case 'short':
        return 60; // 40-80 words range, aim for middle
      case 'long':
        return 180; // 160-200 words range, aim for middle  
      case 'medium':
      default:
        return 125; // 100-150 words range, aim for middle
    }
  }

  /**
   * Get complexity settings for Easy Mode based on age groups
   */
  private getEasyModeComplexity(storyType?: 'short' | 'medium' | 'long'): { complexity: string; vocabulary: string } {
    switch (storyType) {
      case 'short': // Ages 3-6
        return {
          complexity: 'very simple concepts, basic emotions like happy/sad, simple problems with clear solutions',
          vocabulary: 'simple everyday words, short sentences, repetitive phrases, familiar concepts'
        };
      case 'medium': // Ages 6-9
        return {
          complexity: 'moderate concepts, friendship themes, basic problem-solving, simple moral lessons',
          vocabulary: 'age-appropriate vocabulary, varied sentence structure, descriptive but accessible language'
        };
      case 'long': // Ages 8-12
      default:
        return {
          complexity: 'more advanced themes, character growth, complex problem-solving, deeper moral lessons',
          vocabulary: 'richer vocabulary, complex sentence structures, metaphors and descriptive language'
        };
    }
  }

  /**
   * Get genre-specific prompt enhancements
   */
  private getGenreSpecificEnhancements(genre: string, targetAge: string): string {
    const ageCategory = this.categorizeAge(targetAge);
    
    switch (genre.toLowerCase()) {
      case 'adventure':
        return ageCategory === 'young' 
          ? '\n\nFocus on safe, exciting discoveries and simple problem-solving. Include themes of courage and friendship.'
          : '\n\nInclude exciting challenges, exploration, and character growth. Balance action with learning moments.';
      
      case 'fantasy':
        return ageCategory === 'young'
          ? '\n\nInclude gentle magic, friendly magical creatures, and wonder. Keep magic safe and positive.'
          : '\n\nIncorporate magical elements, mythical creatures, and enchanting environments. Balance fantasy with relatable emotions.';
      
      case 'educational':
        return ageCategory === 'young'
          ? '\n\nWeave in simple learning concepts naturally. Focus on basic skills, colors, numbers, or letters.'
          : '\n\nIncorporate age-appropriate educational elements like science, history, or problem-solving in an engaging way.';
      
      case 'bedtime':
        return '\n\nCreate a calming, peaceful atmosphere. Use gentle language and soothing imagery. End with a sense of comfort and security.';
      
      case 'humorous':
        return ageCategory === 'young'
          ? '\n\nInclude gentle humor, silly situations, and playful characters. Keep comedy light and age-appropriate.'
          : '\n\nUse age-appropriate humor, funny situations, and amusing character interactions. Include wordplay if suitable for age group.';
      
      case 'mystery':
        return ageCategory === 'young'
          ? '\n\nCreate simple, non-scary mysteries. Focus on curiosity and gentle problem-solving.'
          : '\n\nInclude age-appropriate mysteries with clues and logical problem-solving. Keep suspense engaging but not frightening.';
      
      case 'sci-fi':
        return ageCategory === 'young'
          ? '\n\nIntroduce simple technology concepts and space themes in an accessible way.'
          : '\n\nIncorporate age-appropriate science fiction elements, technology, and futuristic concepts with educational value.';
      
      default:
        return ageCategory === 'young'
          ? '\n\nKeep the story simple, positive, and engaging with clear moral lessons.'
          : '\n\nInclude character development, positive values, and age-appropriate challenges.';
    }
  }

  /**
   * Replace all placeholders in the prompt template
   */
  private replacePlaceholders(prompt: string, story: Story, userCharacters?: Character[], templateContext?: any): string {
    console.log('🔄 Replacing prompt placeholders...');
    
    // 🎯 CRITICAL: Use template context data with fallbacks
    const theme = templateContext?.theme || story.title || story.description || 'an adventure';
    const setting = templateContext?.setting || templateContext?.setting_description || story.story_mode || 'a magical place';
    const charactersText = this.buildCharactersText(userCharacters, templateContext?.characters);
    
    console.log('🎯 Using template values:', { theme, setting, charactersFromTemplate: templateContext?.characters?.length || 0 });
    
    prompt = prompt.replace(/\{theme\}/g, theme);
    prompt = prompt.replace(/\{setting\}/g, setting);
    prompt = prompt.replace(/\{characters\}/g, charactersText);
    
    // Add additional template context if available
    if (templateContext) {
      // Include conflict and quest in the prompt for better story direction
      if (templateContext.conflict) {
        prompt += `\n\nStory Conflict: ${templateContext.conflict}`;
      }
      if (templateContext.quest) {
        prompt += `\nMain Quest: ${templateContext.quest}`;
      }
      if (templateContext.moral_lesson) {
        prompt += `\nMoral Lesson: ${templateContext.moral_lesson}`;
      }
      if (templateContext.atmosphere) {
        prompt += `\nAtmosphere: ${templateContext.atmosphere}`;
      }
    }
    
    console.log('✅ Placeholders replaced with template context');
    return prompt;
  }

  /**
   * Build characters text for prompt inclusion
   */
  private buildCharactersText(userCharacters?: Character[], templateCharacters?: any[]): string {
    // Priority: template characters > user characters > default
    if (templateCharacters && templateCharacters.length > 0) {
      console.log('🎯 Using template characters for story generation');
      return templateCharacters
        .map(char => `${char.name}: ${char.description} (${char.role})`)
        .join(', ');
    }
    
    if (!userCharacters || userCharacters.length === 0) {
      return 'a brave main character';
    }

    const characterDescriptions = userCharacters
      .map(char => `${char.user_characters.name}: ${char.user_characters.description} (${char.user_characters.role})`)
      .join(', ');
    
    console.log(`👥 Including ${userCharacters.length} characters: ${characterDescriptions}`);
    return characterDescriptions;
  }

  /**
   * Build context section for story continuation
   */
  private buildContextSection(previousSegment: Segment, userChoice?: string): string {
    let contextSection = `\n\nPrevious story segment: ${previousSegment.segment_text}`;
    
    if (userChoice) {
      contextSection += `\n\nUser chose: ${userChoice}`;
      console.log(`🎯 User choice context added: ${userChoice}`);
    }
    
    return contextSection;
  }

  /**
   * Categorize age for template selection
   */
  private categorizeAge(targetAge: string): 'young' | 'middle' | 'older' {
    if (targetAge === '4-6' || targetAge === '3-4') {
      return 'young';
    } else if (targetAge === '7-9') {
      return 'middle';
    } else {
      return 'older';
    }
  }

  /**
   * Validate prompt quality and completeness
   */
  validatePrompt(prompt: string): {
    isValid: boolean;
    length: number;
    hasPlaceholders: boolean;
    missingPlaceholders: string[];
  } {
    const remainingPlaceholders = prompt.match(/\{[^}]+\}/g) || [];
    
    return {
      isValid: prompt.length > 50 && remainingPlaceholders.length === 0,
      length: prompt.length,
      hasPlaceholders: remainingPlaceholders.length > 0,
      missingPlaceholders: remainingPlaceholders
    };
  }

  /**
   * Get debug information about prompt construction
   */
  getPromptDebugInfo(story: Story, prompt: string): {
    storyData: {
      title: string;
      genre: string;
      targetAge: string;
      storyMode: string;
    };
    promptStats: {
      length: number;
      wordCount: number;
      hasContext: boolean;
    };
    templateInfo: {
      genre: string;
      ageCategory: string;
    };
  } {
    return {
      storyData: {
        title: story.title,
        genre: story.genre || 'unknown',
        targetAge: story.target_age,
        storyMode: story.story_mode || 'unknown'
      },
      promptStats: {
        length: prompt.length,
        wordCount: prompt.split(' ').length,
        hasContext: prompt.includes('Previous story segment:')
      },
      templateInfo: {
        genre: story.story_mode || story.genre || 'fantasy',
        ageCategory: this.categorizeAge(story.target_age || '7-9')
      }
    };
  }

  /**
   * Generate system prompt for AI providers
   */
  generateSystemPrompt(targetAge: string): string {
    const ageCategory = this.categorizeAge(targetAge);
    
    const baseSystemPrompt = 'You are an expert children\'s story writer who creates engaging, age-appropriate stories with positive messages. Always respond with valid JSON in the specified format.';
    
    switch (ageCategory) {
      case 'young':
        return baseSystemPrompt + ' Keep language very simple, use basic vocabulary, and focus on fundamental concepts like friendship, kindness, and basic learning.';
      case 'middle':
        return baseSystemPrompt + ' Use moderately complex vocabulary, include educational elements, and focus on problem-solving and character development.';
      case 'older':
        return baseSystemPrompt + ' Use age-appropriate complex vocabulary, include deeper themes like responsibility and empathy, and create engaging character arcs.';
      default:
        return baseSystemPrompt;
    }
  }
}

// Export singleton instance for use in main function
export const promptBuilder = new PromptBuilder();