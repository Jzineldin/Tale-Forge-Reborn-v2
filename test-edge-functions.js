import https from 'https';
import http from 'http';

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Base URL for local edge functions
const BASE_URL = 'http://127.0.0.1:54321/functions/v1';

// Authentication tokens for testing
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Admin user token (generated from create-simple-admin.js)
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2ODU5NTY0LCJpYXQiOjE3NTYyNTQ3NjQsImlzcyI6InN1cGFiYXNlLWRlbW8iLCJzdWIiOiJhYWFhYWFhYS1iYmJiLWNjY2MtZGRkZC1lZWVlZWVlZWVlZWUiLCJlbWFpbCI6Imp6aW5lbGRpbkBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7Im5hbWUiOiJBZG1pbiBVc2VyIiwicm9sZSI6ImFkbWluIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTYyNTQ3NjR9XSwic2Vzc2lvbl9pZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCJ9.XKQQY3RPgBX0mnrcrW1xlAC6iXx7wYrNEzp1IYsRDu8';

// Service role token for admin functions
const SERVICE_ROLE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2MzQwMzA5LCJpYXQiOjE3NTYyNTM5MDksImlzcyI6InN1cGFiYXNlLWRlbW8iLCJyb2xlIjoic2VydmljZV9yb2xlIn0.PGAAV5mpV5ekvhwqU7UE9HBa-o3XiCWFJsiQh4kzCFY';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}, authToken = ANON_KEY) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'apikey': authToken,
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody,
            rawBody: body
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: body
          });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }

    req.end();
  });
}

