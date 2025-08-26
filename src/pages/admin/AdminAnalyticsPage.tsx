import React, { useState } from 'react';
import { StandardPage, UnifiedCard, MetricCard, DESIGN_TOKENS } from '@/components/design-system';
import { useAnalytics } from '@/hooks/useAnalytics';

// Analytics data type definition
interface AnalyticsData {
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    avgSessionDuration: string;
    avgStoriesPerUser: number;
    userRetention30d: number;
    storyCompletionRate: number;
  };
  subscriptionMetrics: {
    totalRevenue: number;
    averageRevenuePerUser: number;
    churnRate: number;
    free: { users: number; percentage: number; revenue: number };
    premium: { users: number; percentage: number; revenue: number };
    pro: { users: number; percentage: number; revenue: number };
  };
  contentAnalytics: {
    totalStories: number;
    publishedStories: number;
    draftStories: number;
    reportedStories: number;
    popularGenres: Array<{ genre: string; count: number; percentage: number }>;
    ageGroupDistribution: Array<{ ageGroup: string; count: number; percentage: number }>;
  };
  systemMetrics: {
    apiResponseTime: number;
    serverUptime: number;
    errorRate: number;
    databasePerformance: number;
    storageUsage: number;
  };
  userGrowth: Array<{ date: string; newUsers: number; totalUsers: number; retainedUsers: number }>;
  storyMetrics: Array<{ date: string; storiesCreated: number; storiesCompleted: number; storiesShared: number }>;
}

