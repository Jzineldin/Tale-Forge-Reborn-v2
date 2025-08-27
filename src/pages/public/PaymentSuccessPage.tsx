import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/providers/AuthContext';
import { supabase } from '@/lib/supabase';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);
  
  useEffect(() => {
    const checkPayment = async () => {
      // Get session ID from URL params (Stripe sends this)
      const sessionId = searchParams.get('session_id');
      
      if (sessionId && user) {
        try {
          // Fetch user's current credit balance
          const { data, error } = await supabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', user.id)
            .single();
            
          if (!error && data) {
            setCredits(data.balance);
          }
        } catch (err) {
          console.error('Error fetching credits:', err);
        }
      }
      
      setLoading(false);
    };
    
    checkPayment();
  }, [searchParams, user]);

  return (
    <div className="page-container">
      <section className="p-section text-center">
        <div className="container-lg">
          <div className="glass-card max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="title-hero mb-4">Payment Successful!</h1>
            <p className="text-body text-lg">Your credits have been added to your account</p>
          </div>
        </div>
      </section>

      <section className="p-section">
        <div className="container-lg">
          <div className="glass-card text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <CheckCircle className="w-24 h-24 text-green-500" />
                <Sparkles className="w-8 h-8 text-amber-400 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            
            <h2 className="title-section mb-4">
              Thank You for Your Purchase!
            </h2>
            
            <p className="text-body text-lg mb-8">
              Your payment has been processed successfully.
            </p>
            
            {credits !== null && (
              <div className="glass-card border border-amber-400/30 mb-8">
                <p className="text-body-sm mb-2">Current Credit Balance:</p>
                <div className="stat-value-large text-amber-400">
                  {credits} Credits
                </div>
              </div>
            )}
            
            <div className="space-y-4 mb-12">
              <Button
                onClick={() => navigate('/create')}
                variant="primary"
                size="large"
                className="w-full sm:w-auto"
              >
                Start Creating Stories
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                onClick={() => navigate('/dashboard')}
                variant="secondary"
                size="large"
                className="w-full sm:w-auto"
              >
                Go to Dashboard
              </Button>
            </div>
            
            <div className="pt-8 border-t border-white/10">
              <h3 className="title-card mb-6">What's Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="glass-card">
                  <div className="text-4xl mb-3">📖</div>
                  <h4 className="title-card-small mb-2">Create Stories</h4>
                  <p className="text-body-xs">Use your credits to generate amazing stories</p>
                </div>
                <div className="glass-card">
                  <div className="text-4xl mb-3">🎨</div>
                  <h4 className="title-card-small mb-2">Add Illustrations</h4>
                  <p className="text-body-xs">Bring stories to life with AI images</p>
                </div>
                <div className="glass-card">
                  <div className="text-4xl mb-3">🎧</div>
                  <h4 className="title-card-small mb-2">Add Narration</h4>
                  <p className="text-body-xs">Professional voice narration for your stories</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaymentSuccessPage;