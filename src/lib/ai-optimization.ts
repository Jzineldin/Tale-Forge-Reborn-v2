// AI Optimization Configuration for Tale-Forge
// Implements performance optimizations for GPT-4o, Llama 3.3, and SDXL

import { LRUCache } from 'lru-cache';

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

export const AI_MODELS = {
  GPT4O: 'gpt-4o',
  LLAMA_33: 'llama-3.3-70b',
  SDXL_TURBO: 'sdxl-turbo'
} as const;

export const PERFORMANCE_TARGETS = {
  STORY_SEED: 500,    // ms
  STORY_SEGMENT: 2000, // ms
  IMAGE_GEN: 2000,     // ms
  TOTAL_STORY: 10000   // ms
} as const;

// ============================================================================
// GPT-4o OPTIMIZATION
// ============================================================================

export const GPT4O_CONFIG = {
  model: 'gpt-4o',
  temperature: 0.8,
  max_tokens: 500,
  top_p: 0.9,
  frequency_penalty: 0.3,
  presence_penalty: 0.3,
  stream: true,
  seed: undefined as number | undefined // Set at runtime
};

export const GPT4O_PROMPTS = {
  STORY_SEED: {
    system: `You generate 3 story seeds for children. Output JSON only.
Rules: age-appropriate, engaging, educational.
Max 100 words per seed.`,
    
    userTemplate: (params: { genre: string; childName: string; age: number; context: string }) => 
      `Genre: ${params.genre}
Child: ${params.childName}, Age: ${params.age}
Context: ${params.context}

JSON format:
[{"title":"","teaser":"","moral":"","conflict":"","quest":""}]`
  },
  
  STORY_SEGMENT: {
    system: `Children's story writer. 150 words max.
Include: vivid imagery, dialogue, action.
Age-appropriate, positive themes.`,
    
    userTemplate: (params: { previousSegment: string; userChoice: string; genre: string }) =>
      `Previous: ${truncateText(params.previousSegment, 200)}
Choice: ${params.userChoice}
Genre: ${params.genre}
Continue story naturally.`
  }
};

// ============================================================================
// LLAMA 3.3 OPTIMIZATION
// ============================================================================

export const LLAMA_CONFIG = {
  model: 'llama-3.3-70b',
  quantization: 'int8',
  max_new_tokens: 256,
  temperature: 0.7,
  top_k: 40,
  top_p: 0.9,
  repetition_penalty: 1.1,
  batch_size: 4,
  use_cache: true,
  torch_compile: true,
  flash_attention: true
};

export const LLAMA_PROMPTS = {
  formatPrompt: (system: string, user: string) => 
    `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
${system}<|eot_id|>
<|start_header_id|>user<|end_header_id|>
${user}<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>`,
  
  STORY_SEED: (params: { genre: string; context: string }) =>
    `Task: Generate 3 creative story seeds
Genre: ${params.genre}
Context: ${params.context}
Format: JSON array with title, teaser, moral
Max 50 words each`,
    
  STORY_SEGMENT: (params: { context: string; choice: string }) =>
    `Continue children's story
Previous: ${truncateText(params.context, 150)}
Choice: ${params.choice}
Length: 100 words
Style: Engaging, age-appropriate`
};

// ============================================================================
// SDXL OPTIMIZATION
// ============================================================================

export const SDXL_CONFIG = {
  model: 'sdxl-turbo',
  num_inference_steps: 4,
  guidance_scale: 0.0,
  width: 1024,
  height: 1024,
  enable_tiling: true,
  enable_vae_slicing: true,
  enable_attention_slicing: true,
  use_fp16: true,
  offload_to_cpu: false,
  sequential_cpu_offload: false
};

export const SDXL_PROMPTS = {
  // Style presets for different genres
  STYLES: {
    fantasy: 'whimsical fairy tale illustration, soft pastel colors, magical atmosphere',
    adventure: 'vibrant cartoon style, dynamic composition, exciting scene',
    mystery: 'intriguing illustration, subtle shadows, mysterious mood',
    educational: 'clear educational illustration, bright colors, simple composition',
    scifi: 'futuristic illustration, neon accents, space theme',
    nature: 'beautiful nature scene, realistic animals, peaceful atmosphere'
  },
  
  // Quality modifiers
  QUALITY: 'masterpiece, best quality, highly detailed, child-friendly, safe',
  
  // Negative prompt to avoid unwanted elements
  NEGATIVE: 'violence, scary, dark, realistic gore, text, watermark, adult content, weapons',
  
  // Build complete prompt
  buildPrompt: (subject: string, genre: keyof typeof SDXL_PROMPTS.STYLES) => {
    const style = SDXL_PROMPTS.STYLES[genre] || SDXL_PROMPTS.STYLES.adventure;
    return {
      positive: `${style}, ${subject}, ${SDXL_PROMPTS.QUALITY}`,
      negative: SDXL_PROMPTS.NEGATIVE
    };
  }
};

// ============================================================================
// CACHING SYSTEM
// ============================================================================

export class AICache {
  private cache: LRUCache<string, any>;
  
  constructor(options: { max?: number; ttl?: number } = {}) {
    this.cache = new LRUCache({
      max: options.max || 500,
      ttl: (options.ttl || 3600) * 1000 // Convert to ms
    });
  }
  
