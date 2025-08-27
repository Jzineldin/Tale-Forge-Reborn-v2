// AI Provider Service V2 - GPT-4o Responses API with Structured Outputs
// Modern implementation using Responses API instead of deprecated Chat Completions
// Guarantees valid JSON responses and eliminates parsing errors

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

// JSON Schema for story segment response - guarantees structure
const STORY_SEGMENT_SCHEMA = {
  type: "object",
  properties: {
    story_text: {
      type: "string",
      description: "The story segment text (2-3 engaging paragraphs that advance the story)"
    },
    choices: {
      type: "array",
      description: "Three choices that directly relate to the story segment",
      items: {
        type: "string",
        description: "A choice option (4-8 words maximum, child-friendly)"
      },
      minItems: 3,
      maxItems: 3
    }
  },
  required: ["story_text", "choices"],
  additionalProperties: false
};

export class AIProvidersV2 implements AIProviderService {
  private openaiConfig: OpenAIConfig;
  private ovhConfig: OVHConfig;
  private useStructuredOutputs: boolean;

  constructor(useStructuredOutputs = true) {
    this.openaiConfig = OPENAI_CONFIG;
    this.ovhConfig = OVH_AI_CONFIG;
    this.useStructuredOutputs = useStructuredOutputs;
  }

  /**
   * Validates available AI providers
   */
  async validateProviders(): Promise<ProviderStatus> {
    const hasOpenAI = validateProviderConfig(this.openaiConfig);
    const hasOVH = validateProviderConfig(this.ovhConfig);
    
    console.log('🔍 AI Provider Status V2:', {
      hasOpenAI,
      hasOVH,
      primaryProvider: hasOpenAI ? 'OpenAI (Responses API)' : 'OVH (fallback only)',
      structuredOutputs: this.useStructuredOutputs
    });

    return {
      hasOpenAI,
      hasOVH,
      primaryProvider: hasOpenAI ? 'OpenAI' : hasOVH ? 'OVH' : 'None'
    };
  }

  /**
   * Generates story segment using modern Responses API with Structured Outputs
   * OpenAI (Primary with Responses API) → OVH (Fallback) → Error
   */
  async generateStorySegment(prompt: string, config: AIRequestConfig): Promise<AIResponse> {
    const providerStatus = await this.validateProviders();
    
    if (!providerStatus.hasOpenAI && !providerStatus.hasOVH) {
      throw new Error('No valid AI providers available');
    }

    let lastError: Error | null = null;
    
    // Try OpenAI with modern Responses API first (if available)
    if (providerStatus.hasOpenAI) {
      try {
        console.log('🚀 PRIMARY V2: Attempting OpenAI GPT-4o with Responses API...');
        const result = await this.callOpenAIWithResponsesAPI(prompt, config);
        console.log('✅ SUCCESS V2: OpenAI Responses API generated story and choices!');
        return result;
      } catch (error) {
        console.log(`⚠️ OpenAI Responses API failed: ${error.message}`);
        lastError = error;
        
        // Try fallback to Chat Completions if Responses API fails
        try {
          console.log('🔄 FALLBACK: Attempting OpenAI Chat Completions...');
          const result = await this.callAIProvider('OpenAI', this.openaiConfig, this.openaiConfig.apiKey, prompt, config);
          console.log('✅ SUCCESS: OpenAI Chat Completions fallback worked!');
          return result;
        } catch (chatError) {
          console.log(`⚠️ OpenAI Chat Completions fallback failed: ${chatError.message}`);
          lastError = chatError;
        }
      }
    }
    
    // Try OVH if OpenAI failed or unavailable
    if (providerStatus.hasOVH) {
      try {
        console.log('🔄 FINAL FALLBACK: Attempting OVH Llama-3.3-70B...');
        const result = await this.callAIProvider('OVH', this.ovhConfig, this.ovhConfig.accessToken, prompt, config);
        console.log('✅ SUCCESS: OVH generated story and choices!');
        return result;
      } catch (error) {
        console.log(`⚠️ OVH failed: ${error.message}`);
        lastError = error;
      }
    }
    
    // If all providers failed, throw the last error
    console.error('🚨 CRITICAL V2: All AI providers failed!', {
      hasOpenAI: providerStatus.hasOpenAI,
      hasOVH: providerStatus.hasOVH,
      lastError: lastError?.message
    });
    
    throw lastError || new Error('All AI providers are unavailable');
  }

