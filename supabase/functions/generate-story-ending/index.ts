// Tale Forge - Generate Story Ending Edge Function
// This function generates a satisfying conclusion for a story using AI

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

// AI Configuration - OpenAI primary, OVH fallback
const AI_CONFIG = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: Deno.env.get('OPENAI_API_KEY'),
    model: 'gpt-4o',
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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
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
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
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
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Extract generation settings from the story
    const settings = story.generation_settings || {};
    const targetAge = story.target_age || settings.target_age || 7;
    const wordsPerChapter = settings.words_per_chapter || story.words_per_chapter || 120;
    
    console.log('🎬 Creating story ending with settings:', {
      genre: story.genre,
      theme: settings.theme,
      quest: settings.quest,
      moral_lesson: settings.moral_lesson,
      targetAge
    });

    // Get the full story content
    const storyContent = segments.map(segment => segment.content).join('\n\n');
    
    // Parse age from various formats (3-4, 7-12, 5, etc.) to determine complexity
    const parseAge = (ageStr: string | number): number => {
      if (typeof ageStr === 'number') return ageStr;
      
      const str = String(ageStr);
      
      // Handle range format (e.g., "7-12", "3-4")
      if (str.includes('-')) {
        const [start, end] = str.split('-').map(Number);
        return !isNaN(start) && !isNaN(end) ? (start + end) / 2 : 7; // Default to 7 if parse fails
      }
      
      // Handle single number (e.g., "5", "8")
      const singleAge = parseInt(str);
      if (!isNaN(singleAge)) return singleAge;
      
      // Default fallback
      return 7;
    };
    
    const effectiveAge = parseAge(targetAge);
    
    // Age-specific language guidelines for ending based on effective age
    let vocabularyGuidelines = '';
    if (effectiveAge <= 4) {
      vocabularyGuidelines = 'Use very simple words (1-2 syllables), short sentences (5-8 words), and basic concepts. Focus on colors, animals, and familiar objects.';
    } else if (effectiveAge <= 6) {
      vocabularyGuidelines = 'Use simple vocabulary (2-3 syllables), short sentences (6-10 words), and clear cause-and-effect relationships.';
    } else if (effectiveAge <= 9) {
      vocabularyGuidelines = 'Use age-appropriate vocabulary with some challenging words, sentences of 8-12 words, and introduce basic problem-solving concepts.';
    } else {
      vocabularyGuidelines = 'Use varied vocabulary appropriate for the age group, with complex sentences and advanced concepts when suitable.';
    }

    // Create comprehensive ending prompt using ALL custom settings
    const endingWords = Math.min(wordsPerChapter + 30, 200); // Slightly longer for satisfying ending
    
    const prompt = `You are writing the FINAL CONCLUSION of an interactive children's story. This must be a definitive, satisfying ending that wraps up everything.

STORY CONTEXT:
- Title: "${story.title}"
- Genre: ${story.genre}
- Target Age: ${targetAge} years old
- Theme: ${settings.theme || story.description || 'adventure'}
- Setting: ${settings.setting || 'a magical place'}
- Main Quest: ${settings.quest || 'overcome challenges'}
- Moral Lesson: ${settings.moral_lesson || 'friendship and courage'}
- Conflict Resolution: ${settings.conflict || 'overcoming challenges'}

CURRENT STORY:
${storyContent}

CRITICAL ENDING REQUIREMENTS:
- Write approximately ${endingWords} words (around ${Math.floor(endingWords * 0.8)}-${Math.floor(endingWords * 1.2)} words is perfect)
- Age: ${targetAge} years old - ${vocabularyGuidelines}
- This is the ABSOLUTE FINAL segment - no more story after this
- COMPLETELY resolve the quest: "${settings.quest || 'overcome challenges'}"
- Provide closure for ALL characters and plot threads
- End with characters back home, safe, or in a peaceful state
- Include a clear "THE END" moment (characters reflecting, celebrating, or at peace)
- Reinforce the moral lesson: "${settings.moral_lesson || 'friendship and courage'}"
- Use phrases like "finally", "at last", "from that day forward", "and they lived happily"
- NO cliffhangers, NO unresolved mysteries, NO "to be continued" elements
- NO new challenges or adventures introduced
- End with warmth, satisfaction, and a sense of completion
- Include what the characters learned and how they grew
- Make it ${story.genre}-themed with positive, uplifting resolution
- Keep the language appropriate for a ${targetAge}-year-old's comprehension level
- IMPORTANT: Do NOT include the story title in your response
- Start directly with the story content, not with a title or heading
- Aim for natural story conclusion around ${endingWords} words for satisfying but appropriately-sized ending

Create a definitive, heartwarming finale that gives children complete closure and satisfaction.`;

    // Calculate max_tokens based on ending word count (roughly 1.3 tokens per word)
    const maxTokensForEnding = Math.ceil(endingWords * 1.3);
    
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
      max_tokens: Math.min(Math.max(maxTokensForEnding, 50), 400), // Ensure reasonable bounds
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
              segment_text: fallbackEndingText,
              content: fallbackEndingText,
              position: segments.length + 1,
              segment_number: segments.length + 1,
              choices: [],
              is_end: true,
              word_count: fallbackEndingText.split(' ').length,
              image_prompt: `Final illustration: ${fallbackEndingText.substring(0, 100)}...`,
              created_at: new Date().toISOString()
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
    let endingText = completion.choices[0].message.content?.trim() || '';
    
    // Post-process to remove story title if it appears at the beginning
    const titlePattern = new RegExp(`^\\*\\*${story.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*\\s*`, 'i');
    endingText = endingText.replace(titlePattern, '').trim();

    // Save the ending as a new segment
    const { data: endingSegment, error: segmentError } = await supabase
      .from('story_segments')
      .insert({
        story_id: storyId,
        segment_text: endingText,
        content: endingText,
        position: segments.length + 1,
        segment_number: segments.length + 1,
        choices: [],
        is_end: true,
        word_count: endingText.split(' ').length,
        image_prompt: `Final illustration: ${endingText.substring(0, 100)}...`,
        created_at: new Date().toISOString()
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
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in generate-story-ending function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});