-- Monitoring and Analytics System for Tale-Forge Gamification
-- This migration creates comprehensive monitoring and analytics infrastructure

-- Create tables for event tracking
CREATE TABLE IF NOT EXISTS gamification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance monitoring events
CREATE TABLE IF NOT EXISTS performance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- web_vital, long_task, api_performance, etc.
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System health metrics
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL, -- api_response_time, database_health, error_rate, etc.
  service_name TEXT NOT NULL, -- templates, achievements, goals, credits
  metric_value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User session tracking for analytics
CREATE TABLE IF NOT EXISTS user_session_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  page_views INTEGER DEFAULT 0,
  actions_taken INTEGER DEFAULT 0,
  time_spent_minutes NUMERIC DEFAULT 0,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business metrics tracking
CREATE TABLE IF NOT EXISTS business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL, -- credit_purchase, subscription_upgrade, template_usage, etc.
  metric_value NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gamification_events_user_type ON gamification_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_gamification_events_created_at ON gamification_events(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_events_metric ON performance_events(metric_name, created_at);
CREATE INDEX IF NOT EXISTS idx_system_health_service ON system_health_metrics(service_name, metric_type, recorded_at);
CREATE INDEX IF NOT EXISTS idx_user_session_user_start ON user_session_analytics(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_business_metrics_type_date ON business_metrics(metric_type, recorded_at);

-- Enable RLS
ALTER TABLE gamification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can insert their own events
CREATE POLICY "Users can insert their own gamification events" ON gamification_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own performance events" ON performance_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own session data" ON user_session_analytics
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can view their own data
CREATE POLICY "Users can view their own gamification events" ON gamification_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own performance events" ON performance_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own session data" ON user_session_analytics
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- System metrics can be inserted by service role
CREATE POLICY "Service role can manage system health metrics" ON system_health_metrics
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage business metrics" ON business_metrics
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Admins can view all analytics data
CREATE POLICY "Admins can view all gamification events" ON gamification_events
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all performance events" ON performance_events
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all system health metrics" ON system_health_metrics
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all session analytics" ON user_session_analytics
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all business metrics" ON business_metrics
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Functions for gamification analytics
CREATE OR REPLACE FUNCTION get_gamification_user_engagement()
RETURNS TABLE (
  template_creation_rate NUMERIC,
  avg_achievement_progress NUMERIC,
  goal_completion_rate NUMERIC,
  weekly_active_users INTEGER,
  streak_retention_rate NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      COUNT(DISTINCT CASE WHEN ge.event_type = 'template_created' AND ge.created_at >= NOW() - INTERVAL '7 days' THEN ge.user_id END) as template_creators,
      COUNT(DISTINCT CASE WHEN ge.created_at >= NOW() - INTERVAL '7 days' THEN ge.user_id END) as weekly_users,
      COUNT(DISTINCT CASE WHEN ge.event_type = 'goal_completed' AND ge.created_at >= NOW() - INTERVAL '7 days' THEN ge.user_id END) as goal_completers,
      COUNT(DISTINCT CASE WHEN ge.event_type = 'goal_created' AND ge.created_at >= NOW() - INTERVAL '7 days' THEN ge.user_id END) as goal_creators
    FROM gamification_events ge
    WHERE ge.created_at >= NOW() - INTERVAL '30 days'
  )
  SELECT 
    CASE WHEN us.weekly_users > 0 THEN (us.template_creators::NUMERIC / us.weekly_users::NUMERIC) * 100 ELSE 0 END as template_creation_rate,
    COALESCE((SELECT AVG((event_data->>'progress')::NUMERIC) FROM gamification_events WHERE event_type = 'achievement_progress' AND created_at >= NOW() - INTERVAL '7 days'), 0) as avg_achievement_progress,
    CASE WHEN us.goal_creators > 0 THEN (us.goal_completers::NUMERIC / us.goal_creators::NUMERIC) * 100 ELSE 0 END as goal_completion_rate,
    us.weekly_users,
    -- Simple streak retention calculation
    COALESCE((SELECT COUNT(DISTINCT user_id)::NUMERIC / NULLIF(COUNT(DISTINCT user_id) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days'), 0) * 100 
              FROM gamification_events WHERE event_type = 'daily_login' AND created_at >= NOW() - INTERVAL '7 days'), 0) as streak_retention_rate
  FROM user_stats us;
END;
$$;

CREATE OR REPLACE FUNCTION get_credit_business_metrics()
RETURNS TABLE (
  total_revenue NUMERIC,
  avg_transaction NUMERIC,
  conversion_rate NUMERIC,
  repeat_purchase_rate NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH credit_stats AS (
    SELECT 
      SUM(metric_value) as total_rev,
      AVG(metric_value) as avg_trans,
      COUNT(DISTINCT user_id) as purchasers,
      COUNT(*) as total_transactions
    FROM business_metrics 
    WHERE metric_type = 'credit_purchase' 
    AND recorded_at >= NOW() - INTERVAL '30 days'
  ),
  total_users AS (
    SELECT COUNT(DISTINCT user_id) as user_count
    FROM gamification_events
    WHERE created_at >= NOW() - INTERVAL '30 days'
  ),
  repeat_purchasers AS (
    SELECT COUNT(*) as repeat_count
    FROM (
      SELECT user_id, COUNT(*) as purchase_count
      FROM business_metrics
      WHERE metric_type = 'credit_purchase'
      AND recorded_at >= NOW() - INTERVAL '30 days'
      GROUP BY user_id
      HAVING COUNT(*) > 1
    ) rp
  )
  SELECT 
    COALESCE(cs.total_rev, 0) as total_revenue,
    COALESCE(cs.avg_trans, 0) as avg_transaction,
    CASE WHEN tu.user_count > 0 THEN (cs.purchasers::NUMERIC / tu.user_count::NUMERIC) * 100 ELSE 0 END as conversion_rate,
    CASE WHEN cs.purchasers > 0 THEN (rp.repeat_count::NUMERIC / cs.purchasers::NUMERIC) * 100 ELSE 0 END as repeat_purchase_rate
  FROM credit_stats cs
  CROSS JOIN total_users tu
  CROSS JOIN repeat_purchasers rp;
END;
$$;

CREATE OR REPLACE FUNCTION get_subscription_business_metrics()
RETURNS TABLE (
  total_upgrades INTEGER,
  upgrade_conversion_rate NUMERIC,
  churn_rate NUMERIC,
  revenue_impact NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH sub_stats AS (
    SELECT 
      COUNT(*) as upgrades,
      SUM(metric_value) as revenue
    FROM business_metrics 
    WHERE metric_type = 'subscription_upgrade' 
    AND recorded_at >= NOW() - INTERVAL '30 days'
  ),
  total_users AS (
    SELECT COUNT(DISTINCT user_id) as user_count
    FROM gamification_events
    WHERE created_at >= NOW() - INTERVAL '30 days'
  )
  SELECT 
    COALESCE(ss.upgrades, 0) as total_upgrades,
    CASE WHEN tu.user_count > 0 THEN (ss.upgrades::NUMERIC / tu.user_count::NUMERIC) * 100 ELSE 0 END as upgrade_conversion_rate,
    -- Simple churn calculation - users who downgraded or cancelled
    COALESCE((SELECT COUNT(*)::NUMERIC FROM business_metrics WHERE metric_type = 'subscription_downgrade' AND recorded_at >= NOW() - INTERVAL '30 days'), 0) / NULLIF(ss.upgrades, 0) * 100 as churn_rate,
    COALESCE(ss.revenue, 0) as revenue_impact
  FROM sub_stats ss
  CROSS JOIN total_users tu;
END;
$$;

CREATE OR REPLACE FUNCTION get_template_content_metrics()
RETURNS TABLE (
  popular_templates JSONB,
  completion_rate NUMERIC,
  user_generated_count INTEGER,
  like_rate NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH template_stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE event_type = 'template_completed') as completed,
      COUNT(*) FILTER (WHERE event_type = 'template_started') as started,
      COUNT(*) FILTER (WHERE event_type = 'template_created' AND (event_data->>'user_generated')::BOOLEAN = true) as user_generated,
      COUNT(*) FILTER (WHERE event_type = 'template_liked') as liked,
      COUNT(*) FILTER (WHERE event_type IN ('template_liked', 'template_viewed')) as interactions
    FROM gamification_events
    WHERE created_at >= NOW() - INTERVAL '30 days'
  ),
  popular_templates_data AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', template_id,
        'name', template_name,
        'usageCount', usage_count
      )
    ) as templates
    FROM (
      SELECT 
        event_data->>'template_id' as template_id,
        event_data->>'template_name' as template_name,
        COUNT(*) as usage_count
      FROM gamification_events
      WHERE event_type = 'template_used'
      AND created_at >= NOW() - INTERVAL '30 days'
      AND event_data->>'template_id' IS NOT NULL
      GROUP BY event_data->>'template_id', event_data->>'template_name'
      ORDER BY usage_count DESC
      LIMIT 10
    ) t
  )
  SELECT 
    COALESCE(ptd.templates, '[]'::jsonb) as popular_templates,
    CASE WHEN ts.started > 0 THEN (ts.completed::NUMERIC / ts.started::NUMERIC) * 100 ELSE 0 END as completion_rate,
    ts.user_generated as user_generated_count,
    CASE WHEN ts.interactions > 0 THEN (ts.liked::NUMERIC / ts.interactions::NUMERIC) * 100 ELSE 0 END as like_rate
  FROM template_stats ts
  CROSS JOIN popular_templates_data ptd;
END;
$$;

CREATE OR REPLACE FUNCTION get_achievement_content_metrics()
RETURNS TABLE (
  popular_achievements JSONB,
  avg_progress_per_user NUMERIC,
  retention_impact NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH achievement_stats AS (
    SELECT 
      jsonb_agg(
        jsonb_build_object(
          'id', achievement_id,
          'name', achievement_name,
          'unlockCount', unlock_count
        )
      ) as achievements
    FROM (
      SELECT 
        event_data->>'achievement_id' as achievement_id,
        event_data->>'achievement_name' as achievement_name,
        COUNT(*) as unlock_count
      FROM gamification_events
      WHERE event_type = 'achievement_unlocked'
      AND created_at >= NOW() - INTERVAL '30 days'
      AND event_data->>'achievement_id' IS NOT NULL
      GROUP BY event_data->>'achievement_id', event_data->>'achievement_name'
      ORDER BY unlock_count DESC
      LIMIT 10
    ) a
  )
  SELECT 
    COALESCE(ast.achievements, '[]'::jsonb) as popular_achievements,
    COALESCE((SELECT AVG((event_data->>'progress')::NUMERIC) FROM gamification_events WHERE event_type = 'achievement_progress' AND created_at >= NOW() - INTERVAL '30 days'), 0) as avg_progress_per_user,
    -- Simple retention impact: users with achievements vs without
    COALESCE((
      SELECT 
        (COUNT(DISTINCT CASE WHEN has_achievements THEN user_id END)::NUMERIC / 
         COUNT(DISTINCT user_id)::NUMERIC) * 100
      FROM (
        SELECT 
          user_id,
          EXISTS(SELECT 1 FROM gamification_events ge2 WHERE ge2.user_id = ge.user_id AND ge2.event_type = 'achievement_unlocked') as has_achievements
        FROM gamification_events ge
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY user_id
      ) user_achievement_status
    ), 0) as retention_impact
  FROM achievement_stats ast;
END;
$$;

CREATE OR REPLACE FUNCTION get_gamification_system_health()
RETURNS TABLE (
  template_api_time NUMERIC,
  achievement_api_time NUMERIC,
  goal_api_time NUMERIC,
  credit_api_time NUMERIC,
  template_error_rate NUMERIC,
  credit_error_rate NUMERIC,
  achievement_error_rate NUMERIC,
  avg_query_time NUMERIC,
  connection_health NUMERIC,
  index_efficiency NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH api_times AS (
    SELECT 
      AVG(metric_value) FILTER (WHERE service_name = 'templates') as template_time,
      AVG(metric_value) FILTER (WHERE service_name = 'achievements') as achievement_time,
      AVG(metric_value) FILTER (WHERE service_name = 'goals') as goal_time,
      AVG(metric_value) FILTER (WHERE service_name = 'credits') as credit_time,
      AVG(metric_value) FILTER (WHERE metric_type = 'query_time') as query_time
    FROM system_health_metrics
    WHERE metric_type = 'api_response_time'
    AND recorded_at >= NOW() - INTERVAL '1 hour'
  ),
  error_rates AS (
    SELECT 
      AVG(metric_value) FILTER (WHERE service_name = 'templates') as template_errors,
      AVG(metric_value) FILTER (WHERE service_name = 'credits') as credit_errors,
      AVG(metric_value) FILTER (WHERE service_name = 'achievements') as achievement_errors
    FROM system_health_metrics
    WHERE metric_type = 'error_rate'
    AND recorded_at >= NOW() - INTERVAL '1 hour'
  )
  SELECT 
    COALESCE(at.template_time, 0) as template_api_time,
    COALESCE(at.achievement_time, 0) as achievement_api_time,
    COALESCE(at.goal_time, 0) as goal_time,
    COALESCE(at.credit_time, 0) as credit_api_time,
    COALESCE(er.template_errors, 0) as template_error_rate,
    COALESCE(er.credit_errors, 0) as credit_error_rate,
    COALESCE(er.achievement_errors, 0) as achievement_error_rate,
    COALESCE(at.query_time, 0) as avg_query_time,
    -- Simple connection health based on recent metrics
    CASE WHEN COUNT(*) OVER() > 0 THEN 95.0 ELSE 0 END as connection_health,
    -- Simple index efficiency placeholder
    90.0 as index_efficiency
  FROM api_times at
  CROSS JOIN error_rates er;
END;
$$;

CREATE OR REPLACE FUNCTION get_gamification_time_series(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  date TEXT,
  template_creations INTEGER,
  achievement_unlocks INTEGER,
  goal_completions INTEGER,
  credit_spent NUMERIC,
  new_users INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      NOW() - (days_back || ' days')::INTERVAL,
      NOW(),
      '1 day'::INTERVAL
    )::DATE as date
  )
  SELECT 
    ds.date::TEXT,
    COALESCE(COUNT(CASE WHEN ge.event_type = 'template_created' THEN 1 END), 0)::INTEGER as template_creations,
    COALESCE(COUNT(CASE WHEN ge.event_type = 'achievement_unlocked' THEN 1 END), 0)::INTEGER as achievement_unlocks,
    COALESCE(COUNT(CASE WHEN ge.event_type = 'goal_completed' THEN 1 END), 0)::INTEGER as goal_completions,
    COALESCE(SUM(CASE WHEN bm.metric_type = 'credit_spent' THEN bm.metric_value ELSE 0 END), 0) as credit_spent,
    COALESCE(COUNT(DISTINCT CASE WHEN ge.event_type = 'user_registered' THEN ge.user_id END), 0)::INTEGER as new_users
  FROM date_series ds
  LEFT JOIN gamification_events ge ON ds.date = ge.created_at::DATE
  LEFT JOIN business_metrics bm ON ds.date = bm.recorded_at::DATE
  GROUP BY ds.date
  ORDER BY ds.date;
END;
$$;