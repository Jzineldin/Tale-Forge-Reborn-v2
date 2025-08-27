import { StoryGenerationStrategy, StoryCreationMode, StoryGenerationContext } from '../StoryGenerationStrategy';
import { Story } from '@shared/types';

export interface AdvancedModeInput {
  // Step 1: Story Concept
  childName: string;
  difficulty: number; // 1-10
  wordsPerChapter: number;
  genre: string;
  theme: string;
  
  // Step 2: Characters
  characters: Array<{
    id: string;
    name: string;
    description: string;
    role: string;
    traits: string[];
  }>;
  
  // Step 3: Setting
  location: string;
  timePeriod: string;
  atmosphere: string;
  settingDescription: string;
  
  // Step 4: Plot Elements
  conflict: string;
  quest: string;
  moralLesson: string;
  
  // Step 5: Additional
  additionalDetails: string;
  specialRequests?: string;
  avoidTopics?: string[];
}

export class AdvancedModeStrategy extends StoryGenerationStrategy {
  constructor() {
    super(StoryCreationMode.ADVANCED);
  }
  
  protected async validateInput(data: AdvancedModeInput): Promise<{ isValid: boolean; errors?: string[]; warnings?: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Step 1 validations
    if (!data.childName || data.childName.trim().length < 2) {
      errors.push('Child name must be at least 2 characters');
    }
    
    if (!data.difficulty || data.difficulty < 1 || data.difficulty > 10) {
      errors.push('Difficulty must be between 1 and 10');
    }
    
    if (!data.wordsPerChapter || data.wordsPerChapter < 50 || data.wordsPerChapter > 500) {
      errors.push('Words per chapter must be between 50 and 500');
    }
    
    if (!data.genre) {
      errors.push('Genre is required');
    }
    
    if (!data.theme) {
      errors.push('Theme is required');
    }
    
    // Step 2 validations
    if (!data.characters || data.characters.length === 0) {
      errors.push('At least one character is required');
    } else {
      const hasMainCharacter = data.characters.some(c => c.role === 'main');
      if (!hasMainCharacter) {
        warnings.push('No main character designated');
      }
      
      if (data.characters.length > 10) {
        warnings.push('Too many characters may make the story complex');
      }
    }
    
    // Step 3 validations
    if (!data.location) {
      errors.push('Location is required');
    }
    
    if (!data.timePeriod) {
      errors.push('Time period is required');
    }
    
    if (!data.atmosphere) {
      errors.push('Atmosphere is required');
    }
    
    // Step 4 validations
    if (!data.conflict) {
      errors.push('Story conflict is required');
    }
    
    if (!data.quest) {
      errors.push('Quest or goal is required');
    }
    
    if (!data.moralLesson) {
      warnings.push('No moral lesson specified');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  protected async transformData(data: AdvancedModeInput): Promise<any> {
    return {
      childName: data.childName.trim(),
      difficulty: data.difficulty,
      wordsPerChapter: data.wordsPerChapter,
      genre: data.genre,
      theme: data.theme,
      characters: data.characters.map(char => ({
        ...char,
        name: char.name.trim(),
        description: char.description.trim(),
        traits: char.traits.filter(t => t.length > 0)
      })),
      location: data.location.trim(),
      timePeriod: data.timePeriod.trim(),
      atmosphere: data.atmosphere.trim(),
      settingDescription: data.settingDescription?.trim() || '',
      conflict: data.conflict.trim(),
      quest: data.quest.trim(),
      moralLesson: data.moralLesson?.trim() || '',
      additionalDetails: data.additionalDetails?.trim() || '',
      specialRequests: data.specialRequests?.trim() || '',
      avoidTopics: data.avoidTopics || []
    };
  }
  
  protected async enrichWithDefaults(data: any): Promise<any> {
    // Advanced mode has minimal defaults as user provides everything
    return {
      ...data,
      estimatedAge: this.difficultyToAge(data.difficulty),
      storyStructure: this.determineStructure(data.wordsPerChapter),
      narrativeStyle: this.determineNarrativeStyle(data.difficulty),
      languageComplexity: this.determineLanguageComplexity(data.difficulty)
    };
  }
  
  protected async applyModeSpecificLogic(data: any, context: StoryGenerationContext): Promise<any> {
    // Advanced mode: Apply sophisticated story crafting logic
    
    // Ensure main character uses child's name if appropriate
    const mainCharacter = data.characters.find((c: any) => c.role === 'main');
    if (mainCharacter && !mainCharacter.name) {
      mainCharacter.name = data.childName;
    }
    
    // Generate character relationships
    data.characterRelationships = this.generateCharacterRelationships(data.characters);
    
    // Enhance setting with sensory details
    data.enhancedSetting = this.enhanceSetting(data);
    
    // Create plot arc structure
    data.plotStructure = this.generatePlotStructure(data);
    
    // Add pacing guidelines
    data.pacingGuidelines = this.determinePacing(data.wordsPerChapter, data.difficulty);
    
    return data;
  }
  
  protected async generatePrompt(data: any): Promise<string> {
    const characterDescriptions = data.characters
      .map((c: any) => `- ${c.name} (${c.role}): ${c.description}. Traits: ${c.traits.join(', ')}`)
      .join('\n');
    
    const avoidanceNote = data.avoidTopics.length > 0 
      ? `\n\nTopics to avoid: ${data.avoidTopics.join(', ')}`
      : '';
    
    const specialRequestsNote = data.specialRequests 
      ? `\n\nSpecial requests: ${data.specialRequests}`
      : '';
    
    return `Create an advanced, carefully crafted ${data.genre} story with the following specifications:

STORY FOUNDATION:
- Main Character: ${data.childName}
- Theme: ${data.theme}
- Difficulty Level: ${data.difficulty}/10 (Age ~${data.estimatedAge})
- Words per segment: ${data.wordsPerChapter}

WORLD BUILDING:
- Location: ${data.location}
- Time Period: ${data.timePeriod}
- Atmosphere: ${data.atmosphere}
- Setting Details: ${data.settingDescription}
${data.enhancedSetting}

CHARACTERS:
${characterDescriptions}

Character Relationships:
${data.characterRelationships}

PLOT STRUCTURE:
- Central Conflict: ${data.conflict}
- Quest/Goal: ${data.quest}
- Moral Lesson: ${data.moralLesson}
- Additional Context: ${data.additionalDetails}

Plot Arc:
${data.plotStructure}

WRITING GUIDELINES:
- Narrative Style: ${data.narrativeStyle}
- Language Complexity: ${data.languageComplexity}
- Pacing: ${data.pacingGuidelines}
- Include rich descriptions and character development
- Create meaningful interactive choice points
- Ensure emotional depth appropriate for age${avoidanceNote}${specialRequestsNote}

Create a sophisticated, engaging story that balances all these elements while maintaining age-appropriateness and educational value.`;
  }
  
  protected async buildStoryObject(data: any, prompt: string, context: StoryGenerationContext): Promise<Partial<Story>> {
    return {
      title: this.generateAdvancedTitle(data),
      child_name: data.childName,
      genre: data.genre,
      theme: data.theme,
      setting: `${data.location} - ${data.timePeriod}`,
      difficulty: data.difficulty,
      moral_lesson: data.moralLesson,
      prompt: prompt,
      creation_mode: this.mode,
      metadata: {
        characters: data.characters,
        atmosphere: data.atmosphere,
        settingDescription: data.settingDescription,
        conflict: data.conflict,
        quest: data.quest,
        wordsPerChapter: data.wordsPerChapter,
        additionalDetails: data.additionalDetails,
        specialRequests: data.specialRequests,
        avoidTopics: data.avoidTopics,
        characterRelationships: data.characterRelationships,
        plotStructure: data.plotStructure,
        narrativeStyle: data.narrativeStyle,
        languageComplexity: data.languageComplexity
      }
    };
  }
  
  // Helper methods specific to advanced mode
  private difficultyToAge(difficulty: number): number {
    const ageMap: Record<number, number> = {
      1: 3, 2: 4, 3: 5, 4: 6, 5: 7,
      6: 8, 7: 9, 8: 10, 9: 11, 10: 12
    };
    return ageMap[difficulty] || 7;
  }
  
  private determineStructure(wordsPerChapter: number): string {
    if (wordsPerChapter < 100) return 'Short episodic chapters';
    if (wordsPerChapter < 200) return 'Standard chapter structure';
    return 'Extended narrative chapters';
  }
  
  private determineNarrativeStyle(difficulty: number): string {
    if (difficulty <= 3) return 'Simple, present tense, direct narration';
    if (difficulty <= 6) return 'Past tense with basic descriptions';
    if (difficulty <= 8) return 'Rich descriptions with varied sentence structure';
    return 'Complex narrative with subplots and foreshadowing';
  }
  
  private determineLanguageComplexity(difficulty: number): string {
    if (difficulty <= 3) return 'Basic vocabulary, simple sentences';
    if (difficulty <= 6) return 'Moderate vocabulary, compound sentences';
    if (difficulty <= 8) return 'Advanced vocabulary, complex sentences';
    return 'Sophisticated language with literary devices';
  }
  
  private generateCharacterRelationships(characters: any[]): string {
    if (characters.length < 2) return 'Focus on main character\'s internal journey';
    
    const main = characters.find(c => c.role === 'main');
    const others = characters.filter(c => c.role !== 'main');
    
    return others.map(char => {
      const relationship = char.role === 'antagonist' ? 'conflicts with' : 'allies with';
      return `${main?.name || 'Main character'} ${relationship} ${char.name}`;
    }).join('\n');
  }
  
  private enhanceSetting(data: any): string {
    return `
Enhanced Setting Elements:
- Visual: ${this.generateVisualDescription(data.atmosphere)}
- Auditory: ${this.generateAuditoryDescription(data.location)}
- Emotional: ${data.atmosphere}
- Cultural Context: ${data.timePeriod}`;
  }
  
  private generateVisualDescription(atmosphere: string): string {
    const visualMap: Record<string, string> = {
      'mysterious': 'Shadows dance, mist swirls, dim lighting',
      'bright': 'Vibrant colors, clear skies, sparkling elements',
      'cozy': 'Warm colors, soft textures, inviting spaces',
      'adventurous': 'Wide vistas, varied terrain, dynamic elements'
    };
    
    for (const [key, value] of Object.entries(visualMap)) {
      if (atmosphere.toLowerCase().includes(key)) {
        return value;
      }
    }
    return 'Rich, detailed visual environment';
  }
  
  private generateAuditoryDescription(location: string): string {
    const audioMap: Record<string, string> = {
      'forest': 'Rustling leaves, bird songs, crackling twigs',
      'city': 'Bustling crowds, traffic, urban rhythms',
      'ocean': 'Crashing waves, seagulls, ocean breeze',
      'space': 'Humming engines, beeping computers, vast silence'
    };
    
    for (const [key, value] of Object.entries(audioMap)) {
      if (location.toLowerCase().includes(key)) {
        return value;
      }
    }
    return 'Ambient environmental sounds';
  }
  
  private generatePlotStructure(data: any): string {
    return `
1. Setup: Introduce ${data.childName} in ${data.location}
2. Inciting Incident: ${data.conflict} emerges
3. Rising Action: Quest for ${data.quest} begins
4. Climax: Major challenge testing ${data.theme}
5. Resolution: ${data.moralLesson} realized`;
  }
  
  private determinePacing(wordsPerChapter: number, difficulty: number): string {
    const pace = wordsPerChapter < 150 ? 'Quick' : wordsPerChapter < 250 ? 'Moderate' : 'Deliberate';
    const complexity = difficulty < 4 ? 'simple' : difficulty < 7 ? 'moderate' : 'complex';
    return `${pace} pacing with ${complexity} plot development`;
  }
  
  private generateAdvancedTitle(data: any): string {
    const { childName, genre, theme, quest } = data;
    
    // More sophisticated title generation for advanced mode
    const templates = [
      `${childName} and the ${quest}`,
      `The ${theme} Chronicles: ${childName}'s Journey`,
      `${childName}: A ${genre} Tale of ${theme}`,
      `The ${quest}: ${childName}'s ${genre} Adventure`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }
}