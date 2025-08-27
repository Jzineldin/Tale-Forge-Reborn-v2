import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';
import { RequestValidator } from '../validators/request-validator.ts';
import { StoryDataFetcher } from '../data/story-data-fetcher.ts';
import { PromptGenerator } from '../generators/prompt-generator.ts';
import { AIProviderManager } from '../providers/ai-provider-manager.ts';
import { ResponseBuilder } from '../builders/response-builder.ts';
import { ImageGenerationService } from '../services/image-generation-service.ts';
import { Logger } from '../utils/logger.ts';
import { MetricsCollector } from '../utils/metrics-collector.ts';
import type { StoryGenerationResult, StoryGenerationContext } from '../types/interfaces.ts';

export class StoryGenerationOrchestrator {
  private readonly logger: Logger;
  private readonly metrics: MetricsCollector;
  private readonly validator: RequestValidator;
  private readonly dataFetcher: StoryDataFetcher;
  private readonly promptGenerator: PromptGenerator;
  private readonly aiManager: AIProviderManager;
  private readonly responseBuilder: ResponseBuilder;
  private readonly imageService: ImageGenerationService;
  
  constructor(private readonly requestId: string) {
    this.logger = new Logger(`orchestrator-${requestId}`);
    this.metrics = new MetricsCollector(requestId);
    this.validator = new RequestValidator();
    this.dataFetcher = new StoryDataFetcher();
    this.promptGenerator = new PromptGenerator();
    this.aiManager = new AIProviderManager();
    this.responseBuilder = new ResponseBuilder();
    this.imageService = new ImageGenerationService();
  }
  
  async generateStorySegment(req: Request): Promise<StoryGenerationResult> {
    const context: StoryGenerationContext = {
      requestId: this.requestId,
      startTime: Date.now()
    };
    
    try {
      // Phase 1: Validation
      this.logger.info('Phase 1: Validating request');
      const validationResult = await this.validator.validate(req);
      context.validation = validationResult;
      this.metrics.recordPhase('validation', Date.now() - context.startTime);
      
      // Phase 2: Initialize Supabase Client
      this.logger.info('Phase 2: Initializing Supabase client');
      const supabase = this.createSupabaseClient(validationResult.authHeader);
      context.supabase = supabase;
      
      // Phase 3: Fetch Story Data
      this.logger.info('Phase 3: Fetching story data');
      const storyData = await this.dataFetcher.fetchStoryContext(
        validationResult.storyId,
        validationResult.choiceIndex,
        supabase
      );
      context.storyData = storyData;
      this.metrics.recordPhase('data-fetch', Date.now() - context.startTime);
      
      // Phase 4: Generate Prompt
      this.logger.info('Phase 4: Generating AI prompt');
      const prompt = this.promptGenerator.generate(
        storyData,
        validationResult.templateContext
      );
      context.prompt = prompt;
      this.metrics.recordPhase('prompt-generation', Date.now() - context.startTime);
      
      // Phase 5: AI Generation with Circuit Breaker
      this.logger.info('Phase 5: Generating story content');
      const aiResponse = await this.aiManager.generateContent(prompt, {
        story: storyData.story,
        targetAge: storyData.story.target_age
      });
      context.aiResponse = aiResponse;
      this.metrics.recordPhase('ai-generation', Date.now() - context.startTime);
      
      // Phase 6: Process and Save Results
      this.logger.info('Phase 6: Processing and saving results');
      const segment = await this.dataFetcher.saveNewSegment(
        context.storyData,
        aiResponse,
        supabase
      );
      context.segment = segment;
      this.metrics.recordPhase('save-segment', Date.now() - context.startTime);
      
      // Phase 7: Trigger Image Generation (Non-blocking)
      this.logger.info('Phase 7: Triggering image generation');
      this.imageService.triggerGeneration(segment.id, aiResponse.imagePrompt)
        .catch(error => this.logger.warn('Image generation failed', { error }));
      
      // Phase 8: Build Response
      const response = this.responseBuilder.buildSuccess(context, this.metrics.getMetrics());
      
      this.logger.info('Story generation completed successfully', {
        metrics: this.metrics.getMetrics()
      });
      
      return response;
    } catch (error) {
      this.logger.error('Story generation failed', { 
        error: error.message,
        phase: this.metrics.getCurrentPhase()
      });
      throw error;
    }
  }
  
  private createSupabaseClient(authHeader: string) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }
    
    return createClient(
      supabaseUrl,
      supabaseServiceKey,
      { global: { headers: { Authorization: authHeader } } }
    );
  }
}