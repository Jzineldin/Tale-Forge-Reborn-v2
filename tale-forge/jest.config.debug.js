// Jest Configuration for Deep Debug Testing
// Specialized config for testing browser-based debugging scripts

module.exports = {
  displayName: 'Deep Debug New Story Tests',
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Test files
  testMatch: [
    '**/deep-debug-*.test.js',
    '**/debug-*.test.js'
  ],
  
  // Setup and teardown
  setupFilesAfterEnv: ['<rootDir>/jest.setup.debug.js'],
  
  // Coverage
  collectCoverageFrom: [
    'deep-debug-new-story.js',
    'debug-test-utilities.js'
  ],
  
  coverageDirectory: 'coverage-debug',
  
  coverageReporters: [
    'text',
    'html',
    'json'
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Mock configuration
  clearMocks: true,
  restoreMocks: true,
  
  // Timeout for async tests
  testTimeout: 10000,
  
  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Global setup
  globals: {
    'window': {},
    'document': {},
    'localStorage': {},
    'fetch': jest.fn()
  },
  
  // Module mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  
  // Verbose output
  verbose: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Performance monitoring
  logHeapUsage: true,
  
  // Custom reporters
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Deep Debug Test Results',
      outputPath: './test-results/debug-test-report.html',
      includeFailureMsg: true,
      includeSuiteFailure: true
    }]
  ]
};