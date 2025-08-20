// Tale Forge - Get Prompt Edge Function
// This function retrieves a prompt from the prompt library

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

console.log("Get Prompt function started");

serve(async (req) => {
  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { headers: { "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get request parameters
    const url = new URL(req.url);
    const promptId = url.searchParams.get('promptId');
    const genre = url.searchParams.get('genre');
    const ageGroup = url.searchParams.get('ageGroup');

    // Validate parameters
    if (!promptId && (!genre || !ageGroup)) {
      return new Response(
        JSON.stringify({ error: 'Missing promptId or both genre and ageGroup parameters' }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    let query = supabase.from('prompt_library').select('*');

    // Build query based on parameters
    if (promptId) {
      query = query.eq('id', promptId);
    } else {
      query = query.eq('genre', genre).eq('age_group', ageGroup);
    }

    // Execute query
    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching prompt:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch prompt' }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Prompt not found' }),
        { headers: { "Content-Type": "application/json" }, status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        prompt: data,
        message: 'Prompt retrieved successfully'
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in get-prompt function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});