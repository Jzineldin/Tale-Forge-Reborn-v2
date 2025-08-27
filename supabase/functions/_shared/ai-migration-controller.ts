// AI Migration Controller - Safe A/B Testing for V1 to V2 Migration
// Allows gradual rollout of GPT-4o Responses API while maintaining fallbacks

interface MigrationConfig {
  enableV2: boolean;
  v2RolloutPercentage: number;
  enableFallbackToV1: boolean;
  forceV2ForDevelopment: boolean;
  logAllRequests: boolean;
}

interface MigrationResult<T> {
  result: T;
  version: 'v1' | 'v2';
  wasError: boolean;
  errorMessage?: string;
  duration: number;
  provider: string;
}

export class AIMigrationController {
  private config: MigrationConfig;

  constructor(config?: Partial<MigrationConfig>) {
    // Default configuration - start conservative
    this.config = {
      enableV2: true,
      v2RolloutPercentage: 25, // Start with 25% of requests
      enableFallbackToV1: true,
      forceV2ForDevelopment: Deno.env.get('NODE_ENV') === 'development' || Deno.env.get('DENO_ENV') === 'development',
      logAllRequests: true,
      ...config
    };

    console.log('🔄 AI Migration Controller initialized:', this.config);
  }

  /**
   * Determines if a request should use V2 based on rollout percentage
   */
  shouldUseV2(userId?: string): boolean {
    // Force V2 in development
    if (this.config.forceV2ForDevelopment) {
      console.log('🧪 Development mode: forcing V2');
      return true;
    }

    // If V2 is disabled, use V1
    if (!this.config.enableV2) {
      console.log('❌ V2 disabled: using V1');
      return false;
    }

    // Deterministic rollout based on user ID (if available)
    if (userId) {
      const hash = this.hashString(userId);
      const shouldUse = (hash % 100) < this.config.v2RolloutPercentage;
      console.log(`🎲 User-based rollout for ${userId}: ${shouldUse ? 'V2' : 'V1'}`);
      return shouldUse;
    }

    // Random rollout for anonymous users
    const shouldUse = Math.random() * 100 < this.config.v2RolloutPercentage;
    console.log(`🎲 Random rollout: ${shouldUse ? 'V2' : 'V1'}`);
    return shouldUse;
  }

