// Ultra-Safe Content Validation and Sanitization
// This module provides comprehensive content safety for Tale-Forge

export interface SafetyValidationResult {
  isValid: boolean;
  issues: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  sanitizedContent?: string;
  action: 'approve' | 'sanitize' | 'block' | 'manual_review';
}

export interface ContentSafetyConfig {
  maxNameLength: number;
  maxTraits: number;
  allowedCharacters: RegExp;
  blockedWords: string[];
  strictMode: boolean;
}

// Default safety configuration
export const DEFAULT_SAFETY_CONFIG: ContentSafetyConfig = {
  maxNameLength: 50,
  maxTraits: 5,
  allowedCharacters: /^[a-zA-Z\s\-'.,!?]+$/,
  blockedWords: [
    // Profanity and inappropriate content (starter list)
    'damn', 'hell', 'stupid', 'hate', 'kill', 'die', 'death', 'blood',
    'violence', 'weapon', 'gun', 'knife', 'fight', 'hurt', 'pain',
    // Add more as needed - this should be externally configurable
  ],
  strictMode: true // Always use strict mode for children's content
};

/**
 * Sanitizes user input for character names
 * Removes potentially harmful characters and content
 */
export function sanitizeCharacterName(name: string, config: ContentSafetyConfig = DEFAULT_SAFETY_CONFIG): SafetyValidationResult {
  const issues: string[] = [];
  let sanitizedName = name.trim();

  // Length validation
  if (sanitizedName.length === 0) {
    return {
      isValid: false,
      issues: ['Character name cannot be empty'],
      severity: 'medium',
      action: 'block'
    };
  }

  if (sanitizedName.length > config.maxNameLength) {
    sanitizedName = sanitizedName.substring(0, config.maxNameLength);
    issues.push(`Name truncated to ${config.maxNameLength} characters`);
  }

  // Character validation - only allow safe characters
  if (!config.allowedCharacters.test(sanitizedName)) {
    sanitizedName = sanitizedName.replace(/[^a-zA-Z\s\-'.,!?]/g, '');
    issues.push('Removed special characters for safety');
  }

  // Profanity and inappropriate content check
  const lowerName = sanitizedName.toLowerCase();
  const foundBlockedWords = config.blockedWords.filter(word => 
    lowerName.includes(word.toLowerCase())
  );

  if (foundBlockedWords.length > 0) {
    return {
      isValid: false,
      issues: [`Contains inappropriate content: ${foundBlockedWords.join(', ')}`],
      severity: 'high',
      action: 'block'
    };
  }

  // Additional safety checks
  if (sanitizedName.length < 2) {
    return {
      isValid: false,
      issues: ['Character name must be at least 2 characters long'],
      severity: 'medium',
      action: 'block'
    };
  }

  // Check for repeated characters (potential spam/abuse)
  if (/(.)\1{4,}/.test(sanitizedName)) {
    return {
      isValid: false,
      issues: ['Character name contains too many repeated characters'],
      severity: 'medium',
      action: 'block'
    };
  }

  const severity = issues.length > 0 ? 'low' : 'low';
  const action = issues.length > 0 ? 'sanitize' : 'approve';

  return {
    isValid: true,
    issues,
    severity,
    sanitizedContent: sanitizedName,
    action
  };
}

/**
 * Validates character traits selection
 */
export function validateCharacterTraits(traits: string[], config: ContentSafetyConfig = DEFAULT_SAFETY_CONFIG): SafetyValidationResult {
  const issues: string[] = [];

  // Limit number of traits
  if (traits.length > config.maxTraits) {
    return {
      isValid: false,
      issues: [`Too many traits selected. Maximum allowed: ${config.maxTraits}`],
      severity: 'medium',
      action: 'block'
    };
  }

  // Validate each trait
  const validTraits = traits.filter(trait => {
    const trimmedTrait = trait.trim();
    if (trimmedTrait.length === 0) return false;
    if (trimmedTrait.length > 20) return false; // Max trait length
    if (!config.allowedCharacters.test(trimmedTrait)) return false;
    
    // Check for inappropriate content
    const lowerTrait = trimmedTrait.toLowerCase();
    return !config.blockedWords.some(word => lowerTrait.includes(word.toLowerCase()));
  });

  if (validTraits.length !== traits.length) {
    issues.push('Some traits were removed due to safety concerns');
  }

  return {
    isValid: true,
    issues,
    severity: issues.length > 0 ? 'low' : 'low',
    sanitizedContent: validTraits.join(','),
    action: issues.length > 0 ? 'sanitize' : 'approve'
  };
}

/**
 * Validates AI-generated story content
 */
export function validateStoryContent(content: any): SafetyValidationResult {
  const issues: string[] = [];

  if (!content || typeof content !== 'object') {
    return {
      isValid: false,
      issues: ['Invalid content structure'],
      severity: 'high',
      action: 'block'
    };
  }

  // Check required fields
  const requiredFields = ['title', 'teaser', 'hiddenMoral', 'conflict', 'quest'];
  const missingFields = requiredFields.filter(field => !content[field] || content[field].trim().length === 0);
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      issues: [`Missing required fields: ${missingFields.join(', ')}`],
      severity: 'high',
      action: 'block'
    };
  }

  // Content safety checks
  const textContent = [content.title, content.teaser, content.hiddenMoral, content.conflict, content.quest].join(' ').toLowerCase();
  
  // Check for inappropriate themes
  const inappropriateThemes = [
    'violence', 'death', 'killing', 'blood', 'weapon', 'gun', 'knife', 
    'scary', 'horror', 'nightmare', 'monster', 'evil', 'devil', 'hell',
    'adult', 'romantic', 'sexual', 'dating', 'marriage', 'love',
    'alcohol', 'drugs', 'smoking', 'drinking', 'party'
  ];

  const foundInappropriate = inappropriateThemes.filter(theme => textContent.includes(theme));
  
  if (foundInappropriate.length > 0) {
    return {
      isValid: false,
      issues: [`Content contains inappropriate themes: ${foundInappropriate.join(', ')}`],
      severity: 'critical',
      action: 'block'
    };
  }

  // Check content length (not too short or too long)
  if (content.teaser && content.teaser.length < 50) {
    issues.push('Story teaser is too short');
  }

  if (content.teaser && content.teaser.length > 500) {
    issues.push('Story teaser is too long');
  }

  // Age-appropriate language check
  const complexWords = ['sophisticated', 'comprehensive', 'intellectual', 'philosophical'];
  const foundComplex = complexWords.filter(word => textContent.includes(word));
  
  if (foundComplex.length > 2) {
    issues.push('Content may be too complex for target age group');
  }

  const severity = foundInappropriate.length > 0 ? 'critical' : issues.length > 0 ? 'medium' : 'low';
  const action = foundInappropriate.length > 0 ? 'block' : issues.length > 2 ? 'manual_review' : 'approve';

  return {
    isValid: foundInappropriate.length === 0,
    issues,
    severity,
    action
  };
}

/**
 * Logs safety events for monitoring
 */
export async function logSafetyEvent(event: {
  type: 'validation' | 'sanitization' | 'block' | 'error';
  content: string;
  result: SafetyValidationResult;
  userId?: string;
  mode: 'easy' | 'template' | 'advanced';
}) {
  // Only log in development for serious issues or when explicitly enabled
  const shouldLog = import.meta.env.DEV && (
    event.result.severity !== 'low' || 
    event.result.action !== 'approve' ||
    import.meta.env.VITE_VERBOSE_SAFETY_LOGS === 'true'
  );
  
  if (shouldLog) {
    console.log('[SAFETY LOG]', {
      timestamp: new Date().toISOString(),
      type: event.type,
      mode: event.mode,
      severity: event.result.severity,
      action: event.result.action,
      issues: event.result.issues,
      userId: event.userId,
      contentHash: btoa(event.content).substring(0, 10) // Don't log full content for privacy
    });
  }

  // TODO: Send to Supabase safety monitoring table
  // await supabase.from('safety_violations').insert({...})
}

/**
 * Emergency fallback content for when AI fails
 */
export const EMERGENCY_FALLBACK_SEEDS = {
  fantasy: [
    {
      title: "The Magic Garden Adventure",
      teaser: "A young explorer discovers a garden where flowers sing beautiful songs and needs to help them prepare for the annual Flower Festival.",
      hiddenMoral: "Taking care of nature helps it flourish and brings joy to everyone.",
      conflict: "The singing flowers have lost their voices before the big festival.",
      quest: "Find the three magical musical notes hidden throughout the garden to restore the flowers' voices."
    }
  ],
  adventure: [
    {
      title: "The Friendly Treasure Hunt",
      teaser: "A treasure map leads to the most amazing discovery - a treasure chest full of books and art supplies for the whole neighborhood.",
      hiddenMoral: "The best treasures are the ones we can share with others.",
      conflict: "The treasure is hidden and needs to be found before the community fair.",
      quest: "Follow the clues and solve friendly puzzles to find the treasure in time for the fair."
    }
  ],
  mystery: [
    {
      title: "The Case of the Missing Cookies",
      teaser: "Freshly baked cookies keep disappearing, and a young detective needs to solve this delicious mystery.",
      hiddenMoral: "Sometimes the best mysteries have the sweetest solutions.",
      conflict: "The cookies vanish every night, and everyone is confused about where they go.",
      quest: "Follow the crumb trail and discover the surprising truth about the missing cookies."
    }
  ]
};

/**
 * Get safe fallback content based on genre and child name
 */
export function getSafeFallbackContent(genre: string, childName: string): any {
  const genreLower = genre.toLowerCase();
  const availableSeeds = EMERGENCY_FALLBACK_SEEDS[genreLower as keyof typeof EMERGENCY_FALLBACK_SEEDS] || EMERGENCY_FALLBACK_SEEDS.fantasy;
  
  // Personalize with child's name
  const seed = availableSeeds[Math.floor(Math.random() * availableSeeds.length)];
  return {
    ...seed,
    title: seed.title.replace(/a young explorer|A young explorer/g, childName),
    teaser: seed.teaser.replace(/a young explorer|A young explorer|a young detective|A young detective/g, childName)
  };
}