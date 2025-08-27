import React, { useState, useEffect } from 'react';
import { CheckCircle, Zap, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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

  // Handle body background for this page
  useEffect(() => {
    const body = document.body;
    const originalBackground = body.style.background;
    const originalBackgroundImage = body.style.backgroundImage;
    const originalBackgroundAttachment = body.style.backgroundAttachment;
    const originalBackgroundSize = body.style.backgroundSize;
    const originalBackgroundPosition = body.style.backgroundPosition;
    const originalBackgroundRepeat = body.style.backgroundRepeat;
    
    body.style.background = 'none';
    body.style.backgroundImage = 'url(/images/backgrounds/background-image.png)';
    body.style.backgroundAttachment = 'fixed';
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundRepeat = 'no-repeat';
    
    // Cleanup function to restore original background
    return () => {
      body.style.background = originalBackground;
      body.style.backgroundImage = originalBackgroundImage;
      body.style.backgroundAttachment = originalBackgroundAttachment;
      body.style.backgroundSize = originalBackgroundSize;
      body.style.backgroundPosition = originalBackgroundPosition;
      body.style.backgroundRepeat = originalBackgroundRepeat;
    };
  }, []);

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
    <div className="page-container">
      {/* Header */}
      <section className="p-section text-center">
        <div className="container-lg">
          <div className="glass-card">
            <h1 className="title-hero mb-6">
              💰 Get Story Credits
            </h1>
            <p className="text-body text-xl max-w-3xl mx-auto mb-8 text-slate-200">
              Purchase credits to create amazing AI-powered stories for your children
            </p>

            {/* Tab Navigation */}
            <div className="glass-card p-2 w-fit mx-auto">
              <Button
                onClick={() => setActiveTab('packages')}
                variant={activeTab === 'packages' ? 'default' : 'ghost'}
                size="lg"
              >
                Monthly Plans
              </Button>
              <Button
                onClick={() => setActiveTab('subscription')}
                variant={activeTab === 'subscription' ? 'default' : 'ghost'}
                size="lg"
              >
                Extra Credits
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Plans */}
      {activeTab === 'packages' && (
        <>
          <section className="p-section">
            <div className="container-lg">
              <div className="glass-card">
                <h3 className="title-section text-center mb-12">Simple Credit System</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-amber-400" />
                    </div>
                    <h4 className="title-card mb-2">1 Credit = 1 Chapter</h4>
                    <p className="text-body text-slate-300">Includes AI text + beautiful illustration</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h4 className="title-card mb-2">Audio Narration</h4>
                    <p className="text-body text-slate-300">1 credit per 100 words (premium only)</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-blue-400" />
                    </div>
                    <h4 className="title-card mb-2">Credits Don't Expire</h4>
                    <p className="text-body text-slate-300">Use at your own pace, whenever you want</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="p-section">
            <div className="container-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {monthlyPlans.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`glass-card relative transition-all duration-300 hover:scale-105 ${pkg.popular ? 'border-amber-400/40 shadow-xl shadow-amber-500/10' : ''
                    }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="title-card mb-4">{pkg.name}</h3>
                    <div className="mb-3">
                      <span className="text-4xl font-bold text-white">{pkg.displayPrice}</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-3xl font-semibold text-amber-400">{pkg.credits}</span>
                      <span className="text-body text-slate-300 text-lg"> credits</span>
                    </div>
                    {pkg.savings && (
                      <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-400/30">
                        {pkg.savings}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-slate-200">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-body">
                        {pkg.id === 'free' ? '10 story chapters' :
                          pkg.id === 'basic' ? '100 story chapters' :
                            '250 story chapters'}
                      </span>
                    </div>
                    <div className="flex items-center text-slate-200">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-body">
                        {pkg.id === 'free' ? 'No credit card required' :
                          'Professional audio narration'}
                      </span>
                    </div>
                    <div className="flex items-center text-slate-200">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-body">
                        {pkg.id === 'free' ? 'Try before you buy' :
                          pkg.id === 'basic' ? 'Cancel anytime' :
                            'Save $0.02 per credit'}
                      </span>
                    </div>
                    {pkg.id !== 'free' && (
                      <div className="flex items-center text-slate-200">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-body">
                          {pkg.id === 'basic' ? 'Perfect for families' : 'Best for educators & heavy users'}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => pkg.id === 'free' ? window.location.href = '/signup' : handlePurchaseClick(pkg.stripeLink)}
                    variant={pkg.popular ? 'default' : 'secondary'}
                    size="lg"
                    className="w-full"
                  >
                    {pkg.id === 'free' ? 'Start Free' : 'Subscribe Now'}
                  </Button>
                </div>
              ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Extra Credit Bundles */}
      {activeTab === 'subscription' && (
        <>
          <section className="p-section">
            <div className="container-lg">
              <div className="glass-card">
                <h3 className="title-section text-center mb-12">Running Low? Top Up Anytime!</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-amber-400" />
                    </div>
                    <h4 className="title-card mb-2">Instant Delivery</h4>
                    <p className="text-body text-slate-300">Credits added to your account immediately</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h4 className="title-card mb-2">Bulk Discounts</h4>
                    <p className="text-body text-slate-300">Save up to 20% on larger bundles</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-blue-400" />
                    </div>
                    <h4 className="title-card mb-2">Works with All Plans</h4>
                    <p className="text-body text-slate-300">Compatible with free and premium accounts</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="p-section">
            <div className="container-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {extraCredits.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`glass-card relative transition-all duration-300 hover:scale-105 ${pkg.popular ? 'border-amber-400/40 shadow-xl shadow-amber-500/10' : ''
                    }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="title-card mb-3">{pkg.name}</h3>
                    <div className="mb-2">
                      <span className="text-3xl font-bold text-white">{pkg.displayPrice}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-2xl font-semibold text-amber-400">{pkg.credits}</span>
                      <span className="text-body text-slate-300 text-lg"> credits</span>
                    </div>
                    {pkg.savings && (
                      <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-400/30">
                        {pkg.savings}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-slate-200">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-body">{pkg.credits} story chapters</span>
                    </div>
                    <div className="flex items-center text-slate-200">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-body">Add to any plan</span>
                    </div>
                    <div className="flex items-center text-slate-200">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-body">{pkg.price <= 10 ? 'No discount' : pkg.savings}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handlePurchaseClick(pkg.stripeLink)}
                    variant={pkg.popular ? 'default' : 'secondary'}
                    size="lg"
                    className="w-full"
                  >
                    Buy Now
                  </Button>
                </div>
              ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Security Notice */}
      <section className="p-section">
        <div className="container-lg">
          <div className="glass-card text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <CreditCard className="w-6 h-6 text-green-400" />
              <p className="text-body text-lg text-slate-200">
                Secure payments powered by <span className="text-white font-semibold">Stripe</span>
              </p>
            </div>
            <p className="text-body text-slate-300">
              All transactions are encrypted and secure. We never store your payment information.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;