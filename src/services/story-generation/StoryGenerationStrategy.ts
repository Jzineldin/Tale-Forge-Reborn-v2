// Unified Story Generation Strategy Pattern
// Provides a single interface for all story creation modes

import { Story } from '@shared/types';

export enum StoryCreationMode {
  EASY = 'easy',
  TEMPLATE = 'template',
  ADVANCED = 'advanced'
}

export interface StoryGenerationContext {
  mode: StoryCreationMode;
  userId: string;
  rawData: any;
  metadata?: {
    templateId?: string;
    sessionId?: string;
    createdAt: Date;
  };
}

export interface StoryGenerationResult {
  story: Partial<Story>;
  validationErrors?: string[];
  warnings?: string[];
  metadata?: Record<string, any>;
}

// Abstract strategy interface
export abstract class StoryGenerationStrategy {
  protected mode: StoryCreationMode;
  
  constructor(mode: StoryCreationMode) {
    this.mode = mode;
  }
  
  // Template method pattern for story generation flow
  async generateStory(context: StoryGenerationContext): Promise<StoryGenerationResult> {
    // 1. Validate input
    const validation = await this.validateInput(context.rawData);
    if (!validation.isValid) {
      return {
        story: {},
        validationErrors: validation.errors
      };
    }
    
    // 2. Transform data to unified format
    const transformedData = await this.transformData(context.rawData);
    
    // 3. Enrich with defaults
    const enrichedData = await this.enrichWithDefaults(transformedData);
    
    // 4. Apply mode-specific processing
    const processedData = await this.applyModeSpecificLogic(enrichedData, context);
    
    // 5. Generate prompt
    const prompt = await this.generatePrompt(processedData);
    
    // 6. Build final story object
    const story = await this.buildStoryObject(processedData, prompt, context);
    
    return {
      story,
      warnings: validation.warnings,
      metadata: {
        mode: this.mode,
        processingTime: Date.now() - context.metadata?.createdAt.getTime()!
      }
    };
  }
  
  // Abstract methods to be implemented by specific strategies
  protected abstract validateInput(data: any): Promise<{ isValid: boolean; errors?: string[]; warnings?: string[] }>;
  protected abstract transformData(data: any): Promise<any>;
  protected abstract enrichWithDefaults(data: any): Promise<any>;
  protected abstract applyModeSpecificLogic(data: any, context: StoryGenerationContext): Promise<any>;
  protected abstract generatePrompt(data: any): Promise<string>;
  protected abstract buildStoryObject(data: any, prompt: string, context: StoryGenerationContext): Promise<Partial<Story>>;
  
  // Shared utility methods
  protected calculateDifficulty(age: number): number {
    if (age <= 3) return 1;
    if (age <= 5) return 3;
    if (age <= 7) return 5;
    if (age <= 10) return 7;
    return 9;
  }
  
  protected calculateWordCount(difficulty: string | number): number {
    const difficultyMap: Record<string, number> = {
      'short': 80,
      'medium': 120,
      'long': 200,
      '1': 80,
      '2': 90,
      '3': 100,
      '4': 110,
      '5': 120,
      '6': 140,
      '7': 160,
      '8': 180,
      '9': 200,
      '10': 250
    };
    
    return difficultyMap[difficulty.toString()] || 120;
  }
  
  protected generateStoryTitle(data: any): string {
    const { characterName, genre, theme } = data;
    const templates = [
      `${characterName}'s ${genre} Adventure`,
      `The ${theme} of ${characterName}`,
      `${characterName} and the ${genre} Quest`,
      `A ${theme} Tale of ${characterName}`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }
}