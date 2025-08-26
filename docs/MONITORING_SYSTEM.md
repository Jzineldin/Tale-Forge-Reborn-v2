# Tale-Forge Monitoring & Analytics System

## Overview

This comprehensive monitoring and analytics system provides real-time insights into the Tale-Forge gamification platform performance, user engagement, and business metrics.

## =Ê Monitoring Components

### 1. **Sentry Integration**
- **Error Monitoring**: Automatic error detection and reporting
- **Performance Monitoring**: API response times and Core Web Vitals
- **Session Replay**: Visual debugging for critical errors
- **Custom Alerts**: Configurable thresholds for critical metrics

### 2. **Core Web Vitals Tracking**
- **LCP (Largest Contentful Paint)**: Page loading performance
- **FID (First Input Delay)**: Interactivity metrics
- **CLS (Cumulative Layout Shift)**: Visual stability
- **FCP (First Contentful Paint)**: Rendering performance
- **TTFB (Time to First Byte)**: Server response times

### 3. **Business Intelligence**
- **User Engagement**: DAU, MAU, retention rates
- **Revenue Metrics**: Credit purchases, subscription upgrades
- **Content Performance**: Template usage, story completion rates
- **System Health**: Database performance, API response times

### 4. **Gamification Analytics**
- **Achievement Progress**: Unlock rates and progression
- **Template Creation**: User-generated content metrics
- **Goal Completion**: Daily/weekly goal success rates
- **Credit System**: Transaction analysis and patterns

## =€ Setup Instructions

### 1. Install Dependencies
```bash
npm install @sentry/react web-vitals
```

### 2. Environment Configuration
Add to your `.env` file:
```env
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_ANALYTICS_API_URL=your_analytics_api_url
```

### 3. Database Setup
Run the monitoring migration:
```bash
supabase migration up 20250825170000_monitoring_analytics_system.sql
```

### 4. Sentry Project Setup
1. Create a new Sentry project
2. Copy the DSN to your environment variables
3. Configure alerts for critical errors and performance issues

## =È Analytics Dashboard

### Admin Access
- URL: `/admin/gamification-analytics`
- Requires admin role in `user_profiles` table
- Real-time refresh every 60 seconds
- Comprehensive tabbed interface

### Dashboard Sections

#### 1. **Overview Tab**
- Key performance indicators
- Time series charts for engagement
- System health overview
- Quick metric summaries

#### 2. **User Engagement Tab**
- Template creation rates
- Achievement progress tracking
- Goal completion analytics
- Retention metrics

#### 3. **Business Metrics Tab**
- Credit purchase analysis
- Subscription upgrade tracking
- Revenue trends and forecasts
- Conversion rate optimization

#### 4. **Content Performance Tab**
- Most popular templates
- Achievement unlock patterns
- Template completion rates
- User-generated content metrics

#### 5. **System Health Tab**
- API response times by service
- Error rate monitoring
- Database performance metrics
- Resource utilization

#### 6. **Alerts Tab**
- Active system alerts
- Performance warnings
- Critical issue notifications
- Threshold breach indicators

## =' API Endpoints & Functions

### Database Functions
- `get_gamification_user_engagement()`: User engagement metrics
- `get_credit_business_metrics()`: Credit system analytics
- `get_subscription_business_metrics()`: Subscription data
- `get_template_content_metrics()`: Template performance
- `get_achievement_content_metrics()`: Achievement analytics
- `get_gamification_system_health()`: System health metrics
- `get_gamification_time_series()`: Historical trend data

### Event Tracking
```typescript
// Track gamification events
await gamificationAnalytics.trackGamificationEvent('achievement_unlocked', {
  achievement_id: 'first_story',
  achievement_name: 'First Story Creator',
  credits_earned: 100
});

// Track business metrics
monitoring.trackBusinessMetric('credit_purchase', 9.99, {
  credit_count: 100,
  plan: 'basic'
});
```

## =Ê Database Schema

### Core Tables

#### `gamification_events`
- Tracks all gamification-related user actions
- Event types: achievement_unlocked, goal_completed, template_created
- JSONB event_data for flexible metadata

#### `performance_events`
- Web Vitals and performance metrics
- User-specific performance data
- Core Web Vitals tracking

#### `system_health_metrics`
- API response times by service
- Error rates and system performance
- Database query performance

#### `business_metrics`
- Revenue tracking (credits, subscriptions)
- User conversion metrics
- Financial KPIs

#### `user_session_analytics`
- Session duration and activity
- Device and browser tracking
- User journey analytics

## =¨ Alert Configuration

### Performance Thresholds
- **API Response Time**: > 2000ms (Critical)
- **Error Rate**: > 5% (Critical)
- **Goal Completion Rate**: < 50% (Warning)
- **Credit Conversion Rate**: < 5% (Critical)

### Alert Channels
- Sentry error notifications
- System health dashboard
- Real-time admin notifications
- Automated alert emails (configurable)

## = Usage Examples

### Initialize Monitoring
```typescript
// In main app initialization
useEffect(() => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    monitoring.initSentry();
  }
  monitoring.initWebVitals();
  monitoring.initPerformanceMonitoring();
}, []);
```

### Track User Interactions
```typescript
// Track button clicks with context
monitoring.trackUserInteraction('click', 'create_story_button', {
  page: 'dashboard',
  user_credits: 50
});
```

### Report Errors with Context
```typescript
// Enhanced error reporting
monitoring.reportError(new Error('Story creation failed'), {
  userId: user.id,
  storyId: 'story-123',
  creditsRemaining: 25,
  context: 'story_creation_wizard'
});
```

### Business Event Tracking
```typescript
// Track revenue events
await gamificationAnalytics.trackGamificationEvent('credit_purchase', {
  amount: 9.99,
  credits: 100,
  payment_method: 'stripe',
  user_tier: 'premium'
});
```

## =Ë Deployment Checklist

### Pre-Deployment
- [ ] Sentry project configured
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Alert thresholds configured

### Post-Deployment
- [ ] Analytics dashboard accessible
- [ ] Error tracking functional
- [ ] Performance monitoring active
- [ ] Business metrics collecting

### Monitoring Verification
- [ ] Create test events and verify tracking
- [ ] Trigger test errors and confirm Sentry alerts
- [ ] Validate dashboard data accuracy
- [ ] Test alert notification system

## =' Maintenance

### Regular Tasks
- **Weekly**: Review performance trends and alerts
- **Monthly**: Analyze user engagement and business metrics
- **Quarterly**: Review and adjust alert thresholds
- **As needed**: Investigate and resolve critical alerts

### Performance Optimization
- Monitor database query performance
- Optimize slow API endpoints
- Review and cleanup old analytics data
- Scale resources based on usage patterns

### Security Considerations
- Analytics data is protected by RLS policies
- Admin-only access to sensitive metrics
- User data anonymization where appropriate
- Regular security audits of tracking code

## =Ú Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [React Query Performance Best Practices](https://react-query.tanstack.com/guides/performance)

---

This monitoring system provides comprehensive observability for Tale-Forge, enabling data-driven decisions and proactive issue resolution.