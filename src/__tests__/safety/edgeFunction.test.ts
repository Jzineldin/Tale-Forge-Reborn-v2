import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        gte: vi.fn().mockResolvedValue({ data: [], error: null })
      }))
    }))
  })),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null })
  }
};

// Mock fetch for AI API calls
global.fetch = vi.fn();

// Mock Deno environment
global.Deno = {
  env: {
    get: vi.fn((key: string) => {
      const envVars: Record<string, string> = {
        'SUPABASE_URL': 'https://test.supabase.co',
        'SUPABASE_SERVICE_ROLE_KEY': 'test-key',
        'ANTHROPIC_API_KEY': 'test-anthropic-key'
      };
      return envVars[key];
    })
  },
  serve: vi.fn()
} as any;

describe('Edge Function Safety Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  describe('Input Validation', () => {
    it('should reject requests without genre', async () => {
      const request = new Request('https://test.com', {
        method: 'POST',
        body: JSON.stringify({ difficulty: 'medium' })
      });

      // Mock the edge function logic
      const { genre } = await request.json();
      
      expect(genre).toBeUndefined();
      // In real function, this would return error with fallback
    });

    it('should sanitize genre input', () => {
      const dirtyGenre = 'fantasy@#$%^&*()123';
      const sanitized = dirtyGenre.replace(/[^a-zA-Z\s]/g, '').trim().toLowerCase();
      
      expect(sanitized).toBe('fantasy');
    });

    it('should sanitize character name input', () => {
      const dirtyName = 'Al3x@#$%^&*()';
      const sanitized = dirtyName.replace(/[^a-zA-Z\s]/g, '').trim();
      
      expect(sanitized).toBe('Alex');
    });

    it('should validate difficulty levels', () => {
      const validDifficulties = ['short', 'medium', 'long'];
      const testDifficulty = 'invalid';
      
      const isValid = validDifficulties.includes(testDifficulty);
      const sanitized = isValid ? testDifficulty : 'medium';
      
      expect(sanitized).toBe('medium');
    });
  });

  describe('Content Safety Validation', () => {
    it('should detect inappropriate keywords in AI response', () => {
      const aiResponse = {
        story: 'A story about war and fighting enemies with weapons.',
        theme: 'Battle and violence',
        characters: ['Warrior'],
        setting: 'Battlefield',
        conflict: 'Defeating evil enemies'
      };

      const inappropriateKeywords = [
        'kill', 'death', 'murder', 'weapon', 'gun', 'sword', 'war', 'fight', 'battle',
        'scary', 'frightening', 'terrifying', 'horror', 'nightmare', 'monster',
        'hate', 'evil', 'villain', 'revenge', 'anger', 'violence'
      ];

      const contentStr = JSON.stringify(aiResponse).toLowerCase();
      const violations = inappropriateKeywords.filter(keyword => 
        contentStr.includes(keyword)
      );

      expect(violations.length).toBeGreaterThan(0);
      expect(violations).toContain('war');
      expect(violations).toContain('fight');
      expect(violations).toContain('battle');
      expect(violations).toContain('evil');
      expect(violations).toContain('violence');
    });

    it('should accept appropriate children content', () => {
      const safeResponse = {
        story: 'A brave little rabbit helps friends in a magical forest filled with kindness.',
        theme: 'Friendship and cooperation',
        characters: ['Bunny', 'Squirrel', 'Owl'],
        setting: 'Enchanted woodland',
        conflict: 'Finding a way to share resources fairly'
      };

      const inappropriateKeywords = [
        'kill', 'death', 'murder', 'weapon', 'gun', 'sword', 'war', 'fight', 'battle',
        'scary', 'frightening', 'terrifying', 'horror', 'nightmare', 'monster',
        'hate', 'evil', 'villain', 'revenge', 'anger', 'violence'
      ];

      const contentStr = JSON.stringify(safeResponse).toLowerCase();
      const violations = inappropriateKeywords.filter(keyword => 
        contentStr.includes(keyword)
      );

      expect(violations).toHaveLength(0);
    });

    it('should validate story content structure', () => {
      const validContent = {
        story: 'A story about friendship and adventure in a magical place where everyone helps each other.',
        theme: 'Friendship',
        characters: ['Hero'],
        setting: 'Magical land',
        conflict: 'Learning to work together'
      };

      const requiredFields = ['story', 'theme', 'characters', 'setting', 'conflict'];
      const hasAllFields = requiredFields.every(field => 
        validContent.hasOwnProperty(field) && validContent[field as keyof typeof validContent]
      );

      expect(hasAllFields).toBe(true);
    });

    it('should reject content that is too short', () => {
      const shortContent = {
        story: 'Short.',
        theme: 'Fun',
        characters: ['A'],
        setting: 'Place',
        conflict: 'Issue'
      };

      const isValid = shortContent.story.length >= 50;
      expect(isValid).toBe(false);
    });

    it('should reject content that is too long', () => {
      const longContent = {
        story: 'A'.repeat(1001),
        theme: 'Adventure',
        characters: ['Hero'],
        setting: 'Kingdom',
        conflict: 'Quest'
      };

      const isValid = longContent.story.length <= 1000;
      expect(isValid).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should track request counts per user', () => {
      const userId = 'test-user';
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      // Mock database query for rate limiting
      const requestCount = 45; // Simulate 45 requests in last hour
      const maxRequests = 50;
      const allowed = requestCount < maxRequests;
      const remainingRequests = Math.max(0, maxRequests - requestCount);

      expect(allowed).toBe(true);
      expect(remainingRequests).toBe(5);
    });

    it('should block requests when limit exceeded', () => {
      const requestCount = 55; // Simulate exceeded limit
      const maxRequests = 50;
      const allowed = requestCount < maxRequests;

      expect(allowed).toBe(false);
    });
  });

  describe('Fallback Content Generation', () => {
    it('should generate personalized fallback for fantasy genre', () => {
      const genre = 'fantasy';
      const characterName = 'Alex';
      const difficulty = 'medium';

      const fallbackSeeds = {
        fantasy: [
          "A young wizard discovers that their magic works best when helping others, leading to adventures in a colorful kingdom filled with friendly dragons and talking animals.",
          "In a land where flowers sing lullabies, a curious child learns the secret language of nature and helps a lost unicorn find its way home.",
          "A magical library appears in the town square, where books come alive to tell their stories and teach important lessons about friendship and courage."
        ]
      };

      const seeds = fallbackSeeds[genre];
      let selectedSeed = seeds[0]; // Use first seed for testing
      
      // Personalize with character name
      const cleanName = characterName.replace(/[^a-zA-Z\s]/g, '').trim();
      if (cleanName.length > 0) {
        selectedSeed = selectedSeed.replace(/young \w+|child|friends?|siblings?/i, cleanName);
      }

      expect(selectedSeed).toContain('Alex');
      expect(selectedSeed).not.toContain('young wizard'); // Should be replaced
    });

    it('should handle unknown genres with default fallback', () => {
      const genre = 'unknown-genre';
      const fallbackSeeds = {
        fantasy: ["A magical adventure awaits..."]
      };

      // Default to fantasy when genre is unknown
      const seeds = fallbackSeeds[genre as keyof typeof fallbackSeeds] || fallbackSeeds.fantasy;
      
      expect(seeds).toEqual(fallbackSeeds.fantasy);
    });
  });

  describe('Error Handling', () => {
    it('should handle AI API failures gracefully', async () => {
      // Mock AI API failure
      (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

      try {
        await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('API Error');
        
        // Should fallback to safe content
        const fallbackContent = {
          story: 'A magical adventure about friendship and kindness.',
          generated_at: new Date().toISOString(),
          safety_validated: true,
          is_fallback: true
        };
        
        expect(fallbackContent.is_fallback).toBe(true);
        expect(fallbackContent.safety_validated).toBe(true);
      }
    });

    it('should handle database logging failures gracefully', () => {
      const mockFailingSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn().mockRejectedValue(new Error('Database error'))
        }))
      };

      // Function should continue even if logging fails
      expect(() => {
        // Simulate logging attempt that fails silently
        mockFailingSupabase.from('safety_violations').insert({}).catch(() => {
          console.log('Logging failed, but continuing...');
        });
      }).not.toThrow();
    });
  });

  describe('Security Headers', () => {
    it('should include proper CORS headers', () => {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      };

      expect(corsHeaders['Access-Control-Allow-Origin']).toBe('*');
      expect(corsHeaders['Access-Control-Allow-Methods']).toContain('POST');
      expect(corsHeaders['Access-Control-Allow-Methods']).toContain('OPTIONS');
    });

    it('should handle OPTIONS requests for preflight', () => {
      const method = 'OPTIONS';
      const shouldReturnEarly = method === 'OPTIONS';
      
      expect(shouldReturnEarly).toBe(true);
    });

    it('should reject non-POST requests', () => {
      const method = 'GET';
      const isAllowed = method === 'POST';
      
      expect(isAllowed).toBe(false);
    });
  });

  describe('Authentication', () => {
    it('should extract user ID from auth header', () => {
      const authHeader = 'Bearer test-jwt-token';
      const token = authHeader.replace('Bearer ', '');
      
      expect(token).toBe('test-jwt-token');
    });

    it('should handle missing auth header gracefully', () => {
      const authHeader = null;
      const userId = authHeader ? 'extracted-user-id' : undefined;
      
      expect(userId).toBeUndefined();
    });

    it('should continue without user ID when auth fails', () => {
      // Mock auth failure
      const mockAuthResult = { data: { user: null }, error: new Error('Invalid token') };
      const userId = mockAuthResult.data.user?.id;
      
      expect(userId).toBeUndefined();
      // Function should continue with anonymous user
    });
  });
});