  /**
   * Execute AI operation with automatic V1/V2 selection and fallback
   */
  async executeWithMigration<T>(
    v1Operation: () => Promise<T>,
    v2Operation: () => Promise<T>,
    operationType: string,
    userId?: string
  ): Promise<MigrationResult<T>> {
    const useV2 = this.shouldUseV2(userId);
    const startTime = performance.now();

    // Try V2 first if selected
    if (useV2) {
      try {
        console.log(`🚀 ${operationType}: Attempting V2 (Responses API)...`);
        const result = await v2Operation();
        const duration = performance.now() - startTime;
        
        const migrationResult: MigrationResult<T> = {
          result,
          version: 'v2',
          wasError: false,
          duration: Math.round(duration),
          provider: 'OpenAI Responses API'
        };

        this.logMigrationResult(operationType, migrationResult, userId);
        return migrationResult;

      } catch (error) {
        console.warn(`⚠️ V2 ${operationType} failed: ${error.message}`);
        
        // Fallback to V1 if enabled
        if (this.config.enableFallbackToV1) {
          console.log(`🔄 ${operationType}: Falling back to V1...`);
          try {
            const result = await v1Operation();
            const duration = performance.now() - startTime;
            
            const migrationResult: MigrationResult<T> = {
              result,
              version: 'v1',
              wasError: true,
              errorMessage: error.message,
              duration: Math.round(duration),
              provider: 'Legacy Chat Completions'
            };

            this.logMigrationResult(operationType, migrationResult, userId);
            return migrationResult;

          } catch (v1Error) {
            console.error(`❌ V1 fallback also failed: ${v1Error.message}`);
            throw new Error(`Both V2 and V1 failed: V2(${error.message}) V1(${v1Error.message})`);
          }
        } else {
          throw error;
        }
      }
    } else {
      // Use V1 directly
      try {
        console.log(`🔄 ${operationType}: Using V1 (Chat Completions)...`);
        const result = await v1Operation();
        const duration = performance.now() - startTime;
        
        const migrationResult: MigrationResult<T> = {
          result,
          version: 'v1',
          wasError: false,
          duration: Math.round(duration),
          provider: 'Legacy Chat Completions'
        };

        this.logMigrationResult(operationType, migrationResult, userId);
        return migrationResult;

      } catch (error) {
        console.error(`❌ V1 ${operationType} failed: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Log migration results for analysis
   */
  private logMigrationResult<T>(
    operationType: string, 
    result: MigrationResult<T>, 
    userId?: string
  ): void {
    if (!this.config.logAllRequests) return;

    const logData = {
      timestamp: new Date().toISOString(),
      operationType,
      version: result.version,
      wasError: result.wasError,
      duration: result.duration,
      provider: result.provider,
      userId: userId || 'anonymous',
      errorMessage: result.errorMessage
    };

    console.log('📊 Migration Log:', JSON.stringify(logData));

    // In production, you might want to send this to analytics
    // await this.sendToAnalytics(logData);
  }

  /**
   * Simple hash function for deterministic user-based rollout
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Update migration configuration during runtime
   */
  updateConfig(updates: Partial<MigrationConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log('🔄 Migration config updated:', this.config);
  }

  /**
   * Get current migration statistics
   */
  getConfig(): MigrationConfig {
    return { ...this.config };
  }

  /**
   * Increase V2 rollout percentage gradually
   */
  increaseRollout(increment = 10): void {
    const newPercentage = Math.min(100, this.config.v2RolloutPercentage + increment);
    this.updateConfig({ v2RolloutPercentage: newPercentage });
    console.log(`📈 V2 rollout increased to ${newPercentage}%`);
  }

  /**
   * Decrease V2 rollout percentage if issues are detected
   */
  decreaseRollout(decrement = 25): void {
    const newPercentage = Math.max(0, this.config.v2RolloutPercentage - decrement);
    this.updateConfig({ v2RolloutPercentage: newPercentage });
    console.log(`📉 V2 rollout decreased to ${newPercentage}%`);
  }

  /**
   * Emergency fallback to V1 only
   */
  emergencyFallbackToV1(): void {
    this.updateConfig({ 
      enableV2: false, 
      v2RolloutPercentage: 0 
    });
    console.warn('🚨 Emergency fallback activated: All requests will use V1');
  }

  /**
   * Complete migration to V2
   */
  completeMigrationToV2(): void {
    this.updateConfig({ 
      enableV2: true, 
      v2RolloutPercentage: 100,
      enableFallbackToV1: false 
    });
    console.log('✅ Migration complete: All requests will use V2');
  }
}

// Singleton instance for global use
export const migrationController = new AIMigrationController();

// Migration presets for different phases
export const MIGRATION_PRESETS = {
  DEVELOPMENT: {
    enableV2: true,
    v2RolloutPercentage: 100,
    enableFallbackToV1: true,
    forceV2ForDevelopment: true,
    logAllRequests: true
  },
  
  BETA_TESTING: {
    enableV2: true,
    v2RolloutPercentage: 10,
    enableFallbackToV1: true,
    forceV2ForDevelopment: false,
    logAllRequests: true
  },
  
  GRADUAL_ROLLOUT: {
    enableV2: true,
    v2RolloutPercentage: 25,
    enableFallbackToV1: true,
    forceV2ForDevelopment: false,
    logAllRequests: true
  },
  
  FULL_MIGRATION: {
    enableV2: true,
    v2RolloutPercentage: 100,
    enableFallbackToV1: false,
    forceV2ForDevelopment: false,
    logAllRequests: false
  },
  
  EMERGENCY_FALLBACK: {
    enableV2: false,
    v2RolloutPercentage: 0,
    enableFallbackToV1: false,
    forceV2ForDevelopment: false,
    logAllRequests: true
  }
} as const;

export type MigrationPreset = keyof typeof MIGRATION_PRESETS;

export function applyMigrationPreset(preset: MigrationPreset): void {
  migrationController.updateConfig(MIGRATION_PRESETS[preset]);
  console.log(`🎯 Applied migration preset: ${preset}`);
}