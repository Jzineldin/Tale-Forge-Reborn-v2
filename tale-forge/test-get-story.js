// Test get-story function
const SUPABASE_URL = 'https://fyihypkigbcmsxyvseca.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE4NjQyNzcsImV4cCI6MjAzNzQ0MDI3N30.TuYKSNsAqJN7cgOABMw6AHV5iy86r5mTqFqL3Ftz8Z0';

// Test the get-story function with a fake token
async function testGetStory() {
  const storyId = '2f8b4f18-f223-42f5-b9d5-32ac296f87a2'; // From the console log
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer fake-token-for-testing`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ storyId })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.text();
    console.log('Response body:', result);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testGetStory();