// Tale Forge - Generate Story Segment Edge Function
// This function generates a story segment using OpenAI GPT-4o (primary) with OVH AI (fallback)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

// OpenAI Configuration (Primary AI Provider)
const OPENAI_CONFIG = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: Deno.env.get('OPENAI_API_KEY'),
  model: 'gpt-4o',
  maxTokens: 512,
  temperature: 0.7
};

// OVH AI Configuration (Fallback AI Provider)
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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const ovhApiKey = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required Supabase environment variables');
    }
    
    // Check if we have valid API keys (not placeholders) for at least one provider
    const hasOpenAI = openaiApiKey && !openaiApiKey.includes('placeholder');
    const hasOVH = ovhApiKey && !ovhApiKey.includes('placeholder');
    
    if (!hasOpenAI && !hasOVH) {
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
    
    console.log('🔍 AI Provider Status:', {
      hasOpenAI: hasOpenAI,
      hasOVH: hasOVH,
      primaryProvider: hasOpenAI ? 'OpenAI' : 'OVH (fallback only)'
    });

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

    // ✅ MULTI-PROVIDER AI SYSTEM: OpenAI (Primary) → OVH (Fallback) → Mock
    // This implements the proper fallback chain as per architectural analysis
    let segmentText = '';
    let choicesText = '';
    let usedProvider = '';
    let usedSingleCall = false;

    // Helper function to call any AI provider with structured JSON
    const callAIProvider = async (providerName, config, apiKey) => {
      console.log(`🤖 Attempting ${providerName} AI with single structured request...`);
      
      const structuredPrompt = `${prompt}

IMPORTANT: Respond with valid JSON in this exact format:
{
  "story_text": "Your story segment here (2-3 short paragraphs)",
  "choices": [
    "Choice 1 (5-10 words)",
    "Choice 2 (5-10 words)", 
    "Choice 3 (5-10 words)"
  ]
}

Make sure the story_text is engaging and age-appropriate, and the 3 choices continue the story in different directions.`;

      const requestBody = {
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert children\'s story writer who creates engaging, age-appropriate stories with positive messages. Always respond with valid JSON in the specified format.'
          },
          {
            role: 'user',
            content: structuredPrompt
          }
        ],
        max_tokens: (story.target_age === '4-6' ? 300 : story.target_age === '7-9' ? 400 : 500) + 200,
        temperature: config.temperature
      };

      const authHeader = providerName === 'OpenAI' ? `Bearer ${apiKey}` : `Bearer ${apiKey}`;
      
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ ${providerName} AI API error:`, response.status, errorText);
        throw new Error(`${providerName} API error: ${response.status} - ${errorText}`);
      }

      const completion = await response.json();
      const rawResponse = completion.choices[0].message.content?.trim() || '';
      
      console.log(`📥 ${providerName} raw response: ${rawResponse.substring(0, 200)}...`);
      
      // Parse JSON response
      const parsedResponse = JSON.parse(rawResponse);
      
      if (!parsedResponse.story_text || !parsedResponse.choices || !Array.isArray(parsedResponse.choices)) {
        throw new Error('Invalid JSON structure - missing story_text or choices');
      }

      return {
        segmentText: parsedResponse.story_text.trim(),
        choicesText: parsedResponse.choices.join('\n'),
        provider: providerName
      };
    };

    // Try providers in order: OpenAI → OVH
    let lastError = null;
    
    // 1. Try OpenAI first (if available)
    if (hasOpenAI) {
      try {
        console.log('🚀 PRIMARY: Attempting OpenAI GPT-4o...');
        const result = await callAIProvider('OpenAI', OPENAI_CONFIG, openaiApiKey);
        segmentText = result.segmentText;
        choicesText = result.choicesText;
        usedProvider = result.provider;
        usedSingleCall = true;
        console.log('✅ SUCCESS: OpenAI generated story and choices!');
      } catch (error) {
        console.log(`⚠️ OpenAI failed: ${error.message}`);
        lastError = error;
      }
    }
    
    // 2. Try OVH if OpenAI failed or unavailable
    if (!segmentText && hasOVH) {
      try {
        console.log('🔄 FALLBACK: Attempting OVH Llama-3.3-70B...');
        const result = await callAIProvider('OVH', OVH_AI_CONFIG, ovhApiKey);
        segmentText = result.segmentText;
        choicesText = result.choicesText;
        usedProvider = result.provider;
        usedSingleCall = true;
        console.log('✅ SUCCESS: OVH generated story and choices!');
      } catch (error) {
        console.log(`⚠️ OVH failed: ${error.message}`);
        lastError = error;
      }
    }
    
    // 3. If all AI providers failed, throw the last error
    if (!segmentText) {
      console.error('🚨 CRITICAL: All AI providers failed!', {
        hasOpenAI: hasOpenAI,
        hasOVH: hasOVH,
        lastError: lastError?.message
      });
      throw lastError || new Error('All AI providers are unavailable');
    }
    
    console.log(`🔍 Original AI response length: ${choicesText.length} characters`);
    console.log(`🔍 Original AI response: "${choicesText}"`);
    
    // ULTRA-ROBUST choice parsing - catch ALL possible formats
    let rawChoices = [];
    
    console.log(`🔍 DEBUG: Raw AI response: "${choicesText}"`);
    console.log(`🔍 DEBUG: Response length: ${choicesText.length} characters`);
    
    // Method 1: Split by any common separators and clean up
    rawChoices = choicesText
      .split(/[\n\r]+/) // Split by newlines/returns
      .map(text => text.trim())
      .map(text => text.replace(/^\d+[\.\)\:]?\s*/, '')) // Remove numbering: "1.", "1)", "1:"
      .map(text => text.replace(/^[A-Za-z][\.\)\:]\s+/, '')) // Remove lettering ONLY if followed by punctuation AND space: "A. ", "A) ", "A: "  
      .map(text => text.replace(/^[-•*\.\+]\s*/, '')) // Remove bullets: "-", "•", "*", ".", "+"
      .map(text => text.replace(/^["'`](.*)["'`]$/, '$1')) // Remove quotes
      .map(text => text.trim())
      .filter(text => text.length > 5) // Must be at least 5 characters
      .filter(text => !text.match(/^\d+\.?\s*$/)) // Remove pure numbers
      .slice(0, 3);
    
    console.log(`🔍 Method 1 (enhanced splitting) found choices: ${rawChoices.length} [${rawChoices.join(' | ')}]`);
    
    // Method 2: If we have less than 3, try sentence extraction
    if (rawChoices.length < 3) {
      console.log('🔍 Trying Method 2: sentence extraction...');
      
      // Look for sentences that sound like choices
      const sentences = choicesText
        .replace(/[\n\r]+/g, ' ') // Join lines
        .split(/[.!?]+/) // Split by sentence endings
        .map(s => s.trim())
        .filter(s => s.length > 5)
        .filter(s => s.length < 100) // Not too long
        .slice(0, 3);
        
      if (sentences.length >= 3) {
        rawChoices = sentences.slice(0, 3);
        console.log(`✅ Method 2 found choices: ${rawChoices.length} [${rawChoices.join(' | ')}]`);
      }
    }
    
    // Method 3: If still not enough, try any text extraction
    if (rawChoices.length < 3) {
      console.log('🔍 Trying Method 3: word-based extraction...');
      
      // Split by common delimiters and take anything reasonable
      const parts = choicesText
        .split(/[,;\n\r\-\|]+/)
        .map(text => text.trim())
        .map(text => text.replace(/^\d+[\.\)\:]?\s*/, ''))
        .map(text => text.replace(/^[A-Za-z][\.\)\:]?\s*/, ''))
        .filter(text => text.length > 3 && text.length < 50)
        .slice(0, 3);
        
      if (parts.length >= rawChoices.length) {
        rawChoices = parts.slice(0, 3);
        console.log(`✅ Method 3 found choices: ${rawChoices.length} [${rawChoices.join(' | ')}]`);
      }
    }
    
    // If we still don't have 3 choices, use contextual fallbacks
    if (rawChoices.length < 3) {
      console.log(`⚠️ FALLBACK TRIGGERED: Only got ${rawChoices.length} choices from AI`);
      console.log(`⚠️ Original AI response: "${choicesText}"`);
      console.log(`⚠️ Parsed choices: ${JSON.stringify(rawChoices)}`);
      
      const storyLower = segmentText.toLowerCase();
      let fallbacks = [];
      
      // Context-aware fallbacks based on story content
      if (storyLower.includes('door') || storyLower.includes('entrance')) {
        fallbacks = ['Go through the door', 'Look for another way', 'Wait and listen first'];
      } else if (storyLower.includes('magic') || storyLower.includes('spell')) {
        fallbacks = ['Use magic to help', 'Be careful with the magic', 'Ask about the magic'];
      } else if (storyLower.includes('forest') || storyLower.includes('woods')) {
        fallbacks = ['Follow the forest path', 'Look for hidden trails', 'Call out for help'];
      } else if (storyLower.includes('castle') || storyLower.includes('tower')) {
        fallbacks = ['Explore the castle', 'Find another entrance', 'Look for a way up'];
      } else if (storyLower.includes('dragon') || storyLower.includes('creature')) {
        fallbacks = ['Approach carefully', 'Try to communicate', 'Find a safe distance'];
      } else if (storyLower.includes('treasure') || storyLower.includes('chest')) {
        fallbacks = ['Open the treasure', 'Check for traps first', 'Look around more'];
      } else {
        // Final generic fallbacks
        console.log('🚨 USING FINAL GENERIC FALLBACKS - AI parsing completely failed');
        fallbacks = ['Continue the adventure', 'Look around carefully', 'Make a thoughtful choice'];
      }
      
      // Fill missing choices with fallbacks
      while (rawChoices.length < 3 && fallbacks.length > 0) {
        rawChoices.push(fallbacks.shift());
      }
      
      console.log(`✅ Added fallback choices: ${JSON.stringify(rawChoices)}`);
    }
    
    const choices = rawChoices.map((text, index) => ({
      id: `choice-${Date.now()}-${index}`,
      text: text,
      next_segment_id: null
    }));
    
    // 📊 PERFORMANCE ANALYTICS: Log provider and method success
    console.log(`📈 AI PROVIDER PERFORMANCE METRICS:`);
    console.log(`   • Provider used: ${usedProvider || 'Unknown'}`);
    console.log(`   • Method: ${usedSingleCall ? 'SINGLE STRUCTURED JSON CALL' : 'DUAL API CALLS'}`);
    console.log(`   • API calls made: ${usedSingleCall ? '1' : '2'}`);
    console.log(`   • Fallback triggered: ${usedProvider !== 'OpenAI' ? 'YES' : 'NO'}`);
    console.log(`   • Story text length: ${segmentText.length} characters`);
    console.log(`   • Choices generated: ${choices.length}`);
    
    if (usedProvider !== 'OpenAI') {
      console.log(`⚠️ NOTICE: Primary OpenAI provider not used - using ${usedProvider} fallback`);
    }

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
        message: `Story segment generated successfully using ${usedProvider}`,
        // AI Provider metrics for monitoring
        aiMetrics: {
          provider: usedProvider,
          method: usedSingleCall ? 'single_structured_json' : 'dual_api_calls',
          api_calls_made: usedSingleCall ? 1 : 2,
          fallback_triggered: usedProvider !== 'OpenAI',
          story_length: segmentText.length,
          choices_count: choices.length
        }
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