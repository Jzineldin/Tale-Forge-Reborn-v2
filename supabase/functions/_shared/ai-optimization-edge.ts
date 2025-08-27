// AI Optimization for Edge Functions (Deno-compatible)
// Simplified version for Supabase Edge Functions

// ============================================================================
// GPT-4o OPTIMIZATION FOR EDGE FUNCTIONS
// ============================================================================

export const GPT4O_OPTIMIZED = {
  // Optimized config for story generation
  storyConfig: {
    model: 'gpt-4o',
    temperature: 0.85,     // Slightly higher for creativity
    max_tokens: 500,       // Controlled for cost
    top_p: 0.9,
    frequency_penalty: 0.3,
    presence_penalty: 0.3,
    seed: undefined as number | undefined
  },
  
  // Optimized prompt templates
  prompts: {
    storySeeds: (params: { genre: string; childName: string }) => ({
      system: `You are a creative story seed generator. Always respond with ONLY a valid JSON array, no markdown, no extra text. Each request must produce NEW and UNIQUE story concepts.`,
      user: `Create 3 story seeds for ${params.genre} genre with ${params.childName} as the hero.

Each seed needs:
- title: Short title with ${params.childName}'s name
- teaser: One sentence story hook
- hiddenMoral: Life lesson (short)
- conflict: Main problem (short)
- quest: Solution action (short)

Return JSON array with 3 objects. Keep all text brief.`
    }),
    
    storySegment: (params: { context: string; choice: string; childName: string }) => ({
      system: `Children's story writer. 150 words max. Age-appropriate, positive themes.`,
      user: `Continue story for ${params.childName}.
Previous: ${truncateText(params.context, 200)}
Choice: ${params.choice}
Write engaging continuation with vivid imagery.`
    })
  }
};

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

// Simple in-memory cache for Edge Functions
class SimpleCache {
  private cache: Map<string, { value: any; expires: number }> = new Map();
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  
  set(key: string, value: any, ttlSeconds = 300): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + (ttlSeconds * 1000)
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
}

export const promptCache = new SimpleCache();

// Intelligent text truncation
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

// Performance timer for monitoring
export function createTimer(operation: string) {
  const start = Date.now();
  
  return {
    end: () => {
      const duration = Date.now() - start;
      console.log(`⏱️ ${operation}: ${duration}ms`);
      
      // Warn if slow
      const targets: Record<string, number> = {
        'story_seed': 500,
        'story_segment': 2000,
        'image_gen': 2000
      };
      
      const target = targets[operation];
      if (target && duration > target) {
        console.warn(`⚠️ Slow operation: ${operation} took ${duration}ms (target: ${target}ms)`);
      }
      
      return duration;
    }
  };
}

// ============================================================================
// OPTIMIZED API CALLS
// ============================================================================

export async function optimizedOpenAICall(
  prompt: { system: string; user: string },
  config = GPT4O_OPTIMIZED.storyConfig
) {
  // Check cache first
  const cacheKey = `${prompt.system}:${prompt.user}`.substring(0, 100);
  const cached = promptCache.get(cacheKey);
  if (cached) {
    console.log('✨ Cache hit for OpenAI call');
    return cached;
  }
  
  const timer = createTimer('openai_call');
  
  try {
    // Add random seed for variation
    const requestConfig = {
      ...config,
      seed: config.seed || Math.floor(Math.random() * 1000000)
    };
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...requestConfig,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    // Cache successful response
    promptCache.set(cacheKey, content, 300); // 5 min cache
    
    timer.end();
    return content;
    
  } catch (error) {
    timer.end();
    throw error;
  }
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

export class RequestBatcher<T> {
  private queue: Array<{
    request: T;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  
  private timeout: number | null = null;
  private batchProcessor: (batch: T[]) => Promise<any[]>;
  
  constructor(processor: (batch: T[]) => Promise<any[]>) {
    this.batchProcessor = processor;
  }
  
  async add(request: T): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      
      // Process after 50ms or when batch is full (10 items)
      if (!this.timeout) {
        this.timeout = setTimeout(() => this.processBatch(), 50);
      }
      
      if (this.queue.length >= 10) {
        this.processBatch();
      }
    });
  }
  
  private async processBatch() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    
    if (this.queue.length === 0) return;
    
    const batch = [...this.queue];
    this.queue = [];
    
    try {
      const results = await this.batchProcessor(batch.map(item => item.request));
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }
}

// ============================================================================
// SDXL IMAGE PROMPT OPTIMIZATION
// ============================================================================

export const SDXL_OPTIMIZED = {
  styles: {
    fantasy: 'cinematic fantasy illustration, rich vibrant colors, dramatic lighting, modern digital art, detailed environments, epic composition',
    adventure: 'dynamic adventure illustration, bold saturated colors, action-packed scene, modern animation style, detailed character design',
    mystery: 'atmospheric mystery scene, moody lighting, sophisticated color palette, contemporary illustration style, detailed backgrounds',
    educational: 'modern educational illustration, clean design, professional artwork, engaging visual storytelling, high-quality digital art',
    nature: 'stunning nature illustration, photorealistic style, beautiful lighting, National Geographic quality, detailed environmental art'
  },
  
  quality: 'masterpiece, ultra high quality, 8k resolution, professional artwork, studio lighting, sharp focus, vivid colors, child-friendly, award-winning illustration',
  negative: 'violence, scary, horror, gore, adult content, text, watermark, low quality, blurry, distorted, ugly, amateur, childish cartoon, simplistic',
  
  buildPrompt: (subject: string, genre: string) => {
    const style = SDXL_OPTIMIZED.styles[genre.toLowerCase()] || SDXL_OPTIMIZED.styles.adventure;
    return {
      positive: `${style}, ${subject}, ${SDXL_OPTIMIZED.quality}`,
      negative: SDXL_OPTIMIZED.negative,
      // SDXL Turbo settings
      steps: 4,
      cfg_scale: 1.0,
      width: 1344,
      height: 768
    };
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  GPT4O_OPTIMIZED,
  SDXL_OPTIMIZED,
  promptCache,
  truncateText,
  createTimer,
  optimizedOpenAICall,
  RequestBatcher
};