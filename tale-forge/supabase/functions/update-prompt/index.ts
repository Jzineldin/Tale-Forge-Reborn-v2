// Tale Forge - Update Prompt Edge Function
// This function updates a prompt in the prompt library

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

console.log("Update Prompt function started");

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

    // Get request body
    const { promptId, updates } = await req.json();

    if (!promptId || !updates) {
      return new Response(
        JSON.stringify({ error: 'Missing promptId or updates in request body' }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Update the prompt in the database
    const { data, error } = await supabase
      .from('prompt_library')
      .update(updates)
      .eq('id', promptId)
      .select()
      .single();

    if (error) {
      console.error('Error updating prompt:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update prompt' }),
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
        message: 'Prompt updated successfully'
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in update-prompt function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});