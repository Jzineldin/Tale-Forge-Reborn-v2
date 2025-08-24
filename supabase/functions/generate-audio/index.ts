// Tale Forge - Generate Audio Edge Function
// This function generates audio narration for a story using ElevenLabs

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

console.log("Generate Audio function started");

serve(async (req) => {
  try {
    // Validate environment variables
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!elevenLabsApiKey || !supabaseUrl || !supabaseAnonKey) {
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

    // Create Supabase client (SECURITY FIXED: Using anon key)
    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { 
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false } // Edge Functions are stateless
      }
    );

    // Get request body
    const { storyId } = await req.json();

    if (!storyId) {
      return new Response(
        JSON.stringify({ error: 'Missing storyId in request body' }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch story data from Supabase
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();

    if (storyError) {
      console.error('Error fetching story:', storyError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch story' }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!story) {
      return new Response(
        JSON.stringify({ error: 'Story not found' }),
        { headers: { "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Fetch story segments
    const { data: segments, error: segmentsError } = await supabase
      .from('story_segments')
      .select('*')
      .eq('story_id', storyId)
      .order('position', { ascending: true });

    if (segmentsError) {
      console.error('Error fetching segments:', segmentsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch story segments' }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Combine all segment content into one text
    const fullStoryText = segments.map(segment => segment.content).join('\n\n');

    // Prepare the audio generation request for ElevenLabs
    const elevenLabsEndpoint = 'https://api.elevenlabs.io/v1/text-to-speech/Brian';
    
    const audioRequest = {
      text: fullStoryText,
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.75
      }
    };

    // Call ElevenLabs API to generate audio
    const response = await fetch(elevenLabsEndpoint, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify(audioRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Get audio data as ArrayBuffer
    const audioArrayBuffer = await response.arrayBuffer();
    const audioUint8Array = new Uint8Array(audioArrayBuffer);

    // Upload to Supabase Storage
    const fileName = `story-audio/${storyId}/narration-${Date.now()}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('story-audio')
      .upload(fileName, audioUint8Array, {
        contentType: 'audio/mpeg'
        });

    if (uploadError) {
      throw new Error(`Failed to upload audio to Supabase Storage: ${uploadError.message}`);
    }

    // Get public URL for the uploaded audio
    const { data: { publicUrl } } = supabase.storage
      .from('story-audio')
      .getPublicUrl(fileName);

    // Update the story with the audio URL
    const { data: updatedStory, error: updateError } = await supabase
      .from('stories')
      .update({ audio_url: publicUrl })
      .eq('id', storyId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating story:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update story with audio URL' }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        story: updatedStory,
        audioUrl: publicUrl,
        message: 'Audio narration generated successfully'
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in generate-audio function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});