-- Ultra-Safe Tale-Forge AI Monitoring Infrastructure
-- Migration: Add comprehensive safety and monitoring tables

-- 1. Safety violations tracking table
CREATE TABLE IF NOT EXISTS safety_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_type text NOT NULL CHECK (violation_type IN ('profanity', 'inappropriate_content', 'violence', 'adult_themes', 'harmful_content', 'system_error')),
  content_snippet text NOT NULL,
  user_id uuid,
  mode text NOT NULL CHECK (mode IN ('easy', 'template', 'advanced')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  action_taken text NOT NULL CHECK (action_taken IN ('blocked', 'fallback_used', 'logged_only', 'manual_review')),
  ai_provider text DEFAULT 'openai',
  prompt_context text,
  created_at timestamp DEFAULT now()
);

-- 2. AI performance monitoring table
CREATE TABLE IF NOT EXISTS ai_performance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode text NOT NULL CHECK (mode IN ('easy', 'template', 'advanced')),
  function_name text NOT NULL,
  response_time_ms integer NOT NULL,
  success boolean NOT NULL,
  error_type text,
  user_id uuid,
  cost_usd decimal(10,4),
  quality_score decimal(3,2) CHECK (quality_score >= 0 AND quality_score <= 10),
  safety_score decimal(3,2) CHECK (safety_score >= 0 AND safety_score <= 10),
  ai_provider text DEFAULT 'openai',
  created_at timestamp DEFAULT now()
);

-- 3. Content safety audit log
CREATE TABLE IF NOT EXISTS content_safety_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('story_seed', 'character_name', 'user_input')),
  original_content text NOT NULL,
  safety_checks jsonb NOT NULL, -- Store results of all safety checks
  passed_safety boolean NOT NULL,
  blocked_reasons text[],
  user_id uuid,
  created_at timestamp DEFAULT now()
);

-- 4. System health monitoring
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_unit text NOT NULL, -- 'ms', 'requests', 'errors', 'percentage'
  service_name text NOT NULL, -- 'easy_mode', 'generate_story_seeds', 'frontend'
  created_at timestamp DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_safety_violations_severity_time ON safety_violations(severity, created_at);
CREATE INDEX IF NOT EXISTS idx_safety_violations_mode_time ON safety_violations(mode, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_performance_mode_success ON ai_performance_logs(mode, success, created_at);
CREATE INDEX IF NOT EXISTS idx_content_safety_audits_passed ON content_safety_audits(passed_safety, created_at);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_service ON system_health_metrics(service_name, created_at);

-- Create safety alert trigger function
CREATE OR REPLACE FUNCTION notify_safety_violation() 
RETURNS trigger AS $$
BEGIN
  -- Immediate alert for critical safety violations
  IF NEW.severity = 'critical' THEN
    PERFORM pg_notify('critical_safety_violation', 
      json_build_object(
        'id', NEW.id,
        'violation_type', NEW.violation_type,
        'mode', NEW.mode,
        'user_id', NEW.user_id,
        'created_at', NEW.created_at
      )::text
    );
  END IF;
  
  -- Alert for high severity violations during business hours
  IF NEW.severity = 'high' AND EXTRACT(hour FROM NOW()) BETWEEN 8 AND 18 THEN
    PERFORM pg_notify('high_safety_violation',
      json_build_object(
        'id', NEW.id,
        'violation_type', NEW.violation_type,
        'mode', NEW.mode,
        'created_at', NEW.created_at
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for safety violations
DROP TRIGGER IF EXISTS safety_violation_alert ON safety_violations;
CREATE TRIGGER safety_violation_alert
  AFTER INSERT ON safety_violations
  FOR EACH ROW
  EXECUTE FUNCTION notify_safety_violation();

-- Create performance monitoring views
CREATE OR REPLACE VIEW ai_performance_summary AS
SELECT 
  mode,
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE success = true) as successful_requests,
  ROUND(COUNT(*) FILTER (WHERE success = true) * 100.0 / COUNT(*), 2) as success_rate_percent,
  ROUND(AVG(response_time_ms), 2) as avg_response_time_ms,
  ROUND(AVG(quality_score), 2) as avg_quality_score,
  ROUND(AVG(safety_score), 2) as avg_safety_score,
  ROUND(SUM(cost_usd), 4) as total_cost_usd
FROM ai_performance_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY mode, DATE_TRUNC('hour', created_at)
ORDER BY hour DESC, mode;

-- Create safety violations summary view
CREATE OR REPLACE VIEW safety_violations_summary AS
SELECT 
  mode,
  violation_type,
  severity,
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as violation_count,
  COUNT(DISTINCT user_id) as affected_users
FROM safety_violations
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY mode, violation_type, severity, DATE_TRUNC('day', created_at)
ORDER BY day DESC, violation_count DESC;

-- Row Level Security policies
ALTER TABLE safety_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_safety_audits ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own logs
CREATE POLICY "Users can insert their own safety logs" ON safety_violations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own performance logs" ON ai_performance_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audit logs" ON content_safety_audits
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow service role to read everything for monitoring
CREATE POLICY "Service role can read all safety data" ON safety_violations
  FOR SELECT TO service_role
  USING (true);

CREATE POLICY "Service role can read all performance data" ON ai_performance_logs
  FOR SELECT TO service_role
  USING (true);

CREATE POLICY "Service role can read all audit data" ON content_safety_audits
  FOR SELECT TO service_role
  USING (true);

-- Comment on tables for documentation
COMMENT ON TABLE safety_violations IS 'Tracks all content safety violations and actions taken';
COMMENT ON TABLE ai_performance_logs IS 'Monitors AI service performance, costs, and quality metrics';
COMMENT ON TABLE content_safety_audits IS 'Detailed audit trail of all content safety checks';
COMMENT ON TABLE system_health_metrics IS 'General system health and performance metrics';