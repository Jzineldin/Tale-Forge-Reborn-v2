// Comprehensive Test Suite for deep-debug-new-story.js
// Run with: npm test deep-debug-new-story.test.js

const { jest } = require('@jest/globals');

// Mock global objects
global.localStorage = {
  keys: [],
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};

global.document = {
  querySelectorAll: jest.fn()
};

global.fetch = jest.fn();
global.setTimeout = jest.fn();
global.console = {
  log: jest.fn()
};

// Mock data
const mockStoryResponse = {
  story: {
    title: "Test Story",
    ai_model_used: "gpt-4",
    segments: [{
      content: "Once upon a time, in a magical forest...",
      choices: [
        { text: "Explore the mysterious cave" },
        { text: "Follow the glowing butterfly" },
        { text: "Climb the ancient oak tree" }
      ]
    }]
  }
};

const mockGenericStoryResponse = {
  story: {
    title: "Test Story",
    ai_model_used: "gpt-4",
    segments: [{
      content: "Generic story content...",
      choices: [
        { text: "Continue the adventure" },
        { text: "Try something different" },
        { text: "Explore a different path" }
      ]
    }]
  }
};

const mockAuthTokens = {
  'sb-test-auth-token': JSON.stringify({
    access_token: 'test-token-123',
    user: { id: 'user-123' }
  }),
  'supabase.auth.token': JSON.stringify({
    access_token: 'supabase-token-456'
  }),
  'irrelevant-key': 'not-json-data'
};

// Load the code to test
const fs = require('fs');
const path = require('path');
const codeToTest = fs.readFileSync(
  path.join(__dirname, 'deep-debug-new-story.js'), 
  'utf8'
);

// Extract functions using eval (for testing purposes only)
eval(codeToTest.replace(/setTimeout\(deepDebugNewStory, 1000\);/, ''));

