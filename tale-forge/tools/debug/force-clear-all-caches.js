// Force Clear All Frontend Caches and Refresh
// COPY AND PASTE INTO BROWSER CONSOLE

console.log('🔄 FORCE CLEARING ALL FRONTEND CACHES');

async function forceRefreshEverything() {
  console.log('1. 🗑️ Clearing React Query cache...');
  
  // Try to access React Query client if available
  if (window.__reactQueryClient || window.queryClient) {
    const client = window.__reactQueryClient || window.queryClient;
    client.clear();
    console.log('✅ React Query cache cleared');
  } else {
    console.log('⚠️ React Query client not found in window - cache may still be cleared on refresh');
  }
  
  console.log('2. 🗑️ Clearing localStorage cache...');
  
  // Keep auth but clear any story/cache data
  const authKeys = Object.keys(localStorage).filter(key => key.includes('auth') || key.includes('sb-'));
  const authData = {};
  authKeys.forEach(key => {
    authData[key] = localStorage.getItem(key);
  });
  
  // Clear everything
  localStorage.clear();
  
  // Restore auth
  Object.keys(authData).forEach(key => {
    localStorage.setItem(key, authData[key]);
  });
  
  console.log('✅ localStorage cleared (auth preserved)');
  
  console.log('3. 🗑️ Clearing sessionStorage...');
  sessionStorage.clear();
  console.log('✅ sessionStorage cleared');
  
  console.log('4. 🔄 Force reloading page...');
  console.log('💡 This will reload the page to ensure fresh data...');
  
  // Give a moment for console to show
  setTimeout(() => {
    window.location.reload(true); // Force reload from server
  }, 2000);
}

// Also provide a function to just refresh story data
window.forceRefreshStoryData = async function() {
  console.log('🔄 Force refreshing story data only...');
  
  try {
    // Try to invalidate React Query cache for stories
    if (window.__reactQueryClient || window.queryClient) {
      const client = window.__reactQueryClient || window.queryClient;
      await client.invalidateQueries(['stories']);
      await client.invalidateQueries(['story']);
      console.log('✅ Story queries invalidated');
    }
    
    // Force refresh current story if on story page
    const currentUrl = window.location.href;
    if (currentUrl.includes('/stories/')) {
      const urlParts = currentUrl.split('/');
      const storyId = urlParts[urlParts.length - 1];
      
      if (storyId && storyId.length > 10) {
        console.log('🔄 Current story ID detected:', storyId);
        console.log('💡 Navigate away and back to see fresh data, or use full page refresh');
      }
    }
    
  } catch (error) {
    console.log('⚠️ Error refreshing story data:', error);
    console.log('💡 Try full page refresh instead');
  }
};

console.log('\n💡 CACHE CLEARING OPTIONS:');
console.log('1. Full refresh (recommended): Run forceRefreshEverything()');
console.log('2. Story data only: Run forceRefreshStoryData()');
console.log('3. Manual refresh: Just reload the page');

// Start the full refresh process
forceRefreshEverything();