import React, { useState, useEffect } from 'react';
import { StandardPage, UnifiedCard, MetricCard, DESIGN_TOKENS } from '@/components/design-system';
import { gamificationAnalytics, GamificationMetrics, TimeSeriesData } from '@/services/gamificationAnalytics';
import { monitoring } from '@/utils/monitoring';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const AdminGamificationAnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<GamificationMetrics | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
    
    // Set up periodic refresh
    const interval = setInterval(loadAnalyticsData, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setError(null);
      
      const [metricsData, timeSeriesData, alertData] = await Promise.all([
        gamificationAnalytics.getGamificationMetrics(),
        gamificationAnalytics.getTimeSeriesData(30),
        gamificationAnalytics.checkAlertConditions()
      ]);
      
      setMetrics(metricsData);
      setTimeSeriesData(timeSeriesData);
      setAlerts(alertData || []);
      
      // Track dashboard view
      monitoring.trackUserInteraction('view', 'gamification_analytics_dashboard');
      
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      monitoring.reportError(err as Error, { context: 'gamification_analytics_load' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadAnalyticsData();
    monitoring.trackUserInteraction('click', 'refresh_analytics');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100) / 100}%`;
  };

  if (loading && !metrics) {
    return (
      <StandardPage title="=� Gamification Analytics" subtitle="Loading comprehensive monitoring data..." containerSize="large">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <p className="text-white/80">Loading gamification analytics...</p>
          </div>
        </div>
      </StandardPage>
    );
  }

  if (error && !metrics) {
    return (
      <StandardPage title="=� Gamification Analytics" subtitle="Error loading analytics data" containerSize="large">
        <UnifiedCard variant="refined" className="text-center bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-400/30">
          <div className="py-12">
            <div className="text-6xl mb-6">�</div>
            <h3 className="text-2xl font-bold text-white mb-4">Analytics Error</h3>
            <p className="text-red-400 mb-6">{error}</p>
            <button 
              onClick={handleRefresh}
              className={`${DESIGN_TOKENS.components.button.primary} px-6 py-3`}
            >
              Retry Loading Analytics
            </button>
          </div>
        </UnifiedCard>
      </StandardPage>
    );
  }

  const tabs = [
    { id: 'overview', label: '=� Overview', icon: '=�' },
    { id: 'engagement', label: '=e User Engagement', icon: '=e' },
    { id: 'revenue', label: '=� Business Metrics', icon: '=�' },
    { id: 'content', label: '=� Content Performance', icon: '=�' },
    { id: 'performance', label: '� System Health', icon: '�' },
    { id: 'alerts', label: '=� Alerts', icon: '=�' }
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  return (
    <StandardPage 
      title="=� Gamification Analytics" 
      subtitle="Comprehensive monitoring dashboard for Tale-Forge gamification system"
      containerSize="large"
    >
      {/* Alert Banner */}
      {alerts.length > 0 && (
        <UnifiedCard variant="enhanced" className="mb-6 bg-gradient-to-r from-red-500/20 to-amber-500/20 border-red-400/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">=�</span>
              <div>
                <h3 className="text-lg font-bold text-white">Active Alerts</h3>
                <p className="text-red-300">{alerts.length} issue{alerts.length > 1 ? 's' : ''} require attention</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`${DESIGN_TOKENS.components.button.secondary} px-4 py-2`}
            >
              View Details
            </button>
          </div>
        </UnifiedCard>
      )}

      {/* Key Metrics Overview */}
      <UnifiedCard variant="enhanced" className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Weekly Active Users"
            value={metrics?.userEngagement.weeklyActiveUsers.toLocaleString() || '0'}
            icon="=e"
            trend={{ value: "+12%", positive: true }}
            onClick={() => monitoring.trackUserInteraction('click', 'wau_metric')}
          />
          <MetricCard
            title="Goal Completion Rate"
            value={formatPercentage(metrics?.userEngagement.goalCompletionRate || 0)}
            icon="<�"
            trend={{ value: "+5.2%", positive: true }}
            onClick={() => monitoring.trackUserInteraction('click', 'goal_completion_metric')}
          />
          <MetricCard
            title="Credit Revenue"
            value={formatCurrency(metrics?.businessMetrics.creditPurchases.totalRevenue || 0)}
            icon="=�"
            trend={{ value: "+18%", positive: true }}
            onClick={() => monitoring.trackUserInteraction('click', 'credit_revenue_metric')}
          />
          <MetricCard
            title="Template Usage"
            value={metrics?.contentMetrics.templateUsage.userGeneratedTemplates.toLocaleString() || '0'}
            icon="=�"
            trend={{ value: "+25%", positive: true }}
            onClick={() => monitoring.trackUserInteraction('click', 'template_usage_metric')}
          />
        </div>
        
        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  monitoring.trackUserInteraction('click', `tab_${tab.id}`);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className={`${DESIGN_TOKENS.components.button.secondary} px-4 py-2 text-sm flex items-center gap-2`}
            title="Refresh analytics data"
          >
            {loading ? '�' : '='} Refresh
          </button>
        </div>
      </UnifiedCard>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Time Series Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <UnifiedCard variant="enhanced">
              <h3 className="text-xl font-bold text-white mb-6">=� User Engagement Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="templateCreations" stroke="#8884d8" name="Template Creations" />
                  <Line type="monotone" dataKey="achievementUnlocks" stroke="#82ca9d" name="Achievement Unlocks" />
                  <Line type="monotone" dataKey="goalCompletions" stroke="#ffc658" name="Goal Completions" />
                </LineChart>
              </ResponsiveContainer>
            </UnifiedCard>

            <UnifiedCard variant="enhanced">
              <h3 className="text-xl font-bold text-white mb-6">=� Revenue & Credits</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="creditSpent" fill="#ff7300" name="Credits Spent" />
                </BarChart>
              </ResponsiveContainer>
            </UnifiedCard>
          </div>

          {/* System Health Overview */}
          <UnifiedCard variant="enhanced">
            <h3 className="text-xl font-bold text-white mb-6">� System Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {metrics?.systemHealth.apiResponseTimes.templates || 0}ms
                </div>
                <div className="text-white/70">Avg API Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {formatPercentage(metrics?.systemHealth.databasePerformance.connectionHealth || 0)}
                </div>
                <div className="text-white/70">Database Health</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {formatPercentage(metrics?.systemHealth.errorRates.templateCreation || 0)}
                </div>
                <div className="text-white/70">Error Rate</div>
              </div>
            </div>
          </UnifiedCard>
        </div>
      )}

      {activeTab === 'engagement' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <UnifiedCard variant="enhanced">
              <h3 className="text-xl font-bold text-white mb-6">User Engagement Metrics</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Template Creation Rate</span>
                  <span className="text-green-400 font-bold">
                    {formatPercentage(metrics?.userEngagement.templateCreationRate || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Achievement Progress</span>
                  <span className="text-blue-400 font-bold">
                    {formatPercentage(metrics?.userEngagement.averageAchievementProgress || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Streak Retention Rate</span>
                  <span className="text-purple-400 font-bold">
                    {formatPercentage(metrics?.userEngagement.streakRetentionRate || 0)}
                  </span>
                </div>
              </div>
            </UnifiedCard>

            <UnifiedCard variant="enhanced">
              <h3 className="text-xl font-bold text-white mb-6">=� Achievement Progress</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics?.contentMetrics.achievementProgress.mostUnlockedAchievements.slice(0, 5) || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="unlockCount"
                  >
                    {metrics?.contentMetrics.achievementProgress.mostUnlockedAchievements.slice(0, 5).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </UnifiedCard>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <UnifiedCard variant="enhanced">
              <h3 className="text-xl font-bold text-white mb-6">=� Credit Purchase Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/70">Total Revenue</span>
                  <span className="text-green-400 font-bold">
                    {formatCurrency(metrics?.businessMetrics.creditPurchases.totalRevenue || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Average Transaction</span>
                  <span className="text-blue-400 font-bold">
                    {formatCurrency(metrics?.businessMetrics.creditPurchases.averageTransaction || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Conversion Rate</span>
                  <span className="text-purple-400 font-bold">
                    {formatPercentage(metrics?.businessMetrics.creditPurchases.conversionRate || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Repeat Purchase Rate</span>
                  <span className="text-amber-400 font-bold">
                    {formatPercentage(metrics?.businessMetrics.creditPurchases.repeatPurchaseRate || 0)}
                  </span>
                </div>
              </div>
            </UnifiedCard>

            <UnifiedCard variant="enhanced">
              <h3 className="text-xl font-bold text-white mb-6">=� Subscription Upgrades</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/70">Total Upgrades</span>
                  <span className="text-green-400 font-bold">
                    {metrics?.businessMetrics.subscriptionUpgrades.totalUpgrades.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Upgrade Conversion Rate</span>
                  <span className="text-blue-400 font-bold">
                    {formatPercentage(metrics?.businessMetrics.subscriptionUpgrades.upgradeConversionRate || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Churn Rate</span>
                  <span className="text-red-400 font-bold">
                    {formatPercentage(metrics?.businessMetrics.subscriptionUpgrades.churnRate || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Revenue Impact</span>
                  <span className="text-amber-400 font-bold">
                    {formatCurrency(metrics?.businessMetrics.subscriptionUpgrades.revenueImpact || 0)}
                  </span>
                </div>
              </div>
            </UnifiedCard>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <UnifiedCard variant="enhanced">
              <h3 className="text-xl font-bold text-white mb-6">=� Template Performance</h3>
              <div className="space-y-4">
                {metrics?.contentMetrics.templateUsage.mostPopularTemplates.slice(0, 5).map((template) => (
                  <div key={template.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white font-medium">{template.name}</span>
                    <span className="text-blue-400 font-bold">{template.usageCount} uses</span>
                  </div>
                ))}
              </div>
            </UnifiedCard>

            <UnifiedCard variant="enhanced">
              <h3 className="text-xl font-bold text-white mb-6">Achievement Unlocks</h3>
              <div className="space-y-4">
                {metrics?.contentMetrics.achievementProgress.mostUnlockedAchievements.slice(0, 5).map((achievement) => (
                  <div key={achievement.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white font-medium">{achievement.name}</span>
                    <span className="text-green-400 font-bold">{achievement.unlockCount} unlocks</span>
                  </div>
                ))}
              </div>
            </UnifiedCard>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <UnifiedCard variant="enhanced">
              <h3 className="text-xl font-bold text-white mb-6">� API Response Times</h3>
              <div className="space-y-4">
                {Object.entries(metrics?.systemHealth.apiResponseTimes || {}).map(([endpoint, time]) => (
                  <div key={endpoint} className="flex justify-between items-center">
                    <span className="text-white/70 capitalize">{endpoint}</span>
                    <span className={`font-bold ${time > 1000 ? 'text-red-400' : time > 500 ? 'text-amber-400' : 'text-green-400'}`}>
                      {time}ms
                    </span>
                  </div>
                ))}
              </div>
            </UnifiedCard>

            <UnifiedCard variant="enhanced">
              <h3 className="text-xl font-bold text-white mb-6">L Error Rates</h3>
              <div className="space-y-4">
                {Object.entries(metrics?.systemHealth.errorRates || {}).map(([system, rate]) => (
                  <div key={system} className="flex justify-between items-center">
                    <span className="text-white/70 capitalize">{system.replace(/([A-Z])/g, ' $1')}</span>
                    <span className={`font-bold ${rate > 5 ? 'text-red-400' : rate > 1 ? 'text-amber-400' : 'text-green-400'}`}>
                      {formatPercentage(rate)}
                    </span>
                  </div>
                ))}
              </div>
            </UnifiedCard>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {alerts.length === 0 ? (
            <UnifiedCard variant="enhanced" className="text-center py-12">
              <div className="text-6xl mb-6"></div>
              <h3 className="text-2xl font-bold text-white mb-4">All Systems Healthy</h3>
              <p className="text-white/70">No alerts or issues detected at this time.</p>
            </UnifiedCard>
          ) : (
            alerts.map((alert, index) => (
              <UnifiedCard 
                key={index} 
                variant="enhanced" 
                className={`border-l-4 ${
                  alert.type === 'critical' 
                    ? 'border-red-500 bg-red-500/10' 
                    : 'border-amber-500 bg-amber-500/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2 flex items-center">
                      {alert.type === 'critical' ? '=�' : '�'} {alert.message}
                    </h4>
                    <div className="text-sm text-white/70 space-y-1">
                      <p><strong>Metric:</strong> {alert.metric}</p>
                      <p><strong>Current Value:</strong> {alert.value}</p>
                      <p><strong>Threshold:</strong> {alert.threshold}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    alert.type === 'critical' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'
                  }`}>
                    {alert.type.toUpperCase()}
                  </span>
                </div>
              </UnifiedCard>
            ))
          )}
        </div>
      )}
    </StandardPage>
  );
};

export default AdminGamificationAnalyticsPage;