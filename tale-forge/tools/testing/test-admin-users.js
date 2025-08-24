// Test script to verify admin users RPC function works
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fyihypkigbcmsxyvseca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQwNzE4NzQsImV4cCI6MjAzOTY0Nzg3NH0.Ej5zQJlGJJBOKNKKjJQJQJQJQJQJQJQJQJQJQJQJQJQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminUsersRPC() {
  console.log('🔍 Testing admin users RPC function...');
  
  try {
    // Test the RPC function
    const { data: profiles, error: profileError } = await supabase
      .rpc('get_all_profiles_for_admin');
      
    console.log('📊 RPC Results:');
    console.log('- Profiles count:', profiles?.length || 0);
    console.log('- Error:', profileError);
    
    if (profiles && profiles.length > 0) {
      console.log('✅ Sample profiles:');
      profiles.slice(0, 5).forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.full_name} (${profile.email}) - ${profile.role}`);
      });
    }
    
    // Test user_profiles table
    const { data: userProfiles, error: userProfileError } = await supabase
      .from('user_profiles')
      .select('*');
      
    console.log('📋 User Profiles:');
    console.log('- User profiles count:', userProfiles?.length || 0);
    console.log('- Error:', userProfileError);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminUsersRPC();
