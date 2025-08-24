// Tale Forge - Create Story Edge Function
// This function creates a new story using OpenAI GPT-4o (primary) with OVH AI (fallback)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

// AI Provider Configurations
const OPENAI_CONFIG = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: Deno.env.get('OPENAI_API_KEY'),
  textModel: 'gpt-4o', // Using full GPT-4o for best quality and performance
  maxTokens: 2048, // Reduced from 4096 for faster generation
  temperature: 0.7
};

const OVH_AI_CONFIG = {
  baseUrl: 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1',
  accessToken: Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN'),
  textModel: 'Meta-Llama-3_3-70B-Instruct',
  maxTokens: 2048, // Reduced from 4096 for faster generation
  temperature: 0.7
};

// Helper function to strip markdown formatting from text
function stripMarkdown(text: string): string {
  return text
    // Remove bold/italic markdown (**text**, *text*, __text__, _text_)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Remove any remaining markdown formatting
    .replace(/`(.*?)`/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .trim();
}

// AI Provider with fallback logic
async function generateStoryWithAI(prompt: string, systemPrompt: string) {
  console.log('🔑 Environment check:', {
    hasOpenAIKey: !!OPENAI_CONFIG.apiKey,
    openAIKeyLength: OPENAI_CONFIG.apiKey?.length,
    openAIKeyStart: OPENAI_CONFIG.apiKey?.substring(0, 10),
    isPlaceholder: OPENAI_CONFIG.apiKey?.includes('placeholder'),
    hasOVHKey: !!OVH_AI_CONFIG.accessToken,
    ovhKeyLength: OVH_AI_CONFIG.accessToken?.length,
    ovhKeyStart: OVH_AI_CONFIG.accessToken?.substring(0, 10)
  });
  
  // Try OpenAI first (primary provider)
  if (OPENAI_CONFIG.apiKey && !OPENAI_CONFIG.apiKey.includes('placeholder')) {
    console.log('🚀 Attempting story generation with OpenAI GPT-4o...');
    
    try {
      console.log('📡 Making OpenAI API call...');
      console.log('📡 Request details:', {
        url: `${OPENAI_CONFIG.baseUrl}/chat/completions`,
        model: OPENAI_CONFIG.textModel,
        maxTokens: OPENAI_CONFIG.maxTokens,
        temperature: OPENAI_CONFIG.temperature,
        promptLength: prompt.length,
        systemPromptLength: systemPrompt.length
      });

      const openaiResponse = await fetch(`${OPENAI_CONFIG.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`,
        },
        body: JSON.stringify({
          model: OPENAI_CONFIG.textModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: OPENAI_CONFIG.maxTokens,
          temperature: OPENAI_CONFIG.temperature,
        }),
      });

      console.log('📡 OpenAI Response status:', openaiResponse.status);
      console.log('📡 OpenAI Response headers:', Object.fromEntries(openaiResponse.headers.entries()));

      if (openaiResponse.ok) {
        const openaiData = await openaiResponse.json();
        console.log('✅ Story generated successfully with OpenAI');
        console.log('📊 Usage:', openaiData.usage);
        console.log('📝 Response preview:', openaiData.choices[0].message.content?.substring(0, 200) + '...');
        return {
          success: true,
          content: openaiData.choices[0].message.content,
          model: 'OpenAI-GPT-4o',
          provider: 'openai',
          usage: openaiData.usage
        };
      } else {
        const errorText = await openaiResponse.text();
        console.log('❌ OpenAI request failed:', openaiResponse.status);
        console.log('❌ OpenAI error details:', errorText);
      }
    } catch (error) {
      console.log('❌ OpenAI request exception:', error.message);
      console.log('❌ OpenAI error stack:', error.stack);
    }
  } else {
    console.log('⚠️ OpenAI API key not configured, skipping primary provider');
  }

  // Fallback to OVH AI
  if (OVH_AI_CONFIG.accessToken && !OVH_AI_CONFIG.accessToken.includes('placeholder')) {
    console.log('🔄 Falling back to OVH AI (Meta-Llama-3.3-70B)...');
    
    try {
      const ovhResponse = await fetch(`${OVH_AI_CONFIG.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OVH_AI_CONFIG.accessToken}`,
        },
        body: JSON.stringify({
          model: OVH_AI_CONFIG.textModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: OVH_AI_CONFIG.maxTokens,
          temperature: OVH_AI_CONFIG.temperature,
        }),
      });

      if (ovhResponse.ok) {
        const ovhData = await ovhResponse.json();
        console.log('✅ Story generated successfully with OVH AI fallback');
        return {
          success: true,
          content: ovhData.choices[0].message.content,
          model: 'OVH-Meta-Llama-3_3-70B-Instruct',
          provider: 'ovh',
          usage: ovhData.usage
        };
      } else {
        const errorText = await ovhResponse.text();
        console.log('❌ OVH AI request also failed:', ovhResponse.status, errorText);
      }
    } catch (error) {
      console.log('❌ OVH AI request error:', error);
    }
  } else {
    console.log('❌ OVH AI access token not configured');
  }

  // Both providers failed
  return {
    success: false,
    error: 'All AI providers failed',
    model: 'None',
    provider: 'none'
  };
}

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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
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
        // Extract the JWT token from Bearer header
        const token = authHeader.replace('Bearer ', '');
        
        // Use anon key client with the JWT token to get user
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

