import { StoryGenerationStrategy, StoryCreationMode, StoryGenerationContext } from '../StoryGenerationStrategy';
import { Story } from '@shared/types';

export interface EasyModeInput {
  difficulty: 'short' | 'medium' | 'long';
  genre: string;
  characterName: string;
  characterTraits: string[];
  storySeed?: string;
}

export class EasyModeStrategy extends StoryGenerationStrategy {
  constructor() {
    super(StoryCreationMode.EASY);
  }
  
  protected async validateInput(data: EasyModeInput): Promise<{ isValid: boolean; errors?: string[]; warnings?: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!data.difficulty) {
      errors.push('Story length is required');
    }
    
    if (!data.genre) {
      errors.push('Genre selection is required');
    }
    
    if (!data.characterName || data.characterName.trim().length < 2) {
      errors.push('Character name must be at least 2 characters');
    }
    
    if (data.characterName && data.characterName.length > 20) {
      warnings.push('Character name is quite long, consider shortening it');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  protected async transformData(data: EasyModeInput): Promise<any> {
    return {
      characterName: data.characterName.trim(),
      genre: data.genre,
      difficulty: data.difficulty,
      traits: data.characterTraits || [],
      storySeed: data.storySeed || '',
      wordCount: this.calculateWordCount(data.difficulty)
    };
  }
  
  protected async enrichWithDefaults(data: any): Promise<any> {
    const genreDefaults: Record<string, any> = {
      'adventure': {
        theme: 'Courage and Discovery',
        atmosphere: 'Exciting and Mysterious',
        setting: 'Enchanted Forest'
      },
      'fantasy': {
        theme: 'Magic and Wonder',
        atmosphere: 'Mystical and Dreamlike',
        setting: 'Magical Kingdom'
      },
      'space': {
        theme: 'Exploration and Science',
        atmosphere: 'Futuristic and Vast',
        setting: 'Distant Galaxy'
      },
      'animals': {
        theme: 'Friendship and Nature',
        atmosphere: 'Warm and Playful',
        setting: 'Forest Meadow'
      }
    };
    
    const defaults = genreDefaults[data.genre] || genreDefaults['adventure'];
    
    return {
      ...data,
      theme: defaults.theme,
      atmosphere: defaults.atmosphere,
      setting: defaults.setting,
      timePeriod: 'Contemporary',
      moralLesson: 'Kindness and perseverance lead to success'
    };
  }
  
  protected async applyModeSpecificLogic(data: any, context: StoryGenerationContext): Promise<any> {
    // Easy mode specific: Generate simple character traits if not provided
    if (!data.traits || data.traits.length === 0) {
      data.traits = ['brave', 'curious', 'kind'];
    }
    
    // Generate a simple conflict based on genre
    const genreConflicts: Record<string, string> = {
      'adventure': 'Must find a hidden treasure',
      'fantasy': 'Must save the kingdom from darkness',
      'space': 'Must return home from a distant planet',
      'animals': 'Must help a friend in need'
    };
    
    data.conflict = genreConflicts[data.genre] || 'Must overcome a challenge';
    
    return data;
  }
  
  protected async generatePrompt(data: any): Promise<string> {
    const { characterName, genre, theme, setting, traits, conflict, wordCount } = data;
    
    return `Create a ${genre} story for young children featuring ${characterName}, who is ${traits.join(', ')}.
    
Setting: ${setting}
Theme: ${theme}
Main Challenge: ${conflict}
Story Length: Approximately ${wordCount} words per segment

Requirements:
- Age-appropriate language and themes
- Positive and encouraging tone
- Clear moral lesson
- Interactive choices at key moments
- Vivid but simple descriptions`;
  }
  
  protected async buildStoryObject(data: any, prompt: string, context: StoryGenerationContext): Promise<Partial<Story>> {
    return {
      title: this.generateStoryTitle(data),
      child_name: data.characterName,
      genre: data.genre,
      theme: data.theme,
      setting: data.setting,
      difficulty: this.calculateDifficulty(5), // Default age 5 for easy mode
      moral_lesson: data.moralLesson,
      prompt: prompt,
      creation_mode: this.mode,
      metadata: {
        traits: data.traits,
        atmosphere: data.atmosphere,
        wordCount: data.wordCount
      }
    };
  }
}