// AI Optimization V2 for Edge Functions - GPT-4o Responses API
// Modern implementation using Responses API with Structured Outputs

// ============================================================================
// GPT-4O V2 OPTIMIZATION WITH RESPONSES API
// ============================================================================

export const GPT4O_V2_OPTIMIZED = {
  // Speed-optimized config for story generation with Responses API
  storyConfig: {
    model: 'gpt-4o',
    temperature: 0.85,     
    max_completion_tokens: 500,  // Updated parameter name for Responses API   
    top_p: 0.9,
    frequency_penalty: 0.3,
    presence_penalty: 0.3,
    seed: undefined as number | undefined
  },
  
  // Seed generation config - shorter responses
  seedConfig: {
    model: 'gpt-4o',
    temperature: 0.95,     // Higher for variety
    max_completion_tokens: 300,     
    top_p: 0.9,
    frequency_penalty: 0.5,
    presence_penalty: 0.8,
    seed: undefined as number | undefined
  },
  
  // Optimized prompt templates with enhanced structure
  prompts: {
    storySeeds: (params: { genre: string; childName: string; context: string; difficulty: string }) => ({
      system: `You are a creative children's story writer who creates simple, engaging story ideas. Generate exactly 3 unique story seeds that are SHORT and DIFFERENT from each other.`,
      user: `Create 3 simple ${params.genre} story ideas for ${params.childName}. Context: ${params.context}, Difficulty: ${params.difficulty}

CRITICAL REQUIREMENTS:
- Each story idea must be ONE SENTENCE only
- Stories must be completely different from each other
- Use simple words children understand
- Make them exciting and age-appropriate
- Each teaser should make children want to hear more

Good example format:
- Title: "Magic Garden" / Teaser: "${params.childName} finds a garden where flowers can talk."
- Title: "Dragon Friend" / Teaser: "${params.childName} meets a tiny dragon who loves cookies."
- Title: "Wishing Star" / Teaser: "${params.childName} catches a falling star that grants wishes."`
    }),
    
    storySegment: (params: { context: string; choice: string; childName: string; wordLimit?: number; storyType?: string }) => ({
      system: `You are a children's story writer. Write exactly ${params.wordLimit || 150} words. Create engaging, age-appropriate content with positive themes and vivid imagery.`,
      user: `Continue this ${params.storyType || 'medium'} story for ${params.childName}.

Previous context: ${truncateText(params.context, 200)}
Reader's choice: ${params.choice}

Write the next story segment with:
- Exactly ${params.wordLimit || 150} words (count carefully)
- Engaging, age-appropriate content for children
- Vivid descriptions children can imagine
- Natural story progression from the previous context
- Show the character actively doing something
- End with a moment where the character must make a decision
- Use sensory details (what they see, hear, feel)

The story should naturally lead to 3 clear choices that relate directly to what happens in your segment.`
    })
  }
};

// ============================================================================
// JSON SCHEMAS FOR STRUCTURED OUTPUTS
// ============================================================================

export const STORY_SEEDS_SCHEMA = {
  type: "object",
  properties: {
    seeds: {
      type: "array",
      description: "Array of exactly 3 story seed objects",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Short, engaging title (2-4 words)"
          },
          teaser: {
            type: "string", 
            description: "One sentence story description that makes children excited"
          }
        },
        required: ["title", "teaser"],
        additionalProperties: false
      },
      minItems: 3,
      maxItems: 3
    }
  },
  required: ["seeds"],
  additionalProperties: false
};

