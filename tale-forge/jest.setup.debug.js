// Jest Setup for Deep Debug Testing
// Global setup and utilities for debugging tests

// Extend Jest matchers
expect.extend({
  toBeValidAuthToken(received) {
    const pass = received && 
                 typeof received === 'string' && 
                 received.length > 10 &&
                 /^[A-Za-z0-9_\-\.]+$/.test(received);
                 
    return {
      message: () => `expected ${received} to be a valid auth token`,
      pass
    };
  },

  toContainGenericChoice(received) {
    const genericPatterns = [
      'Continue the adventure',
      'Explore a different path', 
      'Try something unexpected',
      'Make a brave decision',
      'Explore somewhere new',
      'Try something different'
    ];

    const pass = Array.isArray(received) && 
                 received.some(choice => 
                   genericPatterns.some(pattern => 
                     choice?.text?.toLowerCase().includes(pattern.toLowerCase())
                   )
                 );

    return {
      message: () => `expected choices to contain generic patterns`,
      pass
    };
  },

  toHaveValidStoryStructure(received) {
    const errors = [];

    if (!received) {
      errors.push('Story object is null or undefined');
    } else {
      if (!received.title || typeof received.title !== 'string') {
        errors.push('Story title is missing or invalid');
      }

      if (!received.segments || !Array.isArray(received.segments)) {
        errors.push('Story segments array is missing or invalid');
      } else if (received.segments.length === 0) {
        errors.push('Story has no segments');
      }
    }

    return {
      message: () => `Story structure errors: ${errors.join(', ')}`,
      pass: errors.length === 0
    };
  },

  toBeWithinPerformanceThreshold(received, threshold = 1000) {
    const pass = typeof received === 'number' && received <= threshold;
    
    return {
      message: () => `expected ${received}ms to be within ${threshold}ms threshold`,
      pass
    };
  }
});

// Global test utilities
global.testUtils = {
  createMockLocalStorage: () => ({
    data: {},
    getItem: jest.fn().mockImplementation(function(key) {
      return this.data[key] || null;
    }),
    setItem: jest.fn().mockImplementation(function(key, value) {
      this.data[key] = value;
    }),
    clear: jest.fn().mockImplementation(function() {
      this.data = {};
    }),
    removeItem: jest.fn().mockImplementation(function(key) {
      delete this.data[key];
    })
  }),

  createMockFetch: (responses = []) => {
    let callCount = 0;
    return jest.fn().mockImplementation(() => {
      const response = responses[callCount] || Promise.reject(new Error('No mock response'));
      callCount++;
      return response;
    });
  },

  createMockDOM: () => ({
    querySelectorAll: jest.fn().mockReturnValue([]),
    getElementById: jest.fn().mockReturnValue(null),
    createElement: jest.fn().mockReturnValue({}),
    body: {
      appendChild: jest.fn(),
      removeChild: jest.fn()
    }
  }),

  waitFor: (condition, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Condition not met within timeout'));
        } else {
          setTimeout(check, 10);
        }
      };
      
      check();
    });
  },

  measurePerformance: async (fn, ...args) => {
    const startTime = performance.now();
    const result = await fn(...args);
    const endTime = performance.now();
    
    return {
      result,
      duration: endTime - startTime,
      memory: process.memoryUsage ? process.memoryUsage() : null
    };
  }
};

// Global setup
beforeEach(() => {
  // Clear console to avoid noise between tests
  if (global.console && global.console.log && global.console.log.mockClear) {
    global.console.log.mockClear();
  }

  // Reset performance marks
  if (typeof performance !== 'undefined' && performance.clearMarks) {
    performance.clearMarks();
  }
});

afterEach(() => {
  // Clean up timers
  jest.useRealTimers();
  
  // Clear any pending async operations
  jest.clearAllTimers();
});

// Suppress console warnings during tests unless debugging
if (!process.env.DEBUG_TESTS) {
  console.warn = jest.fn();
  console.error = jest.fn();
}

// Mock browser APIs that aren't available in Node.js
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn()
  }
});

// Mock network status
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true
});

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Test environment information
console.log('🧪 Debug Test Environment Initialized');
console.log(`Node version: ${process.version}`);
console.log(`Jest version: ${require('jest/package.json').version}`);
console.log(`Test timeout: ${jest.setTimeout || 'default'}`);

// Performance monitoring setup
if (process.env.MONITOR_PERFORMANCE) {
  const originalDescribe = global.describe;
  const originalIt = global.it;

  global.describe = function(name, fn) {
    return originalDescribe(name, function() {
      const suiteStart = performance.now();
      
      afterAll(() => {
        const suiteDuration = performance.now() - suiteStart;
        console.log(`📊 Suite "${name}" completed in ${suiteDuration.toFixed(2)}ms`);
      });
      
      return fn.call(this);
    });
  };

  global.it = function(name, fn, timeout) {
    return originalIt(name, async function() {
      const testStart = performance.now();
      
      try {
        await fn.call(this);
      } finally {
        const testDuration = performance.now() - testStart;
        if (testDuration > 1000) { // Log slow tests
          console.warn(`⚠️  Slow test "${name}": ${testDuration.toFixed(2)}ms`);
        }
      }
    }, timeout);
  };
}