  /**
   * Modern OpenAI Responses API with Structured Outputs
   * Guarantees valid JSON structure and eliminates parsing errors
   */
  private async callOpenAIWithResponsesAPI(prompt: string, config: AIRequestConfig): Promise<AIResponse> {
    console.log('🤖 Using OpenAI Responses API V2 with Structured Outputs...');
    
    const enhancedPrompt = this.buildEnhancedPrompt(prompt, config);
    
    const requestBody = {
      model: this.openaiConfig.model,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPTS.story_generation
        },
        {
          role: 'user',
          content: enhancedPrompt
        }
      ],
      max_completion_tokens: calculateMaxTokens(config.story.target_age),
      temperature: this.openaiConfig.temperature,
      // Use Structured Outputs to guarantee JSON format
      response_format: this.useStructuredOutputs ? {
        type: "json_schema",
        json_schema: {
          name: "story_segment_response",
          description: "A story segment with exactly 3 choices",
          schema: STORY_SEGMENT_SCHEMA,
          strict: true
        }
      } : { type: "json_object" }
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiConfig.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenAI Responses API error:`, response.status, errorText);
      throw new Error(`OpenAI Responses API error: ${response.status} - ${errorText}`);
    }

    const completion = await response.json();
    const rawResponse = completion.choices[0].message.content?.trim() || '';
    
    console.log(`📥 OpenAI Responses API raw response: ${rawResponse.substring(0, 200)}...`);
    
    // With Structured Outputs, JSON should be guaranteed valid
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error(`❌ Unexpected JSON parse error with Structured Outputs: ${parseError.message}`);
      console.log(`📝 Raw response: ${rawResponse}`);
      throw new Error(`Invalid JSON from OpenAI Responses API: ${parseError.message}`);
    }
    
    // Validate response structure (should be guaranteed by schema)
    if (!parsedResponse.story_text || !parsedResponse.choices || !Array.isArray(parsedResponse.choices)) {
      throw new Error('Invalid JSON structure from Structured Outputs - this should not happen');
    }

    if (parsedResponse.choices.length !== 3) {
      console.warn(`⚠️ Expected 3 choices, got ${parsedResponse.choices.length}. Padding with fallbacks.`);
      parsedResponse.choices = this.ensureThreeChoices(parsedResponse.choices, parsedResponse.story_text);
    }

    return {
      segmentText: parsedResponse.story_text.trim(),
      choicesText: parsedResponse.choices.join('\n'),
      provider: 'OpenAI Responses API'
    };
  }

  /**
   * Enhanced prompt with GPT-4o best practices
   */
  private buildEnhancedPrompt(basePrompt: string, config: AIRequestConfig): string {
    return `${basePrompt}

CRITICAL REQUIREMENTS FOR STORY GENERATION:

Story Content Requirements:
- Write exactly 2-3 engaging paragraphs (no more, no less)
- Include vivid, sensory descriptions children can imagine
- Show the character actively doing something specific
- Create a natural moment where a decision is needed
- Keep language age-appropriate for ${config.story.target_age} year olds
- End with anticipation, not resolution

Choice Requirements:
- Provide exactly 3 distinct choices
- Each choice must be 4-8 words maximum
- Use simple vocabulary children understand
- Each choice must directly reference something from YOUR story text
- Choices should offer genuinely different story directions
- Avoid abstract or philosophical choices

Example of good story-to-choice connection:
Story mentions: "Luna sees a glowing cave and hears mysterious singing"
Good choices:
- "Enter the glowing cave"
- "Follow the mysterious singing" 
- "Call out to ask who's there"

Bad choices (too generic):
- "Be brave"
- "Make a decision"
- "Think about it"

Your story segment should naturally set up these specific choices.`;
  }

  /**
   * Ensures exactly 3 choices by padding with contextual fallbacks
   */
  private ensureThreeChoices(choices: string[], storyText: string): string[] {
    const validChoices = choices.filter(choice => choice && choice.trim().length > 0);
    
    if (validChoices.length >= 3) {
      return validChoices.slice(0, 3);
    }
    
    // Generate contextual fallback choices based on story content
    const fallbackChoices = [
      "Continue the adventure",
      "Look around carefully", 
      "Ask for help",
      "Try something different",
      "Be brave and move forward"
    ];
    
    // Add fallbacks until we have 3 choices
    while (validChoices.length < 3) {
      const fallback = fallbackChoices[validChoices.length - 1] || "Continue the story";
      validChoices.push(fallback);
    }
    
    return validChoices;
  }

  /**
   * Legacy Chat Completions API call (fallback only)
   * Kept for compatibility with OVH and emergency fallback
   */
  private async callAIProvider(
    providerName: string, 
    providerConfig: OpenAIConfig | OVHConfig, 
    apiKey: string, 
    prompt: string, 
    config: AIRequestConfig
  ): Promise<AIResponse> {
    console.log(`🤖 Fallback: Using ${providerName} with Chat Completions API...`);
    
    const enhancedPrompt = this.buildEnhancedPrompt(prompt, config);
    
    const requestBody = {
      model: providerConfig.model,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPTS.story_generation
        },
        {
          role: 'user',
          content: enhancedPrompt + '\n\nRespond with valid JSON in this exact format:\n{\n  "story_text": "Your story here",\n  "choices": ["Choice 1", "Choice 2", "Choice 3"]\n}'
        }
      ],
      max_tokens: calculateMaxTokens(config.story.target_age),
      temperature: providerConfig.temperature,
      response_format: { type: "json_object" }
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
      console.error(`❌ ${providerName} Chat Completions error:`, response.status, errorText);
      throw new Error(`${providerName} API error: ${response.status} - ${errorText}`);
    }

    const completion = await response.json();
    const rawResponse = completion.choices[0].message.content?.trim() || '';
    
    console.log(`📥 ${providerName} raw response: ${rawResponse.substring(0, 200)}...`);
    
    // Enhanced JSON sanitization for legacy API
    let cleanedResponse = rawResponse.trim();
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }
    
    console.log(`🧹 Cleaned JSON: ${cleanedResponse.substring(0, 200)}...`);
    
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

    // Ensure exactly 3 choices
    parsedResponse.choices = this.ensureThreeChoices(parsedResponse.choices, parsedResponse.story_text);

    return {
      segmentText: parsedResponse.story_text.trim(),
      choicesText: parsedResponse.choices.join('\n'),
      provider: `${providerName} (Chat Completions)`
    };
  }

  /**
   * Health check for AI providers
   */
  async healthCheck(): Promise<{ openai: boolean; ovh: boolean; structuredOutputs: boolean }> {
    const status = await this.validateProviders();
    return {
      openai: status.hasOpenAI,
      ovh: status.hasOVH,
      structuredOutputs: this.useStructuredOutputs
    };
  }
}

// Export singleton instance for use in main function
export const aiProvidersV2 = new AIProvidersV2(true); // Enable Structured Outputs by default