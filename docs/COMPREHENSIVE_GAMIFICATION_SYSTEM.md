# Tale-Forge Comprehensive Gamification & User-Generated Content System

## 📋 Executive Summary

This document outlines the complete implementation plan for Tale-Forge's gamification system, user-generated template marketplace, and credit reward economy. The system transforms Tale-Forge from a simple story creation tool into a comprehensive creative community platform.

## 🎯 Core Features Overview

### 1. User-Generated Template System
- **Template Creation**: Users can create custom story templates
- **Template Marketplace**: Public sharing and discovery platform
- **Tier-Based Limits**: Different creation limits based on subscription
- **Template Analytics**: Usage tracking and performance metrics

### 2. Credit Reward Economy
- **Social Activity Rewards**: Credits for community engagement
- **Template Creator Economy**: Ongoing rewards for popular templates
- **Daily/Weekly Goals**: Progressive achievement system
- **Bonus Multipliers**: Special events and achievements

### 3. Achievement & Progress System
- **Achievement Categories**: Story creation, social engagement, template creation
- **Progress Tracking**: Visual progress bars and milestone tracking
- **Badge Collection**: Collectible achievement badges
- **Leaderboards**: Community recognition and competition

### 4. Weekly Rotation & Featured Content
- **Automated Rotation**: Algorithm-driven featured template selection
- **Community Spotlights**: Highlighting top creators and templates
- **Trending Analytics**: Real-time popularity tracking

## 📊 Subscription Tier Integration

### Free Tier (Current: 15 credits/month)
- **Template Creation**: 3 private templates maximum
- **Public Sharing**: 1 public template allowed
- **Achievement Access**: Basic achievements only
- **Goal Tracking**: Daily goals only

### Story Creator Tier ($9.99/month - 200 credits)
- **Template Creation**: 15 templates total (5 public allowed)
- **Enhanced Features**: Advanced template customization
- **Achievement Access**: Creator-tier achievements unlocked
- **Goal Tracking**: Daily + weekly goals
- **Bonus Rewards**: 25% more credits from social activities

### Story Master Tier ($24.99/month - 600 credits)
- **Template Creation**: Unlimited templates
- **Public Sharing**: Unlimited public templates
- **Priority Featuring**: Higher chance of template featuring
- **Achievement Access**: All achievement tiers unlocked
- **Goal Tracking**: Full goal system with monthly challenges
- **Bonus Rewards**: 50% more credits from social activities
- **Analytics Dashboard**: Detailed template performance metrics

## 💳 Credit Reward Economy Structure

### Template Creation & Sharing Rewards
```
├── Create First Template: +5 credits (one-time)
├── Share Template Publicly: +5 credits per template
├── Template Used by Others: +2 credits per use
├── Template Saved/Bookmarked: +1 credit per save
├── Template Reaches 10 Likes: +10 bonus credits
├── Template Reaches 50 Uses: +25 bonus credits
└── Template Featured Weekly: +40 credits
```

### Daily & Weekly Goal Rewards
```
Daily Goals (Reset every 24 hours):
├── Create 1 Story: +1 credit
├── Like 3 Templates: +1 credit
├── Save 1 Template: +1 credit
└── Share 1 Story: +2 credits

Weekly Goals (Reset every Monday):
├── Create 5 Stories: +15 credits
├── Engage with 10 Templates: +10 credits
├── Receive 10 Likes on Your Templates: +20 credits
└── Complete All Daily Goals (7/7): +25 bonus credits
```

### Social Engagement Rewards
```
├── First Story Like Received: +2 credits
├── Story Shared by Others: +3 credits per share
├── Review Written on Templates: +1 credit per review
├── Helpful Review (5+ helpful votes): +5 bonus credits
└── Community Interaction Streak (7 days): +15 credits
```

## 🏆 Achievement System Architecture

### Achievement Categories

#### **Story Creator Achievements**
```
Novice Tier:
├── "First Steps" - Create your first story (5 credits)
├── "Getting Started" - Create 3 stories (10 credits)
└── "Finding Your Voice" - Create 5 stories (15 credits)

Intermediate Tier:
├── "Storyteller" - Create 10 stories (25 credits)
├── "Chapter Master" - Create 25 stories (40 credits)
└── "Narrative Builder" - Create 50 stories (75 credits)

Advanced Tier:
├── "Master Narrator" - Create 100 stories (150 credits)
├── "Story Architect" - Create 250 stories (300 credits)
└── "Legend of Tales" - Create 500 stories (500 credits)
```

