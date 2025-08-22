// Tale Forge - Generate Story Ending Edge Function
// This function generates a satisfying conclusion for a story using AI

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

// AI Configuration - OpenAI primary, OVH fallback
const AI_CONFIG = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: Deno.env.get('OPENAI_API_KEY'),
    model: 'gpt-4o-mini',
    maxTokens: 400,
    temperature: 0.7
  },
  ovh: {
    baseUrl: 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1',
    accessToken: Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN'),
    model: 'Meta-Llama-3_3-70B-Instruct',
    maxTokens: 400,
    temperature: 0.7
  }
};

console.log("Generate Story Ending function started");

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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const ovhApiKey = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required Supabase environment variables');
    }

    // Determine which AI provider to use (OpenAI primary, OVH fallback)
    const hasOpenAI = openaiApiKey && !openaiApiKey.includes('placeholder');
    const hasOVH = ovhApiKey && !ovhApiKey.includes('placeholder');
    
    if (!hasOpenAI && !hasOVH) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required environment variables', 
          code: 'MISSING_API_KEYS',
          message: 'AI service API keys not configured'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const useOpenAI = hasOpenAI;
    const aiConfig = useOpenAI ? AI_CONFIG.openai : AI_CONFIG.ovh;
    const aiProvider = useOpenAI ? 'OpenAI' : 'OVH';
    
    console.log(`🎬 Using ${aiProvider} for story ending generation`);

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

    // Extract generation settings from the story
    const settings = story.generation_settings || {};
    const targetAge = story.target_age || settings.target_age || '7-9';
    const wordsPerChapter = settings.words_per_chapter || 150;
    
    console.log('🎬 Creating story ending with settings:', {
      genre: story.genre,
      theme: settings.theme,
      quest: settings.quest,
      moral_lesson: settings.moral_lesson,
      targetAge
    });

    // Get the full story content
    const storyContent = segments.map(segment => segment.content).join('\n\n');
    
    // Create comprehensive ending prompt using ALL custom settings
    const prompt = `You are concluding an interactive children's story with these specific details:

STORY CONTEXT:
- Title: "${story.title}"
- Genre: ${story.genre}
- Target Age: ${targetAge}
- Theme: ${settings.theme || story.description || 'adventure'}
- Setting: ${settings.setting || 'a magical place'}
- Main Quest: ${settings.quest || 'overcome challenges'}
- Moral Lesson: ${settings.moral_lesson || 'friendship and courage'}
- Conflict Resolution: ${settings.conflict || 'overcoming challenges'}

CURRENT STORY:
${storyContent}

ENDING REQUIREMENTS:
- Write approximately ${Math.min(wordsPerChapter + 50, 250)} words
- Use age-appropriate vocabulary for ${targetAge} year olds
- Create a satisfying conclusion that resolves the quest: "${settings.quest || 'overcome challenges'}"
- Reinforce the moral lesson: "${settings.moral_lesson || 'friendship and courage'}"
- Make it ${story.genre}-themed with positive, uplifting tone
- Wrap up all story elements in a meaningful way
- End with a sense of accomplishment and growth for the characters
- Include a brief reflection on what was learned
- Keep it educational and promote positive values

Create a heartwarming, complete ending that children will find satisfying and meaningful.`;

    // Generate ending using selected AI provider
    const requestBody = {
      model: aiConfig.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert children\'s story writer who creates engaging, age-appropriate stories with positive, meaningful endings.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: aiConfig.maxTokens,
      temperature: aiConfig.temperature
    };

    console.log(`Calling ${aiProvider} for story ending generation...`);

    const aiAuthHeader = useOpenAI ? `Bearer ${aiConfig.apiKey}` : `Bearer ${aiConfig.accessToken}`;
    const aiResponse = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': aiAuthHeader,
      },
      body: JSON.stringify(requestBody),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`${aiProvider} API error:`, aiResponse.status, errorText);
      
      // Try fallback if primary fails and we have OVH available
      if (useOpenAI && hasOVH) {
        console.log('⚠️ OpenAI failed for ending, trying OVH fallback...');
        const fallbackRequestBody = {
          model: AI_CONFIG.ovh.model,
          messages: requestBody.messages,
          max_tokens: AI_CONFIG.ovh.maxTokens,
          temperature: AI_CONFIG.ovh.temperature
        };
        
        const fallbackResponse = await fetch(`${AI_CONFIG.ovh.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_CONFIG.ovh.accessToken}`,
          },
          body: JSON.stringify(fallbackRequestBody),
        });
        
        if (fallbackResponse.ok) {
          console.log('✅ OVH fallback succeeded for story ending');
          const fallbackData = await fallbackResponse.json();
          const fallbackEndingText = fallbackData.choices[0].message.content?.trim() || '';
          
          // Save the ending as a new segment (using OVH result)
          const { data: fallbackEndingSegment, error: fallbackSegmentError } = await supabase
            .from('story_segments')
            .insert({
              story_id: storyId,
              content: fallbackEndingText,
              position: segments.length + 1,
              choices: [],
              is_end: true
            })
            .select()
            .single();

          if (fallbackSegmentError) {
            console.error('Error saving fallback ending segment:', fallbackSegmentError);
            throw new Error('Failed to save fallback ending segment');
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              endingSegment: fallbackEndingSegment,
              message: 'Story ending generated successfully using OVH fallback',
              provider: 'OVH'
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      throw new Error(`${aiProvider} API error: ${aiResponse.status}`);
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
        is_end: true
      })
      .select()
      .single();

    if (segmentError) {
      console.error('Error saving ending segment:', segmentError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save ending segment',
          details: segmentError,
          attempted_data: {
            story_id: storyId,
            content_length: endingText.length,
            position: segments.length + 1,
            choices: [],
            is_end: true
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
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