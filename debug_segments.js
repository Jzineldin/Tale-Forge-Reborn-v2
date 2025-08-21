// Quick script to debug segment creation
const { createClient } = require('./tale-forge/node_modules/@supabase/supabase-js');

const supabaseUrl = 'https://fyihypkigbcmsxyvseca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSegments() {
  console.log('🔍 Checking story_segments table structure...');
  
  // Check latest story
  const { data: stories, error: storiesError } = await supabase
    .from('stories')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (storiesError) {
    console.error('❌ Error fetching stories:', storiesError);
    return;
  }
  
  console.log('📚 Latest stories:', stories);
  
  if (stories.length > 0) {
    const latestStoryId = stories[0].id;
    console.log(`🎯 Checking segments for story: ${latestStoryId}`);
    
    // Check segments for latest story
    const { data: segments, error: segmentsError } = await supabase
      .from('story_segments')
      .select('*')
      .eq('story_id', latestStoryId);
      
    console.log('📊 Segments result:', {
      error: segmentsError,
      segmentCount: segments?.length || 0,
      segments: segments
    });
    
    // Also try a raw query to see table structure
    const { data: allSegments, error: allError } = await supabase
      .from('story_segments')
      .select('*')
      .limit(1);
      
    console.log('🔍 Table structure sample:', {
      error: allError,
      sample: allSegments?.[0] || 'No data'
    });
  }
}

debugSegments().catch(console.error);