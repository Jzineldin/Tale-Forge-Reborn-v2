/**
 * Feature Flag System for Safe AI Migration
 * Enables gradual rollout without breaking production
 */

// Feature flags with safe defaults (all OFF initially)
export const FeatureFlags = {
  // AI Improvements
  USE_OPTIMIZED_PROMPTS: false,
  USE_CIRCUIT_BREAKER: false,
  USE_RESPONSE_CACHE: false,
  USE_NEW_STRATEGY_PATTERN: false,
  
  // Performance Optimizations
  USE_VIRTUAL_SCROLLING: false,
  USE_IMAGE_CDN: false,
  USE_QUERY_BATCHING: false,
  
  // Monitoring
  ENABLE_PERFORMANCE_MONITORING: false,
  ENABLE_ERROR_TRACKING: false,
  
  // Testing
  ENABLE_A_B_TESTING: false,
  LOG_FEATURE_USAGE: true, // Safe to leave on
} as const;

// Simple hash function for consistent user bucketing
const hashUserId = (userId: string): number => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Percentage-based rollout configuration
const ROLLOUT_PERCENTAGES: Record<string, number> = {
  USE_OPTIMIZED_PROMPTS: 0,      // Start at 0%
  USE_CIRCUIT_BREAKER: 0,        // Start at 0%
  USE_RESPONSE_CACHE: 0,          // Start at 0%
  USE_NEW_STRATEGY_PATTERN: 0,    // Start at 0%
};

/**
 * Check if a feature is enabled for a specific user
 * Supports percentage-based gradual rollout
 */
export const isFeatureEnabled = (
  flag: keyof typeof FeatureFlags,
  userId?: string
): boolean => {
  // First check if globally enabled
  if (FeatureFlags[flag]) {
    return true;
  }
  
  // Check percentage rollout if userId provided
  if (userId && ROLLOUT_PERCENTAGES[flag] > 0) {
    const userBucket = hashUserId(userId) % 100;
    return userBucket < ROLLOUT_PERCENTAGES[flag];
  }
  
  return false;
};

/**
 * Safe feature flag wrapper that logs usage and handles errors
 */
export const withFeatureFlag = async <T>(
  flag: keyof typeof FeatureFlags,
  userId: string | undefined,
  newImplementation: () => Promise<T>,
  oldImplementation: () => Promise<T>
): Promise<T> => {
  const isEnabled = isFeatureEnabled(flag, userId);
  
  if (FeatureFlags.LOG_FEATURE_USAGE) {
    console.log(`Feature ${flag}: ${isEnabled ? 'NEW' : 'OLD'} for user ${userId}`);
  }
  
  if (isEnabled) {
    try {
      const start = performance.now();
      const result = await newImplementation();
      const duration = performance.now() - start;
      
      // Log success metrics
      console.log(`✅ Feature ${flag} succeeded in ${duration}ms`);
      
      return result;
    } catch (error) {
      // Log failure and fallback
      console.error(`❌ Feature ${flag} failed, falling back:`, error);
      
      // Auto-fallback to old implementation
      return await oldImplementation();
    }
  }
  
  return await oldImplementation();
};

/**
 * A/B test wrapper for comparing implementations
 */
export const abTest = async <T>(
  testName: string,
  userId: string,
  variantA: () => Promise<T>,
  variantB: () => Promise<T>
): Promise<{ result: T; variant: 'A' | 'B'; duration: number }> => {
  // 50/50 split based on user hash
  const useVariantB = hashUserId(userId) % 2 === 0;
  const variant = useVariantB ? 'B' : 'A';
  
  const start = performance.now();
  const result = await (useVariantB ? variantB() : variantA());
  const duration = performance.now() - start;
  
  if (FeatureFlags.ENABLE_A_B_TESTING) {
    console.log(`A/B Test "${testName}": Variant ${variant} (${duration}ms)`);
  }
  
  return { result, variant, duration };
};

/**
 * Update rollout percentage (for admin use)
 */
export const updateRolloutPercentage = (
  flag: keyof typeof FeatureFlags,
  percentage: number
): void => {
  if (percentage < 0 || percentage > 100) {
    throw new Error('Percentage must be between 0 and 100');
  }
  
  ROLLOUT_PERCENTAGES[flag] = percentage;
  console.log(`📊 Rollout for ${flag} set to ${percentage}%`);
};

/**
 * Get current feature flag status
 */
export const getFeatureStatus = () => {
  return {
    flags: FeatureFlags,
    rolloutPercentages: ROLLOUT_PERCENTAGES,
    timestamp: new Date().toISOString()
  };
};

/**
 * Emergency kill switch - disable all experimental features
 */
export const emergencyDisableAll = (): void => {
  console.warn('🚨 EMERGENCY: Disabling all feature flags');
  
  Object.keys(FeatureFlags).forEach(key => {
    (FeatureFlags as any)[key] = false;
  });
  
  Object.keys(ROLLOUT_PERCENTAGES).forEach(key => {
    ROLLOUT_PERCENTAGES[key] = 0;
  });
};

// Export for testing
export const __testing = {
  hashUserId,
  ROLLOUT_PERCENTAGES
};