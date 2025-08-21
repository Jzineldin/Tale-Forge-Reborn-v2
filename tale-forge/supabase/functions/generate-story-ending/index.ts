// Tale Forge - Generate Story Ending Edge Function
// This function generates the ending for a story using OVH AI (Llama-3.3-70B)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

// OVH AI Configuration (based on official documentation)
const OVH_AI_CONFIG = {
  baseUrl: 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1',
  accessToken: Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN'),
  model: 'Meta-Llama-3_3-70B-Instruct',
  maxTokens: 512,
  temperature: 0.7
};

console.log("Generate Story Ending function started");

serve(async (req) => {
  try {
    // Validate environment variables
    const ovhApiKey = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!ovhApiKey || !supabaseUrl || !supabaseServiceKey) {
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
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
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

    // Create a prompt for the AI to generate an ending
    const storyContent = segments.map(segment => segment.content).join('\n\n');
    const prompt = `Create a satisfying ending for the following story for a child aged ${story.age_group}:\n\n${storyContent}\n\nThe ending should be appropriate for the child's age and wrap up the story in a positive way. Keep it to approximately ${story.age_group === '4-6' ? '50-90 words' : story.age_group === '7-9' ? '80-120 words' : '150-180 words'}.`;

    // Generate ending using OVH AI (following official documentation)
    const requestBody = {
      model: OVH_AI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert children\'s story writer who creates engaging, age-appropriate stories with positive messages.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: OVH_AI_CONFIG.temperature
    };

    console.log('Calling OVH AI for story ending generation...');

    const aiResponse = await fetch(`${OVH_AI_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OVH_AI_CONFIG.accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OVH AI API error:', aiResponse.status, errorText);
      throw new Error(`OVH AI API error: ${aiResponse.status}`);
    }

    const completion = await aiResponse.json();
    const endingText = completion.choices[0].message.content?.trim() || '';

    // Save the ending as a new segment
    const { data: endingSegment, error: segmentError } = await supabase
      .from('story_segments')
      .insert({
        story_id: storyId,
        content: endingText,
        position: segments.length + 1,
        choices: [],
        is_ending: true
      })
      .select()
      .single();

    if (segmentError) {
      console.error('Error saving ending segment:', segmentError);
      return new Response(
        JSON.stringify({ error: 'Failed to save ending segment' }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        endingSegment,
        message: 'Story ending generated successfully'
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in generate-story-ending function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});