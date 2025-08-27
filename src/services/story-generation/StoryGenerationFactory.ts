import { StoryGenerationStrategy, StoryCreationMode } from './StoryGenerationStrategy';
import { EasyModeStrategy } from './strategies/EasyModeStrategy';
import { TemplateModeStrategy } from './strategies/TemplateModeStrategy';
import { AdvancedModeStrategy } from './strategies/AdvancedModeStrategy';

export class StoryGenerationFactory {
  private static strategies = new Map<StoryCreationMode, StoryGenerationStrategy>();
  
  static {
    // Register all available strategies
    this.strategies.set(StoryCreationMode.EASY, new EasyModeStrategy());
    this.strategies.set(StoryCreationMode.TEMPLATE, new TemplateModeStrategy());
    this.strategies.set(StoryCreationMode.ADVANCED, new AdvancedModeStrategy());
  }
  
  static getStrategy(mode: StoryCreationMode): StoryGenerationStrategy {
    const strategy = this.strategies.get(mode);
    
    if (!strategy) {
      throw new Error(`No strategy found for mode: ${mode}`);
    }
    
    return strategy;
  }
  
  static getSupportedModes(): StoryCreationMode[] {
    return Array.from(this.strategies.keys());
  }
  
  static registerStrategy(mode: StoryCreationMode, strategy: StoryGenerationStrategy): void {
    this.strategies.set(mode, strategy);
  }
}