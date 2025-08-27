import React, { useState, useEffect } from 'react';
import { CheckCircle, Zap, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { stripeService } from '@/services/stripeService';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import toast from 'react-hot-toast';
import FounderProgramBanner from '@/components/molecules/FounderProgramBanner';

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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

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
      name: 'Free Tier',
      credits: 10,
      price: 0,
      displayPrice: 'Free',
      stripeLink: '#'
    },
    {
      id: 'starter',
      name: 'Starter',
      credits: 100,
      price: 9.99,
      displayPrice: '$9.99/mo',
      stripeLink: '#' // Will use stripeService
    },
    {
      id: 'premium',
      name: 'Premium',
      credits: 300,
      price: 19.99,
      displayPrice: '$19.99/mo',
      popular: true,
      savings: 'Best Value - 3X More Credits!',
      stripeLink: '#' // Will use stripeService
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

  const handleSubscriptionClick = async (planId: string) => {
    // Check if user is authenticated
    if (!user) {
      // Save the intended plan and redirect to signup
      localStorage.setItem('intendedPlan', planId);
      navigate('/signup');
      return;
    }

    setLoading(true);
    try {
      const { sessionUrl } = await stripeService.createCheckoutSession(
        planId,
        `${window.location.origin}/payment/success`,
        `${window.location.origin}/pricing`
      );

      // Redirect to Stripe checkout
      window.location.href = sessionUrl;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast.error(error.message || 'Failed to start checkout process');
      setLoading(false);
    }
  };

  const handleCreditPurchase = async (productId: string) => {
    // Check if user is authenticated
    if (!user) {
      // Save the intended product and redirect to signup
      localStorage.setItem('intendedProduct', productId);
      navigate('/signup');
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('create-checkout-session', {
        body: {
          productId,
          mode: 'payment', // One-time payment for credits
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/pricing`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      window.location.href = response.data.sessionUrl;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast.error(error.message || 'Failed to start checkout process');
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <section className="p-section text-center">
        <div className="container-lg">
          <Card className="glass-card">
            <h1 className="title-hero mb-6">
              Choose Your Plan
            </h1>
            <p className="text-body text-xl max-w-3xl mx-auto mb-4 text-slate-200">
              Create unlimited AI-powered stories with our flexible credit system
            </p>
            <p className="text-body text-lg max-w-2xl mx-auto mb-8 text-amber-300">
              📖 1 credit = 1 chapter • 🎙️ TTS narration: 1 credit per 100 words
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
          </Card>
        </div>
      </section>

      {/* Founder Program Banner */}
      <section className="p-section">
        <div className="container-lg">
          <FounderProgramBanner />
        </div>
      </section>

      {/* Monthly Plans */}
      {activeTab === 'packages' && (
        <>
          <section className="p-section">
            <div className="container-lg">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="title-section text-center mb-12">How Credits Work</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-amber-400" />
                    </div>
                    <h4 className="title-card mb-2">1 Credit = 1 Chapter</h4>
                    <p className="text-body text-slate-300">Includes AI story text + beautiful AI illustration</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h4 className="title-card mb-2">Voice Narration</h4>
                    <p className="text-body text-slate-300">1 credit per 100 words of narration</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-blue-400" />
                    </div>
                    <h4 className="title-card mb-2">Credits Never Expire</h4>
                    <p className="text-body text-slate-300">Use them at your own pace, build your library!</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="p-section">
            <div className="container-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {monthlyPlans.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`glass-card relative transition-all duration-300 hover:scale-105 flex flex-col ${pkg.popular ? 'border-amber-400/40 shadow-xl shadow-amber-500/10' : ''
                      }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    <CardHeader className="text-center">
                      <CardTitle className="title-card mb-4">{pkg.name}</CardTitle>
                      <CardDescription>
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
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4 mb-auto">
                      <div className="flex items-center text-slate-200">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-body">
                          {pkg.id === 'free' ? '10 chapters (or ~5 with narration)' :
                            pkg.id === 'starter' ? '100 chapters (or ~50 with narration)' :
                              '300 chapters (or ~150 with narration)'}
                        </span>
                      </div>
                      <div className="flex items-center text-slate-200">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-body">
                          {pkg.id === 'free' ? 'Perfect for trying Tale Forge' :
                            pkg.id === 'starter' ? 'Great for families (10-20 stories)' :
                              'Ideal for educators (30-60 stories)'}
                        </span>
                      </div>
                      <div className="flex items-center text-slate-200">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-body">
                          {pkg.id === 'free' ? 'No credit card required' :
                            'Professional TTS narration available'}
                        </span>
                      </div>
                      <div className="flex items-center text-slate-200">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-body">
                          {pkg.id === 'free' ? '1 complete story per month' :
                            pkg.id === 'starter' ? 'Mix chapters & narration freely' :
                              '10% discount on extra credits'}
                        </span>
                      </div>
                      {pkg.id !== 'free' && (
                        <div className="flex items-center text-slate-200">
                          <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                          <span className="text-body">
                            {pkg.id === 'starter' ? 'Cancel anytime' : 'Priority support included'}
                          </span>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter>
                      <Button
                        onClick={() => pkg.id === 'free' ? navigate('/signup') : handleSubscriptionClick(pkg.id)}
                        size="lg"
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold ${!pkg.popular ? 'opacity-90 hover:opacity-100' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {loading ? 'Processing...' : pkg.id === 'free' ? 'Start Free' : 'Subscribe Now'}
                      </Button>
                    </CardFooter>
                  </Card>
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
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="title-section text-center mb-12">Need More Credits? Top Up Anytime!</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    <h4 className="title-card mb-2">Flexible Usage</h4>
                    <p className="text-body text-slate-300">Use for chapters or TTS narration</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-blue-400" />
                    </div>
                    <h4 className="title-card mb-2">Bulk Savings</h4>
                    <p className="text-body text-slate-300">Save more with larger bundles</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="p-section">
            <div className="container-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {extraCredits.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`glass-card relative transition-all duration-300 hover:scale-105 flex flex-col ${pkg.popular ? 'border-amber-400/40 shadow-xl shadow-amber-500/10' : ''
                      }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    <CardHeader className="text-center">
                      <CardTitle className="title-card mb-3">{pkg.name}</CardTitle>
                      <CardDescription>
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
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3 mb-auto">
                      <div className="flex items-center text-slate-200">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-body text-sm">
                          {pkg.credits} chapters (or ~{Math.floor(pkg.credits / 2)} with TTS)
                        </span>
                      </div>
                      <div className="flex items-center text-slate-200">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-body text-sm">Works with any plan</span>
                      </div>
                      <div className="flex items-center text-slate-200">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-body text-sm">Never expires</span>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button
                        onClick={() => handleCreditPurchase(pkg.id)}
                        variant="default"
                        size="lg"
                        disabled={loading}
                        className={`w-full ${!pkg.popular ? 'opacity-90 hover:opacity-100' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {loading ? 'Processing...' : 'Buy Now'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Security Notice */}
      <section className="p-section">
        <div className="container-lg">
          <Card className="glass-card text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <CreditCard className="w-6 h-6 text-green-400" />
                <p className="text-body text-lg text-slate-200">
                  Secure payments powered by <span className="text-white font-semibold">Stripe</span>
                </p>
              </div>
              <p className="text-body text-slate-300">
                All transactions are encrypted and secure. We never store your payment information.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;