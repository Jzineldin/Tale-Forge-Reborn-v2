// Tale Forge - Get Story Edge Function
// This function retrieves a story with all its segments and choices

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

console.log("Get Story function started");

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('📋 Auth header received:', authHeader ? `${authHeader.substring(0, 20)}...` : 'NONE');
    
    // Create Supabase client (temporarily without auth requirement)
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    // Temporary: Skip auth validation for debugging
    let user = null;
    let userId = 'test-user-id';
    
    if (authHeader) {
      console.log('🔐 Attempting to validate auth header...');
      try {
        const supabaseWithAuth = createClient(
          supabaseUrl,
          supabaseServiceKey,
          { global: { headers: { Authorization: authHeader } } }
        );
        
        const { data: { user: authUser }, error: userError } = await supabaseWithAuth.auth.getUser();
        console.log('👤 Auth result:', { hasUser: !!authUser, error: userError?.message });
        
        if (authUser) {
          user = authUser;
          userId = authUser.id;
          console.log('✅ User authenticated:', userId);
        } else {
          console.log('⚠️ Auth failed, proceeding without user');
        }
      } catch (authError) {
        console.log('❌ Auth validation error:', authError);
      }
    } else {
      console.log('⚠️ No auth header, proceeding without authentication');
    }

    // Get request body
    const { storyId } = await req.json();

    if (!storyId) {
      return new Response(
        JSON.stringify({ error: 'Missing storyId in request body' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch story data from Supabase
    console.log('🔍 Fetching story:', storyId, 'for user:', userId);
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();

    if (storyError) {
      console.error('Error fetching story:', storyError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch story', details: storyError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!story) {
      return new Response(
        JSON.stringify({ error: 'Story not found or access denied' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Fetch all story segments for this story
    const { data: segments, error: segmentsError } = await supabase
      .from('story_segments')
      .select('*')
      .eq('story_id', storyId)
      .order('position', { ascending: true });

    if (segmentsError) {
      console.error('Error fetching story segments:', segmentsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch story segments' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Transform the story data to match the expected format
    const formattedStory = {
      id: story.id,
      title: story.title,
      description: story.description || 'A wonderful adventure awaits',
      genre: story.genre || 'fantasy',
      age_group: story.target_age || 'All Ages',
      status: story.is_completed ? 'completed' : 'in_progress',
      created_at: story.created_at,
      updated_at: story.updated_at,
      user_id: story.user_id,
      is_public: story.is_public,
      audio_url: story.full_story_audio_url,
      cover_image_url: story.cover_image_url,
      segments: segments || [],
      settings: story.generation_settings || {},
      ai_model_used: story.ai_model_used,
      segment_count: story.segment_count || segments?.length || 0,
      estimated_reading_time: story.estimated_reading_time || 5,
      language: story.language || 'en',
      content_rating: story.content_rating || 'G'
    };

    // Calculate reading statistics
    const totalWords = segments?.reduce((total, segment) => {
      return total + (segment.content?.split(' ').length || 0);
    }, 0) || 0;

    const estimatedReadingTime = Math.max(1, Math.ceil(totalWords / 100)); // ~100 words per minute for children

    formattedStory.estimated_reading_time = estimatedReadingTime;

    // Update story stats if they've changed
    if (story.segment_count !== segments?.length || story.estimated_reading_time !== estimatedReadingTime) {
      await supabase
        .from('stories')
        .update({
          segment_count: segments?.length || 0,
          estimated_reading_time: estimatedReadingTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', storyId);
    }

    console.log(`Story ${storyId} retrieved successfully with ${segments?.length || 0} segments`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        story: formattedStory,
        message: 'Story retrieved successfully'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in get-story function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});