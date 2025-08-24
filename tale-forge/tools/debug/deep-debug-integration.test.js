// Integration Tests for Deep Debug New Story
// Tests complete workflows and real-world scenarios

const DebugTestUtilities = require('./debug-test-utilities');

describe('Deep Debug New Story - Integration Tests', () => {
  let testUtils;
  let originalFetch, originalLocalStorage, originalDocument, originalConsole;

  beforeAll(() => {
    testUtils = new DebugTestUtilities();
    
    // Store original globals
    originalFetch = global.fetch;
    originalLocalStorage = global.localStorage;
    originalDocument = global.document;
    originalConsole = global.console;
  });

  beforeEach(() => {
    // Setup clean mocks for each test
    global.fetch = jest.fn();
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
    global.document = testUtils.createMockDOM();
    global.console = {
      log: jest.fn()
    };
    global.Object = {
      keys: jest.fn()
    };

    testUtils.cleanupMocks();
  });

  afterAll(() => {
    // Restore original globals
    global.fetch = originalFetch;
    global.localStorage = originalLocalStorage;
    global.document = originalDocument;
    global.console = originalConsole;
  });

  describe('Complete Success Flow', () => {
    test('should complete full debug flow for story with good choices', async () => {
      // Setup: Valid auth token
      global.Object.keys.mockReturnValue(['sb-test-token']);
      global.localStorage.getItem.mockReturnValue(
        JSON.stringify({ access_token: 'valid-token-123' })
      );

      // Setup: API returns valid story
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(testUtils.mockData.validStory)
      });

      // Setup: DOM has matching choices
      global.document.querySelectorAll.mockReturnValue([
        { textContent: 'A. Ask the forest guardian about the missing crystal' },
        { textContent: 'B. Investigate the glowing mushroom circle' },
        { textContent: 'C. Follow the silver stream deeper into the woods' }
      ]);

      // Load and execute the debug script
      const fs = require('fs');
      const path = require('path');
      const debugScript = fs.readFileSync(
        path.join(__dirname, 'deep-debug-new-story.js'),
        'utf8'
      );

      // Execute without the setTimeout
      const scriptWithoutTimeout = debugScript.replace(
        /setTimeout\(deepDebugNewStory, 1000\);/, 
        ''
      );
      eval(scriptWithoutTimeout);

      // Run the debug function
      await deepDebugNewStory();

      // Assertions
      expect(global.fetch).toHaveBeenCalledWith(
        'https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/get-story',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token-123'
          })
        })
      );

      expect(global.console.log).toHaveBeenCalledWith(
        '✅ New story has contextual choices - different issue'
      );

      expect(global.document.querySelectorAll).toHaveBeenCalledWith(
        '[class*="choice"], [class*="Button"], button'
      );
    });
  });

  describe('Generic Choices Detection Flow', () => {
    test('should detect generic choices and trigger remediation flow', async () => {
      // Setup: Valid auth token
      global.Object.keys.mockReturnValue(['sb-test']);
      global.localStorage.getItem.mockReturnValue(
        JSON.stringify({ access_token: 'test-token' })
      );

      // Setup: First API call returns generic story
      // Second API call for test story returns good choices
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(testUtils.mockData.genericStory)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            model: 'gpt-4',
            firstSegment: {
              choices: [
                { text: 'Specific contextual choice' },
                { text: 'Another detailed option' }
              ]
            }
          })
        });

      global.document.querySelectorAll.mockReturnValue([]);

      const fs = require('fs');
      const debugScript = fs.readFileSync(
        require.resolve('./deep-debug-new-story.js'),
        'utf8'
      );
      
      eval(debugScript.replace(/setTimeout\(deepDebugNewStory, 1000\);/, ''));

      await deepDebugNewStory();

      // Should make two API calls - get story and create test story
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // Should detect generic choices
      expect(global.console.log).toHaveBeenCalledWith(
        '❌ NEW STORY HAS GENERIC CHOICES - Backend issue confirmed!'
      );

      // Should create test story
      expect(global.fetch).toHaveBeenCalledWith(
        'https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Debug Test Story')
        })
      );

      // Should detect inconsistent behavior
      expect(global.console.log).toHaveBeenCalledWith(
        '✅ Test story has good choices - inconsistent behavior detected'
      );
    });
  });

  describe('Error Handling Integration', () => {
    test('should gracefully handle complete API failure', async () => {
      global.Object.keys.mockReturnValue(['sb-test']);
      global.localStorage.getItem.mockReturnValue(
        JSON.stringify({ access_token: 'test-token' })
      );

      global.fetch.mockRejectedValue(new Error('Network failure'));

      const fs = require('fs');
      const debugScript = fs.readFileSync(
        require.resolve('./deep-debug-new-story.js'),
        'utf8'
      );
      
      eval(debugScript.replace(/setTimeout\(deepDebugNewStory, 1000\);/, ''));

      await deepDebugNewStory();

      expect(global.console.log).toHaveBeenCalledWith(
        '❌ Error debugging new story:', 'Network failure'
      );
    });

    test('should handle missing authentication gracefully', async () => {
      global.Object.keys.mockReturnValue([]);

      const fs = require('fs');
      const debugScript = fs.readFileSync(
        require.resolve('./deep-debug-new-story.js'),
        'utf8'
      );
      
      eval(debugScript.replace(/setTimeout\(deepDebugNewStory, 1000\);/, ''));

      await deepDebugNewStory();

      expect(global.console.log).toHaveBeenCalledWith('❌ No auth token found');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Performance Integration Tests', () => {
    test('should handle large number of DOM elements efficiently', async () => {
      global.Object.keys.mockReturnValue(['sb-test']);
      global.localStorage.getItem.mockReturnValue(
        JSON.stringify({ access_token: 'test-token' })
      );

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(testUtils.mockData.validStory)
      });

      // Create 1000 mock DOM elements
      const largeElementArray = Array.from({ length: 1000 }, (_, i) => ({
        textContent: `Choice button ${i} with sufficient text content for processing`
      }));

      global.document.querySelectorAll.mockReturnValue(largeElementArray);

      const fs = require('fs');
      const debugScript = fs.readFileSync(
        require.resolve('./deep-debug-new-story.js'),
        'utf8'
      );
      
      eval(debugScript.replace(/setTimeout\(deepDebugNewStory, 1000\);/, ''));

      const startTime = Date.now();
      await deepDebugNewStory();
      const duration = Date.now() - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(2000); // 2 seconds max

      // Should process all elements
      expect(global.document.querySelectorAll).toHaveBeenCalled();
    });
  });

  describe('Data Comparison Integration', () => {
    test('should accurately compare database vs displayed choices', async () => {
      const dbChoices = [
        'Ask the forest guardian about the missing crystal',
        'Investigate the glowing mushroom circle',
        'Follow the silver stream deeper into the woods'
      ];

      const displayedChoices = [
        'A. Ask the forest guardian about the missing crystal',
        'B. Investigate the glowing mushroom circle', 
        'C. Follow the silver stream deeper into the woods'
      ];

      global.Object.keys.mockReturnValue(['sb-test']);
      global.localStorage.getItem.mockReturnValue(
        JSON.stringify({ access_token: 'test-token' })
      );

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          story: {
            title: 'Test Story',
            segments: [{
              choices: dbChoices.map(text => ({ text }))
            }]
          }
        })
      });

      global.document.querySelectorAll.mockReturnValue(
        displayedChoices.map(text => ({ textContent: text }))
      );

      const fs = require('fs');
      const debugScript = fs.readFileSync(
        require.resolve('./deep-debug-new-story.js'),
        'utf8'
      );
      
      eval(debugScript.replace(/setTimeout\(deepDebugNewStory, 1000\);/, ''));

      await deepDebugNewStory();

      // Should log both sets of choices
      expect(global.console.log).toHaveBeenCalledWith(
        'Database choices:', expect.stringContaining(dbChoices[0])
      );

      expect(global.console.log).toHaveBeenCalledWith(
        'Displayed choices:', expect.any(String)
      );

      // Should provide final diagnosis
      const finalDiagnosisCall = global.console.log.mock.calls.find(call =>
        call[0] && (call[0].includes('match') || call[0].includes('DON\'T match'))
      );
      
      expect(finalDiagnosisCall).toBeDefined();
    });
  });

  describe('Security Integration Tests', () => {
    test('should not expose sensitive tokens in error scenarios', async () => {
      global.Object.keys.mockReturnValue(['sb-test']);
      global.localStorage.getItem.mockReturnValue(
        JSON.stringify({ access_token: 'secret-token-12345' })
      );

      global.fetch.mockRejectedValue(
        new Error('Unauthorized: Token secret-token-12345 is invalid')
      );

      const fs = require('fs');
      const debugScript = fs.readFileSync(
        require.resolve('./deep-debug-new-story.js'),
        'utf8'
      );
      
      eval(debugScript.replace(/setTimeout\(deepDebugNewStory, 1000\);/, ''));

      await deepDebugNewStory();

      // Check all console output for token exposure
      const allConsoleOutput = global.console.log.mock.calls
        .flat()
        .join(' ');

      expect(allConsoleOutput).not.toContain('secret-token-12345');
    });

    test('should handle malicious DOM content safely', async () => {
      global.Object.keys.mockReturnValue(['sb-test']);
      global.localStorage.getItem.mockReturnValue(
        JSON.stringify({ access_token: 'test-token' })
      );

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(testUtils.mockData.validStory)
      });

      // Inject potentially malicious content in DOM
      const maliciousElements = [
        { textContent: '<script>alert("XSS")</script>' },
        { textContent: 'javascript:alert("XSS")' },
        { textContent: 'A. Normal choice text here' }
      ];

      global.document.querySelectorAll.mockReturnValue(maliciousElements);

      const fs = require('fs');
      const debugScript = fs.readFileSync(
        require.resolve('./deep-debug-new-story.js'),
        'utf8'
      );
      
      eval(debugScript.replace(/setTimeout\(deepDebugNewStory, 1000\);/, ''));

      // Should complete without executing malicious content
      await expect(deepDebugNewStory()).resolves.not.toThrow();

      // Verify processing completed
      expect(global.document.querySelectorAll).toHaveBeenCalled();
    });
  });
});

describe('Debug Script Initialization Tests', () => {
  test('should execute initialization sequence correctly', () => {
    const fs = require('fs');
    const debugScript = fs.readFileSync(
      require.resolve('./deep-debug-new-story.js'),
      'utf8'
    );

    // Mock setTimeout to capture the initialization
    global.setTimeout = jest.fn();

    // Execute the script
    eval(debugScript);

    // Should set up the delayed execution
    expect(global.setTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      1000
    );
  });
});