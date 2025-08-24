// Comprehensive Story Generation Debug Script
// COPY AND PASTE INTO BROWSER CONSOLE BEFORE CREATING A STORY

console.log('🔍 COMPREHENSIVE STORY DEBUG SCRIPT LOADED');

// Monitor all network requests to Supabase functions
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [url, options] = args;
  
  if (url.includes('supabase.co/functions/v1/')) {
    const functionName = url.split('/functions/v1/')[1];
    const startTime = Date.now();
    
    console.log(`📤 [${new Date().toLocaleTimeString()}] CALLING ${functionName}`);
    
    return originalFetch.apply(this, args).then(response => {
      const duration = Date.now() - startTime;
      console.log(`📥 [${new Date().toLocaleTimeString()}] ${functionName} completed in ${duration}ms - Status: ${response.status}`);
      
      if (functionName === 'create-story' && duration > 10000) {
        console.warn(`⚠️ create-story took ${duration}ms (${(duration/1000).toFixed(1)}s) - This is unusually slow!`);
      }
      
      return response;
    }).catch(error => {
      const duration = Date.now() - startTime;
      console.error(`❌ [${new Date().toLocaleTimeString()}] ${functionName} failed after ${duration}ms:`, error);
      throw error;
    });
  }
  
  return originalFetch.apply(this, args);
};

// Monitor React Query polling behavior
let pollCount = 0;
let lastStoryData = null;

// Override console.log to capture story data updates
const originalLog = console.log;
console.log = function(...args) {
  const message = args[0];
  
  if (typeof message === 'string' && message.includes('🔍 Story data updated:')) {
    pollCount++;
    const storyData = args[1];
    
    if (JSON.stringify(storyData) !== JSON.stringify(lastStoryData)) {
      console.warn(`🔄 POLL #${pollCount} - Story data changed:`, {
        segmentCount: storyData?.segmentCount,
        hasSegments: storyData?.hasSegments,
        timestamp: new Date().toLocaleTimeString()
      });
      lastStoryData = storyData;
    } else {
      console.log(`🔄 POLL #${pollCount} - No change (${new Date().toLocaleTimeString()})`);
    }
  }
  
  if (typeof message === 'string' && message.includes('👁️ Tab became visible')) {
    console.warn('🎯 TAB VISIBILITY CHANGE DETECTED - Forcing refresh');
  }
  
  return originalLog.apply(this, args);
};

// Tab visibility monitoring
let tabSwitchCount = 0;
let lastVisibilityChange = Date.now();

document.addEventListener('visibilitychange', () => {
  const now = Date.now();
  const timeSinceLastChange = now - lastVisibilityChange;
  tabSwitchCount++;
  
  console.warn(`👁️ TAB SWITCH #${tabSwitchCount}: ${document.hidden ? 'HIDDEN' : 'VISIBLE'} (${timeSinceLastChange}ms since last)`);
  
  lastVisibilityChange = now;
});

// Performance timing tracker
window.storyGenerationMetrics = {
  startTime: null,
  createStoryTime: null,
  firstSegmentTime: null,
  totalPolls: 0,
  tabSwitches: 0
};

// Hook into story creation process
const originalCreateStory = window.fetch;

console.log('🎯 DEBUG SCRIPT READY');
console.log('📊 Now create a story and watch the detailed logs');
console.log('🔍 Monitoring:');
console.log('  - Network requests to Supabase functions');
console.log('  - React Query polling behavior');
console.log('  - Tab visibility changes');
console.log('  - Story data updates');
console.log('');
console.log('💡 Create a story now and switch tabs during generation to see the behavior');