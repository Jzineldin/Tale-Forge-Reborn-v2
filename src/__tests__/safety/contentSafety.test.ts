import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeCharacterName,
  validateCharacterTraits,
  validateStoryContent,
  APPROVED_TRAITS,
  ContentSafetyConfig
} from '../../utils/contentSafety';

describe('Content Safety Validation', () => {
  let config: ContentSafetyConfig;

  beforeEach(() => {
    config = {
      maxCharacterNameLength: 30,
      maxTraitsCount: 5,
      enableProfanityFilter: true,
      childSafeMode: true,
      emergencyFallbackEnabled: true
    };
  });

  describe('sanitizeCharacterName', () => {
    it('should accept valid character names', () => {
      const validNames = ['Alex', 'Luna', 'Max', 'Zoe', 'Oliver'];
      
      validNames.forEach(name => {
        const result = sanitizeCharacterName(name, config);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedValue).toBe(name);
        expect(result.violations).toHaveLength(0);
      });
    });

    it('should reject inappropriate character names', () => {
      const inappropriateNames = ['admin', 'system', 'root', 'null', 'undefined'];
      
      inappropriateNames.forEach(name => {
        const result = sanitizeCharacterName(name, config);
        expect(result.isValid).toBe(false);
        expect(result.violations.length).toBeGreaterThan(0);
      });
    });

    it('should reject names that are too long', () => {
      const longName = 'ThisNameIsWayTooLongForOurCharacterNamingSystem';
      const result = sanitizeCharacterName(longName, config);
      
      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Character name exceeds maximum length');
    });

    it('should sanitize names with special characters', () => {
      const nameWithSpecialChars = 'Al3x@#$';
      const result = sanitizeCharacterName(nameWithSpecialChars, config);
      
      expect(result.sanitizedValue).toBe('Alex');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty names', () => {
      const result = sanitizeCharacterName('', config);
      
      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Character name cannot be empty');
    });

    it('should provide fallback names when emergency mode is enabled', () => {
      const result = sanitizeCharacterName('admin', config);
      
      expect(result.isValid).toBe(false);
      expect(result.fallbackValue).toBeDefined();
      expect(typeof result.fallbackValue).toBe('string');
    });
  });

  describe('validateCharacterTraits', () => {
    it('should accept valid pre-approved traits', () => {
      const validTraits = ['Brave', 'Kind', 'Curious'];
      const result = validateCharacterTraits(validTraits, config);
      
      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should reject non-approved traits', () => {
      const invalidTraits = ['Brave', 'Violent', 'Kind'];
      const result = validateCharacterTraits(invalidTraits, config);
      
      expect(result.isValid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations[0]).toContain('Violent');
    });

    it('should reject too many traits', () => {
      const tooManyTraits = Object.keys(APPROVED_TRAITS).slice(0, 7);
      const result = validateCharacterTraits(tooManyTraits, config);
      
      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Too many traits selected (maximum: 5)');
    });

    it('should accept empty traits array', () => {
      const result = validateCharacterTraits([], config);
      
      expect(result.isValid).toBe(true);
    });

    it('should filter and suggest valid traits for invalid input', () => {
      const mixedTraits = ['Brave', 'InvalidTrait', 'Kind', 'AnotherInvalidTrait'];
      const result = validateCharacterTraits(mixedTraits, config);
      
      expect(result.isValid).toBe(false);
      expect(result.sanitizedValue).toEqual(['Brave', 'Kind']);
      expect(result.fallbackValue).toBeDefined();
    });
  });

  describe('validateStoryContent', () => {
    it('should accept child-appropriate story content', () => {
      const safeContent = {
        story: 'Once upon a time, there was a brave little rabbit who loved to help others in the magical forest.',
        theme: 'Friendship and kindness',
        characters: ['Bunny', 'Squirrel'],
        setting: 'Magical forest',
        conflict: 'Finding a lost treasure through teamwork'
      };
      
      const result = validateStoryContent(safeContent);
      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should reject inappropriate content', () => {
      const inappropriateContent = {
        story: 'A story about war and violence in a scary place.',
        theme: 'Fighting enemies',
        characters: ['Warrior'],
        setting: 'Battlefield',
        conflict: 'Defeating the evil army'
      };
      
      const result = validateStoryContent(inappropriateContent);
      expect(result.isValid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should reject content that is too short', () => {
      const shortContent = {
        story: 'Short.',
        theme: 'Fun',
        characters: ['A'],
        setting: 'Place',
        conflict: 'Issue'
      };
      
      const result = validateStoryContent(shortContent);
      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Story content too short');
    });

    it('should reject content that is too long', () => {
      const longContent = {
        story: 'A'.repeat(1001),
        theme: 'Adventure',
        characters: ['Hero'],
        setting: 'Kingdom',
        conflict: 'Quest'
      };
      
      const result = validateStoryContent(longContent);
      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Story content too long');
    });

    it('should validate required story structure fields', () => {
      const incompleteContent = {
        story: 'A good story about friendship and adventure in a magical place.'
        // Missing theme, characters, setting, conflict
      };
      
      const result = validateStoryContent(incompleteContent);
      expect(result.isValid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should provide emergency fallback content', () => {
      const inappropriateContent = {
        story: 'Inappropriate violent content that should be blocked.',
        theme: 'Violence',
        characters: ['Bad Character'],
        setting: 'Dangerous Place',
        conflict: 'Fighting'
      };
      
      const result = validateStoryContent(inappropriateContent);
      expect(result.isValid).toBe(false);
      expect(result.fallbackValue).toBeDefined();
      expect(result.fallbackValue.story).toContain('friendship');
    });
  });

  describe('Emergency Fallback System', () => {
    it('should provide fallback names when configured', () => {
      config.emergencyFallbackEnabled = true;
      const result = sanitizeCharacterName('inappropriate', config);
      
      expect(result.fallbackValue).toBeDefined();
      expect(['Alex', 'Sam', 'Jordan', 'Casey', 'Taylor']).toContain(result.fallbackValue);
    });

    it('should not provide fallback when disabled', () => {
      config.emergencyFallbackEnabled = false;
      const result = sanitizeCharacterName('inappropriate', config);
      
      expect(result.fallbackValue).toBeUndefined();
    });

    it('should provide fallback traits when needed', () => {
      const invalidTraits = ['Invalid1', 'Invalid2', 'Invalid3'];
      const result = validateCharacterTraits(invalidTraits, config);
      
      expect(result.fallbackValue).toBeDefined();
      expect(Array.isArray(result.fallbackValue)).toBe(true);
      expect(result.fallbackValue.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Child Safety Mode', () => {
    it('should be more restrictive in child safe mode', () => {
      config.childSafeMode = true;
      
      const borderlineContent = {
        story: 'A story about competition and winning against others.',
        theme: 'Competition',
        characters: ['Winner'],
        setting: 'Contest',
        conflict: 'Beating the competition'
      };
      
      const result = validateStoryContent(borderlineContent);
      expect(result.isValid).toBe(false);
    });

    it('should allow more content when child safe mode is disabled', () => {
      config.childSafeMode = false;
      
      const borderlineContent = {
        story: 'A story about friendly competition and sportsmanship in a school setting.',
        theme: 'Healthy competition',
        characters: ['Student'],
        setting: 'School',
        conflict: 'Preparing for a spelling bee'
      };
      
      const result = validateStoryContent(borderlineContent);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Profanity Filter', () => {
    it('should detect and block profanity when enabled', () => {
      config.enableProfanityFilter = true;
      
      // Using mild inappropriate words for testing
      const nameWithProfanity = 'stupid';
      const result = sanitizeCharacterName(nameWithProfanity, config);
      
      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.includes('inappropriate language'))).toBe(true);
    });

    it('should allow questionable content when profanity filter is disabled', () => {
      config.enableProfanityFilter = false;
      
      const borderlineName = 'Rebel';
      const result = sanitizeCharacterName(borderlineName, config);
      
      expect(result.isValid).toBe(true);
    });
  });
});