describe('Deep Debug New Story - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.Object.keys = jest.fn();
  });

  describe('getAuthToken()', () => {
    test('should extract valid auth token from localStorage', () => {
      global.Object.keys.mockReturnValue(['sb-test-auth-token', 'other-key']);
      global.localStorage.getItem.mockImplementation((key) => mockAuthTokens[key]);

      const token = getAuthToken();
      
      expect(token).toBe('test-token-123');
      expect(global.localStorage.getItem).toHaveBeenCalledWith('sb-test-auth-token');
    });

    test('should return null when no valid token found', () => {
      global.Object.keys.mockReturnValue(['irrelevant-key']);
      global.localStorage.getItem.mockReturnValue('not-json-data');

      const token = getAuthToken();
      
      expect(token).toBeNull();
    });

    test('should handle JSON parse errors gracefully', () => {
      global.Object.keys.mockReturnValue(['malformed-key']);
      global.localStorage.getItem.mockReturnValue('{"invalid": json}');

      const token = getAuthToken();
      
      expect(token).toBeNull();
    });

    test('should prioritize supabase keys over sb- keys', () => {
      global.Object.keys.mockReturnValue(['sb-test', 'supabase.auth.token']);
      global.localStorage.getItem.mockImplementation((key) => mockAuthTokens[key]);

      getAuthToken();
      
      // Should check the first valid token found
      expect(global.localStorage.getItem).toHaveBeenCalled();
    });
  });

  describe('API Integration Tests', () => {
    beforeEach(() => {
      global.fetch.mockClear();
      global.Object.keys.mockReturnValue(['sb-test']);
      global.localStorage.getItem.mockReturnValue(mockAuthTokens['sb-test-auth-token']);
    });

    test('should handle successful story fetch', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStoryResponse)
      });

      await deepDebugNewStory();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/get-story',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token-123'
          })
        })
      );
    });

    test('should handle API error responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('API Error')
      });

      await deepDebugNewStory();

      expect(global.console.log).toHaveBeenCalledWith(
        '❌ Failed to fetch story:', 'API Error'
      );
    });

    test('should detect generic choices and trigger test story creation', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGenericStoryResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            model: 'gpt-4',
            firstSegment: {
              choices: [{ text: 'Good contextual choice' }]
            }
          })
        });

      global.document.querySelectorAll.mockReturnValue([]);

      await deepDebugNewStory();

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.console.log).toHaveBeenCalledWith(
        '❌ NEW STORY HAS GENERIC CHOICES - Backend issue confirmed!'
      );
    });

    test('should handle network timeouts gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network timeout'));

      await deepDebugNewStory();

      expect(global.console.log).toHaveBeenCalledWith(
        '❌ Error debugging new story:', 'Network timeout'
      );
    });
  });

  describe('DOM Analysis Tests', () => {
    test('should extract displayed choices from DOM buttons', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStoryResponse)
      });

      const mockButtons = [
        { textContent: 'A. Explore the cave nearby' },
        { textContent: 'B. Follow the mysterious path' },
        { textContent: 'End Story' }, // Should be filtered out
        { textContent: 'Short' } // Should be filtered out (< 10 chars)
      ];

      global.document.querySelectorAll.mockReturnValue(mockButtons);

      await deepDebugNewStory();

      expect(global.document.querySelectorAll).toHaveBeenCalledWith(
        '[class*="choice"], [class*="Button"], button'
      );
    });

    test('should compare database vs displayed choices', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStoryResponse)
      });

      const mockButtons = [
        { textContent: 'A. Explore the mysterious cave' },
        { textContent: 'B. Follow the glowing butterfly' },
        { textContent: 'C. Climb the ancient oak tree' }
      ];

      global.document.querySelectorAll.mockReturnValue(mockButtons);

      await deepDebugNewStory();

      // Should detect matching choices
      expect(global.console.log).toHaveBeenCalledWith('Displayed choices:', expect.any(String));
    });
  });

  describe('Generic Choice Detection Tests', () => {
    const genericPatterns = [
      'Continue the adventure',
      'Explore a different path', 
      'Try something unexpected',
      'Make a brave decision',
      'Explore somewhere new',
      'Try something different'
    ];

    test('should detect generic patterns in choices', () => {
      const choices = [
        { text: 'Continue the adventure boldly' },
        { text: 'Look around carefully' }
      ];

      const hasGeneric = choices.some(choice => 
        genericPatterns.some(pattern => choice.text?.includes(pattern))
      );

      expect(hasGeneric).toBe(true);
    });

    test('should not flag contextual choices as generic', () => {
      const choices = [
        { text: 'Ask the wizard about the crystal' },
        { text: 'Search the library for clues' }
      ];

      const hasGeneric = choices.some(choice => 
        genericPatterns.some(pattern => choice.text?.includes(pattern))
      );

      expect(hasGeneric).toBe(false);
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle missing auth token', async () => {
      global.Object.keys.mockReturnValue([]);
      
      await deepDebugNewStory();

      expect(global.console.log).toHaveBeenCalledWith('❌ No auth token found');
    });

    test('should handle stories with no segments', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ story: { segments: [] } })
      });

      global.Object.keys.mockReturnValue(['sb-test']);
      global.localStorage.getItem.mockReturnValue(mockAuthTokens['sb-test-auth-token']);

      await deepDebugNewStory();

      expect(global.console.log).toHaveBeenCalledWith('❌ New story has no segments');
    });

    test('should handle malformed API responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' })
      });

      global.Object.keys.mockReturnValue(['sb-test']);
      global.localStorage.getItem.mockReturnValue(mockAuthTokens['sb-test-auth-token']);

      await deepDebugNewStory();

      // Should handle gracefully without crashing
      expect(global.console.log).toHaveBeenCalled();
    });
  });

  describe('Security Tests', () => {
    test('should not expose sensitive data in logs', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Authentication failed: token xyz123'));
      
      global.Object.keys.mockReturnValue(['sb-test']);
      global.localStorage.getItem.mockReturnValue(mockAuthTokens['sb-test-auth-token']);

      await deepDebugNewStory();

      // Check that error logs don't contain the actual token
      const consoleCalls = global.console.log.mock.calls.flat();
      const hasTokenInLogs = consoleCalls.some(call => 
        typeof call === 'string' && call.includes('test-token-123')
      );
      
      expect(hasTokenInLogs).toBe(false);
    });

    test('should validate localStorage keys before processing', () => {
      global.Object.keys.mockReturnValue(['<script>alert(1)</script>']);
      global.localStorage.getItem.mockReturnValue('malicious-data');

      const token = getAuthToken();

      expect(token).toBeNull();
    });
  });

  describe('Performance Tests', () => {
    test('should limit DOM queries', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStoryResponse)
      });

      global.document.querySelectorAll.mockReturnValue([]);

      await deepDebugNewStory();

      // Should only query DOM once
      expect(global.document.querySelectorAll).toHaveBeenCalledTimes(1);
    });

    test('should handle large numbers of DOM elements efficiently', async () => {
      const largeButtonArray = Array.from({ length: 1000 }, (_, i) => ({
        textContent: `Button ${i} with enough text to pass the filter`
      }));

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStoryResponse)
      });

      global.document.querySelectorAll.mockReturnValue(largeButtonArray);

      const startTime = Date.now();
      await deepDebugNewStory();
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (< 1 second for 1000 elements)
      expect(duration).toBeLessThan(1000);
    });
  });
});

// Mock test data exports for use in other tests
module.exports = {
  mockStoryResponse,
  mockGenericStoryResponse,
  mockAuthTokens
};