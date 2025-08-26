# Sentry Integration Setup for Tale-Forge

## <¯ Overview
This document outlines the complete setup process for integrating Sentry error monitoring and performance tracking into the Tale-Forge application.

## =' Current Configuration Status

### MCP Server Configuration 
- **Sentry MCP Server**: Configured in `.mcp-config.json`
- **Access Token**: Active and configured
- **Integration Level**: Ready for project setup

### Prerequisites Completed 
- TypeScript errors reduced to 41 (non-blocking)
- Application builds successfully
- All critical systems operational
- Development environment stable

## =Ë Setup Steps

### Step 1: Install Sentry SDK
```bash
npm install @sentry/react @sentry/tracing
```

### Step 2: Create Sentry Project
1. Visit https://sentry.io
2. Create organization: "Tale-Forge"  
3. Create project: "Tale-Forge-Production" (React)
4. Note the DSN for configuration

### Step 3: Configure Sentry in Application

#### Add to `src/main.tsx`:
```typescript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: "YOUR_DSN_HERE",
  integrations: [
    new BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

#### Create Error Boundary Component:
```typescript
// src/components/common/ErrorBoundary.tsx
import * as Sentry from "@sentry/react";

const ErrorBoundary = Sentry.withErrorBoundary(
  ({ children }) => <>{children}</>,
  {
    fallback: ({ error, resetError }) => (
      <div className="error-boundary">
        <h2>Something went wrong</h2>
        <button onClick={resetError}>Try again</button>
      </div>
    ),
  }
);

export default ErrorBoundary;
```

### Step 4: Configure Performance Monitoring

#### Story Loading Performance:
```typescript
// src/utils/performance.ts
import * as Sentry from "@sentry/react";

export const trackStoryLoadPerformance = (storyId: string) => {
  const transaction = Sentry.startTransaction({
    name: "Story Load",
    op: "story.load",
    tags: { storyId }
  });
  
  return {
    finish: () => transaction.finish(),
    setData: (data: any) => transaction.setData("story", data)
  };
};
```

### Step 5: Set Up Custom Error Tracking

#### API Error Tracking:
```typescript
// src/utils/errorTracking.ts
import * as Sentry from "@sentry/react";

export const trackAPIError = (error: Error, context: {
  endpoint: string;
  method: string;
  userId?: string;
}) => {
  Sentry.captureException(error, {
    tags: {
      section: "api",
      endpoint: context.endpoint,
      method: context.method
    },
    user: context.userId ? { id: context.userId } : undefined,
    extra: context
  });
};
```

## =Ê Monitoring Configuration

### Performance Metrics to Track
1. **Core Web Vitals**:
   - Largest Contentful Paint (LCP)
   - First Input Delay (FID)  
   - Cumulative Layout Shift (CLS)

2. **Story-Specific Metrics**:
   - Story load time
   - Image generation time
   - Choice selection response time
   - TTS playback performance

3. **User Experience Metrics**:
   - Error rates by page
   - Session duration
   - Feature usage patterns
   - Payment flow success rates

### Error Alerting Rules

#### Critical Errors (Immediate Alert):
- Authentication failures
- Payment processing errors
- Database connection issues
- Build/deployment failures

#### Warning Errors (Daily Digest):
- TypeScript errors
- Performance degradation
- High error rates (>1%)
- Unusual user behavior patterns

## <› MCP Integration Commands

With Sentry MCP server configured, you can:

```bash
# Check Sentry project status
mcp sentry get-projects

# View recent errors
mcp sentry get-issues --status unresolved

# Get performance data  
mcp sentry get-performance-data --transaction "Story Load"

# Set up alerts
mcp sentry create-alert --rule "Error rate > 1%"
```

## =€ Implementation Priority

### Phase 1: Basic Error Tracking (Week 1)
- [ ] Install Sentry SDK
- [ ] Configure basic error tracking  
- [ ] Add Error Boundary components
- [ ] Test error reporting

### Phase 2: Performance Monitoring (Week 2)
- [ ] Configure performance tracking
- [ ] Add story-specific metrics
- [ ] Set up Core Web Vitals monitoring
- [ ] Create performance dashboard

### Phase 3: Advanced Analytics (Week 3)
- [ ] Custom error contexts
- [ ] User behavior tracking
- [ ] Business metrics integration
- [ ] Advanced alerting rules

### Phase 4: Production Optimization (Week 4)
- [ ] Performance optimization based on data
- [ ] Error rate reduction initiatives  
- [ ] User experience improvements
- [ ] Monitoring automation

## =È Success Metrics

### Error Monitoring Goals:
- **Error Rate**: < 0.1% 
- **Performance Score**: > 90
- **User Experience**: > 95% satisfaction
- **System Availability**: 99.9% uptime

### Tracking KPIs:
- Daily active users
- Story completion rates  
- Payment conversion rates
- Feature adoption rates
- Performance benchmarks

## = Integration with Existing Systems

### Supabase Integration:
- Database error tracking
- Edge function performance monitoring
- Real-time subscription health

### Vercel Integration:
- Deployment success tracking
- Build performance monitoring
- Edge function error rates

### Stripe Integration:
- Payment error tracking
- Subscription health monitoring
- Revenue impact analysis

## =Ý Configuration Files

### Environment Variables:
```env
# .env.local
VITE_SENTRY_DSN=your_dsn_here
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_RELEASE=tale-forge@1.0.0
```

### Sentry Configuration:
```typescript
// sentry.config.ts
export const sentryConfig = {
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
  release: import.meta.env.VITE_SENTRY_RELEASE,
  tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
  beforeSend: (event) => {
    // Filter out development errors
    if (import.meta.env.DEV && event.exception) {
      return null;
    }
    return event;
  }
};
```

---

## <‰ Next Steps

1. **Create Sentry Organization**: Set up Tale-Forge organization
2. **Install Dependencies**: Add Sentry React SDK
3. **Configure Monitoring**: Implement error boundaries and performance tracking
4. **Test Integration**: Verify error reporting and performance data
5. **Set Up Alerts**: Configure notification rules
6. **Monitor & Optimize**: Use data to improve application performance

This comprehensive monitoring setup will provide real-time insights into application health, user experience, and business metrics, enabling data-driven optimization and proactive issue resolution.

---

*Generated by Performance Optimization and Analytics Specialist*  
*Tale-Forge Team - August 25, 2025*