// Test configurations focusing on story creation flow
const tests = [
  {
    name: 'api-health',
    method: 'GET',
    path: '/api-health',
    description: 'Health check endpoint'
  },
  
  // === EASY MODE STORY CREATION FLOW ===
  {
    name: 'generate-story-seeds-easy-mode',
    method: 'POST',
    path: '/generate-story-seeds',
    data: {
      context: 'bedtime',
      difficulty: 'short',
      genre: 'fantasy',
      childName: 'Alex'
    },
    description: '🟢 Easy Mode: Generate story seeds for simple creation',
    authToken: ANON_KEY
  },
  {
    name: 'create-story-easy-mode',
    method: 'POST',
    path: '/create-story',
    data: {
      title: 'The Magical Garden Discovery',
      genre: 'fantasy',
      difficulty: 'short',
      context: 'bedtime',
      childName: 'Alex',
      mode: 'easy',
      teaser: 'A young adventurer finds a secret garden where flowers sing and trees dance',
      hiddenMoral: 'Taking care of nature helps it flourish and brings joy to everyone'
    },
    description: '🟢 Easy Mode: Create story from generated seed',
    authToken: ADMIN_TOKEN
  },
  
  // === TEMPLATE MODE STORY CREATION FLOW ===
  {
    name: 'create-story-template-mode',
    method: 'POST',
    path: '/create-story',
    data: {
      title: 'The Brave Little Knight',
      genre: 'adventure',
      difficulty: 'medium',
      context: 'learning',
      childName: 'Sam',
      mode: 'template',
      templateId: 'heroic-journey-template',
      customizations: {
        character: 'A young knight',
        setting: 'Medieval castle',
        conflict: 'Dragon threatening the village'
      }
    },
    description: '🟡 Template Mode: Create story from template',
    authToken: ADMIN_TOKEN
  },
  
  // === ADVANCED MODE STORY CREATION FLOW ===
  {
    name: 'create-story-advanced-mode',
    method: 'POST',
    path: '/create-story',
    data: {
      title: 'The Time-Traveling Scientist',
      genre: 'sci-fi',
      difficulty: 'long',
      context: 'educational',
      childName: 'Maya',
      mode: 'advanced',
      plotStructure: {
        acts: 3,
        climaxPoint: 'middle',
        characterArcs: ['hero-journey', 'mentor-guide']
      },
      customElements: {
        themes: ['friendship', 'problem-solving', 'curiosity'],
        moralLesson: 'Knowledge and courage can solve any problem',
        targetAge: '8-12',
        educationalFocus: 'science and history'
      }
    },
    description: '🔴 Advanced Mode: Create complex story with custom elements',
    authToken: ADMIN_TOKEN
  },
  
  // === STORY PROGRESSION FLOW (for all modes) ===
  {
    name: 'generate-story-segment-first',
    method: 'POST',
    path: '/generate-story-segment',
    data: {
      storyId: 'story-placeholder-id', // Will be replaced with actual ID after creation
      segmentNumber: 1,
      previousChoice: null,
      targetAge: '6-8',
      preferredLength: 'short'
    },
    description: '📖 Story Flow: Generate first story segment',
    authToken: ADMIN_TOKEN,
    dependsOn: ['create-story-easy-mode'] // Needs story ID from previous test
  },
  {
    name: 'generate-story-segment-continuation',
    method: 'POST',
    path: '/generate-story-segment',
    data: {
      storyId: 'story-placeholder-id',
      segmentNumber: 2,
      previousChoice: 'explore the magical flowers',
      targetAge: '6-8',
      preferredLength: 'short'
    },
    description: '📖 Story Flow: Generate continuation segment',
    authToken: ADMIN_TOKEN,
    dependsOn: ['generate-story-segment-first']
  },
  {
    name: 'generate-story-ending',
    method: 'POST',
    path: '/generate-story-ending',
    data: {
      storyId: 'story-placeholder-id',
      currentSegment: 'The garden revealed its secret...',
      targetAge: '6-8'
    },
    description: '📖 Story Flow: Generate story ending',
    authToken: ADMIN_TOKEN,
    dependsOn: ['generate-story-segment-continuation']
  },
  
  // === STORY MANAGEMENT FUNCTIONS ===
  {
    name: 'list-stories',
    method: 'GET',
    path: '/list-stories',
    description: '📚 Story Management: List user stories',
    authToken: ADMIN_TOKEN
  },
  {
    name: 'get-story',
    method: 'GET',
    path: '/get-story?id=story-placeholder-id',
    description: '📚 Story Management: Get story details',
    authToken: ADMIN_TOKEN,
    dependsOn: ['create-story-easy-mode']
  },
  {
    name: 'update-story',
    method: 'POST',
    path: '/update-story',
    data: {
      id: 'story-placeholder-id',
      title: 'The Magical Garden Discovery (Updated)',
      description: 'An updated version of our test story'
    },
    description: '📚 Story Management: Update story',
    authToken: ADMIN_TOKEN,
    dependsOn: ['create-story-easy-mode']
  },
  
  // === MULTIMEDIA ENHANCEMENTS ===
  {
    name: 'generate-tts-audio',
    method: 'POST',
    path: '/generate-tts-audio',
    data: {
      text: 'Once upon a time, in a magical garden far away, there lived a young adventurer named Alex.',
      storyType: 'bedtime',
      characterType: 'narrator',
      emotion: 'calm',
      ssmlEnhanced: true
    },
    description: '🎵 Multimedia: Generate story narration audio',
    authToken: ADMIN_TOKEN
  },
  {
    name: 'regenerate-image',
    method: 'POST',
    path: '/regenerate-image',
    data: {
      storyId: 'story-placeholder-id',
      segmentId: 1,
      imagePrompt: 'A magical garden with singing flowers and dancing trees, child-friendly fantasy art style',
      style: 'fantasy',
      ageAppropriate: true
    },
    description: '🎨 Multimedia: Regenerate story image',
    authToken: ADMIN_TOKEN,
    dependsOn: ['create-story-easy-mode']
  }
];

