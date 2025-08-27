// Unified Story Generation Service
// Single entry point for all story creation modes

export { StoryGenerationFactory } from './StoryGenerationFactory';
export { StoryGenerationStrategy, StoryCreationMode, StoryGenerationContext, StoryGenerationResult } from './StoryGenerationStrategy';
export { EasyModeStrategy, type EasyModeInput } from './strategies/EasyModeStrategy';
export { TemplateModeStrategy, type TemplateModeInput } from './strategies/TemplateModeStrategy';
export { AdvancedModeStrategy, type AdvancedModeInput } from './strategies/AdvancedModeStrategy';

import { StoryGenerationFactory } from './StoryGenerationFactory';
import { StoryCreationMode, StoryGenerationContext } from './StoryGenerationStrategy';

// Convenience function for story generation
export async function generateStory(mode: StoryCreationMode, context: StoryGenerationContext) {
  const strategy = StoryGenerationFactory.getStrategy(mode);
  return await strategy.generateStory(context);
}