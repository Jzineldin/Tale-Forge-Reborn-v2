// PASTE THIS INTO YOUR BROWSER CONSOLE AT localhost:3001
// This will test the actual authentication and story creation

console.log('🔍 Browser Authentication Debug v2');

// Test 1: Check if React app has access to Supabase
console.log('--- Test 1: Supabase Client Check ---');
if (typeof window !== 'undefined') {
  // Try different ways apps might expose supabase
  const checks = [
    ['window.supabase', window.supabase],
    ['window.__SUPABASE__', window.__SUPABASE__],
    ['React app globals', window.__REACT_APP_GLOBALS__]
  ];
  
  checks.forEach(([name, value]) => {
    console.log(`${name}:`, !!value);
  });
  
  // Check localStorage for supabase session
  const supabaseKeys = Object.keys(localStorage).filter(k => 
    k.includes('supabase') || k.includes('sb-')
  );
  console.log('LocalStorage Supabase keys:', supabaseKeys);
  
  if (supabaseKeys.length > 0) {
    supabaseKeys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`${key}:`, value ? `${value.substring(0, 50)}...` : 'empty');
    });
  }
}

// Test 2: Manual Supabase Client Test
console.log('\n--- Test 2: Manual Supabase Test ---');

// Create our own supabase client for testing
const { createClient } = window.supabase || {};

if (createClient) {
  console.log('✅ Supabase createClient available');
  
  const testClient = createClient(
    'https://fyihypkigbcmsxyvseca.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
  );
  
  testClient.auth.getSession().then(({ data: { session }, error }) => {
    console.log('Session result:', { 
      hasSession: !!session, 
      userEmail: session?.user?.email, 
      error: error?.message,
      tokenExists: !!session?.access_token
    });
    
    if (session?.access_token) {
      console.log('🧪 Testing story creation API...');
      
      // Test the story creation
      fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
        },
        body: JSON.stringify({
          title: 'Browser Test - Julius Adventure',
          description: 'Test story to debug browser creation',
          genre: 'fantasy',
          target_age: 10,
          theme: 'adventure',
          setting: 'Enchanted Forest',
          time_period: 'Future',
          atmosphere: 'Mysterious',
          characters: [
            { name: 'Julius', role: 'Hero', traits: 'Curious, Clever' },
            { name: 'Kevin', role: 'Best Friend', traits: 'Funny, Clever' }
          ],
          conflict: 'protecting nature',
          quest: 'Save the day',
          moral_lesson: 'Friendship is important',
          additional_details: '',
          words_per_chapter: 70
        })
      })
      .then(async response => {
        console.log('📡 Story Creation Result:');
        console.log('Status:', response.status);
        console.log('OK:', response.ok);
        
        const text = await response.text();
        console.log('Response:', text);
        
        if (response.ok) {
          console.log('🎉 SUCCESS: Story creation worked!');
          const data = JSON.parse(text);
          console.log('Story ID:', data.story?.id);
        } else {
          console.log('❌ FAILED: Story creation failed');
        }
      })
      .catch(err => {
        console.log('❌ Fetch Error:', err.message);
      });
    }
  });
} else {
  console.log('❌ No Supabase createClient found in window.supabase');
  console.log('Available in window:', Object.keys(window).filter(k => k.toLowerCase().includes('supabase')));
}