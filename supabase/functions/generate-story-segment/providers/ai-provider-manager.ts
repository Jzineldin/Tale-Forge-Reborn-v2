import { CircuitBreaker } from '../utils/circuit-breaker.ts';
import { Logger } from '../utils/logger.ts';
import { OpenAIProvider } from './openai-provider.ts';
import { OVHProvider } from './ovh-provider.ts';
import { AnthropicProvider } from './anthropic-provider.ts';
import type { AIProvider, AIResponse, AIConfig } from '../types/ai-types.ts';

export class AIProviderManager {
  private providers: Map<string, AIProvider> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private logger: Logger;
  
  constructor() {
    this.logger = new Logger('ai-provider-manager');
    this.initializeProviders();
  }
  
  private initializeProviders(): void {
    // Initialize providers based on available API keys
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const ovhToken = Deno.env.get('OVH_AI_ENDPOINTS_ACCESS_TOKEN');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (openaiKey && !openaiKey.includes('dummy') && !openaiKey.includes('test')) {
      const provider = new OpenAIProvider(openaiKey);
      this.providers.set('openai', provider);
      this.circuitBreakers.set('openai', new CircuitBreaker({
        failureThreshold: 3,
        resetTimeout: 60000,
        monitoringPeriod: 120000
      }));
      this.logger.info('OpenAI provider initialized');
    }
    
    if (ovhToken) {
      const provider = new OVHProvider(ovhToken);
      this.providers.set('ovh', provider);
      this.circuitBreakers.set('ovh', new CircuitBreaker({
        failureThreshold: 3,
        resetTimeout: 60000,
        monitoringPeriod: 120000
      }));
      this.logger.info('OVH provider initialized');
    }
    
    if (anthropicKey && !anthropicKey.includes('dummy') && !anthropicKey.includes('test')) {
      const provider = new AnthropicProvider(anthropicKey);
      this.providers.set('anthropic', provider);
      this.circuitBreakers.set('anthropic', new CircuitBreaker({
        failureThreshold: 3,
        resetTimeout: 60000,
        monitoringPeriod: 120000
      }));
      this.logger.info('Anthropic provider initialized');
    }
    
    if (this.providers.size === 0) {
      throw new Error('MISSING_API_KEYS: No AI providers configured with valid API keys');
    }
  }
  
  async generateContent(prompt: string, config: AIConfig): Promise<AIResponse> {
    const providerOrder = this.getProviderPriority();
    let lastError: Error | undefined;
    
    for (const providerName of providerOrder) {
      const provider = this.providers.get(providerName);
      const breaker = this.circuitBreakers.get(providerName);
      
      if (!provider || !breaker) {
        continue;
      }
      
      // Check if circuit breaker is open
      if (breaker.isOpen()) {
        this.logger.warn(`Circuit breaker open for ${providerName}, skipping`);
        continue;
      }
      
      try {
        this.logger.info(`Attempting generation with ${providerName}`);
        const startTime = Date.now();
        
        const response = await breaker.execute(async () => {
          return await provider.generate(prompt, config);
        });
        
        const duration = Date.now() - startTime;
        this.logger.info(`${providerName} generation successful`, { duration });
        
        return {
          ...response,
          provider: providerName,
          metadata: {
            ...response.metadata,
            duration,
            fallbackAttempt: providerOrder.indexOf(providerName)
          }
        };
      } catch (error) {
        lastError = error;
        this.logger.error(`${providerName} generation failed`, { 
          error: error.message 
        });
        
        // Record failure in circuit breaker
        breaker.recordFailure();
      }
    }
    
    // All providers failed
    throw new Error(`AI_GENERATION_FAILED: All providers failed. Last error: ${lastError?.message}`);
  }
  
  private getProviderPriority(): string[] {
    // Priority order based on reliability and cost
    const priority = ['openai', 'anthropic', 'ovh'];
    
    // Filter to only available providers
    return priority.filter(name => this.providers.has(name));
  }
  
  getProviderStatus(): Record<string, {
    available: boolean;
    circuitBreakerState: string;
    failureCount: number;
  }> {
    const status: Record<string, any> = {};
    
    for (const [name, breaker] of this.circuitBreakers.entries()) {
      status[name] = {
        available: this.providers.has(name),
        circuitBreakerState: breaker.getState(),
        failureCount: breaker.getFailureCount()
      };
    }
    
    return status;
  }
}