export const STORY_SEGMENT_SCHEMA = {
  type: "object",
  properties: {
    story_text: {
      type: "string",
      description: "The story segment text (exactly 2-3 paragraphs that advance the story)"
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

// ============================================================================
// PERFORMANCE UTILITIES (ENHANCED)
// ============================================================================

// Enhanced cache with better eviction
class EnhancedCache {
  private cache: Map<string, { value: any; expires: number; hits: number }> = new Map();
  private maxSize: number;
  
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    item.hits++;
    return item.value;
  }
  
  set(key: string, value: any, ttlSeconds = 300): void {
    // Evict least used items if cache is full
    if (this.cache.size >= this.maxSize) {
      const leastUsed = Array.from(this.cache.entries())
        .sort((a, b) => a[1].hits - b[1].hits)[0];
      if (leastUsed) {
        this.cache.delete(leastUsed[0]);
      }
    }
    
    this.cache.set(key, {
      value,
      expires: Date.now() + (ttlSeconds * 1000),
      hits: 0
    });
  }
  
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  stats(): { size: number; maxSize: number } {
    return { size: this.cache.size, maxSize: this.maxSize };
  }
}

export const promptCacheV2 = new EnhancedCache(50);

// Text truncation (unchanged but optimized)
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastPeriod > maxLength * 0.8) {
    return truncated.substring(0, lastPeriod + 1);
  } else if (lastSpace > maxLength * 0.9) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

// Enhanced performance timer
export function createTimerV2(operation: string, expectedMs?: number) {
  const start = performance.now();
  
  return {
    end: () => {
      const duration = Math.round(performance.now() - start);
      console.log(`⏱️ V2 ${operation}: ${duration}ms`);
      
      // Dynamic performance targets
      const targets: Record<string, number> = {
        'story_seed': expectedMs || 800,
        'story_segment': expectedMs || 2500,
        'image_gen': expectedMs || 3000,
        'openai_responses_api': expectedMs || 1500
      };
      
      const target = targets[operation];
      if (target && duration > target) {
        console.warn(`⚠️ Slow operation V2: ${operation} took ${duration}ms (target: ${target}ms)`);
      } else if (target && duration < target * 0.5) {
        console.log(`🚀 Fast operation V2: ${operation} was ${Math.round((1 - duration/target) * 100)}% faster than expected`);
      }
      
      return duration;
    },
    
    checkpoint: (label: string) => {
      const checkpoint = Math.round(performance.now() - start);
      console.log(`📍 V2 ${operation} - ${label}: ${checkpoint}ms`);
      return checkpoint;
    }
  };
}

// ============================================================================
// OPTIMIZED RESPONSES API CALLS
// ============================================================================

export async function optimizedResponsesAPICall(
  prompt: { system: string; user: string },
  schema: any,
  config = GPT4O_V2_OPTIMIZED.storyConfig,
  skipCache = false
) {
  // Check cache first (unless skipped for variety)
  const cacheKey = `v2:${prompt.system.substring(0, 50)}:${prompt.user.substring(0, 100)}`;
  if (!skipCache) {
    const cached = promptCacheV2.get(cacheKey);
    if (cached) {
      console.log('✨ V2 Cache hit for Responses API call');
      return cached;
    }
  }
  
  const timer = createTimerV2('openai_responses_api');
  
  try {
    // Add random seed for variation if not specified
    const requestConfig = {
      ...config,
      seed: config.seed || Math.floor(Math.random() * 1000000)
    };
    
    const requestBody = {
      model: requestConfig.model,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user }
      ],
      max_completion_tokens: requestConfig.max_completion_tokens,
      temperature: requestConfig.temperature,
      top_p: requestConfig.top_p,
      frequency_penalty: requestConfig.frequency_penalty,
      presence_penalty: requestConfig.presence_penalty,
      seed: requestConfig.seed,
      // Use Structured Outputs for guaranteed JSON
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "structured_response",
          description: "Structured response following the provided schema",
          schema: schema,
          strict: true
        }
      }
    };

    timer.checkpoint('request_prepared');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Connection': 'keep-alive'
      },
      keepalive: true,
      signal: AbortSignal.timeout(20000), // 20s timeout for Responses API
      body: JSON.stringify(requestBody)
    });
    
    timer.checkpoint('response_received');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI Responses API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    timer.checkpoint('json_parsed');
    
    if (!content) {
      throw new Error('Empty response from OpenAI Responses API');
    }
    
    // With Structured Outputs, JSON should be guaranteed valid
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ Unexpected JSON parse error with Structured Outputs:', parseError);
      console.log('📝 Raw content:', content);
      throw new Error(`JSON parse error (this should not happen with Structured Outputs): ${parseError.message}`);
    }
    
    // Cache successful response (unless skipped)
    if (!skipCache) {
      promptCacheV2.set(cacheKey, parsedContent, 300); // 5 min cache
    }
    
    const duration = timer.end();
    
    return parsedContent;
    
  } catch (error) {
    timer.end();
    throw error;
  }
}

// Legacy OpenAI Chat Completions fallback
export async function legacyOpenAICall(
  prompt: { system: string; user: string },
  config = GPT4O_V2_OPTIMIZED.storyConfig
) {
  console.log('🔄 Using legacy Chat Completions API as fallback...');
  
  const timer = createTimerV2('legacy_openai_call');
  
  try {
    const requestConfig = {
      ...config,
      // Convert back to legacy parameter names
      max_tokens: config.max_completion_tokens,
      seed: config.seed || Math.floor(Math.random() * 1000000)
    };
    
    delete requestConfig.max_completion_tokens; // Remove new parameter
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ...requestConfig,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user }
        ],
        response_format: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Legacy OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    timer.end();
    return content;
    
  } catch (error) {
    timer.end();
    throw error;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  GPT4O_V2_OPTIMIZED,
  STORY_SEEDS_SCHEMA,
  STORY_SEGMENT_SCHEMA,
  promptCacheV2,
  truncateText,
  createTimerV2,
  optimizedResponsesAPICall,
  legacyOpenAICall
};