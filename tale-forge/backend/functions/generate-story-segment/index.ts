// Tale Forge - Generate Story Segment Edge Function
// This function generates a story segment using OpenAI GPT

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';
import OpenAI from 'https://deno.land/x/openai@v4.29.0/mod.ts';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY') ?? '',
});

console.log("Generate Story Segment function started");

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
    const { storyId, choiceIndex } = await req.json();

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

    // Fetch the previous segment if this is not the first segment
    let previousSegment = null;
    if (choiceIndex !== undefined) {
      const { data: prevSegment, error: prevSegmentError } = await supabase
        .from('story_segments')
        .select('*')
        .eq('story_id', storyId)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      if (prevSegmentError) {
        console.error('Error fetching previous segment:', prevSegmentError);
        // This is not fatal, we can continue without previous context
      } else {
        previousSegment = prevSegment;
      }
    }

    // Fetch user characters for this story
    const { data: userCharacters, error: charactersError } = await supabase
      .from('story_characters')
      .select('user_characters(name, description, role)')
      .eq('story_id', storyId)
      .eq('user_characters.user_id', story.user_id);

    if (charactersError) {
      console.error('Error fetching user characters:', charactersError);
      // This is not fatal, we can continue without character context
    }

    // Get appropriate prompt based on story genre and age group
    const { data: promptTemplate, error: promptError } = await supabase
      .from('prompt_library')
      .select('prompt_template')
      .eq('genre', story.genre)
      .eq('age_group', story.age_group)
      .single();

    if (promptError) {
      console.error('Error fetching prompt template:', promptError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch prompt template' }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Create a prompt for the AI
    let prompt = promptTemplate.prompt_template;
    
    // Replace placeholders in the prompt
    prompt = prompt.replace('{theme}', story.theme || 'an adventure');
    prompt = prompt.replace('{setting}', story.setting || 'a magical place');
    
    // Add character information if available
    if (userCharacters && userCharacters.length > 0) {
      const characterDescriptions = userCharacters
        .map(char => `${char.user_characters.name}: ${char.user_characters.description} (${char.user_characters.role})`)
        .join(', ');
      prompt = prompt.replace('{characters}', characterDescriptions);
    } else {
      prompt = prompt.replace('{characters}', 'a brave main character');
    }
    
    // Add previous segment context if available
    if (previousSegment) {
      prompt += `\n\nPrevious story segment: ${previousSegment.content}`;
      if (choiceIndex !== undefined && previousSegment.choices[choiceIndex]) {
        prompt += `\n\nUser chose: ${previousSegment.choices[choiceIndex].text}`;
      }
    }

    // Generate story segment using OpenAI
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
      max_tokens: story.age_group === '4-6' ? 100 : story.age_group === '7-9' ? 150 : 200,
      temperature: 0.7,
    });

    const segmentText = completion.choices[0].message.content?.trim() || '';

    // Generate choices for the next segment
    const choicesPrompt = `Based on the following story segment for a child aged ${story.age_group}, create 3 simple choices the child can make that would continue the story in different directions:\n\n${segmentText}\n\nEach choice should be a short phrase (5-10 words) that describes an action or decision. Return only the 3 choices, one per line.`;

    const choicesCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert children\'s story writer who creates engaging, age-appropriate stories with positive messages.'
        },
        {
          role: 'user',
          content: choicesPrompt
        }
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    const choicesText = choicesCompletion.choices[0].message.content?.trim() || '';
    const choices = choicesText.split('\n').map((text, index) => ({
      id: `choice-${Date.now()}-${index}`,
      text: text.trim(),
      next_segment_id: null
    }));

    // Get the next position for the segment
    const { data: segments, error: segmentsError } = await supabase
      .from('story_segments')
      .select('position')
      .eq('story_id', storyId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = segments && segments.length > 0 ? segments[0].position + 1 : 1;

    // Save the new segment
    const { data: newSegment, error: segmentError } = await supabase
      .from('story_segments')
      .insert({
        story_id: storyId,
        content: segmentText,
        position: nextPosition,
        choices: choices,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (segmentError) {
      console.error('Error saving segment:', segmentError);
      return new Response(
        JSON.stringify({ error: 'Failed to save story segment' }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Generate image prompt for this segment
    const imagePrompt = `Illustration for a children's story segment: ${segmentText.substring(0, 100)}...`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        segment: newSegment,
        imagePrompt: imagePrompt,
        message: 'Story segment generated successfully'
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in generate-story-segment function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});