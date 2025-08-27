import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { supabase } from '@/lib/supabase';
import { stripeService } from '@/services/stripeService';
import toast from 'react-hot-toast';
import FounderBadge from '@/components/atoms/FounderBadge';

interface SubscriptionData {
  plan: 'free' | 'starter' | 'premium';
  credits: number;
  creditsUsed: number;
  nextBillingDate?: string;
  stripeCustomerId?: string;
  // Founder status
  isFounder?: boolean;
  founderTier?: 'elite' | 'pioneer';
  founderNumber?: number;
  founderDiscount?: number;
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData>({
    plan: 'free',
    credits: 10,
    creditsUsed: 0
  });
  const [activeTab, setActiveTab] = useState<'account' | 'subscription' | 'preferences'>('account');
  const [processingStripe, setProcessingStripe] = useState(false);

  useEffect(() => {
    const body = document.body;
    const originalBackground = body.style.background;
    const originalBackgroundImage = body.style.backgroundImage;
    const originalBackgroundAttachment = body.style.backgroundAttachment;
    const originalBackgroundSize = body.style.backgroundSize;
    const originalBackgroundPosition = body.style.backgroundPosition;
    const originalBackgroundRepeat = body.style.backgroundRepeat;
    
    body.style.background = 'none';
    body.style.backgroundImage = 'url(/images/backgrounds/magical-space-nebula-1.png)';
    body.style.backgroundAttachment = 'fixed';
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundRepeat = 'no-repeat';
    
    return () => {
      body.style.background = originalBackground;
      body.style.backgroundImage = originalBackgroundImage;
      body.style.backgroundAttachment = originalBackgroundAttachment;
      body.style.backgroundSize = originalBackgroundSize;
      body.style.backgroundPosition = originalBackgroundPosition;
      body.style.backgroundRepeat = originalBackgroundRepeat;
    };
  }, []);

  useEffect(() => {
    fetchSubscriptionData();
  }, [user]);

