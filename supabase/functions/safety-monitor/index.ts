import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Severity thresholds for alerting
const ALERT_THRESHOLDS = {
  HIGH_VIOLATION_COUNT: 10, // 10+ violations in 1 hour
  CRITICAL_VIOLATION_COUNT: 5, // 5+ high-severity violations in 1 hour  
  AI_FAILURE_RATE: 0.25, // 25% AI failure rate in 1 hour
  SYSTEM_ERROR_COUNT: 20, // 20+ system errors in 1 hour
};

// Alert channels configuration
const ALERT_CHANNELS = {
  SLACK_WEBHOOK: Deno.env.get('SLACK_WEBHOOK_URL'),
  EMAIL_SERVICE: Deno.env.get('EMAIL_SERVICE_URL'),
  SMS_SERVICE: Deno.env.get('SMS_SERVICE_URL')
};

interface AlertData {
  type: 'safety_violation' | 'ai_performance' | 'system_health';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data: any;
  timestamp: string;
}

// Send alert to configured channels
async function sendAlert(alert: AlertData) {
  const promises: Promise<any>[] = [];
  
  // Slack notification
  if (ALERT_CHANNELS.SLACK_WEBHOOK) {
    promises.push(
      fetch(ALERT_CHANNELS.SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Tale-Forge Safety Alert: ${alert.message}`,
          attachments: [{
            color: alert.severity === 'critical' ? 'danger' : 
                   alert.severity === 'high' ? 'warning' : 'good',
            fields: [
              { title: 'Type', value: alert.type, short: true },
              { title: 'Severity', value: alert.severity, short: true },
              { title: 'Timestamp', value: alert.timestamp, short: false },
              { title: 'Data', value: JSON.stringify(alert.data, null, 2), short: false }
            ]
          }]
        })
      }).catch(error => console.error('Slack alert failed:', error))
    );
  }
  
  // Email notification for high/critical alerts
  if (ALERT_CHANNELS.EMAIL_SERVICE && ['high', 'critical'].includes(alert.severity)) {
    promises.push(
      fetch(ALERT_CHANNELS.EMAIL_SERVICE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: Deno.env.get('ALERT_EMAIL'),
          subject: `🚨 Tale-Forge ${alert.severity.toUpperCase()} Alert: ${alert.type}`,
          body: `
            Alert Details:
            - Type: ${alert.type}
            - Severity: ${alert.severity}
            - Message: ${alert.message}
            - Timestamp: ${alert.timestamp}
            - Data: ${JSON.stringify(alert.data, null, 2)}
          `
        })
      }).catch(error => console.error('Email alert failed:', error))
    );
  }
  
  // SMS for critical alerts only
  if (ALERT_CHANNELS.SMS_SERVICE && alert.severity === 'critical') {
    promises.push(
      fetch(ALERT_CHANNELS.SMS_SERVICE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: Deno.env.get('ALERT_PHONE'),
          message: `CRITICAL Tale-Forge Alert: ${alert.message} at ${alert.timestamp}`
        })
      }).catch(error => console.error('SMS alert failed:', error))
    );
  }
  
  await Promise.all(promises);
}

// Check for safety violations requiring alerts
async function checkSafetyViolations(supabase: any): Promise<AlertData[]> {
  const alerts: AlertData[] = [];
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  try {
    // Count violations in last hour
    const { data: violations, error } = await supabase
      .from('safety_violations')
      .select('violation_type, severity, created_at')
      .gte('created_at', oneHourAgo);
    
    if (error) throw error;
    
    const violationCount = violations?.length || 0;
    const highSeverityCount = violations?.filter(v => v.severity === 'high').length || 0;
    
    // Check violation count thresholds
    if (violationCount >= ALERT_THRESHOLDS.HIGH_VIOLATION_COUNT) {
      alerts.push({
        type: 'safety_violation',
        severity: violationCount >= 20 ? 'critical' : 'high',
        message: `High violation count detected: ${violationCount} violations in the last hour`,
        data: { 
          total_violations: violationCount,
          high_severity_count: highSeverityCount,
          violation_types: violations?.reduce((acc, v) => {
            acc[v.violation_type] = (acc[v.violation_type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Check high-severity violation threshold
    if (highSeverityCount >= ALERT_THRESHOLDS.CRITICAL_VIOLATION_COUNT) {
      alerts.push({
        type: 'safety_violation',
        severity: 'critical',
        message: `Critical safety violations detected: ${highSeverityCount} high-severity violations in the last hour`,
        data: { 
          high_severity_count: highSeverityCount,
          total_violations: violationCount
        },
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Failed to check safety violations:', error);
    alerts.push({
      type: 'system_health',
      severity: 'high',
      message: 'Failed to check safety violations - monitoring system may be compromised',
      data: { error: error.message },
      timestamp: new Date().toISOString()
    });
  }
  
  return alerts;
}

// Check AI performance metrics
async function checkAIPerformance(supabase: any): Promise<AlertData[]> {
  const alerts: AlertData[] = [];
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  try {
    // Get AI performance logs from last hour
    const { data: logs, error } = await supabase
      .from('ai_performance_logs')
      .select('success, operation_type, response_time_ms')
      .gte('created_at', oneHourAgo);
    
    if (error) throw error;
    
    if (logs && logs.length > 0) {
      const totalRequests = logs.length;
      const failedRequests = logs.filter(log => !log.success).length;
      const failureRate = failedRequests / totalRequests;
      
      // Check AI failure rate
      if (failureRate >= ALERT_THRESHOLDS.AI_FAILURE_RATE) {
        alerts.push({
          type: 'ai_performance',
          severity: failureRate >= 0.5 ? 'critical' : 'high',
          message: `High AI failure rate detected: ${(failureRate * 100).toFixed(1)}% failure rate`,
          data: {
            total_requests: totalRequests,
            failed_requests: failedRequests,
            failure_rate: failureRate,
            avg_response_time: logs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / logs.length
          },
          timestamp: new Date().toISOString()
        });
      }
      
      // Check for very slow response times
      const slowRequests = logs.filter(log => (log.response_time_ms || 0) > 30000); // 30 seconds
      if (slowRequests.length >= 5) {
        alerts.push({
          type: 'ai_performance',
          severity: 'medium',
          message: `Slow AI response times detected: ${slowRequests.length} requests took over 30 seconds`,
          data: {
            slow_requests: slowRequests.length,
            total_requests: totalRequests
          },
          timestamp: new Date().toISOString()
        });
      }
    }
    
  } catch (error) {
    console.error('Failed to check AI performance:', error);
    alerts.push({
      type: 'system_health',
      severity: 'high',
      message: 'Failed to check AI performance metrics',
      data: { error: error.message },
      timestamp: new Date().toISOString()
    });
  }
  
  return alerts;
}

// Check system health metrics
async function checkSystemHealth(supabase: any): Promise<AlertData[]> {
  const alerts: AlertData[] = [];
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  try {
    // Count system errors
    const { data: errors, error } = await supabase
      .from('system_health_metrics')
      .select('metric_type, metric_value, context')
      .eq('metric_type', 'function_error')
      .gte('created_at', oneHourAgo);
    
    if (error) throw error;
    
    const errorCount = errors?.reduce((sum, metric) => sum + (metric.metric_value || 0), 0) || 0;
    
    if (errorCount >= ALERT_THRESHOLDS.SYSTEM_ERROR_COUNT) {
      alerts.push({
        type: 'system_health',
        severity: errorCount >= 50 ? 'critical' : 'high',
        message: `High system error count: ${errorCount} errors in the last hour`,
        data: {
          error_count: errorCount,
          error_contexts: errors?.map(e => e.context).slice(0, 10) // First 10 error contexts
        },
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Failed to check system health:', error);
    alerts.push({
      type: 'system_health',
      severity: 'critical',
      message: 'Failed to check system health - monitoring system failure',
      data: { error: error.message },
      timestamp: new Date().toISOString()
    });
  }
  
  return alerts;
}

// Log alert to database
async function logAlert(supabase: any, alert: AlertData) {
  try {
    await supabase
      .from('safety_alerts')
      .insert({
        alert_type: alert.type,
        severity: alert.severity,
        message: alert.message,
        alert_data: alert.data,
        created_at: alert.timestamp
      });
  } catch (error) {
    console.error('Failed to log alert:', error);
  }
}

// Generate safety dashboard data
async function generateDashboardData(supabase: any) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  try {
    const [
      violationsResult,
      aiPerformanceResult,
      systemHealthResult,
      auditsResult
    ] = await Promise.all([
      supabase
        .from('safety_violations')
        .select('violation_type, severity, created_at')
        .gte('created_at', oneDayAgo),
      
      supabase
        .from('ai_performance_logs')
        .select('success, operation_type, response_time_ms, created_at')
        .gte('created_at', oneDayAgo),
        
      supabase
        .from('system_health_metrics')
        .select('metric_type, metric_value, created_at')
        .gte('created_at', oneDayAgo),
        
      supabase
        .from('content_safety_audits')
        .select('safety_score, flagged_content, created_at')
        .gte('created_at', oneDayAgo)
    ]);
    
    const violations = violationsResult.data || [];
    const aiLogs = aiPerformanceResult.data || [];
    const systemMetrics = systemHealthResult.data || [];
    const audits = auditsResult.data || [];
    
    // Calculate metrics
    const recentViolations = violations.filter(v => v.created_at >= oneHourAgo);
    const recentAiLogs = aiLogs.filter(log => log.created_at >= oneHourAgo);
    
    const dashboardData = {
      timestamp: new Date().toISOString(),
      safety_summary: {
        total_violations_24h: violations.length,
        violations_last_hour: recentViolations.length,
        high_severity_violations_24h: violations.filter(v => v.severity === 'high').length,
        violation_types: violations.reduce((acc, v) => {
          acc[v.violation_type] = (acc[v.violation_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      ai_performance: {
        total_requests_24h: aiLogs.length,
        requests_last_hour: recentAiLogs.length,
        success_rate_24h: aiLogs.length > 0 ? (aiLogs.filter(log => log.success).length / aiLogs.length * 100).toFixed(2) : '100',
        success_rate_last_hour: recentAiLogs.length > 0 ? (recentAiLogs.filter(log => log.success).length / recentAiLogs.length * 100).toFixed(2) : '100',
        avg_response_time_24h: aiLogs.length > 0 ? Math.round(aiLogs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / aiLogs.length) : 0
      },
      content_safety: {
        audits_24h: audits.length,
        avg_safety_score: audits.length > 0 ? Math.round(audits.reduce((sum, audit) => sum + (audit.safety_score || 0), 0) / audits.length) : 100,
        flagged_content_count: audits.filter(audit => audit.flagged_content).length
      },
      system_health: {
        error_count_24h: systemMetrics.filter(m => m.metric_type === 'function_error').reduce((sum, m) => sum + (m.metric_value || 0), 0),
        status: recentViolations.length < 5 && recentAiLogs.filter(log => !log.success).length / Math.max(recentAiLogs.length, 1) < 0.1 ? 'healthy' : 'warning'
      }
    };
    
    return dashboardData;
    
  } catch (error) {
    console.error('Failed to generate dashboard data:', error);
    return {
      timestamp: new Date().toISOString(),
      error: 'Failed to generate dashboard data',
      status: 'error'
    };
  }
}

// Main Deno serve function
Deno.serve(async (req: Request) => {
  try {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };
    
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'monitor';
    
    switch (action) {
      case 'monitor':
        // Run monitoring checks
        const [safetyAlerts, aiAlerts, systemAlerts] = await Promise.all([
          checkSafetyViolations(supabase),
          checkAIPerformance(supabase),
          checkSystemHealth(supabase)
        ]);
        
        const allAlerts = [...safetyAlerts, ...aiAlerts, ...systemAlerts];
        
        // Send alerts and log them
        for (const alert of allAlerts) {
          await Promise.all([
            sendAlert(alert),
            logAlert(supabase, alert)
          ]);
        }
        
        return new Response(
          JSON.stringify({
            status: 'monitoring_complete',
            alerts_generated: allAlerts.length,
            alerts: allAlerts,
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      case 'dashboard':
        // Generate dashboard data
        const dashboardData = await generateDashboardData(supabase);
        
        return new Response(
          JSON.stringify(dashboardData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      case 'health':
        // Simple health check
        return new Response(
          JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            monitoring_active: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action parameter' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }
    
  } catch (error) {
    console.error('Safety monitor error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Safety monitoring system failure',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      }
    );
  }
});