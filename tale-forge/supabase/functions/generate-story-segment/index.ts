// Tale Forge - Generate Story Segment Edge Function
// This function generates a story segment using OVH AI (Llama-3.3-70B)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

// AI Configuration - OpenAI primary, OVH fallback
const AI_CONFIG = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: Deno.env.get('OPENAI_API_KEY'),
    model: 'gpt-4o', // Using full GPT-4o for high-quality choices and story consistency
    maxTokens: 2048, // Increased for better story content
    temperature: 0.7
  },
  ovh: {
    baseUrl: 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1',
    accessToken: Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN'),
    model: 'Meta-Llama-3_3-70B-Instruct',
    maxTokens: 2048, // Increased to match OpenAI configuration
    temperature: 0.7
  }
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
      console.log('⚠️ No valid AI API keys found');
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
    console.log(`🤖 Using AI provider: ${useOpenAI ? 'OpenAI (gpt-4o)' : 'OVH (Llama-3.3-70B)'}`);

    // Select AI configuration
    const aiConfig = useOpenAI ? AI_CONFIG.openai : AI_CONFIG.ovh;
    const aiProvider = useOpenAI ? 'OpenAI' : 'OVH';

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Create Supabase client (initially without auth)
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    // Validate authentication and get user
    let user = null;
    let userId = null;
    
    if (authHeader) {
      console.log('🔐 Attempting to validate auth header...');
      try {
        // Extract the JWT token from Bearer header
        const token = authHeader.replace('Bearer ', '');
        
        // Use anon key client with the JWT token to get user
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
        const supabaseWithAuth = createClient(
          supabaseUrl,
          supabaseAnonKey,
          { global: { headers: { Authorization: authHeader } } }
        );
        
        const { data: { user: authUser }, error: userError } = await supabaseWithAuth.auth.getUser(token);
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
    }

    // Require authentication
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

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

    // Fetch existing story segments for context (needed before prompt generation)
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
    
    console.log('📋 Using story settings:', {
      genre: story.genre,
      theme: settings.theme,
      setting: settings.setting,
      characters: settings.characters?.length || 0,
      conflict: settings.conflict,
      quest: settings.quest,
      moral_lesson: settings.moral_lesson,
      atmosphere: settings.atmosphere,
      time_period: settings.time_period
    });

    // Create comprehensive prompt using ALL custom settings
    let prompt = `You are continuing an interactive children's story with these specific details:

STORY CONTEXT:
- Title: "${story.title}"
- Genre: ${story.genre}
- Target Age: ${targetAge}
- Theme: ${settings.theme || story.description || 'adventure'}
- Setting: ${settings.setting || 'a magical place'}
- Time Period: ${settings.time_period || 'present day'}
- Atmosphere: ${settings.atmosphere || 'exciting and positive'}
- Main Conflict: ${settings.conflict || 'overcoming challenges'}
- Quest/Goal: ${settings.quest || 'help others and learn valuable lessons'}
- Moral Lesson: ${settings.moral_lesson || 'friendship and courage'}

CHARACTERS:`;

    // Add character information if available
    if (userCharacters && userCharacters.length > 0) {
      const characterDescriptions = userCharacters
        .map(char => `- ${char.user_characters.name} (${char.user_characters.role}): ${char.user_characters.description}`)
        .join('\n');
      prompt += `\n${characterDescriptions}`;
    } else if (settings.characters && settings.characters.length > 0) {
      const characterDescriptions = settings.characters
        .map(char => `- ${char.name} (${char.role}): ${char.description}`)
        .join('\n');
      prompt += `\n${characterDescriptions}`;
    } else {
      prompt += '\n- A brave and curious main character';
    }

    // Add additional details if provided
    if (settings.additional_details) {
      prompt += `\n\nADDITIONAL STORY ELEMENTS:\n${settings.additional_details}`;
    }

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
    
    // Age-specific language guidelines based on effective age
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

    prompt += `\n\nWRITING INSTRUCTIONS:
- Write approximately ${wordsPerChapter} words (around ${Math.floor(wordsPerChapter * 0.8)}-${Math.floor(wordsPerChapter * 1.2)} words is perfect)
- Age: ${targetAge} years old - ${vocabularyGuidelines}
- Make it ${story.genre}-themed with ${settings.atmosphere || 'positive'} atmosphere
- Focus on the theme of "${settings.theme || 'adventure'}"
- Advance the quest: "${settings.quest || 'overcome challenges'}"
- Incorporate the moral lesson: "${settings.moral_lesson || 'friendship and courage'}"
- End with an engaging moment that leads to meaningful choices
- Keep the language appropriate for a ${targetAge}-year-old's comprehension level
- Make it educational and promote positive values
- IMPORTANT: Do NOT include the story title in your response
- Start directly with the story content, not with a title or heading
- Aim for natural storytelling flow around ${wordsPerChapter} words rather than forcing exact count`;
    
    // Add comprehensive story context for continuity
    if (segments && segments.length > 0) {
      prompt += `\n\nSTORY CONTEXT FOR CONTINUITY:`;
      
      // Include the last 2-3 segments for better context
      const contextSegments = segments.slice(-3);
      contextSegments.forEach((segment, index) => {
        const segmentNumber = segments.length - contextSegments.length + index + 1;
        prompt += `\n\nChapter ${segmentNumber}: ${segment.content}`;
      });
      
      // Add the user's choice that led to this segment
      if (previousSegment && choiceIndex !== undefined && previousSegment.choices[choiceIndex]) {
        const selectedChoice = previousSegment.choices[choiceIndex].text;
        prompt += `\n\nUSER'S CHOSEN ACTION: "${selectedChoice}"`;
        prompt += `\n\nCRITICAL INSTRUCTION: You MUST show the characters actually performing this chosen action: "${selectedChoice}"`;
        prompt += `\nStart the new chapter by showing the characters following through on this specific choice.`;
        prompt += `\nDo NOT ignore the choice or have characters do something completely different.`;
        prompt += `\nThe entire chapter should be a direct consequence of: "${selectedChoice}".`;
      }
    }

    // Calculate max_tokens based on words_per_chapter (roughly 1.3 tokens per word)
    const maxTokensForWords = Math.ceil(wordsPerChapter * 1.3);
    
    // Generate story segment using selected AI provider
    const requestBody = {
      model: aiConfig.model,
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
      max_tokens: Math.min(Math.max(maxTokensForWords, 50), 500), // Ensure reasonable bounds
      temperature: aiConfig.temperature
    };

    console.log(`Calling ${aiProvider} for story segment generation...`);

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
        console.log('⚠️ OpenAI failed, trying OVH fallback...');
        const fallbackRequestBody = {
          model: AI_CONFIG.ovh.model,
          messages: requestBody.messages,
          max_tokens: requestBody.max_tokens,
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
          console.log('✅ OVH fallback succeeded');
          const fallbackData = await fallbackResponse.json();
          const segmentText = fallbackData.choices[0].message.content?.trim() || '';
          // Continue with choices generation using OVH...
        }
      }
      
      throw new Error(`${aiProvider} API error: ${aiResponse.status}`);
    }

    const completion = await aiResponse.json();
    let segmentText = completion.choices[0].message.content?.trim() || '';
    
    // Post-process to remove story title if it appears at the beginning
    const titlePattern = new RegExp(`^\\*\\*${story.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*\\s*`, 'i');
    segmentText = segmentText.replace(titlePattern, '').trim();

    // Generate choices for the next segment using story context
    const choicesPrompt = `Based on the following story segment, create 3 meaningful choices that advance the story:

STORY CONTEXT:
- Genre: ${story.genre}
- Theme: ${settings.theme || 'adventure'}
- Setting: ${settings.setting || 'magical place'}
- Quest: ${settings.quest || 'overcome challenges'}
- Target Age: ${targetAge}
- Atmosphere: ${settings.atmosphere || 'positive'}

CURRENT SEGMENT:
${segmentText}

CRITICAL CHARACTER CONSISTENCY RULES:
- ONLY reference characters that are ALREADY MENTIONED in the current segment above
- Do NOT introduce new characters (no wizards, owls, fairies, etc. unless already in the story)
- Do NOT reference places not established in the story content
- Base choices on what the existing characters can actually do with what's available

Create 3 choices that:
- Are age-appropriate for ${targetAge} year olds
- Advance the quest: "${settings.quest || 'overcome challenges'}"
- Fit the ${story.genre} genre and ${settings.atmosphere || 'positive'} atmosphere
- Only involve characters and elements already present in the story
- Use simple language (5-10 words each)
- Start with action verbs

Return only the 3 choices, one per line, without numbers.`;

    const choicesRequestBody = {
      model: aiConfig.model,
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
      max_tokens: 200, // Increased for better choice quality
      temperature: 0.8
    };

    console.log(`Calling ${aiProvider} for choices generation...`);

    const choicesResponse = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': aiAuthHeader,
      },
      body: JSON.stringify(choicesRequestBody),
    });

    if (!choicesResponse.ok) {
      const errorText = await choicesResponse.text();
      console.error(`${aiProvider} API error for choices:`, choicesResponse.status, errorText);
      throw new Error(`${aiProvider} API error for choices: ${choicesResponse.status}`);
    }

    const choicesCompletion = await choicesResponse.json();
    const choicesText = choicesCompletion.choices[0].message.content?.trim() || '';
    
    // Helper function to strip markdown formatting
    const stripMarkdown = (text: string): string => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/~~(.*?)~~/g, '$1')
        .trim();
    };

    // Split choices and filter out empty ones
    const rawChoices = choicesText.split('\n')
      .map(text => stripMarkdown(text.trim()))
      .filter(text => text.length > 0)
      .slice(0, 3); // Limit to 3 choices
    
    console.log('🎯 Generated choices:', rawChoices);
    
    // Ensure we have exactly 3 choices
    const fallbackChoices = [
      'Continue the adventure',
      'Explore a different path',
      'Make a brave decision'
    ];
    
    const choices = [];
    for (let i = 0; i < 3; i++) {
      choices.push({
        id: `choice-${Date.now()}-${i}`,
        text: rawChoices[i] || fallbackChoices[i] || 'Continue the story',
        next_segment_id: null
      });
    }

    // Get the next position for the segment
    const { data: positionData, error: positionError } = await supabase
      .from('story_segments')
      .select('position')
      .eq('story_id', storyId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = positionData && positionData.length > 0 ? positionData[0].position + 1 : 1;

    // Save the new segment using authenticated client
    const supabaseWithAuth = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: newSegment, error: segmentError } = await supabaseWithAuth
      .from('story_segments')
      .insert({
        story_id: storyId,
        segment_text: segmentText,
        content: segmentText,
        choices: choices,
        position: nextPosition,
        segment_number: nextPosition,
        image_prompt: `Children's book illustration: ${segmentText.substring(0, 100)}...`,
        word_count: segmentText.split(' ').length,
        is_end: false,
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

    // Trigger async image generation (don't wait for completion)
    console.log(`🎨 Triggering async image generation for segment ${newSegment.id}`);
    try {
      const imageGenerationUrl = `${supabaseUrl}/functions/v1/generate-story-image`;
      fetch(imageGenerationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          segmentId: newSegment.id,
          imagePrompt: imagePrompt
        })
      }).then(response => {
        if (response.ok) {
          console.log(`✅ Image generation triggered for segment ${newSegment.id}`);
        } else {
          console.error(`❌ Failed to trigger image generation for segment ${newSegment.id}`);
        }
      }).catch(error => {
        console.error(`❌ Error triggering image generation for segment ${newSegment.id}:`, error);
      });
    } catch (error) {
      console.error('Error triggering async image generation:', error);
      // Don't fail the main request if image generation fails to trigger
    }

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