// Tale Forge - Regenerate Seeds Edge Function
// This function generates new prompt seeds for story creation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';
import OpenAI from 'https://deno.land/x/openai@v4.29.0/mod.ts';

// AI Configuration - GPT-4o primary, OVH Llama-3.3-70B fallback
const AI_CONFIG = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: Deno.env.get('OPENAI_API_KEY'),
    model: 'gpt-4o',
    maxTokens: 300,
    temperature: 0.8
  },
  ovh: {
    baseUrl: 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1',
    accessToken: Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN'),
    model: 'Meta-Llama-3_3-70B-Instruct',
    maxTokens: 300,
    temperature: 0.8
  }
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: AI_CONFIG.openai.apiKey,
});

console.log("Regenerate Seeds function started");

serve(async (req) => {
  try {
    // Validate environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!openaiApiKey || !supabaseUrl || !supabaseServiceKey) {
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
    const { storyId, seedType } = await req.json();

    if (!storyId || !seedType) {
      return new Response(
        JSON.stringify({ error: 'Missing storyId or seedType in request body' }),
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

    // Generate appropriate prompt based on seed type
    let prompt = '';
    
    switch (seedType) {
      case 'character':
        prompt = `Generate 3 creative character ideas for a child's story. Each character should have:
        - A name
        - Age or age group
        - Appearance (color, size, distinctive features)
        - Personality traits
        - Special abilities or quirks
        
        The characters should be appropriate for children aged ${story.age_group}.`;
        break;
        
      case 'setting':
        prompt = `Generate 3 creative story settings for a child's story. Each setting should have:
        - A location name
        - Description of the place
        - Time period (modern, historical, fantasy, future)
        - Mood/atmosphere
        
        The setting should be appropriate for children aged ${story.age_group}.`;
        break;
        
      case 'plot':
        prompt = `Generate 3 creative story plot ideas for a child's story. Each plot should have:
        - A central conflict or challenge
        - The main character's goal
        - A potential resolution
        
        The plot should be appropriate for children aged ${story.age_group} and focus on positive values like friendship, courage, or learning.`;
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid seedType. Must be "character", "setting", or "plot"' }),
          { headers: { "Content-Type": "application/json" }, status: 400 }
        );
    }

    // Generate seeds using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert children\'s story creator who generates creative and age-appropriate story elements.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const seedsText = completion.choices[0].message.content?.trim() || '';

    // Save the seeds to the database
    const { data: seeds, error: seedsError } = await supabase
      .from('story_seeds')
      .insert({
        story_id: storyId,
        seed_type: seedType,
        content: seedsText,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (seedsError) {
      console.error('Error saving seeds:', seedsError);
      return new Response(
        JSON.stringify({ error: 'Failed to save seeds' }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        seeds,
        message: 'Seeds generated successfully'
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in regenerate-seeds function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});