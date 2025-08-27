# Tale-Forge AI Prompt Optimization Guide

## Overview
This guide provides optimized prompt templates and performance techniques for Tale-Forge's AI integrations, specifically targeting GPT-4o, Llama 3.3, and SDXL for maximum speed and quality.

## 🎯 Core Optimization Principles

### 1. Token Economy
- **Minimize token usage** while maintaining clarity
- Use **structured templates** to reduce repetition
- **Pre-process context** to remove redundant information
- **Batch similar requests** when possible

### 2. Response Streaming
- Enable streaming for real-time feedback
- Use incremental processing for long generations
- Implement client-side buffering for smooth UX

### 3. Caching Strategy
- Cache common prompts and responses
- Use semantic similarity for cache hits
- Implement TTL based on content type

---

## 📝 GPT-4o Optimization

### Story Seed Generation Template
```typescript
const OPTIMIZED_STORY_SEED_PROMPT = {
  system: `You generate 3 story seeds for children. Output JSON only.
Rules: age-appropriate, ${MAX_TOKENS_SEED}, engaging.`,
  
  user: `Genre: {genre}
Child: {childName}, Age: {age}
Context: {context}

JSON format:
[{"title":"","teaser":"","moral":"","conflict":"","quest":""}]`
}

// Performance settings
const GPT4O_CONFIG = {
  model: "gpt-4o",
  temperature: 0.8,  // Balanced creativity
  max_tokens: 500,   // Limit for seeds
  top_p: 0.9,        // Focus sampling
  frequency_penalty: 0.3,  // Reduce repetition
  presence_penalty: 0.3,   // Encourage variety
  stream: true,      // Enable streaming
  seed: Date.now()   // Reproducibility
}
```

### Story Segment Generation
```typescript
const STORY_SEGMENT_PROMPT = {
  system: `Children's story writer. ${MAX_WORDS} words max.
Style: {difficulty}, Genre: {genre}
Include: vivid imagery, dialogue, action.`,
  
  user: `Previous: {previousSegment}
Choice: {userChoice}
Continue story naturally.`
}

// Optimize with few-shot examples
const FEW_SHOT_EXAMPLES = [
  { input: "Dragon finds treasure", output: "The dragon's eyes sparkled..." },
  { input: "Friends work together", output: "Together, they lifted..." }
]
```

### Cost Optimization Techniques
```typescript
// 1. Use prompt caching for repeated elements
const CACHED_ELEMENTS = {
  storyRules: "age-appropriate, positive, educational",
  outputFormat: "JSON with title, content, choices",
  safetyGuidelines: "no violence, inclusive, kind"
}

// 2. Implement smart truncation
function truncateContext(text: string, maxTokens: number): string {
  // Keep beginning and end, summarize middle
  if (text.length > maxTokens * 4) {
    const start = text.slice(0, maxTokens * 2);
    const end = text.slice(-maxTokens);
    return `${start}\n[...content summarized...]\n${end}`;
  }
  return text;
}

// 3. Use completion instead of chat for simple tasks
const COMPLETION_PROMPT = `Complete: The brave {childName} discovered`;
```

---

## 🦙 Llama 3.3 70B Optimization

### Inference Optimization
```typescript
const LLAMA_CONFIG = {
  // Model settings
  model: "llama-3.3-70b",
  quantization: "int8",  // Reduce memory, maintain quality
  
  // Performance settings
  max_new_tokens: 256,
  temperature: 0.7,
  top_k: 40,
  top_p: 0.9,
  repetition_penalty: 1.1,
  
  // Batching for throughput
  batch_size: 4,
  
  // Enable optimizations
  use_cache: true,
  torch_compile: true,
  flash_attention: true
}
```

### Optimized Prompt Structure
```typescript
const LLAMA_STORY_PROMPT = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are a creative children's story writer.<|eot_id|>
<|start_header_id|>user<|end_header_id|>
Task: Generate story segment
Genre: {genre}
Context: {shortContext}
Output: 100 words maximum<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>`;

// Minimize context switching
const BATCHED_REQUESTS = [
  { prompt: prompt1, metadata: { userId: 1 } },
  { prompt: prompt2, metadata: { userId: 2 } },
  { prompt: prompt3, metadata: { userId: 3 } }
];
```

### Memory Management
```typescript
// KV Cache optimization
const KV_CACHE_CONFIG = {
  max_cache_size: 2048,
  cache_implementation: "paged_attention",
  block_size: 16
}

// Grouped Query Attention (GQA) settings
const GQA_CONFIG = {
  num_key_value_heads: 8,  // Llama 3.3 uses GQA
  sliding_window: 4096
}
```

---

## 🎨 SDXL Optimization

### SDXL Turbo Configuration
```typescript
const SDXL_TURBO_CONFIG = {
  model: "sdxl-turbo",
  
  // Speed optimizations
  num_inference_steps: 4,  // 4-6 steps for quality/speed balance
  guidance_scale: 0.0,     // Disabled for Turbo
  
  // Quality settings
  width: 1024,
  height: 1024,
  
  // Performance flags
  enable_tiling: true,
  enable_vae_slicing: true,
  enable_attention_slicing: true,
  use_fp16: true,
  
  // Memory optimization
  offload_to_cpu: false,
  sequential_cpu_offload: false
}
```

### Optimized Image Prompts
```typescript
const IMAGE_PROMPT_TEMPLATE = {
  // Positive prompt structure
  positive: `{style}, {subject}, {mood}, {quality_tags}`,
  
  // Negative prompt for quality
  negative: `low quality, blurry, distorted, text, watermark, realistic violence`,
  
  // Style presets for children's content
  styles: {
    fantasy: "whimsical fairy tale illustration, soft colors, magical",
    adventure: "vibrant cartoon style, dynamic composition, exciting",
    educational: "clear educational illustration, bright colors, simple"
  },
  
  // Quality tags
  quality: "masterpiece, best quality, highly detailed, 8k"
}

