// Tale Forge - Delete Story Edge Function
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

console.log("Delete Story function started");

serve(async (req) => {
  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
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
      supabaseAnonKey,
      { 
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false } // Edge Functions are stateless
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Get request body
    const { storyId } = await req.json();

    if (!storyId) {
      return new Response(
        JSON.stringify({ error: 'Missing storyId in request body' }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Deleting story ${storyId} for user ${user.id}`);

    // First, delete related story segments (cascade delete)
    const { error: segmentsError } = await supabase
      .from('story_segments')
      .delete()
      .eq('story_id', storyId);

    if (segmentsError) {
      console.error('Error deleting story segments:', segmentsError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete story segments' }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Delete the story
    const { error: deleteError } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting story:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete story' }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`✅ Story ${storyId} deleted successfully`);

    return new Response(
      JSON.stringify({ 
        success: true,
        storyId: storyId,
        message: 'Story deleted successfully'
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in delete-story function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});