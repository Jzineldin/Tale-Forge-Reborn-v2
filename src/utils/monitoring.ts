import * as Sentry from '@sentry/react';
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

// Performance monitoring and error tracking utilities
export class MonitoringService {
  private static instance: MonitoringService;
  private performanceObserver: PerformanceObserver | null = null;
  private vitalsData: Record<string, number> = {};

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Initialize Sentry for error monitoring
   */
  initSentry() {
    try {
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
          }),
        ],
        // Performance Monitoring
        tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
        // Session Replay
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        
        beforeSend(event, hint) {
          // Filter out non-critical errors in production
          if (import.meta.env.MODE === 'production') {
            // Skip certain expected errors
            const ignoredErrors = [
              'Non-Error promise rejection captured',
              'ResizeObserver loop limit exceeded',
              'Script error.',
              'Network request failed'
            ];
            
            if (event.message && ignoredErrors.some(err => event.message?.includes(err))) {
              return null;
            }
          }
          return event;
        },
        
        // Set user context
        initialScope: {
          tags: {
            component: 'tale-forge',
            feature: 'gamification'
          },
        },
      });

      console.log('Sentry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Initialize Core Web Vitals monitoring
   */
  initWebVitals() {
    try {
      // Collect Core Web Vitals
      onCLS((metric) => {
        this.vitalsData.cls = metric.value;
        this.reportWebVital(metric);
      });

      onINP((metric) => {
        this.vitalsData.inp = metric.value;
        this.reportWebVital(metric);
      });

      onFCP((metric) => {
        this.vitalsData.fcp = metric.value;
        this.reportWebVital(metric);
      });

      onLCP((metric) => {
        this.vitalsData.lcp = metric.value;
        this.reportWebVital(metric);
      });

      onTTFB((metric) => {
        this.vitalsData.ttfb = metric.value;
        this.reportWebVital(metric);
      });

      console.log('Web Vitals monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize Web Vitals:', error);
    }
  }

  /**
   * Initialize performance monitoring
   */
  initPerformanceMonitoring() {
    try {
      if ('PerformanceObserver' in window) {
        // Monitor long tasks (>50ms)
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'longtask') {
              this.reportLongTask(entry as PerformanceLongTaskTiming);
            } else if (entry.entryType === 'navigation') {
              this.reportNavigationTiming(entry as PerformanceNavigationTiming);
            } else if (entry.entryType === 'resource') {
              this.reportResourceTiming(entry as PerformanceResourceTiming);
            }
          }
        });

        this.performanceObserver.observe({ 
          entryTypes: ['longtask', 'navigation', 'resource'] 
        });
      }

      // Monitor memory usage (if available)
      if ('memory' in performance) {
        setInterval(() => {
          this.reportMemoryUsage();
        }, 30000); // Every 30 seconds
      }

      console.log('Performance monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  /**
   * Report Web Vital metric
   */
  private reportWebVital(metric: any) {
    try {
      // Send to analytics service
      this.trackEvent('web_vital', 'performance', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id
      });

      // Set threshold alerts
      const thresholds = {
        CLS: 0.1,  // Good: < 0.1
        FID: 100,  // Good: < 100ms
        FCP: 1800, // Good: < 1.8s
        LCP: 2500, // Good: < 2.5s
        TTFB: 800  // Good: < 800ms
      };

      const threshold = thresholds[metric.name as keyof typeof thresholds];
      if (threshold && metric.value > threshold) {
        Sentry.addBreadcrumb({
          message: `Poor ${metric.name} performance`,
          level: 'warning',
          data: {
            metric: metric.name,
            value: metric.value,
            threshold,
            rating: metric.rating
          }
        });
      }
    } catch (error) {
      console.error('Error reporting web vital:', error);
    }
  }

  /**
   * Report long task performance
   */
  private reportLongTask(entry: PerformanceLongTaskTiming) {
    try {
      if (entry.duration > 100) { // Only report tasks >100ms
        this.trackEvent('long_task', 'performance', {
          duration: entry.duration,
          startTime: entry.startTime,
          name: entry.name
        });

        // Alert for very long tasks
        if (entry.duration > 250) {
          Sentry.addBreadcrumb({
            message: 'Long task detected',
            level: 'warning',
            data: {
              duration: entry.duration,
              startTime: entry.startTime
            }
          });
        }
      }
    } catch (error) {
      console.error('Error reporting long task:', error);
    }
  }

  /**
   * Report navigation timing
   */
  private reportNavigationTiming(entry: PerformanceNavigationTiming) {
    try {
      const metrics = {
        dns_lookup: entry.domainLookupEnd - entry.domainLookupStart,
        tcp_connect: entry.connectEnd - entry.connectStart,
        ssl_handshake: entry.connectEnd - entry.secureConnectionStart,
        time_to_first_byte: entry.responseStart - entry.requestStart,
        content_download: entry.responseEnd - entry.responseStart,
        dom_processing: entry.domContentLoadedEventStart - entry.responseEnd,
        total_load_time: entry.loadEventEnd - entry.navigationStart
      };

      this.trackEvent('navigation_timing', 'performance', metrics);
    } catch (error) {
      console.error('Error reporting navigation timing:', error);
    }
  }

  /**
   * Report resource timing
   */
  private reportResourceTiming(entry: PerformanceResourceTiming) {
    try {
      // Only report slow resources (>1s) or failed requests
      const duration = entry.responseEnd - entry.startTime;
      
      if (duration > 1000 || entry.responseEnd === 0) {
        this.trackEvent('slow_resource', 'performance', {
          name: entry.name,
          duration,
          type: this.getResourceType(entry.name),
          size: entry.transferSize,
          cached: entry.transferSize === 0 && entry.decodedBodySize > 0
        });
      }
    } catch (error) {
      console.error('Error reporting resource timing:', error);
    }
  }

  /**
   * Report memory usage
   */
  private reportMemoryUsage() {
    // MEMORY REPORTING DISABLED - Analytics is disabled
    return;
    
    try {
      const memory = (performance as any).memory;
      if (memory) {
        const memoryInfo = {
          used_heap: memory.usedJSHeapSize / 1024 / 1024, // MB
          total_heap: memory.totalJSHeapSize / 1024 / 1024, // MB
          heap_limit: memory.jsHeapSizeLimit / 1024 / 1024 // MB
        };

        this.trackEvent('memory_usage', 'performance', memoryInfo);

        // Alert if memory usage is high
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (usagePercent > 90) {
          Sentry.addBreadcrumb({
            message: 'High memory usage detected',
            level: 'warning',
            data: memoryInfo
          });
        }
      }
    } catch (error) {
      console.error('Error reporting memory usage:', error);
    }
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.match(/\.(js|mjs)(\?|$)/)) return 'script';
    if (url.match(/\.(css)(\?|$)/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)(\?|$)/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)(\?|$)/)) return 'font';
    if (url.includes('/api/') || url.includes('/functions/')) return 'api';
    return 'other';
  }

  /**
   * Track custom analytics event
   */
  private async trackEvent(eventType: string, category: string, data: Record<string, any>) {
    // ANALYTICS DISABLED - Remove this return statement to re-enable
    return;
    
    try {
      // Import analytics service dynamically to avoid circular dependencies
      const { analyticsService } = await import('@/services/analyticsService');
      await analyticsService.trackEvent(eventType, category, data);
    } catch (error) {
      // Silently ignore tracking errors
    }
  }

  /**
   * Track user interaction
   */
  trackUserInteraction(action: string, element: string, data: Record<string, any> = {}) {
    try {
      this.trackEvent('user_interaction', 'engagement', {
        action,
        element,
        timestamp: Date.now(),
        ...data
      });

      // Add to Sentry breadcrumbs
      Sentry.addBreadcrumb({
        message: `User ${action} on ${element}`,
        level: 'info',
        category: 'user',
        data
      });
    } catch (error) {
      console.error('Error tracking user interaction:', error);
    }
  }

  /**
   * Track gamification events
   */
  trackGamificationEvent(eventType: string, data: Record<string, any>) {
    try {
      this.trackEvent(eventType, 'gamification', {
        timestamp: Date.now(),
        ...data
      });

      // Tag user if achievement unlocked
      if (eventType === 'achievement_unlocked') {
        Sentry.setTag('latest_achievement', data.achievement_id);
      }
    } catch (error) {
      // Silently ignore gamification tracking errors
    }
  }

  /**
   * Track business metrics
   */
  trackBusinessMetric(metric: string, value: number, metadata: Record<string, any> = {}) {
    try {
      this.trackEvent('business_metric', 'revenue', {
        metric,
        value,
        timestamp: Date.now(),
        ...metadata
      });
    } catch (error) {
      console.error('Error tracking business metric:', error);
    }
  }

  /**
   * Report error to monitoring services
   */
  reportError(error: Error, context: Record<string, any> = {}) {
    try {
      console.error('Reported error:', error, context);
      
      Sentry.withScope((scope) => {
        // Add context to error report
        Object.keys(context).forEach(key => {
          scope.setExtra(key, context[key]);
        });
        
        // Set user context if available
        if (context.userId) {
          scope.setUser({ id: context.userId });
        }
        
        Sentry.captureException(error);
      });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  /**
   * Get current performance data
   */
  getPerformanceData() {
    return {
      webVitals: this.vitalsData,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : null
    };
  }

  /**
   * Cleanup monitoring
   */
  cleanup() {
    try {
      if (this.performanceObserver) {
        this.performanceObserver.disconnect();
        this.performanceObserver = null;
      }
    } catch (error) {
      console.error('Error during monitoring cleanup:', error);
    }
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();