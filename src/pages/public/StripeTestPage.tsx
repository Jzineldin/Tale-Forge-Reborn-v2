import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { stripeService } from '@/services/stripeService';
import { supabase } from '@/lib/supabase';
import { Loader2, CreditCard, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function StripeTestPage() {
  const [loading, setLoading] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [creditPackages] = useState([
    { id: 'starter', name: 'Starter Pack', credits: 50, price: 5 },
    { id: 'popular', name: 'Popular Pack', credits: 100, price: 10 },
    { id: 'value', name: 'Value Pack', credits: 250, price: 20 },
    { id: 'mega', name: 'Mega Pack', credits: 500, price: 35 },
  ]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    loadSubscriptionData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    if (session) {
      loadUserCredits(session.user.id);
    }
  };

  const loadUserCredits = async (userId: string) => {
    const { data } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    if (data) {
      setUserCredits(data.balance);
    }
  };

  const loadSubscriptionData = async () => {
    try {
      const plans = await stripeService.getSubscriptionPlans();
      setSubscriptionPlans(plans);
      
      const subscription = await stripeService.getUserSubscription();
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    }
  };

  const handleCreditPurchase = async (packageType: string) => {
    setLoading(true);
    try {
      // Map package type to product ID (these would be your actual Stripe product IDs)
      const productMap: Record<string, string> = {
        starter: 'prod_SvymmYp2coYnM0',
        popular: 'prod_Svym6HPv40z2k1',
        value: 'prod_SvymqbrtoB9AxI',
        mega: 'prod_Svyn8Cpibzu67p',
      };

      // Create a checkout session for one-time payment
      const response = await supabase.functions.invoke('create-checkout-session', {
        body: {
          mode: 'payment',
          productId: productMap[packageType],
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/credits`,
        },
      });

      if (response.data?.sessionUrl) {
        window.location.href = response.data.sessionUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start checkout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionPurchase = async (planId: string) => {
    setLoading(true);
    try {
      const { sessionUrl } = await stripeService.createCheckoutSession(
        planId,
        `${window.location.origin}/payment-success?subscription=true`,
        `${window.location.origin}/stripe-test`
      );

      if (sessionUrl) {
        window.location.href = sessionUrl;
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start subscription checkout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const portalUrl = await stripeService.openCustomerPortal();
      window.open(portalUrl, '_blank');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to open customer portal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-12">
        <Alert>
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please sign in to test Stripe payments.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Stripe Integration Test</h1>
        <p className="text-lg text-muted-foreground">
          Test payment flows for credits and subscriptions
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Credits Balance:</span>
            <span className="font-bold">{userCredits} credits</span>
          </div>
          <div className="flex justify-between">
            <span>Subscription:</span>
            <span className="font-bold">
              {currentSubscription ? (
                <span className="text-green-600">
                  {currentSubscription.planName} (Active)
                </span>
              ) : (
                <span className="text-gray-500">No active subscription</span>
              )}
            </span>
          </div>
        </CardContent>
        {currentSubscription && (
          <CardFooter>
            <Button onClick={handleManageSubscription} variant="outline" className="w-full">
              Manage Subscription
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Credit Packages */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Credit Packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {creditPackages.map((pkg) => (
            <Card key={pkg.id}>
              <CardHeader>
                <CardTitle>{pkg.name}</CardTitle>
                <CardDescription>{pkg.credits} Credits</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">${pkg.price}</p>
                <p className="text-sm text-muted-foreground">
                  ${(pkg.price / pkg.credits * 100).toFixed(0)}¢ per credit
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleCreditPurchase(pkg.id)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Purchase
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Subscription Plans */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <Card key={plan.id} className={currentSubscription?.planId === plan.id ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {plan.creditsIncluded} credits per month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">${plan.price}/mo</p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {currentSubscription?.planId === plan.id ? (
                  <Button disabled variant="secondary" className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscriptionPurchase(plan.id)}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Subscribe'
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Test Webhook */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Status</CardTitle>
          <CardDescription>
            Webhook endpoint configured at: https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/stripe-webhook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              After making a test purchase, check the Stripe Dashboard webhook logs to verify events are being received.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}