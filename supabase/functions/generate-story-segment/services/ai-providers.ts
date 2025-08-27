// AI Provider Service
// Handles OpenAI (primary) and OVH (fallback) AI providers with robust JSON parsing
// Extracted from main function for better testability and maintainability

import { 
  AIProviderService, 
  AIResponse, 
  AIRequestConfig, 
  ProviderStatus,
  OpenAIConfig,
  OVHConfig
} from '../types/interfaces.ts';

import { 
  OPENAI_CONFIG, 
  OVH_AI_CONFIG, 
  calculateMaxTokens,
  validateProviderConfig,
  SYSTEM_PROMPTS
} from '../config/ai-config.ts';

export class AIProviders implements AIProviderService {
  private openaiConfig: OpenAIConfig;
  private ovhConfig: OVHConfig;

  constructor() {
    this.openaiConfig = OPENAI_CONFIG;
    this.ovhConfig = OVH_AI_CONFIG;
  }

  /**
   * Validates available AI providers
   */
  async validateProviders(): Promise<ProviderStatus> {
    const hasOpenAI = validateProviderConfig(this.openaiConfig);
    const hasOVH = validateProviderConfig(this.ovhConfig);
    
    console.log('🔍 AI Provider Status:', {
      hasOpenAI,
      hasOVH,
      primaryProvider: hasOpenAI ? 'OpenAI' : 'OVH (fallback only)'
    });

    return {
      hasOpenAI,
      hasOVH,
      primaryProvider: hasOpenAI ? 'OpenAI' : hasOVH ? 'OVH' : 'None'
    };
  }

  /**
   * Generates story segment using multi-provider fallback system
   * OpenAI (Primary) → OVH (Fallback) → Error
   */
  async generateStorySegment(prompt: string, config: AIRequestConfig): Promise<AIResponse> {
    const providerStatus = await this.validateProviders();
    
    if (!providerStatus.hasOpenAI && !providerStatus.hasOVH) {
      throw new Error('No valid AI providers available');
    }

    let lastError: Error | null = null;
    
    // Try OpenAI first (if available)
    if (providerStatus.hasOpenAI) {
      try {
        console.log('🚀 PRIMARY: Attempting OpenAI GPT-4o...');
        const result = await this.callAIProvider('OpenAI', this.openaiConfig, this.openaiConfig.apiKey, prompt, config);
        console.log('✅ SUCCESS: OpenAI generated story and choices!');
        return result;
      } catch (error) {
        console.log(`⚠️ OpenAI failed: ${error.message}`);
        lastError = error;
      }
    }
    
    // Try OVH if OpenAI failed or unavailable
    if (providerStatus.hasOVH) {
      try {
        console.log('🔄 FALLBACK: Attempting OVH Llama-3.3-70B...');
        const result = await this.callAIProvider('OVH', this.ovhConfig, this.ovhConfig.accessToken, prompt, config);
        console.log('✅ SUCCESS: OVH generated story and choices!');
        return result;
      } catch (error) {
        console.log(`⚠️ OVH failed: ${error.message}`);
        lastError = error;
      }
    }
    
    // If all providers failed, throw the last error
    console.error('🚨 CRITICAL: All AI providers failed!', {
      hasOpenAI: providerStatus.hasOpenAI,
      hasOVH: providerStatus.hasOVH,
      lastError: lastError?.message
    });
    
    throw lastError || new Error('All AI providers are unavailable');
  }

  /**
   * Calls specific AI provider with structured JSON request
   * Includes robust JSON sanitization and error handling
   */
  private async callAIProvider(
    providerName: string, 
    providerConfig: OpenAIConfig | OVHConfig, 
    apiKey: string, 
    prompt: string, 
    config: AIRequestConfig
  ): Promise<AIResponse> {
    console.log(`🤖 Attempting ${providerName} AI with single structured request...`);
    
    const structuredPrompt = `${prompt}

IMPORTANT: You are writing for children. The story must be engaging and the choices must be clear and directly related to what happens in your story.

Respond with valid JSON in this exact format:
{
  "story_text": "Your story segment here (2-3 short paragraphs that advance the story)",
  "choices": [
    "First choice that directly relates to the story segment",
    "Second choice that offers a different path from your story", 
    "Third choice that presents another option from your story"
  ]
}

CRITICAL STORY REQUIREMENTS:
- Write 2-3 engaging paragraphs that advance the story
- Include the main character doing something specific  
- End with a moment where the character must make a decision
- Make it age-appropriate and exciting

CRITICAL CHOICE REQUIREMENTS:
- Each choice must be 4-8 words maximum
- Choices MUST directly relate to what happens in your story segment
- Use simple words children can understand
- Each choice should lead to a different story direction
- Reference specific actions, characters, or objects from YOUR story text

EXAMPLE of good choices based on story content:
If your story mentions "a locked door and a small window", choices could be:
- "Try to unlock the door"
- "Climb through the window" 
- "Look for another way"

Make sure your story_text creates a situation that naturally leads to your 3 choices.`;

    const requestBody = {
      model: providerConfig.model,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPTS.story_generation
        },
        {
          role: 'user',
          content: structuredPrompt
        }
      ],
      max_tokens: calculateMaxTokens(config.story.target_age),
      temperature: providerConfig.temperature
    };

    const authHeader = `Bearer ${apiKey}`;
    
    const response = await fetch(`${providerConfig.baseUrl}/chat/completions`, {
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
    
    // Enhanced JSON sanitization - fix the corrupted parsing
    let cleanedResponse = rawResponse.trim();
    
    // Remove markdown code blocks if present
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Extract JSON object from response
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }
    
    console.log(`🧹 Cleaned JSON: ${cleanedResponse.substring(0, 200)}...`);
    
    // Parse JSON response with enhanced error handling
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error(`❌ JSON parse failed: ${parseError.message}`);
      console.log(`📝 Raw response: ${rawResponse}`);
      console.log(`🧹 Cleaned response: ${cleanedResponse}`);
      throw new Error(`Invalid JSON from ${providerName}: ${parseError.message}`);
    }
    
    if (!parsedResponse.story_text || !parsedResponse.choices || !Array.isArray(parsedResponse.choices)) {
      throw new Error('Invalid JSON structure - missing story_text or choices');
    }

    return {
      segmentText: parsedResponse.story_text.trim(),
      choicesText: parsedResponse.choices.join('\n'),
      provider: providerName
    };
  }

  /**
   * Health check for AI providers
   */
  async healthCheck(): Promise<{ openai: boolean; ovh: boolean }> {
    const status = await this.validateProviders();
    return {
      openai: status.hasOpenAI,
      ovh: status.hasOVH
    };
  }
}

// Export singleton instance for use in main function
export const aiProviders = new AIProviders();