// Tale Forge - Generate Story Segment Edge Function
// This function generates a story segment using OVH AI (Llama-3.3-70B)

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

console.log("Generate Story Segment function started");

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    const ovhApiKey = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
    const ovhTextEndpoint = Deno.env.get('OVH_TEXT_ENDPOINT');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required Supabase environment variables');
    }
    
    // Check if we have valid API keys (not placeholders)
    const hasValidApiKeys = ovhApiKey && !ovhApiKey.includes('placeholder');
    
    if (!hasValidApiKeys) {
      console.log('⚠️ No valid AI API keys found, returning error for frontend fallback');
      return new Response(
        JSON.stringify({ 
          error: 'Missing required environment variables', 
          code: 'MISSING_API_KEYS',
          message: 'AI service API keys not configured'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
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
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
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
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!story) {
      return new Response(
        JSON.stringify({ error: 'Story not found' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
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

    // Get appropriate prompt based on story genre and age group (using hardcoded prompts)
    const getPromptTemplate = (genre: string, targetAge: string) => {
      const basePrompt = `Write the next segment of an engaging children's story for ages ${targetAge}. The story should be ${genre}-themed and focus on {theme} in {setting}. Include the main characters: {characters}. Make it age-appropriate, educational, and exciting. The segment should be 2-3 short paragraphs and end with an engaging moment that leads to choices. Keep the language simple but engaging.`;
      
      return basePrompt;
    };

    // Create a prompt for the AI
    let prompt = getPromptTemplate(story.genre || 'fantasy', story.target_age || '7-9');
    
    // Replace placeholders in the prompt
    prompt = prompt.replace('{theme}', story.title || story.description || 'an adventure');
    prompt = prompt.replace('{setting}', story.story_mode || 'a magical place');
    
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
      prompt += `\n\nPrevious story segment: ${previousSegment.segment_text}`;
      if (choiceIndex !== undefined && previousSegment.choices[choiceIndex]) {
        prompt += `\n\nUser chose: ${previousSegment.choices[choiceIndex].text}`;
      }
    }

    // Generate story segment using OVH AI (following official documentation)
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
      max_tokens: story.target_age === '4-6' ? 100 : story.target_age === '7-9' ? 150 : 200,
      temperature: OVH_AI_CONFIG.temperature
    };

    console.log('Calling OVH AI for story segment generation...');

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
    const segmentText = completion.choices[0].message.content?.trim() || '';

    // Generate choices for the next segment
    const choicesPrompt = `Based on the following story segment for a child aged ${story.age_group}, create 3 simple choices the child can make that would continue the story in different directions:\n\n${segmentText}\n\nEach choice should be a short phrase (5-10 words) that describes an action or decision. Return only the 3 choices, one per line.`;

    const choicesRequestBody = {
      model: OVH_AI_CONFIG.model,
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
      temperature: 0.8
    };

    console.log('Calling OVH AI for choices generation...');

    const choicesResponse = await fetch(`${OVH_AI_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OVH_AI_CONFIG.accessToken}`,
      },
      body: JSON.stringify(choicesRequestBody),
    });

    if (!choicesResponse.ok) {
      const errorText = await choicesResponse.text();
      console.error('OVH AI API error for choices:', choicesResponse.status, errorText);
      throw new Error(`OVH AI API error for choices: ${choicesResponse.status}`);
    }

    const choicesCompletion = await choicesResponse.json();
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
        segment_text: segmentText,
        choices: choices,
        is_end: false,
        parent_segment_id: previousSegment?.id || null,
        word_count: segmentText.split(' ').length,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (segmentError) {
      console.error('Error saving segment:', segmentError);
      return new Response(
        JSON.stringify({ error: 'Failed to save story segment' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
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
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in generate-story-segment function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});