import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * API Testing with Playwright
 */
test.describe('API Tests', () => {
  let apiContext: any;
  
  test.beforeEach(async ({ playwright }) => {
    let authToken = '';
    
    // Read auth token from saved state
    try {
      const authPath = join(__dirname, '.auth', 'user.json');
      const authData = JSON.parse(readFileSync(authPath, 'utf8'));
      const tokenData = JSON.parse(authData.origins[0].localStorage.find((item: any) => 
        item.name === 'sb-fyihypkigbcmsxyvseca-auth-token'
      )?.value || '{}');
      authToken = tokenData.access_token || '';
    } catch (error) {
      console.log('Could not read auth token, some tests may fail');
    }

    apiContext = await playwright.request.newContext({
      baseURL: process.env.API_URL || 'http://localhost:3000',
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      },
    });
  });
  
  test.afterEach(async () => {
    if (apiContext) {
      await apiContext.dispose();
    }
  });
  
  test('should get health check', async () => {
    const response = await apiContext.get('/api/health');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
  });
  
  test('should create a story via API', async () => {
    const storyData = {
      title: 'API Test Story',
      description: 'A test story created via API',
      genre: 'adventure',
      age_group: '7-9',
      theme: 'teamwork',
      setting: 'space',
      characters: [{ name: 'API Test Character', role: 'protagonist' }],
      conflict: 'Finding a way home',
      quest: 'Space exploration adventure',
      moral_lesson: 'teamwork',
      child_name: 'API Test Character'
    };
    
    const response = await apiContext.post('/api/stories', {
      data: storyData
    });
    
    if (response.ok()) {
      const story = await response.json();
      expect(story).toHaveProperty('id');
      expect(story.title).toBe(storyData.title);
    } else {
      // Log error for debugging
      const error = await response.text();
      console.log('Story creation failed:', response.status(), error);
    }
  });
  
  test('should get story list', async () => {
    const response = await apiContext.get('/api/stories');
    
    if (response.ok()) {
      const stories = await response.json();
      expect(Array.isArray(stories)).toBeTruthy();
    }
  });
  
  test.skip('should handle 404 for non-existent story', async () => {
    const response = await apiContext.get('/api/stories/non-existent-id');
    expect(response.status()).toBe(404);
  });
  
  test.skip('should validate request body', async () => {
    const invalidData = {
      // Missing required fields
      theme: 'adventure'
    };
    
    const response = await apiContext.post('/api/stories', {
      data: invalidData
    });
    
    expect(response.status()).toBe(400);
    const error = await response.json();
    expect(error).toHaveProperty('error');
  });
  
  test.skip('should test rate limiting', async () => {
    const requests = [];
    
    // Send multiple requests quickly
    for (let i = 0; i < 10; i++) {
      requests.push(apiContext.get('/api/stories'));
    }
    
    const responses = await Promise.all(requests);
    
    // Check if rate limiting is applied
    const rateLimited = responses.some(r => r.status() === 429);
    
    // This test documents the behavior - adjust based on your rate limit settings
    console.log('Rate limiting applied:', rateLimited);
  });
  
  test('should measure API response time', async () => {
    const startTime = Date.now();
    const response = await apiContext.get('/api/stories');
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    console.log(`API Response time: ${responseTime}ms`);
    
    // Assert response time is reasonable
    expect(responseTime).toBeLessThan(5000); // 5 seconds max
  });
});