import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StandardPage, UnifiedCard, MetricCard, DESIGN_TOKENS } from '@/components/design-system';
import { useCredits } from '@/hooks/useCredits';
import { CreditDisplay } from '@/components/business/CreditDisplay';
import { PricingWidget } from '@/components/business/PricingWidget';
import { useAuth } from '@/providers/AuthContext';

const CreditsPage: React.FC = () => {
  const { user } = useAuth();
  const { credits, transactions, loading, error, refreshCredits } = useCredits();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'pricing' | 'earn'>('overview');
  const [activeGoals, setActiveGoals] = useState<any[]>([]);
  const [earnableAchievements, setEarnableAchievements] = useState<any[]>([]);

  // Fetch ways to earn credits
  useEffect(() => {
    if (user?.id) {
      const loadEarnOpportunities = async () => {
        try {
          const [goals, achievements] = await Promise.all([
            goalService.getUserGoalsWithProgress(user.id),
            achievementService.getAvailableAchievements(user.id)
          ]);
          
          setActiveGoals(goals.filter(g => !g.goal.completed));
          setEarnableAchievements(achievements.filter(a => !a.is_completed && a.current_progress > 0).slice(0, 5));
        } catch (error) {
          console.error('Error loading earn opportunities:', error);
        }
      };
      
      loadEarnOpportunities();
    }
  }, [user?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'spend': return '💸';
      case 'earn': return '💰';
      case 'monthly_refresh': return '🔄';
      case 'refund': return '↩️';
      default: return '💳';
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) return 'text-green-400';
    if (type === 'refund') return 'text-blue-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <StandardPage title="💳 Credits" subtitle="Loading your credit information..." containerSize="large">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
        </div>
      </StandardPage>
    );
  }

  if (error) {
    return (
      <StandardPage title="💳 Credits" subtitle="Unable to load credit information" containerSize="large">
        <UnifiedCard variant="refined" className="text-center bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-400/30">
          <div className="py-12">
            <div className="text-6xl mb-6">⚠️</div>
            <h3 className="text-2xl font-bold text-white mb-4">Credits Unavailable</h3>
            <p className="text-red-400 mb-6">{error}</p>
            <button 
              onClick={refreshCredits}
              className={`${DESIGN_TOKENS.components.button.primary} px-6 py-3`}
            >
              Retry Loading Credits
            </button>
          </div>
        </UnifiedCard>
      </StandardPage>
    );
  }

  return (
    <StandardPage 
      title="💳 Credits" 
      subtitle="Manage your Tale Forge credits and understand pricing"
      containerSize="large"
    >
      {/* Credit Balance Overview */}
      <div className="mb-8">
        <CreditDisplay showDetails className="mb-6" />
        
        {/* Tab Navigation */}
        <UnifiedCard variant="enhanced">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <MetricCard
                title="Current Balance"
                value={credits?.currentBalance.toLocaleString() || '0'}
                icon="💳"
                trend={{ value: credits && credits.currentBalance >= 15 ? 'Sufficient' : 'Low' }}
              />
              <MetricCard
                title="Total Earned"
                value={credits?.totalEarned.toLocaleString() || '0'}
                icon="💰"
                trend={{ value: "All time" }}
              />
              <MetricCard
                title="Total Spent"
                value={credits?.totalSpent.toLocaleString() || '0'}
                icon="💸"
                trend={{ value: "All time" }}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'overview', label: '📊 Overview' },
                { id: 'earn', label: '🎯 Earn Credits' },
                { id: 'history', label: '📋 History' },
                { id: 'pricing', label: '💎 Pricing' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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
              onClick={refreshCredits}
              className={`${DESIGN_TOKENS.components.button.secondary} px-4 py-2 text-sm flex items-center gap-2`}
              title="Refresh credit data"
            >
              🔄 Refresh
            </button>
          </div>
        </UnifiedCard>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* How Credits Work */}
          <UnifiedCard variant="enhanced">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              🎯 How Credits Work
            </h3>
            <div className="space-y-4 text-white/80">
              <p>
                Credits are Tale Forge's currency for creating stories from our curated templates. Our new template system includes everything you need:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UnifiedCard variant="glass">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📚</div>
                    <div className="font-medium text-white">Complete Chapter</div>
                    <div className="text-amber-400">2 credits</div>
                    <div className="text-xs text-white/60">Story text + illustration included</div>
                  </div>
                </UnifiedCard>
                <UnifiedCard variant="glass">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎵</div>
                    <div className="font-medium text-white">Audio Narration</div>
                    <div className="text-amber-400">50% of story cost</div>
                    <div className="text-xs text-white/60">Available after story completion</div>
                  </div>
                </UnifiedCard>
              </div>
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg p-4 mt-4">
                <p className="text-white/90 text-sm">
                  <strong>✨ What's Included:</strong> Every story chapter comes with AI-generated text AND a beautiful illustration. 
                  Audio narration can be purchased separately after completing your story.
                </p>
              </div>
            </div>
          </UnifiedCard>

          {/* Story Types and Costs */}
          <UnifiedCard variant="enhanced">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              📚 Template-Based Story Tiers
            </h3>
            <div className="space-y-4">
              {[
                { 
                  name: 'Short Story', 
                  chapters: 5, 
                  cost: 10, 
                  description: 'Perfect for bedtime stories',
                  icon: '📖'
                },
                { 
                  name: 'Medium Story', 
                  chapters: 10, 
                  cost: 20, 
                  description: 'Great for weekend adventures',
                  icon: '📚',
                  popular: true
                },
                { 
                  name: 'Long Story', 
                  chapters: 15, 
                  cost: 30, 
                  description: 'Epic tales for story lovers',
                  icon: '📜'
                }
              ].map((story) => (
                <UnifiedCard key={story.name} variant="glass" className={`flex items-center justify-between ${story.popular ? 'border-amber-400/50' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{story.icon}</div>
                    <div>
                      <div className="font-medium text-white flex items-center gap-2">
                        {story.name}
                        {story.popular && (
                          <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-1 rounded font-bold">
                            POPULAR
                          </span>
                        )}
                      </div>
                      <div className="text-white/70 text-sm">{story.description}</div>
                      <div className="text-white/60 text-xs">{story.chapters} chapters with illustrations</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-400">{story.cost}</div>
                    <div className="text-white/60 text-sm">credits</div>
                    <div className="text-white/50 text-xs">+{Math.ceil(story.cost * 0.5)} for audio</div>
                  </div>
                </UnifiedCard>
              ))}
            </div>
          </UnifiedCard>

          {/* Free Tier Info */}
          <UnifiedCard variant="enhanced" className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              🆓 Free Tier Benefits
            </h3>
            <div className="text-white/80 space-y-2">
              <p>• <strong>15 credits monthly</strong> - Perfect for 1 short story (10 credits) with extra credits to spare</p>
              <p>• <strong>Full template access</strong> - Choose from dozens of curated story templates</p>
              <p>• <strong>Text + illustrations included</strong> - Every chapter comes with beautiful AI art</p>
              <p>• <strong>Audio available separately</strong> - Purchase narration after completing your story</p>
              <p>• <strong>Auto-refresh</strong> - Credits reset every 30 days</p>
              <p className="text-sm text-white/60">
                Last refresh: {credits ? formatDate(credits.lastRefresh) : 'Unknown'}
              </p>
            </div>
          </UnifiedCard>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <UnifiedCard variant="enhanced">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              📋 Transaction History
            </h3>
            
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <div className="text-4xl mb-4">📝</div>
                <p>No transactions yet. Create your first story to see activity here!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <UnifiedCard key={transaction.id} variant="glass">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{getTransactionIcon(transaction.transactionType)}</div>
                        <div>
                          <div className="font-medium text-white">{transaction.description}</div>
                          <div className="text-white/60 text-sm">
                            {formatDate(transaction.createdAt)}
                            {transaction.referenceType && (
                              <span className="ml-2 px-2 py-0.5 bg-white/10 rounded text-xs">
                                {transaction.referenceType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getTransactionColor(transaction.transactionType, transaction.amount)}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </div>
                        <div className="text-white/60 text-sm">
                          Balance: {transaction.balanceAfter}
                        </div>
                      </div>
                    </div>
                  </UnifiedCard>
                ))}
              </div>
            )}
          </UnifiedCard>
        </div>
      )}

      {activeTab === 'earn' && (
        <div className="space-y-8">
          {/* Current Ways to Get Credits */}
          <UnifiedCard variant="enhanced">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              💳 How to Get More Credits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Refresh */}
              <UnifiedCard variant="glass" className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/30">
                <h4 className="font-bold text-white mb-4 flex items-center">
                  🔄 Monthly Refresh (Free)
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/80">Free tier refresh</span>
                    <span className="text-green-400 font-medium">15 credits/month</span>
                  </div>
                  <p className="text-white/70 text-xs mt-2">
                    Your free credits automatically refresh every 30 days. Perfect for creating one short story monthly!
                  </p>
                </div>
              </UnifiedCard>

              {/* Purchase Credits */}
              <UnifiedCard variant="glass" className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/30">
                <h4 className="font-bold text-white mb-4 flex items-center">
                  🛒 Purchase Credits
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/80">One-time purchase</span>
                    <span className="text-amber-400 font-medium">Available now</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Subscription plans</span>
                    <span className="text-amber-400 font-medium">More value</span>
                  </div>
                  <p className="text-white/70 text-xs mt-2">
                    Need more stories? Purchase additional credits or upgrade to a subscription for better value.
                  </p>
                </div>
              </UnifiedCard>
            </div>
          </UnifiedCard>

          {/* Coming Soon: Additional Ways to Earn */}
          <UnifiedCard variant="enhanced" className="relative overflow-hidden">
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <div className="text-center max-w-xl mx-auto p-6">
                <div className="text-4xl mb-4">🚧</div>
                <h3 className="text-xl font-bold text-white mb-3">Coming Soon: Earn Free Credits!</h3>
                <p className="text-white/90 text-sm mb-4">
                  We're building exciting ways for you to earn credits through creativity and engagement
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/10 p-3 rounded">
                    <div className="text-amber-400 font-semibold">🎯 Achievements</div>
                    <div className="text-white/70">Story milestones & creative challenges</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded">
                    <div className="text-green-400 font-semibold">📅 Daily Tasks</div>
                    <div className="text-white/70">Login streaks & story completion bonuses</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded">
                    <div className="text-blue-400 font-semibold">🏆 Competitions</div>
                    <div className="text-white/70">Community contests & special events</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded">
                    <div className="text-purple-400 font-semibold">👥 Social Features</div>
                    <div className="text-white/70">Share stories & template creation rewards</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background placeholder */}
            <div className="opacity-20 blur-sm p-6">
              <h3 className="text-xl font-bold text-white mb-6">Additional Ways to Earn Credits</h3>
              <div className="grid grid-cols-2 gap-4 h-40 bg-white/5 rounded"></div>
            </div>
          </UnifiedCard>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="space-y-8">
          {/* Subscription Plans */}
          <UnifiedCard variant="enhanced">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              💎 Subscription Plans
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Free',
                  price: '$0',
                  period: '/month',
                  credits: '15 credits monthly',
                  stories: '1 short story + 5 spare credits',
                  features: ['Template-based stories', 'Text + illustrations', 'Audio purchase option', 'Community support'],
                  icon: '🆓',
                  color: 'border-gray-400/30'
                },
                {
                  name: 'Premium',
                  price: '$9.99',
                  period: '/month',
                  credits: '100 credits monthly',
                  stories: '3-10 stories depending on length',
                  features: ['All template features', 'Priority generation', 'Email support', 'Early access features'],
                  icon: '💎',
                  color: 'border-blue-400/50',
                  popular: true
                },
                {
                  name: 'Pro',
                  price: '$19.99',
                  period: '/month',
                  credits: '250 credits monthly',
                  stories: '8-25 stories depending on length',
                  features: ['Everything in Premium', 'Priority support', 'Beta features', 'Bulk audio discounts'],
                  icon: '👑',
                  color: 'border-purple-400/50'
                }
              ].map((plan) => (
                <UnifiedCard key={plan.name} variant="enhanced" className={`relative ${plan.color}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        POPULAR
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-3xl mb-2">{plan.icon}</div>
                    <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-white">{plan.price}</span>
                      <span className="text-white/60">{plan.period}</span>
                    </div>
                    <div className="text-amber-400 font-medium mb-2">{plan.credits}</div>
                    <div className="text-white/80 text-sm mb-4">{plan.stories}</div>
                    <ul className="text-white/70 text-sm space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="text-green-400">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button 
                      className={`w-full ${
                        plan.popular 
                          ? DESIGN_TOKENS.components.button.primary
                          : DESIGN_TOKENS.components.button.secondary
                      } py-3`}
                      onClick={() => {
                        toast.success(`${plan.name} plan selected! Subscription system coming soon.`);
                        console.log(`Selected ${plan.name} plan`);
                      }}
                      disabled={plan.name !== 'Free'}
                    >
                      {plan.name === 'Free' ? 'Current Plan' : `Choose ${plan.name} (Soon)`}
                    </button>
                  </div>
                </UnifiedCard>
              ))}
            </div>
          </UnifiedCard>

          {/* One-time Credit Purchases */}
          <UnifiedCard variant="enhanced">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              🛒 One-time Credit Purchases
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { credits: 25, price: '$4.99', bonus: 0, popular: false },
                { credits: 75, price: '$12.99', bonus: 5, popular: true },
                { credits: 150, price: '$24.99', bonus: 15, popular: false },
                { credits: 300, price: '$44.99', bonus: 50, popular: false }
              ].map((pack, index) => (
                <UnifiedCard key={index} variant="glass" className={pack.popular ? 'border-amber-400/50' : ''}>
                  {pack.popular && (
                    <div className="text-center mb-2">
                      <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-1 rounded">
                        BEST VALUE
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{pack.credits}</div>
                    {pack.bonus > 0 && (
                      <div className="text-green-400 text-sm">+{pack.bonus} bonus</div>
                    )}
                    <div className="text-white/60 text-xs mb-3">credits</div>
                    <div className="text-lg font-bold text-white mb-3">{pack.price}</div>
                    <button 
                      className={`w-full text-sm py-2 ${
                        pack.popular 
                          ? DESIGN_TOKENS.components.button.primary
                          : DESIGN_TOKENS.components.button.secondary
                      }`}
                      onClick={() => {
                        // TODO: Navigate to payment flow
                        console.log(`Purchase ${pack.credits} credits`);
                      }}
                    >
                      Purchase
                    </button>
                  </div>
                </UnifiedCard>
              ))}
            </div>
          </UnifiedCard>
        </div>
      )}
    </StandardPage>
  );
};

export default CreditsPage;