  // Generate cache key from prompt
  private generateKey(prompt: string, model: string): string {
    return `${model}:${this.hashString(prompt)}`;
  }
  
  // Simple hash function
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }
  
  // Get cached response
  get(prompt: string, model: string): any | null {
    const key = this.generateKey(prompt, model);
    return this.cache.get(key);
  }
  
  // Set cached response
  set(prompt: string, model: string, response: any): void {
    const key = this.generateKey(prompt, model);
    this.cache.set(key, response);
  }
  
  // Check if response exists
  has(prompt: string, model: string): boolean {
    const key = this.generateKey(prompt, model);
    return this.cache.has(key);
  }
  
  // Clear cache
  clear(): void {
    this.cache.clear();
  }
}

// ============================================================================
// REQUEST BATCHING
// ============================================================================

export class RequestBatcher<T> {
  private queue: Map<string, Array<{
    request: T;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>> = new Map();
  
  private batchTimeout: number;
  private maxBatchSize: number;
  private processor: (batch: T[]) => Promise<any[]>;
  
  constructor(options: {
    timeout?: number;
    maxSize?: number;
    processor: (batch: T[]) => Promise<any[]>;
  }) {
    this.batchTimeout = options.timeout || 50;
    this.maxBatchSize = options.maxSize || 10;
    this.processor = options.processor;
  }
  
  async add(type: string, request: T): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.queue.has(type)) {
        this.queue.set(type, []);
        setTimeout(() => this.processBatch(type), this.batchTimeout);
      }
      
      const queue = this.queue.get(type)!;
      queue.push({ request, resolve, reject });
      
      // Process immediately if batch is full
      if (queue.length >= this.maxBatchSize) {
        this.processBatch(type);
      }
    });
  }
  
  private async processBatch(type: string): Promise<void> {
    const queue = this.queue.get(type);
    if (!queue || queue.length === 0) return;
    
    this.queue.delete(type);
    const requests = queue.map(item => item.request);
    
    try {
      const responses = await this.processor(requests);
      queue.forEach((item, index) => {
        item.resolve(responses[index]);
      });
    } catch (error) {
      queue.forEach(item => item.reject(error));
    }
  }
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  startTimer(operation: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
      
      // Check against targets
      const target = (PERFORMANCE_TARGETS as any)[operation];
      if (target && duration > target) {
        console.warn(`⚠️ Slow operation: ${operation} took ${duration.toFixed(2)}ms (target: ${target}ms)`);
      }
      
      return duration;
    };
  }
  
  private recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const metrics = this.metrics.get(operation)!;
    metrics.push(duration);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }
  
  getStats(operation: string): {
    avg: number;
    min: number;
    max: number;
    p95: number;
  } | null {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) return null;
    
    const sorted = [...metrics].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    
    return {
      avg: sum / sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)]
    };
  }
  
  logStats(): void {
    console.log('📊 Performance Statistics:');
    for (const [operation, _] of this.metrics) {
      const stats = this.getStats(operation);
      if (stats) {
        console.log(`  ${operation}:`);
        console.log(`    Avg: ${stats.avg.toFixed(2)}ms`);
        console.log(`    Min: ${stats.min.toFixed(2)}ms`);
        console.log(`    Max: ${stats.max.toFixed(2)}ms`);
        console.log(`    P95: ${stats.p95.toFixed(2)}ms`);
      }
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Intelligent text truncation
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  // Try to break at sentence boundary
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

// Retry with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
  } = {}
): Promise<T> {
  const maxRetries = options.maxRetries || 3;
  const initialDelay = options.initialDelay || 100;
  const maxDelay = options.maxDelay || 5000;
  const factor = options.factor || 2;
  
  let delay = initialDelay;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * factor, maxDelay);
    }
  }
  
  throw new Error('Max retries exceeded');
}

// ============================================================================
// FALLBACK HANDLER
// ============================================================================

export class AIFallbackHandler {
  private providers: Array<{
    name: string;
    handler: (prompt: any) => Promise<any>;
    priority: number;
  }> = [];
  
  addProvider(name: string, handler: (prompt: any) => Promise<any>, priority = 0): void {
    this.providers.push({ name, handler, priority });
    this.providers.sort((a, b) => b.priority - a.priority);
  }
  
  async execute(prompt: any): Promise<any> {
    const errors: any[] = [];
    
    for (const provider of this.providers) {
      try {
        console.log(`🔄 Trying provider: ${provider.name}`);
        const result = await provider.handler(prompt);
        console.log(`✅ Success with provider: ${provider.name}`);
        return result;
      } catch (error) {
        console.log(`❌ Provider ${provider.name} failed:`, error);
        errors.push({ provider: provider.name, error });
      }
    }
    
    throw new Error(`All providers failed: ${JSON.stringify(errors)}`);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Configurations
  GPT4O_CONFIG,
  GPT4O_PROMPTS,
  LLAMA_CONFIG,
  LLAMA_PROMPTS,
  SDXL_CONFIG,
  SDXL_PROMPTS,
  
  // Classes
  AICache,
  RequestBatcher,
  PerformanceMonitor,
  AIFallbackHandler,
  
  // Utilities
  truncateText,
  retryWithBackoff,
  
  // Constants
  AI_MODELS,
  PERFORMANCE_TARGETS
};