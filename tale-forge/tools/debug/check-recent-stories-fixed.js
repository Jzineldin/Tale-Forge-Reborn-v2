import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fyihypkigbcmsxyvseca.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
);

console.log('🔍 Checking for stories created today (2025-08-23)...');

const { data: todayStories, error } = await supabase
  .from('stories')
  .select('*')
  .gte('created_at', '2025-08-23T00:00:00.000Z')
  .order('created_at', { ascending: false });

if (error) {
  console.error('Error:', error.message);
} else {
  console.log('Stories created today:', todayStories?.length || 0);
  todayStories?.forEach((story, i) => {
    console.log(`${i+1}. ${story.title} - ${story.created_at} (User: ${story.user_id})`);
    if (story.settings || story.generation_settings) {
      console.log('   Settings:', JSON.stringify(story.settings || story.generation_settings, null, 2));
    }
  });
}

// Also check for your specific user's stories
console.log('\n🔍 Checking stories for your user ID...');
const { data: userStories } = await supabase
  .from('stories')
  .select('*')
  .eq('user_id', '2509e936-b676-4afa-a311-5e8f3d0cb22c')
  .order('created_at', { ascending: false })
  .limit(3);

console.log('Your recent stories:', userStories?.length || 0);
userStories?.forEach((story, i) => {
  console.log(`${i+1}. ${story.title} - ${story.created_at}`);
  console.log('   Genre:', story.genre, '| Target age:', story.target_age);
  if (story.settings || story.generation_settings) {
    console.log('   Custom settings exist:', !!(story.settings || story.generation_settings));
  }
});