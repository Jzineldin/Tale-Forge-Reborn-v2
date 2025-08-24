// Test direct story reading using Supabase client
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fyihypkigbcmsxyvseca.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE4NjQyNzcsImV4cCI6MjAzNzQ0MDI3N30.TuYKSNsAqJN7cgOABMw6AHV5iy86r5mTqFqL3Ftz8Z0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDirectRead() {
  const storyId = '2f8b4f18-f223-42f5-b9d5-32ac296f87a2';
  
  try {
    console.log('Testing direct story read...');
    
    // Test 1: Try to read story directly
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();
      
    console.log('Story query result:', { story: !!story, error: storyError });
    
    if (story) {
      console.log('Story found:', {
        id: story.id,
        title: story.title,
        user_id: story.user_id
      });
    }
    
    // Test 2: Try to read segments directly
    const { data: segments, error: segmentsError } = await supabase
      .from('story_segments')
      .select('*')
      .eq('story_id', storyId)
      .order('segment_number', { ascending: true });
      
    console.log('Segments query result:', { 
      segmentCount: segments?.length || 0, 
      error: segmentsError 
    });
    
    if (segments && segments.length > 0) {
      console.log('Segments found:', segments.length);
      console.log('First segment:', {
        id: segments[0].id,
        content: segments[0].content?.substring(0, 100) + '...',
        hasImage: !!segments[0].image_url
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testDirectRead();