// Function to print formatted results
function printResult(test, result, duration) {
  const status = result.status;
  const statusColor = status >= 200 && status < 300 ? colors.green : 
                     status >= 400 && status < 500 ? colors.yellow : colors.red;
  
  console.log(`${colors.bold}${colors.cyan}${test.name}${colors.reset}`);
  console.log(`  ${test.description}`);
  console.log(`  ${colors.bold}Method:${colors.reset} ${test.method} ${test.path}`);
  console.log(`  ${colors.bold}Status:${colors.reset} ${statusColor}${status}${colors.reset}`);
  console.log(`  ${colors.bold}Duration:${colors.reset} ${duration}ms`);
  
  if (result.body && Object.keys(result.body).length > 0) {
    console.log(`  ${colors.bold}Response:${colors.reset}`);
    console.log(`    ${JSON.stringify(result.body, null, 2).split('\n').join('\n    ')}`);
  } else if (result.rawBody) {
    console.log(`  ${colors.bold}Raw Response:${colors.reset} ${result.rawBody.substring(0, 200)}${result.rawBody.length > 200 ? '...' : ''}`);
  }
  
  console.log('');
}

// Main test execution function
async function runTests() {
  console.log(`${colors.bold}${colors.magenta}🚀 Tale-Forge Story Creation Flow Test${colors.reset}\n`);
  console.log(`${colors.bold}Testing all 3 story creation modes + complete flow${colors.reset}\n`);
  console.log(`${colors.bold}Testing ${tests.length} functions at ${BASE_URL}${colors.reset}\n`);
  
  const results = {
    total: tests.length,
    passed: 0,
    failed: 0,
    errors: 0,
    storyIds: {} // Track created story IDs for dependent tests
  };
  
  for (const test of tests) {
    try {
      console.log(`${colors.bold}${colors.blue}Testing: ${test.name}${colors.reset}`);
      const startTime = Date.now();
      
      // Use the specified auth token or default to ANON_KEY
      const authToken = test.authToken || ANON_KEY;
      
      // Replace placeholder story IDs with actual ones from previous tests
      let testData = test.data;
      if (testData && testData.storyId === 'story-placeholder-id') {
        const createdStoryId = results.storyIds['create-story-easy-mode'];
        if (createdStoryId) {
          testData = { ...testData, storyId: createdStoryId };
        }
      }
      
      // Handle GET requests with placeholder IDs in path
      let testPath = test.path;
      if (testPath.includes('story-placeholder-id')) {
        const createdStoryId = results.storyIds['create-story-easy-mode'];
        if (createdStoryId) {
          testPath = testPath.replace('story-placeholder-id', createdStoryId);
        }
      }
      
      const result = await makeRequest(test.method, testPath, testData, {}, authToken);
      const duration = Date.now() - startTime;
      
      // Extract story ID from create-story responses for use in dependent tests
      if (test.name.startsWith('create-story') && result.status >= 200 && result.status < 300 && result.body && result.body.story) {
        results.storyIds[test.name] = result.body.story.id;
        console.log(`  ${colors.green}📝 Created story ID: ${result.body.story.id}${colors.reset}`);
      }
      
      printResult(test, result, duration);
      
      if (result.status >= 200 && result.status < 300) {
        results.passed++;
      } else {
        results.failed++;
      }
      
    } catch (error) {
      console.log(`${colors.red}❌ Error testing ${test.name}: ${error.message}${colors.reset}\n`);
      results.errors++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Print summary
  console.log(`${colors.bold}${colors.magenta}📊 Test Summary${colors.reset}`);
  console.log(`${colors.bold}Total:${colors.reset} ${results.total}`);
  console.log(`${colors.bold}${colors.green}Passed:${colors.reset} ${results.passed}`);
  console.log(`${colors.bold}${colors.yellow}Failed:${colors.reset} ${results.failed}`);
  console.log(`${colors.bold}${colors.red}Errors:${colors.reset} ${results.errors}`);
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`${colors.bold}Success Rate:${colors.reset} ${successRate}%`);
}

// Run the tests
console.log(`${colors.bold}${colors.cyan}Starting Edge Function Tests...${colors.reset}\n`);
runTests().catch(console.error);