#### **Template Creator Achievements**
```
Creator Tier:
├── "Template Pioneer" - Create first template (10 credits)
├── "Creative Mind" - Create 5 templates (25 credits)
└── "Template Architect" - Create 15 templates (50 credits)

Community Tier:
├── "Sharing is Caring" - First public template (15 credits)
├── "Community Builder" - 5 public templates (40 credits)
└── "Template Library" - 20 public templates (100 credits)

Impact Tier:
├── "Popular Creator" - Template used 50+ times (75 credits)
├── "Community Favorite" - Template used 200+ times (150 credits)
└── "Template Master" - Template used 1000+ times (400 credits)
```

#### **Social Engagement Achievements**
```
Engagement Tier:
├── "Friendly Face" - Like 50 templates (10 credits)
├── "Community Supporter" - Like 200 templates (25 credits)
└── "Engagement Champion" - Like 500 templates (60 credits)

Recognition Tier:
├── "First Fan" - Receive 10 likes (15 credits)
├── "Popular Creator" - Receive 100 likes (40 credits)
└── "Community Star" - Receive 500 likes (100 credits)

Influence Tier:
├── "Helpful Reviewer" - Write 25 reviews (20 credits)
├── "Trusted Voice" - 50+ helpful review votes (50 credits)
└── "Community Guide" - 200+ helpful review votes (120 credits)
```

#### **Special & Seasonal Achievements**
```
Seasonal Events:
├── "Halloween Master" - Create spooky story in October (25 credits)
├── "Holiday Spirit" - Create festive story in December (25 credits)
└── "New Year, New Stories" - Create 10 stories in January (50 credits)

Milestone Events:
├── "Early Adopter" - Join during beta period (50 credits)
├── "Community Founder" - First 1000 users (100 credits)
└── "Platform Veteran" - 1 year membership (75 credits)

Collaboration Events:
├── "Template Collaboration" - Use others' templates 20 times (30 credits)
├── "Cross-Genre Explorer" - Create stories in 5 different genres (40 credits)
└── "Age Range Master" - Create stories for all age groups (60 credits)
```

## 🗄️ Database Schema Implementation

### User-Generated Templates
```sql
CREATE TABLE user_story_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('3-5', '6-8', '9-12', '13+')),
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  
  -- Template Content (JSON structures)
  characters JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '[]'::jsonb,
  plot_elements JSONB DEFAULT '[]'::jsonb,
  story_hooks JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  estimated_chapters INTEGER DEFAULT 3,
  estimated_word_count INTEGER DEFAULT 500,
  tags TEXT[] DEFAULT '{}',
  
  -- Visibility & Status
  is_public BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  
  -- Analytics
  usage_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0.0,
  
  -- Creator Info
  creator_tier TEXT DEFAULT 'free' CHECK (creator_tier IN ('free', 'creator', 'master')),
  credits_earned INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  featured_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_user_templates_creator ON user_story_templates(creator_id);
CREATE INDEX idx_user_templates_public ON user_story_templates(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_user_templates_featured ON user_story_templates(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_user_templates_genre ON user_story_templates(genre);
CREATE INDEX idx_user_templates_popularity ON user_story_templates(likes_count, usage_count);
```

### Template Usage Tracking
```sql
CREATE TABLE template_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES user_story_templates(id) ON DELETE CASCADE,
  template_creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  
  -- Reward Tracking
  credits_awarded INTEGER DEFAULT 0,
  award_processed BOOLEAN DEFAULT FALSE,
  
  -- Usage Context
  usage_type TEXT DEFAULT 'story_creation' CHECK (usage_type IN ('story_creation', 'template_copy', 'inspiration')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_template_usage_template ON template_usage_logs(template_id);
CREATE INDEX idx_template_usage_creator ON template_usage_logs(template_creator_id);
CREATE INDEX idx_template_usage_awards ON template_usage_logs(award_processed) WHERE award_processed = FALSE;
```

### Achievement System
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('story_creation', 'template_creation', 'social_engagement', 'special_events')),
  tier TEXT NOT NULL CHECK (tier IN ('novice', 'intermediate', 'advanced', 'master')),
  
  -- Visual Elements
  icon TEXT NOT NULL, -- Lucide icon name
  badge_color TEXT DEFAULT '#fbbf24', -- Hex color for badge
  
  -- Requirements
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  requirement_timeframe TEXT, -- 'daily', 'weekly', 'monthly', 'all_time'
  
  -- Rewards
  credits_reward INTEGER DEFAULT 0,
  
  -- Restrictions
  tier_required TEXT DEFAULT 'free' CHECK (tier_required IN ('free', 'creator', 'master')),
  is_active BOOLEAN DEFAULT TRUE,
  is_repeatable BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Achievements
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  
  -- Achievement Details
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  credits_earned INTEGER DEFAULT 0,
  progress_when_earned INTEGER DEFAULT 0,
  
  -- Tracking
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id, achievement_id, earned_at) -- Allow repeatable achievements
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_earned ON user_achievements(earned_at DESC);
CREATE INDEX idx_user_achievements_unclaimed ON user_achievements(is_claimed) WHERE is_claimed = FALSE;
```

### Goal Tracking System
```sql
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Goal Definition
  goal_type TEXT NOT NULL CHECK (goal_type IN ('daily_story', 'daily_engagement', 'weekly_stories', 'weekly_engagement', 'monthly_challenge')),
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  
  -- Time Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Status
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Rewards
  credits_reward INTEGER DEFAULT 0,
  bonus_multiplier DECIMAL(3,2) DEFAULT 1.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_goals_user_active ON user_goals(user_id, period_end) WHERE completed = FALSE;
