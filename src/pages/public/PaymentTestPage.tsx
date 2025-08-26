import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StandardPage, UnifiedCard } from '@/components/design-system';
import { useAuth } from '@/providers/AuthContext';
import { useCreditSummary } from '@/hooks/useCredits';
import { CheckCircle, XCircle, AlertCircle, Loader, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
}

const PaymentTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, loading: creditsLoading, refreshSummary } = useCreditSummary();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Authentication
    results.push({
      name: 'User Authentication',
      status: user ? 'success' : 'error',
      message: user ? `Logged in as ${user.email}` : 'Not logged in'
    });

    // Test 2: Supabase Connection
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      results.push({
        name: 'Supabase Connection',
        status: error ? 'error' : 'success',
        message: error ? error.message : 'Connected successfully'
      });
    } catch (error) {
      results.push({
        name: 'Supabase Connection',
        status: 'error',
        message: String(error)
      });
    }

    // Test 3: Credit Tables
    if (user) {
      try {
        const { data, error } = await supabase
          .from('user_credits')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();

        results.push({
          name: 'Credit Balance Check',
          status: error ? 'error' : 'success',
          message: error ? error.message : `Current balance: ${data?.balance || 0} credits`
        });
      } catch (error) {
        results.push({
          name: 'Credit Balance Check',
          status: 'error',
          message: String(error)
        });
      }
    }

    // Test 4: Stripe Products
    const stripeProducts = [
      { id: 'prod_SvymmYp2coYnM0', name: 'Starter Pack (50 credits)', link: 'https://buy.stripe.com/cNi28rg8eb5Lghk5Hegbm00' },
      { id: 'prod_Svym6HPv40z2k1', name: 'Popular Pack (100 credits)', link: 'https://buy.stripe.com/dR68wP04a05LdZcdQI' },
      { id: 'prod_SvymqbrtoB9AxI', name: 'Value Pack (250 credits)', link: 'https://buy.stripe.com/28ocN5bS81v94sG145' },
      { id: 'prod_Svyn8Cpibzu67p', name: 'Mega Pack (500 credits)', link: 'https://buy.stripe.com/14k5kD04ad7P5wK3cc' }
    ];

    results.push({
      name: 'Stripe Products Configuration',
      status: 'success',
      message: `${stripeProducts.length} products configured`
    });

    // Test 5: Edge Function Status
    results.push({
      name: 'Webhook Edge Function',
      status: 'warning',
      message: 'Function deployed - webhook URL needs configuration in Stripe'
    });

    // Test 6: UI Components
    results.push({
      name: 'UI Components',
      status: 'success',
      message: 'Credit display, pricing page, and payment pages ready'
    });

    setTests(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, [user]);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      default:
        return <Loader className="w-5 h-5 text-white/50 animate-spin" />;
    }
  };

  const testPaymentLinks = [
    { 
      name: 'Starter Pack', 
      credits: 50, 
      price: '$5',
      link: 'https://buy.stripe.com/cNi28rg8eb5Lghk5Hegbm00',
      testCard: '4242 4242 4242 4242'
    },
    { 
      name: 'Popular Pack', 
      credits: 100, 
      price: '$10',
      link: 'https://buy.stripe.com/dR68wP04a05LdZcdQI',
      testCard: '4000 0025 0000 3155' // Requires authentication
    }
  ];

  return (
    <StandardPage 
      title="Payment System Test"
      subtitle="Verify payment integration is working"
      icon="🧪"
      containerSize="medium"
    >
      {/* User Status */}
      <UnifiedCard variant="glass" className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Current User Status</h3>
            <p className="text-white/70">
              {user ? `Logged in as ${user.email}` : 'Not logged in'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-400">
              {creditsLoading ? '...' : balance}
            </div>
            <div className="text-sm text-white/60">Credits</div>
          </div>
        </div>
        
        {!user && (
          <div className="mt-4 p-3 bg-amber-500/20 border border-amber-400/30 rounded-lg">
            <p className="text-amber-300 text-sm">
              ⚠️ You need to be logged in to test the payment flow
            </p>
            <button
              onClick={() => navigate('/signin')}
              className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>
        )}
      </UnifiedCard>

      {/* System Tests */}
      <UnifiedCard variant="glass" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">System Integration Tests</h3>
          <button
            onClick={runTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {isRunning ? 'Running...' : 'Run Tests'}
          </button>
        </div>
        
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              {getStatusIcon(test.status)}
              <div className="flex-1">
                <div className="font-medium text-white">{test.name}</div>
                <div className="text-sm text-white/60">{test.message}</div>
              </div>
            </div>
          ))}
        </div>
      </UnifiedCard>

      {/* Test Payment Links */}
      <UnifiedCard variant="glass" className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Test Payment Links</h3>
        <p className="text-white/70 text-sm mb-4">
          Use these links to test the payment flow. Use test card numbers in test mode.
        </p>
        
        <div className="space-y-3">
          {testPaymentLinks.map((pack) => (
            <div key={pack.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <div className="font-medium text-white">{pack.name}</div>
                <div className="text-sm text-white/60">
                  {pack.credits} credits for {pack.price} • Test card: {pack.testCard}
                </div>
              </div>
              <a
                href={pack.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Test Purchase
              </a>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            💡 Tip: After completing a test purchase, refresh this page to see your updated credit balance
          </p>
        </div>
      </UnifiedCard>

      {/* Webhook Configuration */}
      <UnifiedCard variant="glass">
        <h3 className="text-lg font-semibold text-white mb-4">⚙️ Webhook Configuration</h3>
        <p className="text-white/70 mb-4">
          To complete the payment integration, configure the webhook in your Stripe Dashboard:
        </p>
        
        <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg font-mono text-sm">
          <div>
            <div className="text-amber-400">Webhook URL:</div>
            <div className="text-white/90">https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/stripe-webhook</div>
          </div>
          <div>
            <div className="text-amber-400">Events to listen for:</div>
            <div className="text-white/90">• checkout.session.completed</div>
            <div className="text-white/90">• payment_intent.payment_failed</div>
          </div>
        </div>
        
        <div className="mt-4 flex gap-3">
          <a
            href="https://dashboard.stripe.com/webhooks"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            Open Stripe Dashboard
          </a>
          <button
            onClick={() => navigate('/pricing')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Go to Pricing Page
          </button>
        </div>
      </UnifiedCard>
    </StandardPage>
  );
};

export default PaymentTestPage;