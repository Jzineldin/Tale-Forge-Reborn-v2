// Tale Forge - Update Story Edge Function
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

console.log("Update Story function started");

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
    const { storyId, updates } = await req.json();

    if (!storyId) {
      return new Response(
        JSON.stringify({ error: 'Missing storyId in request body' }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!updates || typeof updates !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid updates in request body' }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Updating story ${storyId} for user ${user.id}`);

    // Update the story
    const { data: updatedStory, error: updateError } = await supabase
      .from('stories')
      .update({
        title: updates.title,
        description: updates.description,
        genre: updates.genre,
        target_age: updates.age_group || updates.target_age,
        is_completed: updates.status === 'completed' || updates.is_completed,
        updated_at: new Date().toISOString()
      })
      .eq('id', storyId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating story:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update story' }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!updatedStory) {
      return new Response(
        JSON.stringify({ error: 'Story not found or unauthorized' }),
        { headers: { "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Transform to match expected format
    const transformedStory = {
      id: updatedStory.id,
      title: updatedStory.title,
      description: updatedStory.description,
      genre: updatedStory.genre,
      age_group: updatedStory.target_age,
      status: updatedStory.is_completed ? 'completed' : 'draft',
      created_at: updatedStory.created_at,
      updated_at: updatedStory.updated_at,
      user_id: updatedStory.user_id,
      userId: updatedStory.user_id
    };

    console.log(`✅ Story ${storyId} updated successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        story: transformedStory,
        message: 'Story updated successfully'
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in update-story function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});