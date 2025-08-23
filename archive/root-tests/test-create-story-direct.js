// Direct test of create-story function to debug the 500 error
import fetch from 'node-fetch';
import { config } from 'dotenv';

// Load environment variables
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// You'll need to replace this with a valid session token from your browser
// Or create a test user session
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzI0NTA3MDQ4LCJpYXQiOjE3MjQ1MDM0NDgsImlzcyI6Imh0dHBzOi8vd3Z4bHpoY3lxbXhtcXNtcnl3eGcuc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6ImNhZWZkNGMwLTcxZjEtNGFkZC04ZTMwLWIxYTZkMmMwMGI3ZCIsImVtYWlsIjoidGVzdEBlbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7fSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTcyNDUwMzQ0OH1dLCJzZXNzaW9uX2lkIjoiZTczYTU5Y2EtOGZjZi00OGVhLTlkMzAtNzlkZjI2MTMzZjZjIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.fake-signature-for-testing';

async function testCreateStory() {
  console.log('🧪 Testing create-story function directly...');
  
  const testStoryData = {
    title: "The Test Adventure",
    description: "A simple test story",
    genre: "adventure", 
    age_group: "7-9",
    target_age: 8,
    theme: "friendship",
    setting: "forest",
    characters: [{name: "Alex", age: 8}],
    conflict: "getting lost",
    quest: "find the way home",
    moralLesson: "asking for help is okay"
  };
  
  try {
    console.log('📡 Calling create-story function with data:', JSON.stringify(testStoryData, null, 2));
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-story`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(testStoryData)
    });
    
    console.log('📊 Response details:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    const responseText = await response.text();
    console.log('📝 Raw response text:', responseText);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ SUCCESS - Response data:', JSON.stringify(data, null, 2));
      } catch (e) {
        console.log('⚠️ Response is not valid JSON:', e.message);
      }
    } else {
      console.log('❌ FAILURE - This is the error causing MockAIService fallback!');
      try {
        const errorData = JSON.parse(responseText);
        console.log('🚨 Error details:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.log('🚨 Raw error text (not JSON):', responseText);
      }
    }
    
  } catch (error) {
    console.error('💥 Network/fetch error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
  }
}

// Check environment
console.log('🔍 Environment check:', {
  hasSupabaseUrl: !!SUPABASE_URL,
  hasAnonKey: !!SUPABASE_ANON_KEY,
  supabaseUrl: SUPABASE_URL?.substring(0, 30) + '...',
  hasAuthToken: !!AUTH_TOKEN
});

testCreateStory().catch(console.error);