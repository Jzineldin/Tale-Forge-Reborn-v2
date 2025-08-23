// Force refresh story data and debug React Query cache
// COPY AND PASTE INTO BROWSER CONSOLE

console.log('🔄 Force Refresh Story Data');

// Force page reload to clear React Query cache and re-fetch
console.log('💡 Refreshing page to clear React Query cache...');
console.log('📋 This should fix the stale data issue');

// Give user a moment to read the message
setTimeout(() => {
  window.location.reload();
}, 2000);