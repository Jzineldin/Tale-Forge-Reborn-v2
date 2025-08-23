// Force Refresh Current Story - Clear cache and reload
// Run this to force your React app to show the latest choices

console.log('🔄 FORCE REFRESHING CURRENT STORY');
console.log('='.repeat(50));

function forceRefreshCurrentStory() {
  const storyId = window.location.pathname.match(/\/stories\/([^\/]+)/)?.[1];
  
  if (!storyId) {
    console.log('❌ Not on a story page');
    return;
  }
  
  console.log('📖 Current Story ID:', storyId);
  
  // Clear browser cache for this story
  console.log('🧹 Clearing browser cache...');
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  // Clear localStorage cache if any
  console.log('🧹 Clearing localStorage cache...');
  Object.keys(localStorage).forEach(key => {
    if (key.includes('story') || key.includes('cache')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear sessionStorage cache if any
  console.log('🧹 Clearing sessionStorage cache...');
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('story') || key.includes('cache')) {
      sessionStorage.removeItem(key);
    }
  });
  
  // Try to access React Query cache and invalidate
  console.log('🧹 Attempting to clear React Query cache...');
  
  // Multiple ways to access React Query
  const possibleClients = [
    window.queryClient,
    window.__REACT_QUERY_CLIENT__,
    window.__REACT_QUERY_DEVTOOLS_CLIENT__
  ];
  
  let foundClient = false;
  possibleClients.forEach(client => {
    if (client && client.invalidateQueries) {
      console.log('✅ Found React Query client, invalidating story queries...');
      client.invalidateQueries(['story']);
      client.invalidateQueries(['get-story']);
      client.refetchQueries(['story']);
      foundClient = true;
    }
  });
  
  if (!foundClient) {
    console.log('⚠️ Could not access React Query client directly');
  }
  
  // Force hard reload
  console.log('🔄 Force reloading page in 2 seconds...');
  setTimeout(() => {
    window.location.reload(true);
  }, 2000);
}

console.log('⏳ Starting force refresh...');
forceRefreshCurrentStory();