// Batch processing for multiple images
const BATCH_CONFIG = {
  batch_size: 4,
  enable_model_cpu_offload: true,
  chunk_size: 1  // Process one at a time to avoid OOM
}
```

### Pre-computed Embeddings
```typescript
// Cache text embeddings
const CACHED_EMBEDDINGS = new Map();

async function getEmbedding(prompt: string) {
  if (CACHED_EMBEDDINGS.has(prompt)) {
    return CACHED_EMBEDDINGS.get(prompt);
  }
  
  const embedding = await computeEmbedding(prompt);
  CACHED_EMBEDDINGS.set(prompt, embedding);
  return embedding;
}

// Reuse embeddings for similar prompts
const STYLE_EMBEDDINGS = {
  fantasy: await getEmbedding("fantasy magical whimsical"),
  adventure: await getEmbedding("adventure exciting dynamic"),
  educational: await getEmbedding("educational clear simple")
}
```

---

## 🚀 Implementation Best Practices

### 1. Request Batching
```typescript
class AIRequestBatcher {
  private queue: Map<string, Request[]> = new Map();
  private batchTimeout = 50; // ms
  
  async addRequest(type: string, request: Request) {
    if (!this.queue.has(type)) {
      this.queue.set(type, []);
      setTimeout(() => this.processBatch(type), this.batchTimeout);
    }
    this.queue.get(type)!.push(request);
  }
  
  private async processBatch(type: string) {
    const requests = this.queue.get(type) || [];
    this.queue.delete(type);
    
    // Process all requests together
    const responses = await this.batchProcess(requests);
    return responses;
  }
}
```

### 2. Response Caching
```typescript
class SmartCache {
  private cache = new Map();
  private similarity = new SemanticSimilarity();
  
  async get(prompt: string, threshold = 0.95) {
    for (const [cachedPrompt, response] of this.cache) {
      const sim = await this.similarity.compare(prompt, cachedPrompt);
      if (sim > threshold) {
        return response;
      }
    }
    return null;
  }
  
  set(prompt: string, response: any, ttl = 3600) {
    this.cache.set(prompt, { response, expires: Date.now() + ttl * 1000 });
  }
}
```

### 3. Fallback Strategy
```typescript
class AIFallbackHandler {
  private providers = ['gpt-4o', 'llama-3.3', 'fallback-data'];
  
  async generate(prompt: string, options: any) {
    for (const provider of this.providers) {
      try {
        return await this.callProvider(provider, prompt, options);
      } catch (error) {
        console.log(`Provider ${provider} failed, trying next...`);
        continue;
      }
    }
    return this.getStaticFallback(prompt);
  }
}
```

### 4. Performance Monitoring
```typescript
class PerformanceMonitor {
  track(operation: string) {
    const start = performance.now();
    return {
      end: () => {
        const duration = performance.now() - start;
        this.log(operation, duration);
        if (duration > 1000) {
          console.warn(`Slow operation: ${operation} took ${duration}ms`);
        }
      }
    };
  }
  
  private log(operation: string, duration: number) {
    // Send to analytics
    analytics.track('ai_operation', {
      operation,
      duration,
      timestamp: Date.now()
    });
  }
}
```

---

## 📊 Performance Targets

### Target Metrics
- **Story Seed Generation**: < 500ms (with caching)
- **Story Segment**: < 2s (GPT-4o), < 1s (Llama 3.3)
- **Image Generation**: < 2s (SDXL Turbo)
- **End-to-end Story Creation**: < 10s

### Optimization Checklist
- [ ] Enable response streaming
- [ ] Implement request batching
- [ ] Use semantic caching
- [ ] Optimize prompt tokens
- [ ] Enable model quantization
- [ ] Use appropriate batch sizes
- [ ] Implement fallback mechanisms
- [ ] Monitor performance metrics
- [ ] Cache embeddings and responses
- [ ] Use CDN for static assets

---

## 🔧 Debugging Tips

### Common Issues and Solutions

1. **High Latency**
   - Reduce max_tokens
   - Enable streaming
   - Use smaller models for simple tasks
   - Implement caching

2. **Token Limit Errors**
   - Truncate context intelligently
   - Use summarization for long content
   - Split into multiple requests

3. **Rate Limiting**
   - Implement exponential backoff
   - Use request batching
   - Add queueing system

4. **Memory Issues (SDXL)**
   - Enable CPU offloading
   - Reduce batch size
   - Use fp16 precision
   - Enable attention slicing

---

## 📚 Additional Resources

- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Llama 3.3 Performance Guide](https://github.com/meta-llama/llama)
- [SDXL Optimization Techniques](https://huggingface.co/docs/diffusers/optimization/sdxl)
- [Tale-Forge Performance Dashboard](./monitoring.md)