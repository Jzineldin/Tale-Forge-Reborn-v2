import { StoryGenerationStrategy, StoryCreationMode, StoryGenerationContext } from '../StoryGenerationStrategy';
import { Story } from '@shared/types';
import { StoryTemplate } from '@/utils/storyTemplates';

export interface TemplateModeInput {
  templateId: string;
  template: StoryTemplate;
  childName: string;
  customizations?: {
    characterNames?: Record<string, string>;
    settingDetails?: string;
    additionalTraits?: string[];
  };
}

export class TemplateModeStrategy extends StoryGenerationStrategy {
  constructor() {
    super(StoryCreationMode.TEMPLATE);
  }
  
  protected async validateInput(data: TemplateModeInput): Promise<{ isValid: boolean; errors?: string[]; warnings?: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!data.templateId || !data.template) {
      errors.push('Template selection is required');
    }
    
    if (!data.childName || data.childName.trim().length < 2) {
      errors.push('Child name must be at least 2 characters');
    }
    
    if (data.template && !data.template.settings) {
      errors.push('Invalid template structure');
    }
    
    if (data.customizations?.additionalTraits && data.customizations.additionalTraits.length > 5) {
      warnings.push('Too many additional traits may dilute character focus');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  protected async transformData(data: TemplateModeInput): Promise<any> {
    const template = data.template;
    const settings = template.settings;
    
    // Merge template characters with customizations
    const characters = settings.characters.map(char => ({
      ...char,
      name: data.customizations?.characterNames?.[char.id] || char.name
    }));
    
    return {
      templateId: data.templateId,
      templateName: template.name,
      childName: data.childName.trim(),
      genre: settings.genre,
      theme: settings.theme,
      characters,
      setting: settings.setting,
      timePeriod: settings.timePeriod,
      atmosphere: settings.atmosphere,
      conflict: settings.conflict,
      quest: settings.quest,
      moralLesson: settings.moralLesson,
      targetAge: settings.targetAge,
      wordsPerChapter: settings.wordsPerChapter,
      customizations: data.customizations
    };
  }
  
  protected async enrichWithDefaults(data: any): Promise<any> {
    // Templates come pre-enriched, but we can add system defaults
    return {
      ...data,
      difficulty: this.calculateDifficulty(data.targetAge),
      estimatedReadingTime: Math.ceil(data.wordsPerChapter / 150), // Average reading speed
      interactiveElements: true,
      illustrationStyle: data.atmosphere.includes('whimsical') ? 'cartoon' : 'realistic'
    };
  }
  
  protected async applyModeSpecificLogic(data: any, context: StoryGenerationContext): Promise<any> {
    // Template mode specific: Apply template-specific transformations
    
    // Replace main character with child's name if appropriate
    if (data.characters && data.characters.length > 0) {
      const mainCharacter = data.characters.find((c: any) => c.role === 'main');
      if (mainCharacter) {
        mainCharacter.name = data.childName;
      }
    }
    
    // Add any additional traits to main character
    if (data.customizations?.additionalTraits) {
      const mainCharacter = data.characters.find((c: any) => c.role === 'main');
      if (mainCharacter) {
        mainCharacter.traits = [
          ...mainCharacter.traits,
          ...data.customizations.additionalTraits
        ];
      }
    }
    
    // Apply setting customizations
    if (data.customizations?.settingDetails) {
      data.setting = `${data.setting} - ${data.customizations.settingDetails}`;
    }
    
    return data;
  }
  
  protected async generatePrompt(data: any): Promise<string> {
    const characterDescriptions = data.characters
      .map((c: any) => `- ${c.name} (${c.role}): ${c.description}. Traits: ${c.traits.join(', ')}`)
      .join('\n');
    
    return `Create a ${data.genre} story based on the "${data.templateName}" template.

Main Character: ${data.childName}
Theme: ${data.theme}
Setting: ${data.setting} (${data.timePeriod})
Atmosphere: ${data.atmosphere}

Characters:
${characterDescriptions}

Plot Elements:
- Main Conflict: ${data.conflict}
- Quest/Goal: ${data.quest}
- Moral Lesson: ${data.moralLesson}

Requirements:
- Target age: ${data.targetAge} years old
- Word count per segment: ${data.wordsPerChapter}
- Maintain template structure and pacing
- Include interactive decision points
- Stay true to the template's established world`;
  }
  
  protected async buildStoryObject(data: any, prompt: string, context: StoryGenerationContext): Promise<Partial<Story>> {
    return {
      title: `${data.childName} in ${data.templateName}`,
      child_name: data.childName,
      genre: data.genre,
      theme: data.theme,
      setting: data.setting,
      difficulty: data.difficulty,
      moral_lesson: data.moralLesson,
      prompt: prompt,
      creation_mode: this.mode,
      template_id: data.templateId,
      metadata: {
        templateName: data.templateName,
        characters: data.characters,
        atmosphere: data.atmosphere,
        timePeriod: data.timePeriod,
        targetAge: data.targetAge,
        wordsPerChapter: data.wordsPerChapter,
        customizations: data.customizations
      }
    };
  }
}