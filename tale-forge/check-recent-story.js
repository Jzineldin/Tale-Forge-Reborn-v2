import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fyihypkigbcmsxyvseca.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'
);

async function getRecentStory() {
  try {
    const { data: stories, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    if (stories && stories.length > 0) {
      const story = stories[0];
      console.log('=== LATEST STORY ===');
      console.log('Title:', story.title);
      console.log('Genre:', story.genre);
      console.log('Target Age:', story.target_age);
      console.log('Description:', story.description);
      console.log('Settings:', JSON.stringify(story.settings, null, 2));
      console.log('Status:', story.is_completed ? 'Completed' : 'In Progress');
      console.log('Created:', story.created_at);
      console.log('');
      
      // Get segments
      const { data: segments, error: segError } = await supabase
        .from('story_segments')
        .select('*')
        .eq('story_id', story.id)
        .order('position', { ascending: true });
        
      if (segments) {
        console.log('=== STORY SEGMENTS ===');
        segments.forEach((segment, i) => {
          console.log(`Segment ${i + 1}:`);
          console.log('Content:', segment.content || segment.segment_text);
          console.log('Choices:', JSON.stringify(segment.choices, null, 2));
          console.log('Image Status:', segment.image_generation_status || 'not started');
          console.log('Image URL:', segment.image_url || 'none');
          console.log('Is Generating:', segment.is_image_generating);
          console.log('---');
        });
      }
    } else {
      console.log('No stories found');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

getRecentStory();