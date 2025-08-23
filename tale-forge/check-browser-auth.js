// This script needs to be run in the browser console at localhost:3001
// Copy and paste this into your browser's developer console while on the Tale Forge site

console.log('🔍 Checking browser authentication state...');

// Check if supabase is available
if (typeof window !== 'undefined' && window.supabase) {
  console.log('✅ Supabase client found in browser');
  
  window.supabase.auth.getSession().then(({ data: { session }, error }) => {
    console.log('📊 Browser Auth Results:');
    console.log('- Session exists:', !!session);
    console.log('- User ID:', session?.user?.id || 'None');
    console.log('- User email:', session?.user?.email || 'None');
    console.log('- Access token exists:', !!session?.access_token);
    console.log('- Token (first 50 chars):', session?.access_token?.substring(0, 50) || 'None');
    console.log('- Session error:', error?.message || 'None');
    
    if (session?.access_token) {
      console.log('🧪 Testing story creation API from browser...');
      
      const testData = {
        title: 'Browser Auth Test',
        description: 'Testing auth from browser',
        genre: 'fantasy',
        target_age: 7,
        theme: 'adventure',
        setting: 'forest',
        characters: [{ name: 'Test', role: 'hero' }],
        conflict: 'test',
        quest: 'test',
        moral_lesson: 'test',
        additional_details: '',
        words_per_chapter: 70
      };
      
      fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
        },
        body: JSON.stringify(testData)
      })
      .then(response => {
        console.log('📡 API Response from browser:');
        console.log('- Status:', response.status);
        return response.text();
      })
      .then(text => {
        console.log('- Response body:', text);
      })
      .catch(err => {
        console.log('❌ Fetch error:', err.message);
      });
    }
  });
} else {
  console.log('❌ No supabase client found in browser');
  console.log('💡 Make sure you are on the Tale Forge website');
}