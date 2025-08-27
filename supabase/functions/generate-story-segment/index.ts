// Tale Forge - Generate Story Segment Edge Function (REFACTORED)
// Clean service-orchestrated architecture for better maintainability and testability
// OpenAI GPT-4o (primary) with OVH AI (fallback) + robust fallback systems

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

// Import refactored services
import { aiProviders } from './services/ai-providers.ts';
import { choiceParser } from './services/choice-parser.ts';
import { database } from './services/database-service.ts';
import { promptBuilder } from './services/prompt-builder.ts';
import { validation } from './services/validation-service.ts';
import { imagePromptBuilder } from './services/image-prompt-builder.ts';
import { characterReferenceManager } from './services/character-reference-service.ts';
import { CORS_HEADERS } from './types/interfaces.ts';

console.log("Generate Story Segment function started (REFACTORED + 2025 STREAMING)");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    console.log('🚀 REFACTORED: Starting story segment generation...');
    
    // 1. VALIDATION PHASE - Comprehensive validation using ValidationService
    const validationResult = await validation.validateAllRequirements(req);
    if (!validationResult.isValid) {
      console.error('❌ Validation failed:', validationResult.errors);
      
      // Return appropriate error based on validation type
      const isEnvironmentError = validationResult.environment && !validationResult.environment.isValid;
      const isMissingAPIKeys = validationResult.apiKeys && !validationResult.apiKeys.hasValidApiKeys;
      
      if (isMissingAPIKeys) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing required environment variables', 
            code: 'MISSING_API_KEYS',
            message: 'AI service API keys not configured'
          }),
          { headers: { ...CORS_HEADERS, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      return new Response(
        JSON.stringify({ error: validationResult.errors[0] }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Extract validated data
    const { storyId, choiceIndex, authHeader, templateContext } = validationResult.requestValidation!;
    
    // 2. SUPABASE CLIENT SETUP
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { global: { headers: { Authorization: authHeader! } } }
    );

    // 3. DATABASE OPERATIONS PHASE - Using DatabaseService
    console.log('📖 Fetching story data and context...');
    
    const [story, previousSegment, userCharacters] = await Promise.all([
      database.fetchStoryData(storyId!, supabase).catch(error => {
        if (error.message.includes('not found')) {
          throw { status: 404, message: 'Story not found' };
        }
        throw { status: 500, message: 'Failed to fetch story' };
      }),
      database.fetchPreviousSegment(storyId!, choiceIndex, supabase),
      database.fetchUserCharacters(storyId!, (await validation.validateUserAuth(supabase, authHeader!)).userId!, supabase).catch(() => [])
    ]);

    // 4. PROMPT GENERATION PHASE - Using PromptBuilderService
    console.log('📝 Building AI prompt...');
    
    const userChoice = previousSegment && choiceIndex !== undefined && previousSegment.choices[choiceIndex]
      ? previousSegment.choices[choiceIndex].text
      : undefined;
      
    const prompt = promptBuilder.buildPrompt(story, previousSegment, userChoice, userCharacters, templateContext);

    // 5. AI GENERATION PHASE - Using AIProviderService
    console.log('🤖 Generating story content with AI providers...');
    
    const aiConfig = { story, prompt, targetAge: story.target_age };
    const aiResponse = await aiProviders.generateStorySegment(prompt, aiConfig);

    // 6. CHOICE PARSING PHASE - Using ChoiceParserService  
    console.log('🎯 Parsing choices from AI response...');
    
    const choices = await choiceParser.parseChoices(aiResponse.choicesText, aiResponse.segmentText);

    // 7. ENHANCED IMAGE PROMPT GENERATION - With character consistency
    console.log('🎨 Generating enhanced intelligent image prompt...');
    
    // Check if we need character consistency
    const needsConsistency = characterReferenceManager.needsCharacterConsistency(
      aiResponse.segmentText, 
      ''
    );
    
    const imagePrompt = imagePromptBuilder.buildImagePrompt(
      story, 
      aiResponse.segmentText, 
      [previousSegment].filter(Boolean), // Previous segments for context
      userCharacters // Character consistency
    );
    
    console.log('🎨 Enhanced image prompt generated:', imagePrompt.substring(0, 120) + '...');
    
    if (needsConsistency) {
      console.log('🎯 Character consistency will be applied during image generation');
      const mainCharacter = characterReferenceManager.extractMainCharacter(aiResponse.segmentText);
      console.log('👤 Main character detected:', mainCharacter);
    }
    
    // 8. DATABASE PERSISTENCE PHASE - Using DatabaseService
    console.log('💾 Saving new segment to database...');
    
    const nextPosition = await database.getNextPosition(storyId!, supabase);
    const newSegmentData = database.createSegmentForInsertion(
      storyId!,
      aiResponse.segmentText,
      choices,
      previousSegment?.id || null,
      imagePrompt // Pass image prompt to be saved
    );
    
    // Update the position with the calculated value
    newSegmentData.position = nextPosition;
    newSegmentData.segment_number = nextPosition;
    
    const newSegment = await database.saveSegment(newSegmentData, supabase);

    // 9. IMAGE GENERATION PHASE - Generate image for the new segment
    console.log('🖼️ Triggering background image generation...');
    try {
      // Call regenerate-image function to generate the image
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const authHeader = req.headers.get('Authorization');
      
      if (supabaseUrl && authHeader && imagePrompt) {
        // Make async call to regenerate-image function
        fetch(`${supabaseUrl}/functions/v1/regenerate-image`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || ''
          },
          body: JSON.stringify({
            segmentId: newSegment.id,
            imagePrompt: imagePrompt
          })
        }).then(response => {
          if (response.ok) {
            console.log('✅ Image generation started successfully for segment:', newSegment.id);
          } else {
            console.error('❌ Image generation failed for segment:', newSegment.id, response.status);
          }
        }).catch(error => {
          console.error('❌ Error triggering image generation:', error);
        });
      }
    } catch (error) {
      console.error('❌ Error setting up image generation:', error);
      // Don't fail the entire segment creation if image generation fails
    }

    // 10. ANALYTICS & RESPONSE PHASE
    console.log(`📈 AI PROVIDER PERFORMANCE METRICS:`);
    console.log(`   • Provider used: ${aiResponse.provider}`);
    console.log(`   • Method: SINGLE STRUCTURED JSON CALL`);
    console.log(`   • API calls made: 1`);
    console.log(`   • Fallback triggered: ${aiResponse.provider !== 'OpenAI' ? 'YES' : 'NO'}`);
    console.log(`   • Story text length: ${aiResponse.segmentText.length} characters`);
    console.log(`   • Choices generated: ${choices.length}`);
    
    if (aiResponse.provider !== 'OpenAI') {
      console.log(`⚠️ NOTICE: Primary OpenAI provider not used - using ${aiResponse.provider} fallback`);
    }

    // 11. SUCCESS RESPONSE
    return new Response(
      JSON.stringify({ 
        success: true, 
        segment: newSegment,
        imagePrompt: imagePrompt,
        message: `Story segment generated successfully using ${aiResponse.provider}`,
        // AI Provider metrics for monitoring
        aiMetrics: {
          provider: aiResponse.provider,
          method: 'single_structured_json',
          api_calls_made: 1,
          fallback_triggered: aiResponse.provider !== 'OpenAI',
          story_length: aiResponse.segmentText.length,
          choices_count: choices.length
        }
      }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('❌ REFACTORED FUNCTION ERROR:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 500)
    });
    
    // Handle specific error types with appropriate HTTP status codes
    if (error.status) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" }, status: error.status }
      );
    }
    
    // Generic error response
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" }, status: 500 }
    );
  }
});