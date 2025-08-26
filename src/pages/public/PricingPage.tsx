import React, { useState } from 'react';
import { StandardPage, UnifiedCard } from '@/components/design-system';
import { CheckCircle, Zap, CreditCard } from 'lucide-react';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  displayPrice: string;
  savings?: string;
  popular?: boolean;
  stripeLink: string;
}

const PricingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'packages' | 'subscription'>('packages');

  // Monthly subscription plans
  const monthlyPlans: CreditPackage[] = [
    {
      id: 'free',
      name: 'Free Plan',
      credits: 10,
      price: 0,
      displayPrice: 'Free',
      stripeLink: '#'
    },
    {
      id: 'basic',
      name: 'Basic Creator',
      credits: 100,
      price: 9.99,
      displayPrice: '$9.99/mo',
      stripeLink: 'https://buy.stripe.com/monthly_basic_placeholder'
    },
    {
      id: 'pro',
      name: 'Pro Storyteller',
      credits: 250,
      price: 19.99,
      displayPrice: '$19.99/mo',
      popular: true,
      savings: 'Best Value - 25% More!',
      stripeLink: 'https://buy.stripe.com/monthly_pro_placeholder'
    }
  ];

  // Extra credit bundles for one-time purchase
  // Base price: $0.10 per credit, with discounts for larger bundles
  const extraCredits: CreditPackage[] = [
    {
      id: 'small',
      name: 'Small Bundle',
      credits: 50,
      price: 5,
      displayPrice: '$5',
      stripeLink: 'https://buy.stripe.com/cNi28rg8eb5Lghk5Hegbm00'
    },
    {
      id: 'medium',
      name: 'Medium Bundle',
      credits: 100,
      price: 10,
      displayPrice: '$10',
      stripeLink: 'https://buy.stripe.com/9B6fZhbRY1vbaX05Hegbm01'
    },
    {
      id: 'large',
      name: 'Large Bundle',
      credits: 250,
      price: 22.50,
      displayPrice: '$22.50',
      savings: 'Save 10%',
      popular: true,
      stripeLink: 'https://buy.stripe.com/00wbJ17BIehX5CGfhOgbm02'
    },
    {
      id: 'mega',
      name: 'Mega Bundle',
      credits: 500,
      price: 40,
      displayPrice: '$40',
      savings: 'Save 20%!',
      stripeLink: 'https://buy.stripe.com/4gM4gz9JQ4Hn1mq3z6gbm03'
    }
  ];

  const handlePurchaseClick = (stripeLink: string) => {
    // Direct navigation to Stripe checkout
    window.location.href = stripeLink;
  };

  return (
    <StandardPage 
      title="Get Story Credits"
      subtitle="Purchase credits to create amazing AI-powered stories"
      icon="💰"
      containerSize="large"
    >
      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/5 rounded-lg p-1 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-6 py-2 rounded-md transition-all ${
              activeTab === 'packages'
                ? 'bg-amber-500 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Monthly Plans
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-6 py-2 rounded-md transition-all ${
              activeTab === 'subscription'
                ? 'bg-amber-500 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Extra Credits
          </button>
        </div>
      </div>

      {/* Monthly Plans */}
      {activeTab === 'packages' && (
        <>
          {/* How It Works */}
          <UnifiedCard variant="enhanced" className="mb-12">
            <h3 className="text-xl font-bold text-white mb-4">Simple Credit System</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-amber-400 mt-1" />
                <div>
                  <p className="font-medium text-white">1 Credit = 1 Chapter</p>
                  <p className="text-white/70 text-sm">Includes AI text + image</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <p className="font-medium text-white">Audio = 1cr/100 words</p>
                  <p className="text-white/70 text-sm">Premium only</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <p className="font-medium text-white">Credits Don't Expire</p>
                  <p className="text-white/70 text-sm">Use at your own pace</p>
                </div>
              </div>
            </div>
          </UnifiedCard>

          {/* Monthly Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
            {monthlyPlans.map((pkg) => (
              <UnifiedCard
                key={pkg.id}
                variant={pkg.popular ? 'enhanced' : 'glass'}
                className={`relative ${pkg.popular ? 'ring-2 ring-amber-500' : ''}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">{pkg.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-white">{pkg.displayPrice}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-2xl font-semibold text-amber-400">{pkg.credits}</span>
                    <span className="text-white/60 text-sm"> credits</span>
                  </div>
                  {pkg.savings && (
                    <span className="text-green-400 text-sm font-medium">{pkg.savings}</span>
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-white/80 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span>
                      {pkg.id === 'free' ? '10 story chapters' : 
                       pkg.id === 'basic' ? '100 story chapters' : 
                       '250 story chapters'}
                    </span>
                  </div>
                  <div className="flex items-center text-white/80 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span>
                      {pkg.id === 'free' ? 'No credit card' : 
                       pkg.id === 'basic' ? 'Audio narration available' : 
                       'Audio narration available'}
                    </span>
                  </div>
                  <div className="flex items-center text-white/80 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span>
                      {pkg.id === 'free' ? 'Try before you buy' : 
                       pkg.id === 'basic' ? 'Cancel anytime' : 
                       'Save $0.02 per credit'}
                    </span>
                  </div>
                  {pkg.id !== 'free' && (
                    <div className="flex items-center text-white/80 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span>
                        {pkg.id === 'basic' ? 'Perfect for families' : 'Best for educators'}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => pkg.id === 'free' ? window.location.href = '/signup' : handlePurchaseClick(pkg.stripeLink)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                    pkg.popular
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : pkg.id === 'free'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {pkg.id === 'free' ? 'Start Free' : 'Subscribe Now'}
                </button>
              </UnifiedCard>
            ))}
          </div>
        </>
      )}

      {/* Extra Credit Bundles */}
      {activeTab === 'subscription' && (
        <>
          {/* How Extra Credits Work */}
          <UnifiedCard variant="enhanced" className="mb-12">
            <h3 className="text-xl font-bold text-white mb-4">Running Low? Top Up Anytime!</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-amber-400 mt-1" />
                <div>
                  <p className="font-medium text-white">Instant Delivery</p>
                  <p className="text-white/70 text-sm">Use immediately</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <p className="font-medium text-white">Bulk Discounts</p>
                  <p className="text-white/70 text-sm">Save up to 20%</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <p className="font-medium text-white">Works with All Plans</p>
                  <p className="text-white/70 text-sm">Even free accounts</p>
                </div>
              </div>
            </div>
          </UnifiedCard>

          {/* Extra Credits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {extraCredits.map((pkg) => (
              <UnifiedCard
                key={pkg.id}
                variant={pkg.popular ? 'enhanced' : 'glass'}
                className={`relative ${pkg.popular ? 'ring-2 ring-amber-500' : ''}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">{pkg.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-white">{pkg.displayPrice}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-2xl font-semibold text-amber-400">{pkg.credits}</span>
                    <span className="text-white/60 text-sm"> credits</span>
                  </div>
                  {pkg.savings && (
                    <span className="text-green-400 text-sm font-medium">{pkg.savings}</span>
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-white/80 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span>{pkg.credits} story chapters</span>
                  </div>
                  <div className="flex items-center text-white/80 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span>Add to any plan</span>
                  </div>
                  <div className="flex items-center text-white/80 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span>{pkg.price <= 10 ? 'No discount' : pkg.savings}</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchaseClick(pkg.stripeLink)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                    pkg.popular
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  Buy Now
                </button>
              </UnifiedCard>
            ))}
          </div>
        </>
      )}

      {/* Security Notice */}
      <UnifiedCard variant="glass" className="text-center">
        <div className="flex items-center justify-center space-x-3">
          <CreditCard className="w-5 h-5 text-green-400" />
          <p className="text-white/70">
            Secure payments powered by <span className="text-white font-semibold">Stripe</span>
          </p>
        </div>
        <p className="text-white/50 text-sm mt-2">
          All transactions are encrypted and secure. We never store your payment information.
        </p>
      </UnifiedCard>
    </StandardPage>
  );
};

export default PricingPage;