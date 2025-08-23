// Test Utilities for Deep Debug Testing
// Provides mock data, helpers, and validation functions

class DebugTestUtilities {
  constructor() {
    this.mockData = this.createMockData();
  }

  createMockData() {
    return {
      validStory: {
        story: {
          title: "The Enchanted Forest Adventure",
          ai_model_used: "gpt-4-turbo",
          segments: [{
            content: "You stand at the edge of a mystical forest where ancient trees whisper secrets and magical creatures roam freely...",
            choices: [
              { text: "Ask the forest guardian about the missing crystal" },
              { text: "Investigate the glowing mushroom circle" },
              { text: "Follow the silver stream deeper into the woods" }
            ]
          }]
        }
      },

      genericStory: {
        story: {
          title: "Generic Adventure",
          ai_model_used: "gpt-3.5-turbo",
          segments: [{
            content: "You are on an adventure...",
            choices: [
              { text: "Continue the adventure" },
              { text: "Try something different" },
              { text: "Explore a different path" }
            ]
          }]
        }
      },

      partialStory: {
        story: {
          title: "Incomplete Story",
          segments: []
        }
      },

      authTokens: {
        valid: {
          'sb-fyihypkigbcmsxyvseca-auth-token': JSON.stringify({
            access_token: 'sbp_test_token_12345',
            refresh_token: 'refresh_token_67890',
            expires_at: Date.now() + 3600000,
            user: {
              id: 'user_test_123',
              email: 'test@example.com'
            }
          })
        },
        expired: {
          'sb-expired-token': JSON.stringify({
            access_token: 'expired_token',
            expires_at: Date.now() - 3600000
          })
        },
        malformed: {
          'malformed-key': '{"invalid": json syntax}'
        }
      },

      domElements: {
        validChoiceButtons: [
          { textContent: 'A. Examine the ancient runes on the stone altar' },
          { textContent: 'B. Speak with the wise owl perched nearby' },
          { textContent: 'C. Search for hidden passages behind the waterfall' }
        ],
        mixedButtons: [
          { textContent: 'A. Valid long choice text here' },
          { textContent: 'Short' }, // Should be filtered
          { textContent: 'End Story' }, // Should be filtered
          { textContent: 'Generate Audio' }, // Should be filtered
          { textContent: 'B. Another valid choice with sufficient length' }
        ],
        emptyButtons: []
      },

      apiResponses: {
        networkError: new Error('Network request failed'),
        timeout: new Error('Request timeout'),
        unauthorized: new Response('Unauthorized', { status: 401 }),
        serverError: new Response('Internal Server Error', { status: 500 })
      }
    };
  }

  // Validation helpers
  isValidAuthToken(token) {
    return token && 
           typeof token === 'string' && 
           token.length > 10 &&
           !token.includes('<script>') && // Basic XSS check
           /^[A-Za-z0-9_\-\.]+$/.test(token); // Basic format check
  }

  isGenericChoice(choice) {
    const genericPatterns = [
      'Continue the adventure',
      'Explore a different path', 
      'Try something unexpected',
      'Make a brave decision',
      'Explore somewhere new',
      'Try something different'
    ];

    return genericPatterns.some(pattern => 
      choice?.text?.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  validateStoryStructure(story) {
    const errors = [];

    if (!story) {
      errors.push('Story object is null or undefined');
      return errors;
    }

    if (!story.title || typeof story.title !== 'string') {
      errors.push('Story title is missing or invalid');
    }

    if (!story.segments || !Array.isArray(story.segments)) {
      errors.push('Story segments array is missing or invalid');
    } else if (story.segments.length === 0) {
      errors.push('Story has no segments');
    } else {
      story.segments.forEach((segment, index) => {
        if (!segment.content || typeof segment.content !== 'string') {
          errors.push(`Segment ${index} has missing or invalid content`);
        }

        if (!segment.choices || !Array.isArray(segment.choices)) {
          errors.push(`Segment ${index} has missing or invalid choices array`);
        } else if (segment.choices.length === 0) {
          errors.push(`Segment ${index} has no choices`);
        }
      });
    }

    return errors;
  }

  // Mock API response builder
  createMockApiResponse(data, options = {}) {
    const { status = 200, delay = 0, shouldFail = false } = options;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error('Mock API failure'));
          return;
        }

        resolve({
          ok: status >= 200 && status < 300,
          status,
          json: () => Promise.resolve(data),
          text: () => Promise.resolve(JSON.stringify(data))
        });
      }, delay);
    });
  }

  // Performance testing helpers
  createPerformanceTest(name, fn) {
    return async (...args) => {
      const startTime = performance.now();
      const result = await fn(...args);
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Performance Test [${name}]: ${duration.toFixed(2)}ms`);
      
      return {
        result,
        duration,
        performanceMetrics: {
          name,
          duration,
          timestamp: new Date().toISOString()
        }
      };
    };
  }

  // Security testing helpers
  createMaliciousPayloads() {
    return [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '../../etc/passwd',
      'SELECT * FROM users;',
      '${jndi:ldap://malicious.server}',
      '../../../sensitive-file.txt',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox("XSS")'
    ];
  }

  // DOM testing utilities
  createMockDOM() {
    return {
      querySelectorAll: jest.fn(),
      getElementById: jest.fn(),
      createElement: jest.fn(),
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      }
    };
  }

  // Network testing utilities
  createMockFetch(responses = []) {
    let callCount = 0;
    
    return jest.fn().mockImplementation((url, options) => {
      const response = responses[callCount] || this.mockData.apiResponses.networkError;
      callCount++;
      
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      
      return Promise.resolve(response);
    });
  }

  // Test data generators
  generateRandomStoryId() {
    return 'test-' + Math.random().toString(36).substr(2, 9);
  }

  generateLargeStoryData(segmentCount = 100, choicesPerSegment = 5) {
    const segments = [];
    
    for (let i = 0; i < segmentCount; i++) {
      const choices = [];
      for (let j = 0; j < choicesPerSegment; j++) {
        choices.push({
          text: `Choice ${j + 1} for segment ${i + 1} - detailed contextual option`
        });
      }
      
      segments.push({
        content: `This is segment ${i + 1} with extensive content to simulate a real story segment...`.repeat(10),
        choices
      });
    }
    
    return {
      story: {
        title: `Large Test Story with ${segmentCount} segments`,
        ai_model_used: 'gpt-4',
        segments
      }
    };
  }

  // Assertion helpers
  assertValidApiCall(fetchMock, expectedUrl, expectedOptions = {}) {
    expect(fetchMock).toHaveBeenCalledWith(
      expectedUrl,
      expect.objectContaining(expectedOptions)
    );
  }

  assertNoSensitiveDataInLogs(consoleMock, sensitiveData = []) {
    const allLogs = consoleMock.mock.calls.flat().join(' ');
    
    sensitiveData.forEach(sensitive => {
      expect(allLogs).not.toContain(sensitive);
    });
  }

  // Cleanup utilities
  cleanupMocks() {
    jest.clearAllMocks();
    
    // Reset global mocks
    if (global.localStorage) {
      global.localStorage.getItem.mockClear();
    }
    
    if (global.fetch) {
      global.fetch.mockClear();
    }
    
    if (global.document) {
      global.document.querySelectorAll.mockClear();
    }
  }
}

// Export for use in tests
module.exports = DebugTestUtilities;