IMPORTANT FORMATTING:
- Do NOT include the title in your response - start directly with the story content
- Do NOT use markdown formatting (**, __, etc.) in choices - use plain text only
- Do NOT end story content with "What will they do next?" or similar transition phrases (this will be TTS narrated)
- End story content naturally with the story situation, then provide choices
- Only reference characters/places already established in the story content
- Aim for natural storytelling flow around ${wordsPerChapter} words rather than forcing exact count`;

    // Generate the first story segment using AI provider system (OpenAI primary, OVH fallback)
    const systemPrompt = 'You are an expert children\'s story writer who creates engaging, age-appropriate stories with positive educational messages. Write for TTS narration (no transition phrases like "What will they do next?"). Always include exactly 3 choices that reference only characters/elements from your story content.';
    
    console.log('🤖 Generating story with AI provider system...');
    console.log('📋 Request data:', JSON.stringify(storyData, null, 2));
    console.log('📋 Prompt preview:', storyPrompt.substring(0, 300) + '...');
    
    const aiStartTime = Date.now();
    
    // Add timeout to AI generation to prevent hanging
    const AI_TIMEOUT = 45000; // 45 second timeout
    const aiPromise = generateStoryWithAI(storyPrompt, systemPrompt);
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI generation timeout')), AI_TIMEOUT);
    });
    
    const aiResult = await Promise.race([aiPromise, timeoutPromise]).catch(error => {
      console.error('❌ AI generation failed or timed out:', error);
      console.error('❌ Error stack:', error.stack);
      return { success: false, error: error.message };
    });
    
    const aiDuration = Date.now() - aiStartTime;
    console.log(`🤖 AI generation completed in ${aiDuration}ms (timeout was ${AI_TIMEOUT}ms)`);
    console.log('🤖 AI result:', { success: aiResult.success, error: aiResult.error, hasContent: !!aiResult.content });

    if (!aiResult.success) {
      console.log('🎭 All AI providers failed, creating simple story manually...');
      console.log('❌ AI Result Error Details:', {
        success: aiResult.success,
        error: aiResult.error,
        hasOpenAI: hasOpenAI,
        hasOVH: hasOVH,
        requestData: JSON.stringify(storyData, null, 2)
      });
      
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
          segment_text: storyText,
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

    const generatedContent = aiResult.content;
    
    console.log(`✅ Story content generated successfully using ${aiResult.model}`);

    // Parse the generated content to extract story text and choices
    console.log('🔍 Raw AI response:', generatedContent.substring(0, 500) + '...');
    
    // Try multiple patterns to extract choices from AI response
    let choices = [];
    let storyText = generatedContent;
    
    // Pattern 1: Look for numbered choices at the end of the content
    const numberedChoiceMatches = generatedContent.match(/\d+\.\s*(.+?)(?=\s*\d+\.|\s*$)/g);
    if (numberedChoiceMatches && numberedChoiceMatches.length >= 3) {
      console.log('✅ Found numbered choices:', numberedChoiceMatches);
      // Extract the story text before the choices
      const firstChoiceIndex = generatedContent.indexOf(numberedChoiceMatches[0]);
      storyText = generatedContent.substring(0, firstChoiceIndex).trim();
      
      choices = numberedChoiceMatches.slice(0, 3).map((choice, index) => ({
        id: `choice-${Date.now()}-${index}`,
        text: stripMarkdown(choice.replace(/^\d+\.\s*/, '')),
        next_segment_id: null
      }));
    }
    
    // Pattern 2: Look for choices after common trigger phrases
    if (choices.length < 3) {
      const contentParts = generatedContent.split(/(?:What happens next|Choose what happens next|Your choices are|What would you like to do)/i);
      if (contentParts.length > 1) {
        storyText = contentParts[0].trim();
        const choicesText = contentParts[1];
        const choiceMatches = choicesText.match(/\d+\.\s*(.+?)(?=\d+\.|$)/g);
        
        if (choiceMatches && choiceMatches.length >= 3) {
          console.log('✅ Found choices after trigger phrase:', choiceMatches);
          choices = choiceMatches.slice(0, 3).map((choice, index) => ({
            id: `choice-${Date.now()}-${index}`,
            text: stripMarkdown(choice.replace(/^\d+\.\s*/, '')),
            next_segment_id: null
          }));
        }
      }
    }
    
    // Pattern 3: Look for any line starting with number+period (more flexible)
    if (choices.length < 3) {
      const lines = generatedContent.split('\n');
      const choiceLines = lines.filter(line => /^\s*\d+\.\s*.+/.test(line.trim()));
      if (choiceLines.length >= 3) {
        console.log('✅ Found choice lines:', choiceLines);
        // Find where choices start to separate story text
        const firstChoiceLine = choiceLines[0];
        const choiceStartIndex = generatedContent.indexOf(firstChoiceLine);
        storyText = generatedContent.substring(0, choiceStartIndex).trim();
        
        choices = choiceLines.slice(0, 3).map((choice, index) => ({
          id: `choice-${Date.now()}-${index}`,
          text: stripMarkdown(choice.replace(/^\s*\d+\.\s*/, '')),
          next_segment_id: null
        }));
      }
    }
    
    // Pattern 4: Look for sentence-based choices (new pattern for non-numbered choices)
    if (choices.length < 3) {
      console.log('🔍 Trying sentence-based choice extraction...');
      
      // Look for the last paragraph or sentences that could be choices
      const lines = generatedContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const lastLine = lines[lines.length - 1];
      
      // Check if last line contains multiple sentences that could be choices
      const sentences = lastLine.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
      
      if (sentences.length >= 3) {
        console.log('✅ Found sentence-based choices:', sentences);
        
        // Remove the choices from story text
        const choicesStartIndex = generatedContent.lastIndexOf(lastLine);
        if (choicesStartIndex > 0) {
          storyText = generatedContent.substring(0, choicesStartIndex).trim();
        }
        
        choices = sentences.slice(0, 3).map((choice, index) => ({
          id: `choice-${Date.now()}-${index}`,
          text: stripMarkdown(choice.trim()),
          next_segment_id: null
        }));
      }
    }

    console.log(`🎯 Extracted ${choices.length} choices:`, choices.map(c => c.text));

    // Clean up story text - remove title if AI included it despite instructions
    if (storyText) {
      // Remove title patterns at the beginning
      storyText = storyText
        .replace(/^\*\*Title:\s*.*?\*\*/i, '') // **Title: Story Name**
        .replace(/^Title:\s*.*?\n/i, '')        // Title: Story Name (newline)
        .replace(/^\*\*.*?\*\*\s*\n/i, '')      // **Any Title** (newline)
        .replace(/^#\s*.*?\n/i, '')             // # Title (markdown header)
        .trim();
      
      console.log('🧹 Story text cleaned, length:', storyText.length);
    }

    // If we couldn't parse choices, generate them separately
    if (choices.length < 3) {
      console.log('🔄 Generating choices separately...');
      
      const choicesPrompt = `Based on the following story opening for children aged ${storyData.target_age || storyData.age_group}, create exactly 3 simple choices that would continue the story in different exciting directions:

