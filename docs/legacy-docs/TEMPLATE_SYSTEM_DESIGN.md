# Template-as-a-Product System Design

## Enhanced Template Interface
```typescript
interface EnhancedStoryTemplate {
  // Core Identity
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  
  // NEW: Template Metadata
  difficulty: number; // 1-10 scale (replaces targetAge)
  chapterCount: number; // 3, 5, 8, 12, etc.
  estimatedDuration: string; // "15 min read", "30 min read"
  
  // NEW: Pricing & Access
  creditCost: number; // Base cost to use template
  discountPercentage?: number; // 0-100 for promotions
  isPremium: boolean; // Requires subscription
  isCustom: boolean; // User-created template
  
  // NEW: Creation & Ownership
  createdBy: 'system' | string; // 'system' or user_id
  createdAt: Date;
  lastModified: Date;
  isPublic: boolean; // Available in marketplace
  
  // Enhanced Settings
  settings: {
    difficulty: number; // 1-10 (matches template difficulty)
    wordsPerChapter: number;
    chapterVariation: 'fixed' | 'variable'; // NEW: Chapter length variation
    
    // Story Structure (ENHANCED)
    genre: string;
    theme: string;
    storyArc: 'linear' | 'branching' | 'episodic'; // NEW: Story structure types
    
    // Characters (ENHANCED) 
    characters: EnhancedCharacter[];
    maxCharacters: number; // Template limit
    allowCustomCharacters: boolean; // Can user add more?
    
    // World Building (ENHANCED)
    location: string;
    timePeriod: string;
    atmosphere: string;
    worldComplexity: 'simple' | 'moderate' | 'complex'; // NEW
    
    // Plot Elements (ENHANCED)
    conflict: string;
    quest: string;
    plotTwists: string[]; // NEW: Predefined plot points
    moralLesson: string;
    
    // Customization Options (NEW)
    customizableElements: string[]; // What users can modify
    lockedElements: string[]; // What's fixed in template
    
    // Additional Details
    additionalDetails: string;
    settingDescription: string;
  };
  
  // NEW: Analytics & Performance
  analytics: {
    usageCount: number;
    averageRating: number;
    totalRatings: number;
    conversionRate: number; // Template -> Story completion
  };
}

interface EnhancedCharacter {
  id: string;
  name: string;
  description: string;
  role: string;
  traits: string[];
  isCustomizable: boolean; // NEW: Can user edit this character?
  visualDescription?: string; // NEW: For AI image generation
  voicePersonality?: string; // NEW: For AI voice synthesis
}
```

## Tiered Template Access System

### Free Tier - "Template Explorer"
```typescript
interface FreeTierLimits {
  canUseTemplates: string[]; // List of free template IDs
  canCreateCustom: false;
  canPublishTemplates: false;
  canAccessMarketplace: 'browse_only';
  maxSimultaneousStories: 3;
}
```

### Premium Tier - "Template Creator"  
```typescript
interface PremiumTierLimits {
  canUseTemplates: 'all_standard'; // All non-premium templates
  canCreateCustom: true;
  maxCustomTemplates: 3;
  canEditTemplates: true;
  canSharePrivately: true; // Share with family/friends
  canPublishTemplates: false;
  marketplaceDiscounts: 20; // 20% off premium templates
}
```

### Professional Tier - "Template Master"
```typescript
interface ProTierLimits {
  canUseTemplates: 'all'; // Including premium marketplace templates
  canCreateCustom: true;
  maxCustomTemplates: 10;
  canPublishTemplates: true; // Sell in marketplace
  canEarnFromTemplates: true; // Revenue sharing
  canAccessAnalytics: true; // Template performance data
  marketplaceDiscounts: 50; // 50% off all templates
  prioritySupport: true;
}
```

## Template Marketplace Features

### Dynamic Pricing System
```typescript
interface TemplatePricing {
  baseCredits: number; // Standard cost
  currentPrice: number; // After discounts
  discountReason?: 'daily_special' | 'seasonal' | 'bulk' | 'first_time';
  timeRemaining?: string; // "2 hours left!" 
  bundlePricing?: {
    quantity: number;
    discountPercentage: number;
  }[];
}
```