const AdminAnalyticsPage: React.FC = () => {
  const { analyticsData, loading, error, refreshAnalytics } = useAnalytics() as {
    analyticsData: AnalyticsData | null;
    loading: boolean;
    error: string | null;
    refreshAnalytics: () => void;
  };
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const renderChart = (data: any[], height = 'h-48') => {
    if (!data || data.length === 0) return <div className="text-white/60 text-center">No data available</div>;

    const maxValue = Math.max(...data.flatMap(item => Object.values(item).filter(v => typeof v === 'number')));
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500'];

    return (
      <div className={`flex items-end justify-between ${height} mb-4`}>
        {data.map((item, index) => {
          const values = Object.entries(item).filter(([key, value]) => key !== 'date' && typeof value === 'number');
          return (
            <div key={index} className="flex flex-col items-center flex-1 mx-1">
              {values.map(([key, value], i) => {
                const barHeight = ((value as number) / maxValue) * 100;
                return (
                  <div
                    key={key}
                    className={`w-full ${colors[i % colors.length]} rounded transition-all duration-500 hover:opacity-80`}
                    style={{ height: `${barHeight}%` }}
                    title={`${key}: ${value}`}
                  />
                );
              })}
              <span className="text-white/60 text-xs mt-2">
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white/80">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <StandardPage 
        title="📈 Analytics Dashboard" 
        subtitle="Analytics data temporarily unavailable"
        containerSize="large"
      >
        <UnifiedCard variant="refined" className="text-center bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-400/30">
          <div className="py-12">
            <div className="text-6xl mb-6">⚠️</div>
            <h3 className="text-2xl font-bold text-white mb-4">Analytics Error</h3>
            <p className="text-red-400 mb-6">{error}</p>
            <button 
              onClick={refreshAnalytics}
              className={`${DESIGN_TOKENS.components.button.primary} px-6 py-3`}
            >
              Retry Loading Analytics
            </button>
          </div>
        </UnifiedCard>
      </StandardPage>
    );
  }

  if (!analyticsData) {
    return (
      <StandardPage 
        title="📈 Analytics Dashboard" 
        subtitle="No analytics data available"
        containerSize="large"
      >
        <UnifiedCard variant="glass" className="text-center py-12">
          <div className="text-6xl mb-6">📊</div>
          <h3 className="text-2xl font-bold text-white mb-4">No Data Available</h3>
          <p className="text-white/70 mb-6">Analytics data will appear here once users start using the platform.</p>
          <button 
            onClick={refreshAnalytics}
            className={`${DESIGN_TOKENS.components.button.secondary} px-6 py-3`}
          >
            Refresh Analytics
          </button>
        </UnifiedCard>
      </StandardPage>
    );
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'users', label: '👥 Users', icon: '👥' },
    { id: 'content', label: '📚 Content', icon: '📚' },
    { id: 'revenue', label: '💰 Revenue', icon: '💰' },
    { id: 'system', label: '⚙️ System', icon: '⚙️' }
  ];

  return (
    <StandardPage 
      title="📈 Analytics Dashboard" 
      subtitle="Deep insights into platform performance and user behavior"
      containerSize="large"
    >
      {/* Tab Navigation */}
      <div className="mb-8">
        <UnifiedCard variant="enhanced">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
              <MetricCard
                title="Monthly Active Users"
                value={analyticsData.userEngagement.monthlyActiveUsers.toLocaleString()}
                icon="👥"
                trend={{ value: "+12%", positive: true }}
              />
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(analyticsData.subscriptionMetrics.totalRevenue)}
                icon="💰"
                trend={{ value: "+8.3%", positive: true }}
              />
              <MetricCard
                title="Stories Created"
                value={analyticsData.contentAnalytics.totalStories.toLocaleString()}
                icon="📚"
                trend={{ value: "+15%", positive: true }}
              />
              <MetricCard
                title="System Uptime"
                value={`${analyticsData.systemMetrics.serverUptime}%`}
                icon="⚡"
                trend={{ value: "99.8%", positive: true }}
              />
            </div>
          </div>
          
          {/* Tab buttons and refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
              onClick={refreshAnalytics}
              className={`${DESIGN_TOKENS.components.button.secondary} px-4 py-2 text-sm flex items-center gap-2`}
              title="Refresh analytics data"
            >
              🔄 Refresh
            </button>
          </div>
        </UnifiedCard>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <UnifiedCard variant="enhanced">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                👥 User Growth Trends
              </h3>
              {renderChart(analyticsData.userGrowth || [])}
              <div className="text-center text-white/70">
                <span className="text-green-400 font-medium">+{analyticsData.userGrowth[analyticsData.userGrowth.length - 1]?.newUsers || 0} new users</span> this week
              </div>
            </UnifiedCard>

            <UnifiedCard variant="enhanced">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                📚 Story Creation Activity
              </h3>
              {renderChart(analyticsData.storyMetrics || [])}
              <div className="text-center text-white/70">
                Completion rate: <span className="text-green-400 font-medium">{analyticsData.userEngagement.storyCompletionRate}%</span>
              </div>
            </UnifiedCard>
          </div>

          {/* Engagement Metrics */}
          <UnifiedCard variant="enhanced">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              🎯 User Engagement Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{analyticsData.userEngagement.avgSessionDuration}</div>
                <div className="text-white/70">Avg Session Duration</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{analyticsData.userEngagement.avgStoriesPerUser}</div>
                <div className="text-white/70">Stories per User</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{analyticsData.userEngagement.userRetention30d}%</div>
                <div className="text-white/70">30-Day Retention</div>
              </div>
            </div>
          </UnifiedCard>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-8">
          {/* User Activity */}
          <UnifiedCard variant="enhanced">
            <h3 className="text-xl font-bold text-white mb-6">👥 User Activity Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <UnifiedCard variant="glass" className="text-center">
                <div className="text-2xl font-bold text-green-400">{analyticsData.userEngagement.dailyActiveUsers}</div>
                <div className="text-white/70">Daily Active Users</div>
              </UnifiedCard>
              <UnifiedCard variant="glass" className="text-center">
                <div className="text-2xl font-bold text-blue-400">{analyticsData.userEngagement.weeklyActiveUsers}</div>
                <div className="text-white/70">Weekly Active Users</div>
              </UnifiedCard>
              <UnifiedCard variant="glass" className="text-center">
                <div className="text-2xl font-bold text-purple-400">{analyticsData.userEngagement.monthlyActiveUsers}</div>
                <div className="text-white/70">Monthly Active Users</div>
              </UnifiedCard>
            </div>
          </UnifiedCard>

          {/* User Growth Chart */}
          <UnifiedCard variant="enhanced">
            <h3 className="text-xl font-bold text-white mb-6">📈 User Growth Over Time</h3>
            {renderChart(analyticsData.userGrowth, 'h-64')}
          </UnifiedCard>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-8">
          {/* Content Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Stories', value: analyticsData.contentAnalytics.totalStories, color: 'text-blue-400' },
              { label: 'Published', value: analyticsData.contentAnalytics.publishedStories, color: 'text-green-400' },
              { label: 'Drafts', value: analyticsData.contentAnalytics.draftStories, color: 'text-amber-400' },
              { label: 'Reported', value: analyticsData.contentAnalytics.reportedStories, color: 'text-red-400' }
            ].map((metric, index) => (
              <div key={index} className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-6 text-center">
                <div className={`text-2xl font-bold ${metric.color}`}>{metric.value.toLocaleString()}</div>
                <div className="text-white/70">{metric.label}</div>
              </div>
            ))}
          </div>

          {/* Genre and Age Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <UnifiedCard variant="enhanced">
              <h3 className="text-xl font-bold text-white mb-6">🎭 Popular Genres</h3>
              <div className="space-y-4">
                {analyticsData.contentAnalytics.popularGenres.map((genre, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-white font-medium">{genre.genre}</span>
                      <span className="text-white/70">{genre.count} ({genre.percentage}%)</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${genre.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </UnifiedCard>

            <UnifiedCard variant="enhanced">
              <h3 className="text-xl font-bold text-white mb-6">👶 Age Group Distribution</h3>
              <div className="space-y-4">
                {analyticsData.contentAnalytics.ageGroupDistribution.map((group, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-white font-medium">Ages {group.ageGroup}</span>
                      <span className="text-white/70">{group.count} ({group.percentage}%)</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${group.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </UnifiedCard>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-8">
          {/* Revenue Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Revenue', value: formatCurrency(analyticsData.subscriptionMetrics.totalRevenue), color: 'text-green-400' },
              { label: 'ARPU', value: formatCurrency(analyticsData.subscriptionMetrics.averageRevenuePerUser), color: 'text-blue-400' },
              { label: 'Churn Rate', value: `${analyticsData.subscriptionMetrics.churnRate}%`, color: 'text-red-400' }
            ].map((metric, index) => (
              <div key={index} className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-6 text-center">
                <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
                <div className="text-white/70">{metric.label}</div>
              </div>
            ))}
          </div>

          {/* Subscription Distribution */}
          <UnifiedCard variant="enhanced">
            <h3 className="text-xl font-bold text-white mb-6">💎 Subscription Plans</h3>
            <div className="space-y-6">
              {Object.entries(analyticsData.subscriptionMetrics).filter(([key]) => ['free', 'premium', 'pro'].includes(key)).map(([plan, data]: [string, any], index) => (
                <UnifiedCard key={index} variant="glass">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white font-bold capitalize flex items-center">
                      {plan === 'free' && '🆓'} {plan === 'premium' && '💎'} {plan === 'pro' && '👑'} {plan}
                    </span>
                    <span className="text-white/70">{data.users} users ({data.percentage}%)</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/70">Revenue</span>
                    <span className="text-green-400 font-medium">{formatCurrency(data.revenue)}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        plan === 'free' ? 'bg-gray-500' : 
                        plan === 'premium' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                </UnifiedCard>
              ))}
            </div>
          </UnifiedCard>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-8">
          {/* System Health */}
          <UnifiedCard variant="enhanced">
            <h3 className="text-xl font-bold text-white mb-6">⚙️ System Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'API Response Time', value: `${analyticsData.systemMetrics.apiResponseTime}ms`, target: 200, current: analyticsData.systemMetrics.apiResponseTime },
                { label: 'Server Uptime', value: `${analyticsData.systemMetrics.serverUptime}%`, target: 100, current: analyticsData.systemMetrics.serverUptime },
                { label: 'Error Rate', value: `${analyticsData.systemMetrics.errorRate}%`, target: 1, current: analyticsData.systemMetrics.errorRate, inverse: true },
                { label: 'Database Performance', value: `${analyticsData.systemMetrics.databasePerformance}%`, target: 100, current: analyticsData.systemMetrics.databasePerformance },
                { label: 'Storage Usage', value: `${analyticsData.systemMetrics.storageUsage}%`, target: 80, current: analyticsData.systemMetrics.storageUsage }
              ].map((metric, index) => {
                const percentage = metric.inverse 
                  ? Math.max(0, 100 - (metric.current / metric.target) * 100)
                  : (metric.current / metric.target) * 100;
                const color = percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-red-500';
                
                return (
                  <UnifiedCard key={index} variant="glass">
                    <div className="text-white font-medium mb-2">{metric.label}</div>
                    <div className="text-2xl font-bold text-white mb-3">{metric.value}</div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${color}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </UnifiedCard>
                );
              })}
            </div>
          </UnifiedCard>
        </div>
      )}
    </StandardPage>
  );
};

export default AdminAnalyticsPage;