CREATE INDEX idx_user_goals_period ON user_goals(period_start, period_end);
```

### Progress Tracking
```sql
CREATE TABLE user_progress_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Story Creation Stats
  stories_created_total INTEGER DEFAULT 0,
  stories_created_this_month INTEGER DEFAULT 0,
  stories_created_this_week INTEGER DEFAULT 0,
  
  -- Template Stats
  templates_created_total INTEGER DEFAULT 0,
  templates_public_total INTEGER DEFAULT 0,
  template_usage_received_total INTEGER DEFAULT 0,
  
  -- Social Stats
  likes_given_total INTEGER DEFAULT 0,
  likes_received_total INTEGER DEFAULT 0,
  reviews_written_total INTEGER DEFAULT 0,
  helpful_votes_received INTEGER DEFAULT 0,
  
  -- Engagement Stats
  login_streak_current INTEGER DEFAULT 0,
  login_streak_best INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  
  -- Credit Stats
  credits_earned_from_social INTEGER DEFAULT 0,
  credits_earned_from_templates INTEGER DEFAULT 0,
  credits_earned_from_achievements INTEGER DEFAULT 0,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔄 Weekly Rotation & Featured Content System

### Rotation Algorithm
```sql
-- Function to calculate template popularity score
CREATE OR REPLACE FUNCTION calculate_template_popularity_score(template_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  score DECIMAL(10,2) := 0;
  likes_weight DECIMAL(3,2) := 2.0;
  usage_weight DECIMAL(3,2) := 3.0;
  recency_weight DECIMAL(3,2) := 1.5;
  rating_weight DECIMAL(3,2) := 2.5;
BEGIN
  SELECT 
    (COALESCE(likes_count, 0) * likes_weight) +
    (COALESCE(usage_count, 0) * usage_weight) +
    (COALESCE(rating_average, 0) * rating_weight) +
    -- Recency bonus (newer templates get slight boost)
    (CASE 
      WHEN created_at > NOW() - INTERVAL '30 days' THEN 10 * recency_weight
      WHEN created_at > NOW() - INTERVAL '90 days' THEN 5 * recency_weight
      ELSE 0 
    END)
  INTO score
  FROM user_story_templates 
  WHERE id = template_id;
  
  RETURN COALESCE(score, 0);
END;
$$ LANGUAGE plpgsql;

-- Weekly rotation function
CREATE OR REPLACE FUNCTION rotate_featured_templates()
RETURNS void AS $$
DECLARE
  template_record RECORD;
BEGIN
  -- Reset all featured flags
  UPDATE user_story_templates SET is_featured = FALSE, featured_at = NULL;
  
  -- Select top templates by popularity score
  FOR template_record IN
    SELECT id, calculate_template_popularity_score(id) as score
    FROM user_story_templates 
    WHERE is_public = TRUE AND is_approved = TRUE
    ORDER BY score DESC 
    LIMIT 6
  LOOP
    UPDATE user_story_templates 
    SET is_featured = TRUE, featured_at = NOW()
    WHERE id = template_record.id;
    
    -- Award credits to template creator
    INSERT INTO credit_transactions (
      user_id, 
      transaction_type, 
      amount, 
      description, 
      reference_id
    )
    SELECT 
      creator_id,
      'template_featured',
      40,
      'Template featured in weekly rotation: ' || title,
      id::text
    FROM user_story_templates 
    WHERE id = template_record.id;
  END LOOP;
  
  -- Log the rotation event
  INSERT INTO system_events (event_type, event_data)
  VALUES ('weekly_template_rotation', jsonb_build_object(
    'rotated_at', NOW(),
    'featured_count', 6
  ));
END;
$$ LANGUAGE plpgsql;
```

## 🎮 User Interface Components