### Rotating Features
```typescript
interface MarketplaceRotation {
  featuredTemplates: string[]; // Template IDs
  dailyDeal: {
    templateId: string;
    originalPrice: number;
    discountedPrice: number;
    expiresAt: Date;
  };
  weeklyCollection: {
    theme: string; // "Halloween Adventures", "Winter Tales"
    templates: string[];
    collectionDiscount: number;
  };
  newArrivals: string[]; // Recently created templates
  trending: string[]; // Most used templates
}
```

## Template Categories & Diversity

### Structural Diversity
```typescript
const TEMPLATE_STRUCTURES = {
  'micro-story': { chapters: 1, wordsPerChapter: 500 },
  'short-tale': { chapters: 3, wordsPerChapter: [200, 300, 250] },
  'classic-story': { chapters: 5, wordsPerChapter: [300, 400, 450, 350, 200] },
  'epic-adventure': { chapters: 8, wordsPerChapter: [400, 500, 600, 500, 550, 450, 400, 300] },
  'serial-episodes': { chapters: 10, wordsPerChapter: 300 }, // Consistent length
  'choose-adventure': { chapters: 'variable', branchingPoints: 3 }
};
```

### Enhanced Categories
```typescript
const TEMPLATE_CATEGORIES = {
  // Genre Categories
  'fantasy': ['magical-realms', 'mythical-creatures', 'wizarding-schools'],
  'sci-fi': ['space-exploration', 'time-travel', 'robot-friends'],
  'mystery': ['detective-cases', 'treasure-hunts', 'missing-persons'],
  'adventure': ['jungle-expeditions', 'pirate-quests', 'mountain-climbing'],
  
  // Difficulty Categories  
  'beginner': [1, 2, 3], // Simple vocabulary, linear plots
  'intermediate': [4, 5, 6, 7], // Complex characters, subplots
  'advanced': [8, 9, 10], // Sophisticated themes, branching narratives
  
  // Structure Categories
  'quick-reads': ['micro-story', 'short-tale'],
  'standard': ['classic-story'], 
  'extended': ['epic-adventure', 'serial-episodes'],
  'interactive': ['choose-adventure', 'puzzle-stories'],
  
  // Theme Categories
  'educational': ['science-discovery', 'historical-adventures', 'math-mysteries'],
  'emotional': ['friendship-tales', 'overcoming-fears', 'family-bonds'],
  'seasonal': ['halloween-spooks', 'christmas-magic', 'summer-camps']
};
```

## Implementation Phases

### Phase 1: Template Enhancement (Week 1)
1. Update existing templates from age → difficulty
2. Add chapter counts and structure info
3. Implement template credit costs
4. Fix template display UI

### Phase 2: Template Creation System (Week 2-3) 
1. Build template editor interface
2. Implement template saving/loading
3. Add template sharing capabilities
4. Create template validation system

### Phase 3: Marketplace Infrastructure (Week 4-5)
1. Build template marketplace UI
2. Implement dynamic pricing system
3. Add featured/trending/discount systems
4. Create template rating/review system

### Phase 4: Advanced Features (Week 6+)
1. Template analytics dashboard
2. Revenue sharing for creators
3. AI-assisted template suggestions
4. Collaborative template editing

## Database Schema Updates

```sql
-- Templates table
CREATE TABLE story_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  category VARCHAR(100),
  
  -- NEW: Enhanced metadata
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10),
  chapter_count INTEGER,
  estimated_duration VARCHAR(50),
  
  -- NEW: Pricing & access
  credit_cost INTEGER DEFAULT 0,
  discount_percentage INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  is_custom BOOLEAN DEFAULT false,
  
  -- NEW: Ownership
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  
  -- Template settings (JSONB for flexibility)
  settings JSONB NOT NULL,
  
  -- Analytics
  usage_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template usage tracking
CREATE TABLE template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  template_id UUID REFERENCES story_templates(id),
  story_id UUID REFERENCES stories(id),
  credits_spent INTEGER,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template marketplace features
CREATE TABLE template_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES story_templates(id),
  promotion_type VARCHAR(50), -- 'daily_deal', 'featured', 'seasonal'
  discount_percentage INTEGER,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

This comprehensive system transforms Tale Forge from a simple story generator into a sophisticated template marketplace - similar to how Canva revolutionized design templates.