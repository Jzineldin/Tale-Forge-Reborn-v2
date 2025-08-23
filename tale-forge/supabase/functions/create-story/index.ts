// Tale Forge - Create Story Edge Function
// This function creates a new story using OVH AI (Llama-3.3-70B)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

// OVH AI Configuration
const OVH_AI_CONFIG = {
  baseUrl: 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1',
  accessToken: Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN'),
  textModel: 'Meta-Llama-3_3-70B-Instruct',
  maxTokens: 4096,
  temperature: 0.7
};

interface StoryCreationRequest {
  title: string;
  description: string;
  genre: string;
  age_group?: string;  // Optional - for backward compatibility
  target_age: string | number;  // Main age field
  theme: string;
  setting: string;
  characters: any[];
  conflict: string;
  quest: string;
  moral_lesson: string;
  additional_details: string;
  setting_description: string;
  time_period: string;
  atmosphere: string;
  words_per_chapter?: number;
}

console.log("Create Story function started");

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate fallback story when AI fails
function generateFallbackStory(storyData: StoryCreationRequest): string {
  const wordsPerChapter = storyData.words_per_chapter || 120;
  const targetAge = typeof storyData.target_age === 'number' ? storyData.target_age : parseInt(String(storyData.target_age || storyData.age_group || 7));
  
  // Create age-appropriate content
  let vocabulary = "simple";
  let concepts = "basic adventures";
  
  if (targetAge <= 4) {
    vocabulary = "very simple";
    concepts = "colors, animals, and friends";
  } else if (targetAge <= 6) {
    vocabulary = "easy";
    concepts = "fun discoveries and helping others";
  }
  
  // Generate content roughly matching word count
  const sentences = Math.ceil(wordsPerChapter / 10); // Roughly 10 words per sentence
  
  let content = `Once upon a time, there was a ${vocabulary} ${storyData.genre} story about ${concepts}. `;
  
  for (let i = 1; i < sentences; i++) {
    content += `This is sentence ${i + 1} of the story. `;
  }
  
  content += "What happens next?";
  
  return content;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    // Validate environment variables
    const ovhApiKey = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
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
    console.log('📋 Auth header received:', authHeader ? `${authHeader.substring(0, 20)}...` : 'NONE');
    
    // Create Supabase client (temporarily without auth requirement)
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    // Get user from authentication
    let user = null;
    let userId = null;
    
    if (authHeader) {
      console.log('🔐 Attempting to validate auth header...');
      try {
        const supabaseWithAuth = createClient(
          supabaseUrl,
          supabaseServiceKey,
          { global: { headers: { Authorization: authHeader } } }
        );
        
        const { data: { user: authUser }, error: userError } = await supabaseWithAuth.auth.getUser();
        console.log('👤 Auth result:', { hasUser: !!authUser, error: userError?.message });
        
        if (authUser) {
          user = authUser;
          userId = authUser.id;
          console.log('✅ User authenticated:', userId);
        } else {
          console.log('⚠️ Auth failed - no user found');
        }
      } catch (authError) {
        console.log('❌ Auth validation error:', authError);
      }
    } else {
      console.log('⚠️ No auth header provided');
    }

    // Require authentication for story creation
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Get request body
    const storyData: StoryCreationRequest = await req.json();

    if (!storyData.title || !storyData.genre || (!storyData.target_age && !storyData.age_group)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title, genre, target_age' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create the story prompt for OVH AI with custom word count
    const wordsPerChapter = storyData.words_per_chapter || 350;
    const wordCountRange = `${Math.max(wordsPerChapter - 50, 100)}-${wordsPerChapter + 50}`;
    
    const storyPrompt = `You are a master storyteller creating personalized children's stories.

Create an engaging story with these details:
- Title: ${storyData.title}
- Age group: ${storyData.target_age || storyData.age_group}
- Genre: ${storyData.genre}
- Theme: ${storyData.theme}
- Characters: ${storyData.characters?.map(c => `${c.name} (${c.role}): ${c.description}`).join(', ')}
- Setting: ${storyData.setting}
- Time period: ${storyData.time_period}
- Atmosphere: ${storyData.atmosphere}
- Conflict: ${storyData.conflict}
- Quest/Goal: ${storyData.quest}
- Moral lesson: ${storyData.moral_lesson}
- Additional details: ${storyData.additional_details}

The story should be:
- Age-appropriate with vocabulary suitable for ${storyData.target_age || storyData.age_group}
- Interactive with meaningful choices
- Educational with positive values
- Engaging with vivid descriptions
- Safe and wholesome content
- Approximately ${wordsPerChapter} words per chapter (${wordCountRange} words range is perfect)

Generate the opening chapter around ${wordsPerChapter} words that sets up the story world and introduces the main character(s). End with 3 compelling choices for what happens next. Format each choice as a clear, actionable option starting with an action verb.

IMPORTANT: Aim for natural storytelling flow around ${wordsPerChapter} words rather than forcing exact count.`;

    // Generate the first story segment using OVH AI
    const aiPayload = {
      model: OVH_AI_CONFIG.textModel,
      messages: [
        {
          role: 'system',
          content: 'You are an expert children\'s story writer who creates engaging, age-appropriate stories with positive educational messages. Always include exactly 3 choices at the end of each story segment.'
        },
        {
          role: 'user',
          content: storyPrompt
        }
      ],
      max_tokens: OVH_AI_CONFIG.maxTokens,
      temperature: OVH_AI_CONFIG.temperature,
    };

    console.log('Calling OVH AI for story generation...');
    
    const aiResponse = await fetch(`${OVH_AI_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OVH_AI_CONFIG.accessToken}`,
      },
      body: JSON.stringify(aiPayload),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OVH AI API error:', aiResponse.status, errorText);
      
      // Create a simple story manually when AI fails
      console.log('🎭 AI service failed, creating simple story manually...');
      
      const fallbackContent = generateFallbackStory(storyData);
      const choices = [
        { id: `choice-${Date.now()}-0`, text: 'Continue the adventure', next_segment_id: null },
        { id: `choice-${Date.now()}-1`, text: 'Explore somewhere new', next_segment_id: null },
        { id: `choice-${Date.now()}-2`, text: 'Try something different', next_segment_id: null }
      ];
      
      // Skip AI generation and proceed directly to database storage
      const storyText = fallbackContent;
      
      // Create the story in Supabase
      const { data: newStory, error: storyError } = await supabase
        .from('stories')
        .insert({
          title: storyData.title,
          description: storyData.description,
          user_id: userId,
          genre: storyData.genre,
          target_age: String(storyData.target_age || storyData.age_group || "7-9"),
          story_mode: 'interactive',
          is_completed: false,
          is_public: false,
          language: 'en',
          content_rating: 'G',
          ai_model_used: 'Fallback-Manual',
          generation_settings: {
            theme: storyData.theme,
            setting: storyData.setting,
            characters: storyData.characters,
            conflict: storyData.conflict,
            quest: storyData.quest,
            moral_lesson: storyData.moral_lesson,
            time_period: storyData.time_period,
            atmosphere: storyData.atmosphere,
            additional_details: storyData.additional_details,
            words_per_chapter: storyData.words_per_chapter || 120,
            target_age: storyData.target_age || storyData.age_group
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (storyError) {
        console.error('Error creating fallback story:', storyError);
        return new Response(
          JSON.stringify({ error: 'Failed to create story in database' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      // Create the first story segment
      const { data: newSegment, error: segmentError } = await supabase
        .from('story_segments')
        .insert({
          story_id: newStory.id,
          content: storyText,
          position: 1,
          choices: choices,
          image_prompt: `Children's book illustration: ${storyText.substring(0, 100)}... in ${storyData.genre} style`,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (segmentError) {
        console.error('❌ Error creating fallback story segment:', segmentError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create story segment', 
            segmentError: segmentError,
            story: newStory 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          story: newStory,
          firstSegment: newSegment,
          model: 'Fallback-Manual',
          message: 'Story created with fallback method'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices[0].message.content;
    
    console.log('Story content generated successfully');

    // Parse the generated content to extract story text and choices
    const contentParts = generatedContent.split(/(?:What happens next|Choose what happens next|Your choices are)/i);
    const storyText = contentParts[0].trim();
    
    // Extract choices from the generated content
    let choices = [];
    if (contentParts.length > 1) {
      const choicesText = contentParts[1];
      const choiceMatches = choicesText.match(/\d+\.\s*(.+?)(?=\d+\.|$)/g);
      
      if (choiceMatches && choiceMatches.length >= 3) {
        choices = choiceMatches.slice(0, 3).map((choice, index) => ({
          id: `choice-${Date.now()}-${index}`,
          text: choice.replace(/^\d+\.\s*/, '').trim(),
          next_segment_id: null
        }));
      }
    }

    // If we couldn't parse choices, generate them separately
    if (choices.length < 3) {
      console.log('Generating choices separately...');
      
      const choicesPrompt = `Based on the following story opening for children aged ${storyData.target_age || storyData.age_group}, create exactly 3 simple choices that would continue the story in different exciting directions:

${storyText}

Return exactly 3 choices, each starting with an action verb, formatted as:
1. [Choice 1]
2. [Choice 2]  
3. [Choice 3]`;

      const choicesPayload = {
        model: OVH_AI_CONFIG.textModel,
        messages: [
          {
            role: 'user',
            content: choicesPrompt
          }
        ],
        max_tokens: 200,
        temperature: 0.8,
      };

      const choicesResponse = await fetch(`${OVH_AI_CONFIG.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OVH_AI_CONFIG.accessToken}`,
        },
        body: JSON.stringify(choicesPayload),
      });

      if (choicesResponse.ok) {
        const choicesData = await choicesResponse.json();
        const choicesText = choicesData.choices[0].message.content;
        const choiceMatches = choicesText.match(/\d+\.\s*(.+?)(?=\d+\.|$)/g);
        
        if (choiceMatches) {
          choices = choiceMatches.slice(0, 3).map((choice, index) => ({
            id: `choice-${Date.now()}-${index}`,
            text: choice.replace(/^\d+\.\s*/, '').trim(),
            next_segment_id: null
          }));
        }
      }
    }

    // Fallback choices if AI generation fails
    if (choices.length < 3) {
      choices = [
        { id: `choice-${Date.now()}-0`, text: 'Continue the adventure', next_segment_id: null },
        { id: `choice-${Date.now()}-1`, text: 'Explore a different path', next_segment_id: null },
        { id: `choice-${Date.now()}-2`, text: 'Try something unexpected', next_segment_id: null }
      ];
    }

    // Create the story in Supabase
    const { data: newStory, error: storyError } = await supabase
      .from('stories')
      .insert({
        title: storyData.title,
        description: storyData.description,
        user_id: userId,
        genre: storyData.genre,
        target_age: String(storyData.target_age || storyData.age_group || "7-9"),
        story_mode: 'interactive',
        is_completed: false,
        is_public: false,
        language: 'en',
        content_rating: 'G',
        ai_model_used: OVH_AI_CONFIG.textModel,
        generation_settings: {
          theme: storyData.theme,
          setting: storyData.setting,
          characters: storyData.characters,
          conflict: storyData.conflict,
          quest: storyData.quest,
          moral_lesson: storyData.moral_lesson,
          time_period: storyData.time_period,
          atmosphere: storyData.atmosphere,
          additional_details: storyData.additional_details,
          words_per_chapter: wordsPerChapter,
          target_age: storyData.target_age
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (storyError) {
      console.error('Error creating story:', storyError);
      return new Response(
        JSON.stringify({ error: 'Failed to create story in database' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Create the first story segment
    const { data: newSegment, error: segmentError } = await supabase
      .from('story_segments')
      .insert({
        story_id: newStory.id,
        content: storyText,
        position: 1,
        choices: choices,
        image_prompt: `Children's book illustration: ${storyText.substring(0, 100)}... in ${storyData.genre} style`,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (segmentError) {
      console.error('❌ CRITICAL: Error creating story segment:', segmentError);
      console.error('Segment error details:', JSON.stringify(segmentError, null, 2));
      // This is actually critical - return error to help debug
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create story segment', 
          segmentError: segmentError,
          story: newStory 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log('Story created successfully:', newStory.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        story: newStory,
        firstSegment: newSegment,
        tokensUsed: aiData.usage?.total_tokens || 0,
        model: OVH_AI_CONFIG.textModel,
        message: 'Story created successfully'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in create-story function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});