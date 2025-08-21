// Tale Forge - Get Story Edge Function
// This function fetches a story with its segments and handles different statuses

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

console.log("Get Story function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }
    
    // Use built-in anon key if available, fallback to manual one
    const anonKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg';

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { 
          headers: { 
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          }, 
          status: 401 
        }
      );
    }

    // Create Supabase client for admin operations (with service role key)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Create separate client for user auth validation (with user session)
    const supabaseUser = createClient(
      supabaseUrl,
      anonKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Extract JWT token from Bearer header
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(jwt);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized - Invalid session',
          details: userError?.message || 'No user found'
        }),
        { 
          headers: { 
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          }, 
          status: 401 
        }
      );
    }

    // Get request body
    const { storyId } = await req.json();

    if (!storyId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: storyId' }),
        { 
          headers: { 
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          }, 
          status: 400 
        }
      );
    }

    // Fetch the story
    const { data: story, error: storyError } = await supabaseAdmin
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', user.id) // Ensure user can only access their own stories
      .single();

    if (storyError || !story) {
      return new Response(
        JSON.stringify({ 
          error: 'Story not found',
          details: storyError?.message || 'Story does not exist or you do not have permission to access it'
        }),
        { 
          headers: { 
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          }, 
          status: 404 
        }
      );
    }

    // Fetch story segments
    console.log(`🔍 Fetching segments for story: ${storyId}`);
    const { data: segments, error: segmentsError } = await supabaseAdmin
      .from('story_segments')
      .select('*')
      .eq('story_id', storyId)
      .order('segment_number', { ascending: true });

    console.log(`📊 Segments query result:`, {
      segmentCount: segments?.length || 0,
      hasError: !!segmentsError,
      errorMessage: segmentsError?.message || 'none',
      segments: segments || []
    });

    if (segmentsError) {
      console.error('❌ Error fetching segments:', segmentsError);
      // Don't fail the request, just return story without segments
    }

    // Format the response
    const formattedStory = {
      id: story.id,
      title: story.title,
      description: story.description,
      genre: story.genre,
      age_group: story.target_age,
      target_age: story.target_age,
      status: 'ready', // Hardcoded until schema refresh
      created_at: story.created_at,
      updated_at: story.updated_at,
      generation_settings: story.generation_settings || {},
      error_message: null, // Temporarily removed until schema refresh
      tokens_used: 0, // Temporarily removed until schema refresh
      segments: segments || [],
      // Add some helpful metadata
      has_content: segments && segments.length > 0,
      segment_count: segments ? segments.length : 0
    };

    console.log(`Story ${storyId} fetched successfully - Status: ${formattedStory.status}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        story: formattedStory
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        } 
      }
    );

  } catch (error) {
    console.error('Error in get-story function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }, 
        status: 500 
      }
    );
  }
});