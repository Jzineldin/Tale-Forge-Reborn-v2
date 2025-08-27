-- Tale-Forge Safety Monitoring Infrastructure
-- Creates comprehensive safety monitoring tables with automated alerting

-- 1. Safety Violations Table
CREATE TABLE IF NOT EXISTS safety_violations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    violation_type text NOT NULL CHECK (violation_type IN (
        'profanity', 'inappropriate_content', 'inappropriate_name', 
        'invalid_input', 'rate_limit_exceeded', 'ai_content_violation'
    )),
    content_snippet text,
    severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high')) DEFAULT 'medium',
    context text,
    user_agent text,
    ip_address inet,
    created_at timestamptz DEFAULT now(),
    resolved_at timestamptz,
    resolution_notes text
);

-- 2. AI Performance Logs Table
CREATE TABLE IF NOT EXISTS ai_performance_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    operation_type text NOT NULL,
    success boolean NOT NULL,
    response_time_ms integer,
    model_used text,
    context text,
    error_message text,
    created_at timestamptz DEFAULT now()
);

-- 3. Content Safety Audits Table
CREATE TABLE IF NOT EXISTS content_safety_audits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    content_type text NOT NULL CHECK (content_type IN (
        'story_seed', 'character_name', 'character_traits', 'story_content'
    )),
    safety_score integer CHECK (safety_score >= 0 AND safety_score <= 100),
    flagged_content jsonb,
    context text,
    created_at timestamptz DEFAULT now()
);

-- 4. System Health Metrics Table
CREATE TABLE IF NOT EXISTS system_health_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type text NOT NULL,
    metric_value numeric,
    context text,
    created_at timestamptz DEFAULT now()
);

-- 5. Safety Alerts Table
CREATE TABLE IF NOT EXISTS safety_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type text NOT NULL CHECK (alert_type IN (
        'safety_violation', 'ai_performance', 'system_health'
    )),
    severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message text NOT NULL,
    alert_data jsonb,
    sent_at timestamptz DEFAULT now(),
    acknowledged_at timestamptz,
    acknowledged_by uuid
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_safety_violations_user_created ON safety_violations(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_safety_violations_type_severity ON safety_violations(violation_type, severity);
CREATE INDEX IF NOT EXISTS idx_safety_violations_created_at ON safety_violations(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_performance_user_created ON ai_performance_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_performance_operation_success ON ai_performance_logs(operation_type, success);
CREATE INDEX IF NOT EXISTS idx_ai_performance_created_at ON ai_performance_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_content_audits_user_created ON content_safety_audits(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_content_audits_type_score ON content_safety_audits(content_type, safety_score);

CREATE INDEX IF NOT EXISTS idx_system_health_type_created ON system_health_metrics(metric_type, created_at);

CREATE INDEX IF NOT EXISTS idx_safety_alerts_type_severity ON safety_alerts(alert_type, severity);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_sent_at ON safety_alerts(sent_at);

-- Automated alerting trigger function
CREATE OR REPLACE FUNCTION trigger_safety_alert()
RETURNS TRIGGER AS $$
BEGIN
    -- Trigger critical alert for high severity violations
    IF NEW.severity = 'high' THEN
        INSERT INTO safety_alerts (alert_type, severity, message, alert_data)
        VALUES (
            'safety_violation',
            'high',
            'High severity safety violation detected: ' || NEW.violation_type,
            jsonb_build_object(
                'violation_id', NEW.id,
                'violation_type', NEW.violation_type,
                'user_id', NEW.user_id,
                'context', NEW.context
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic alerting
DROP TRIGGER IF EXISTS safety_violation_alert_trigger ON safety_violations;
CREATE TRIGGER safety_violation_alert_trigger
    AFTER INSERT ON safety_violations
    FOR EACH ROW
    EXECUTE FUNCTION trigger_safety_alert();

-- Function to get safety dashboard data
CREATE OR REPLACE FUNCTION get_safety_dashboard(hours_back integer DEFAULT 24)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
    start_time timestamptz;
BEGIN
    start_time := now() - (hours_back || ' hours')::interval;
    
    SELECT jsonb_build_object(
        'timestamp', now(),
        'hours_back', hours_back,
        'safety_violations', (
            SELECT jsonb_build_object(
                'total', COALESCE(COUNT(*), 0),
                'by_severity', jsonb_object_agg(COALESCE(severity, 'unknown'), count),
                'by_type', jsonb_object_agg(COALESCE(violation_type, 'unknown'), count)
            )
            FROM (
                SELECT severity, violation_type, COUNT(*) as count
                FROM safety_violations 
                WHERE created_at >= start_time
                GROUP BY severity, violation_type
            ) sv
        ),
        'ai_performance', (
            SELECT jsonb_build_object(
                'total_requests', COALESCE(COUNT(*), 0),
                'success_rate', COALESCE((COUNT(*) FILTER (WHERE success) * 100.0 / NULLIF(COUNT(*), 0)), 100),
                'avg_response_time', COALESCE(AVG(response_time_ms), 0)
            )
            FROM ai_performance_logs
            WHERE created_at >= start_time
        ),
        'content_safety', (
            SELECT jsonb_build_object(
                'total_audits', COALESCE(COUNT(*), 0),
                'avg_safety_score', COALESCE(AVG(safety_score), 100),
                'flagged_count', COALESCE(COUNT(*) FILTER (WHERE flagged_content IS NOT NULL), 0)
            )
            FROM content_safety_audits
            WHERE created_at >= start_time
        ),
        'system_health', (
            SELECT jsonb_build_object(
                'error_count', COALESCE(SUM(metric_value), 0)
            )
            FROM system_health_metrics
            WHERE metric_type = 'function_error' AND created_at >= start_time
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert initial success metric
INSERT INTO system_health_metrics (metric_type, metric_value, context)
VALUES ('safety_infrastructure_deployed', 1, 'Safety monitoring infrastructure successfully deployed');