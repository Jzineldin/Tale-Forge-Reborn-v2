// Core Services - Exported for application use
export { creditService } from './creditService';
export { creditsService } from './creditsService';
export { templateService } from './templateService';
export { templateCreditsService } from './templateCreditsService';
export { stripeService } from './stripeService';
export { analyticsService } from './analyticsService';
export { contentCurationService } from './contentCuration';
export { foundersService } from './foundersService';

// Type Exports
export type { CreditTransaction, UserCredits } from './creditService';
export type { UserStoryTemplate } from './templateService';
export type { UserCredits as UserCreditsBalance, StoryCost, CreditTransaction as SimpleCreditTransaction } from './creditsService';
export type { TemplateTier, StoryTemplate, StoryCreationCost, SubscriptionLimits } from './templateCreditsService';
export type { SubscriptionPlan, UserSubscription } from './stripeService';
export type { UserEngagementMetrics, ContentAnalytics, SubscriptionMetrics } from './analyticsService';
export type { CurationCandidate, FeaturedContent } from './contentCuration';