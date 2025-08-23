import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fyihypkigbcmsxyvseca.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
);

console.log('🔍 Checking current authentication status...');

const { data: { session }, error } = await supabase.auth.getSession();

console.log('📊 Auth Results:');
console.log('- Session exists:', !!session);
console.log('- User ID:', session?.user?.id || 'None');
console.log('- User email:', session?.user?.email || 'None');
console.log('- Access token exists:', !!session?.access_token);
console.log('- Token expires at:', session?.expires_at ? new Date(session.expires_at * 1000) : 'N/A');
console.log('- Current time:', new Date());
console.log('- Token expired:', session?.expires_at ? Date.now() / 1000 > session.expires_at : 'Unknown');
console.log('- Session error:', error?.message || 'None');

if (session?.access_token) {
  console.log('\n🧪 Testing story creation with current token...');
  
  const testStoryData = {
    title: 'Debug Test - Julius Adventure',
    description: 'Test story to debug authentication',
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
  };

  try {
    const response = await fetch('https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/create-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
      },
      body: JSON.stringify(testStoryData)
    });

    console.log('\n📡 API Response:');
    console.log('- Status:', response.status);
    console.log('- Status text:', response.statusText);
    
    const responseText = await response.text();
    console.log('- Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Story creation successful!');
      const data = JSON.parse(responseText);
      console.log('- Story ID:', data.story?.id);
      console.log('- Story title:', data.story?.title);
    } else {
      console.log('❌ Story creation failed');
    }
  } catch (fetchError) {
    console.log('❌ Fetch error:', fetchError.message);
  }
} else {
  console.log('\n❌ No access token available - user not authenticated');
  console.log('💡 You need to sign in at http://localhost:3001 first');
}