// Simple Credit System
// 1 credit = 1 story segment (text + image)

export interface StorySpecs {
  chapters: number;
  wordsPerChapter: number;
}

export interface CreditCalculation {
  total: number;
  breakdown: string[];
}

export interface AudioCost {
  available: boolean;
  cost: number;
  requiresSubscription: boolean;
}

/**
 * Calculate story cost: 1 credit per chapter (includes text + image)
 */
export function calculateStoryCredits(specs: StorySpecs): CreditCalculation {
  const { chapters } = specs;
  
  // Simple: 1 credit per chapter (text + image included)
  const total = chapters;
  
  // Simple breakdown
  const breakdown = [
    `${chapters} chapter${chapters === 1 ? '' : 's'} = ${total} credit${total === 1 ? '' : 's'}`,
    'Includes story text and images'
  ];
  
  return {
    total,
    breakdown
  };
}

/**
 * Calculate audio cost: 1 credit per 100 words (scales with actual content)
 */
export function calculateAudioCost(specs: StorySpecs): AudioCost {
  const { chapters, wordsPerChapter } = specs;
  const totalWords = chapters * wordsPerChapter;
  
  // 1 credit per 100 words, rounded up
  const creditsNeeded = Math.ceil(totalWords / 100);
  
  return {
    available: true, // Available to premium users only
    cost: creditsNeeded, // 1 credit per 100 words
    requiresSubscription: true // Premium subscription required
  };
}

/**
 * Get estimated reading time based on average reading speed
 */
export function estimateReadingTime(specs: StorySpecs): string {
  const totalWords = specs.chapters * specs.wordsPerChapter;
  const averageReadingSpeed = 200; // words per minute
  const minutes = Math.ceil(totalWords / averageReadingSpeed);
  
  if (minutes === 1) return '1 min read';
  if (minutes < 60) return `${minutes} min read`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) return `${hours} hour read`;
  return `${hours}h ${remainingMinutes}m read`;
}

/**
 * Validate story specifications
 */
export function validateStorySpecs(specs: StorySpecs): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (specs.chapters < 1) errors.push('Must have at least 1 chapter');
  if (specs.chapters > 10) errors.push('Maximum 10 chapters allowed');
  if (specs.wordsPerChapter < 100) errors.push('Minimum 100 words per chapter');
  if (specs.wordsPerChapter > 400) errors.push('Maximum 400 words per chapter');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get smart defaults for custom template creation
 */
export function getSmartDefaults(): StorySpecs {
  return {
    chapters: 5,        // Sweet spot for engagement
    wordsPerChapter: 200 // Perfect for quick reading
  };
}

/**
 * Pre-calculate costs for all pre-made templates (simplified)
 */
export function getPreMadeTemplateCosts() {
  return {
    'magical-adventure': 5, // 5 chapters = 5 credits
    'space-explorer': 4,    // 4 chapters = 4 credits  
    'pirate-treasure': 6,   // 6 chapters = 6 credits
    'animal-rescue': 3,     // 3 chapters = 3 credits
    'time-travel': 5,       // 5 chapters = 5 credits
    'underwater-kingdom': 4 // 4 chapters = 4 credits
  };
}