${storyText}

Return exactly 3 choices, each starting with an action verb, formatted as:
1. [Choice 1]
2. [Choice 2]  
3. [Choice 3]`;

      console.log('📤 Generating separate choices with AI provider system...');
      const choicesResult = await generateStoryWithAI(choicesPrompt, 'You are a creative assistant who generates exactly 3 numbered choices for children\'s stories.');
      
      if (choicesResult.success) {
        const choicesText = choicesResult.content;
        console.log('🎯 Separate choices AI response:', choicesText);
        
        // Try multiple regex patterns to extract choices
        let choiceMatches = choicesText.match(/^\d+\.\s*(.+?)(?=\n\d+\.|\n*$)/gm);
        
        if (!choiceMatches || choiceMatches.length === 0) {
          // Try alternative pattern - numbered list with any whitespace
          choiceMatches = choicesText.match(/\d+\.\s*(.+?)(?=\d+\.|$)/gs);
        }
        
        if (!choiceMatches || choiceMatches.length === 0) {
          // Try splitting by lines and finding numbered items
          const lines = choicesText.split('\n').filter(line => line.trim().match(/^\d+\./));
          choiceMatches = lines;
        }
        
        console.log('🔍 Raw choice matches:', choiceMatches);
        
        if (choiceMatches && choiceMatches.length > 0) {
          console.log('✅ Successfully parsed separate choices:', choiceMatches);
          choices = choiceMatches.slice(0, 3).map((choice, index) => {
            // Clean up the choice text
            let cleanText = choice.replace(/^\d+\.\s*/, '').trim();
            cleanText = stripMarkdown(cleanText);
            return {
              id: `choice-${Date.now()}-${index}`,
              text: cleanText,
              next_segment_id: null
            };
          });
        } else {
          console.log('❌ Failed to parse separate choices from AI response');
        }
      } else {
        console.log('❌ Separate choices generation failed with both AI providers');
      }
    }

    // Fallback choices if AI generation fails
    if (choices.length < 3) {
      console.log('⚠️ Using fallback choices - AI parsing completely failed');
      choices = [
        { id: `choice-${Date.now()}-0`, text: 'Continue the adventure', next_segment_id: null },
        { id: `choice-${Date.now()}-1`, text: 'Explore a different path', next_segment_id: null },
        { id: `choice-${Date.now()}-2`, text: 'Try something unexpected', next_segment_id: null }
      ];
    }
    
    console.log('🔥 Final choices being used:', choices.map(c => c.text));

    // Create the story in Supabase
    console.log('💾 Creating story in database...');
    const dbStartTime = Date.now();
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
        ai_model_used: aiResult.model,
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

    const dbStoryDuration = Date.now() - dbStartTime;
    console.log(`💾 Story created in database in ${dbStoryDuration}ms`);

    // Create the first story segment
    console.log('💾 Creating first segment in database...');
    const segmentStartTime = Date.now();
    const { data: newSegment, error: segmentError } = await supabase
      .from('story_segments')
      .insert({
        story_id: newStory.id,
        segment_text: storyText,
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

    const segmentDuration = Date.now() - segmentStartTime;
    console.log(`💾 Segment created in database in ${segmentDuration}ms`);
    console.log('✅ Story created successfully:', newStory.id);

    // Trigger image generation for the first segment (async - don't wait)
    const imagePrompt = `Children's book illustration: ${storyText.substring(0, 100)}... in ${storyData.genre} style`;
    console.log('🎨 Triggering image generation for segment:', newSegment.id);
    
    // Call generate-story-image function asynchronously
    fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-story-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
        'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
      },
      body: JSON.stringify({
        segmentId: newSegment.id,
        imagePrompt: imagePrompt
      }),
    }).catch(error => {
      console.error('❌ Failed to trigger image generation:', error);
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        story: newStory,
        firstSegment: newSegment,
        tokensUsed: aiResult.usage?.total_tokens || 0,
        model: aiResult.model,
        message: 'Story created successfully, image generation started'
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