  const fetchSubscriptionData = async () => {
    if (!user) return;
    
    try {
      // Fetch user's subscription status
      const userSubscription = await stripeService.getUserSubscription();
      
      // Fetch user's credit balance
      const { data: creditData } = await supabase
        .from('user_credits')
        .select('balance, lifetime_spent')
        .eq('user_id', user.id)
        .single();
      
      // Fetch founder status
      const { data: founderData } = await supabase.rpc('get_user_founder_status', {
        user_uuid: user.id
      });
      
      if (userSubscription) {
        setSubscription({
          plan: userSubscription.planId as 'free' | 'starter' | 'premium',
          credits: userSubscription.creditsIncluded,
          creditsUsed: creditData?.lifetime_spent || 0,
          nextBillingDate: userSubscription.currentPeriodEnd,
          stripeCustomerId: userSubscription.planId,
          // Founder status
          isFounder: founderData?.is_founder || false,
          founderTier: founderData?.founder_tier || undefined,
          founderNumber: founderData?.founder_number || undefined,
          founderDiscount: founderData?.discount_percentage || undefined
        });
      } else {
        // Free tier user
        setSubscription({
          plan: 'free',
          credits: 10,
          creditsUsed: creditData?.lifetime_spent || 0,
          // Founder status (free users can't be founders)
          isFounder: false
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Default to free tier on error
      setSubscription({
        plan: 'free',
        credits: 10,
        creditsUsed: 0,
        isFounder: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setProcessingStripe(true);
    try {
      const portalUrl = await stripeService.openCustomerPortal();
      window.open(portalUrl, '_blank');
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast.error(error.message || 'Failed to open subscription management');
    } finally {
      setProcessingStripe(false);
    }
  };

  const handleUpgrade = async () => {
    // Determine which plan to upgrade to
    const targetPlan = subscription.plan === 'free' ? 'starter' : 'premium';
    
    setProcessingStripe(true);
    try {
      const { sessionUrl } = await stripeService.createCheckoutSession(
        targetPlan,
        `${window.location.origin}/payment/success`,
        `${window.location.origin}/settings`
      );
      
      // Redirect to Stripe checkout
      window.location.href = sessionUrl;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast.error(error.message || 'Failed to start upgrade process');
      setProcessingStripe(false);
    }
  };

  const getPlanDetails = (plan: string) => {
    switch(plan) {
      case 'free':
        return { name: 'Free Tier', credits: 10, price: '$0/mo' };
      case 'starter':
        return { name: 'Starter', credits: 100, price: '$9.99/mo' };
      case 'premium':
        return { name: 'Premium', credits: 300, price: '$19.99/mo' };
      default:
        return { name: 'Free Tier', credits: 10, price: '$0/mo' };
    }
  };

  const planDetails = getPlanDetails(subscription.plan);
  const creditsPercentage = ((subscription.credits - subscription.creditsUsed) / subscription.credits) * 100;

  return (
    <div className="min-h-screen py-8 container-lg">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="title-hero mb-4 text-white">Account Settings</h1>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto">
          Manage your Tale Forge account, subscription, and preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-2 flex gap-2">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === 'account' 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === 'subscription' 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Subscription
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === 'preferences' 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Preferences
          </button>
        </div>
      </div>

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                <div className="bg-slate-800/50 rounded-lg px-4 py-3 text-white">
                  {user?.email || 'Not provided'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-800/50 rounded-lg px-4 py-3 text-white border border-white/10 focus:border-orange-400 transition-colors"
                  placeholder="Enter your name"
                  defaultValue={user?.user_metadata?.full_name || ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Account Created</label>
                <div className="bg-slate-800/50 rounded-lg px-4 py-3 text-white">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </div>
              </div>

              <Button variant="primary" size="medium" className="w-full mt-6">
                Save Changes
              </Button>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Security</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h3 className="font-medium text-white mb-2">Change Password</h3>
                <p className="text-sm text-gray-400 mb-4">Update your password to keep your account secure</p>
                <Button variant="secondary" size="medium">
                  Change Password
                </Button>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h3 className="font-medium text-white mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-400 mb-4">Add an extra layer of security to your account</p>
                <Button variant="secondary" size="medium">
                  Enable 2FA
                </Button>
              </div>

              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg mt-8">
                <h3 className="font-medium text-red-400 mb-2">Delete Account</h3>
                <p className="text-sm text-gray-400 mb-4">Permanently delete your account and all data</p>
                <Button variant="danger" size="small">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <div className="max-w-4xl mx-auto">
          {/* Current Plan */}
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-8 border border-white/10 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">Current Plan</h2>
                {subscription.isFounder && subscription.founderTier && (
                  <FounderBadge 
                    tier={subscription.founderTier}
                    number={subscription.founderNumber}
                    showNumber={true}
                    showDiscount={true}
                    discountPercentage={subscription.founderDiscount}
                    size="small"
                  />
                )}
              </div>
              {subscription.plan === 'premium' ? (
                <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-full">
                  PREMIUM
                </span>
              ) : subscription.plan === 'starter' ? (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full border border-blue-400/30">
                  STARTER
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-sm font-medium rounded-full border border-gray-400/30">
                  FREE
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Plan Name</p>
                <p className="text-2xl font-bold text-white">{planDetails.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Monthly Price</p>
                <p className="text-2xl font-bold text-orange-400">{planDetails.price}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Next Billing Date</p>
                <p className="text-2xl font-bold text-white">
                  {subscription.nextBillingDate || 'N/A'}
                </p>
              </div>
            </div>

            {/* Credits Usage */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-400 text-sm">Credits Used This Month</p>
                <p className="text-white font-medium">
                  {subscription.creditsUsed} / {subscription.credits}
                </p>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${100 - creditsPercentage}%` }}
                />
              </div>
              <p className="text-gray-400 text-xs mt-2">
                {subscription.credits - subscription.creditsUsed} credits remaining
              </p>
            </div>

            <div className="flex gap-4">
              {subscription.plan !== 'premium' && (
                <Button 
                  variant="primary" 
                  size="medium"
                  onClick={handleUpgrade}
                  disabled={processingStripe}
                  className="flex-1"
                >
                  {processingStripe ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Icon name="star" size={16} className="mr-2" />
                      Upgrade Plan
                    </>
                  )}
                </Button>
              )}
              {subscription.plan !== 'free' && (
                <Button 
                  variant="secondary" 
                  size="medium"
                  onClick={handleManageSubscription}
                  disabled={processingStripe}
                  className="flex-1"
                >
                  {processingStripe ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Icon name="settings" size={16} className="mr-2" />
                      Manage Subscription
                    </>
                  )}
                </Button>
              )}
              <Button 
                variant="secondary" 
                size="medium"
                onClick={() => navigate('/pricing')}
                className="flex-1"
              >
                <Icon name="plus" size={16} className="mr-2" />
                Buy More Credits
              </Button>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Your Plan Benefits</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <Icon name="check" size={20} className="text-green-400 mr-3 mt-1" />
                <div>
                  <p className="text-white font-medium">Monthly Credits</p>
                  <p className="text-gray-400 text-sm">{planDetails.credits} credits per month</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Icon name="check" size={20} className="text-green-400 mr-3 mt-1" />
                <div>
                  <p className="text-white font-medium">AI Story Generation</p>
                  <p className="text-gray-400 text-sm">Unlimited story creation</p>
                </div>
              </div>

              <div className="flex items-start">
                <Icon name="check" size={20} className="text-green-400 mr-3 mt-1" />
                <div>
                  <p className="text-white font-medium">AI Illustrations</p>
                  <p className="text-gray-400 text-sm">Beautiful images for every chapter</p>
                </div>
              </div>

              <div className="flex items-start">
                <Icon name="check" size={20} className="text-green-400 mr-3 mt-1" />
                <div>
                  <p className="text-white font-medium">Voice Narration</p>
                  <p className="text-gray-400 text-sm">Professional TTS (1 credit per 100 words)</p>
                </div>
              </div>

              {subscription.plan === 'premium' && (
                <>
                  <div className="flex items-start">
                    <Icon name="check" size={20} className="text-green-400 mr-3 mt-1" />
                    <div>
                      <p className="text-white font-medium">Extra Credit Discount</p>
                      <p className="text-gray-400 text-sm">10% off all credit bundles</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Icon name="check" size={20} className="text-green-400 mr-3 mt-1" />
                    <div>
                      <p className="text-white font-medium">Priority Support</p>
                      <p className="text-gray-400 text-sm">Get help faster when you need it</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Story Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Default Story Length</label>
                <div className="grid grid-cols-3 gap-3">
                  <button className="px-4 py-2 bg-slate-800/50 rounded-lg text-white hover:bg-orange-500/20 hover:border-orange-400 border border-white/10 transition-all">
                    Short (5-7 chapters)
                  </button>
                  <button className="px-4 py-2 bg-orange-500/20 rounded-lg text-white border border-orange-400">
                    Medium (8-12 chapters)
                  </button>
                  <button className="px-4 py-2 bg-slate-800/50 rounded-lg text-white hover:bg-orange-500/20 hover:border-orange-400 border border-white/10 transition-all">
                    Long (13-20 chapters)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Content Filters</label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3 rounded" defaultChecked />
                    <span className="text-white">Enable age-appropriate content filtering</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3 rounded" defaultChecked />
                    <span className="text-white">Avoid scary or intense themes</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3 rounded" />
                    <span className="text-white">Include educational elements</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Email Notifications</label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3 rounded" defaultChecked />
                    <span className="text-white">New features and updates</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3 rounded" />
                    <span className="text-white">Story recommendations</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3 rounded" defaultChecked />
                    <span className="text-white">Credit usage alerts</span>
                  </label>
                </div>
              </div>

              <Button variant="primary" size="large" className="w-full mt-8">
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;