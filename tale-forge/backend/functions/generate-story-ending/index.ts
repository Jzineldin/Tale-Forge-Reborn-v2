// Tale Forge - Generate Story Ending Edge Function
// This function generates the ending for a story using OpenAI GPT

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';
import OpenAI from 'https://deno.land/x/openai@v4.29.0/mod.ts';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY') ?? '',
});

console.log("Generate Story Ending function started");

serve(async (req) => {
  try {
    // Validate environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
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

    // Generate ending using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
      temperature: 0.7,
    });

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