### Achievement Badge Component
```typescript
// src/components/ui/AchievementBadge.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/atoms/Icon';

interface AchievementBadgeProps {
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    badge_color: string;
    tier: string;
    credits_reward: number;
  };
  earned?: boolean;
  earnedAt?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  earned = false,
  earnedAt,
  size = 'md',
  showDetails = true
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  return (
    <div className="achievement-badge-container">
      <div 
        className={`
          achievement-badge flex items-center justify-center rounded-full transition-all duration-300
          ${sizeClasses[size]}
          ${earned 
            ? 'bg-gradient-to-br shadow-lg' 
            : 'bg-gray-300 opacity-60 grayscale'
          }
        `}
        style={earned ? {
          background: `linear-gradient(135deg, ${achievement.badge_color}, ${achievement.badge_color}cc)`
        } : {}}
      >
        <Icon 
          name={achievement.icon as any} 
          size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} 
          className={earned ? 'text-white' : 'text-gray-500'}
        />
      </div>
      
      {showDetails && (
        <div className="mt-2 text-center">
          <h4 className={`font-semibold ${earned ? 'text-white' : 'text-gray-400'}`}>
            {achievement.name}
          </h4>
          <p className="text-xs text-gray-300 mb-1">
            {achievement.description}
          </p>
          {achievement.credits_reward > 0 && (
            <Badge variant="secondary" className="text-xs">
              +{achievement.credits_reward} credits
            </Badge>
          )}
          {earned && earnedAt && (
            <p className="text-xs text-amber-400 mt-1">
              Earned {new Date(earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
```

### Progress Dashboard Component
```typescript
// src/components/organisms/ProgressDashboard.tsx
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { AchievementBadge } from '@/components/ui/AchievementBadge';
import Icon from '@/components/atoms/Icon';

interface ProgressDashboardProps {
  user: any;
  achievements: any[];
  goals: any[];
  stats: any;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  user,
  achievements,
  goals,
  stats
}) => {
  return (
    <div className="progress-dashboard space-y-6">
      {/* Daily Goals Section */}
      <div className="glass-enhanced p-6 rounded-2xl">
        <h3 className="fantasy-heading text-xl font-bold mb-4 flex items-center">
          <Icon name="target" className="mr-2 text-amber-400" />
          Daily Goals
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.filter(g => g.goal_type.startsWith('daily')).map(goal => (
            <div key={goal.id} className="bg-white/5 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-white">
                  {goal.goal_type.replace('daily_', '').replace('_', ' ')}
                </h4>
                <span className="text-amber-400 text-sm">
                  {goal.current_value}/{goal.target_value}
                </span>
              </div>
              <Progress 
                value={(goal.current_value / goal.target_value) * 100} 
                className="h-2 mb-2"
              />
              {goal.completed && (
                <Badge variant="default" className="text-xs">
                  +{goal.credits_reward} credits earned!
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="glass-enhanced p-6 rounded-2xl">
        <h3 className="fantasy-heading text-xl font-bold mb-4 flex items-center">
          <Icon name="trophy" className="mr-2 text-amber-400" />
          Recent Achievements
        </h3>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {achievements.slice(0, 6).map(achievement => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              earned={achievement.earned}
              earnedAt={achievement.earnedAt}
              size="md"
              showDetails={false}
            />
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="glass-enhanced p-6 rounded-2xl">
        <h3 className="fantasy-heading text-xl font-bold mb-4 flex items-center">
          <Icon name="bar-chart" className="mr-2 text-amber-400" />
          Your Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {stats.stories_created_total}
            </div>
            <div className="text-sm text-white/70">Stories Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {stats.templates_created_total}
            </div>
            <div className="text-sm text-white/70">Templates Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {stats.likes_received_total}
            </div>
            <div className="text-sm text-white/70">Likes Received</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {stats.credits_earned_from_social}
            </div>
            <div className="text-sm text-white/70">Social Credits</div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 🚀 Implementation Timeline

### Phase 1: Database & Core Systems (Week 1-2)
- [ ] Create all database migrations
- [ ] Set up achievement seeding system
- [ ] Implement goal tracking functions
- [ ] Create credit reward automation

### Phase 2: User Template System (Week 3-4)
- [ ] Build template creation UI
- [ ] Implement template editing interface
- [ ] Create template marketplace
- [ ] Add template usage tracking

### Phase 3: Achievement & Progress System (Week 5-6)
- [ ] Build achievement tracking system
- [ ] Create progress dashboard
- [ ] Implement real-time notifications
- [ ] Add achievement claiming interface

### Phase 4: Advanced Features (Week 7-8)
- [ ] Weekly rotation automation
- [ ] Analytics dashboard
- [ ] Advanced reporting
- [ ] Performance optimization

This comprehensive system will transform Tale-Forge into a thriving creative community with sustained user engagement through gamification, social rewards, and user-generated content.