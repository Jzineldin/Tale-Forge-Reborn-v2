import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StandardPage, UnifiedCard } from '@/components/design-system';
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
    <StandardPage 
      title="Payment Successful!"
      subtitle="Your credits have been added to your account"
      icon="🎉"
      containerSize="small"
    >
      <UnifiedCard variant="enhanced" className="text-center py-12">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <CheckCircle className="w-24 h-24 text-green-500" />
            <Sparkles className="w-8 h-8 text-amber-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          Thank You for Your Purchase!
        </h2>
        
        <p className="text-white/80 text-lg mb-8">
          Your payment has been processed successfully.
        </p>
        
        {credits !== null && (
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-6 mb-8">
            <p className="text-white/70 mb-2">Current Credit Balance:</p>
            <div className="text-4xl font-bold text-amber-400">
              {credits} Credits
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/create')}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center mx-auto"
          >
            Start Creating Stories
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition-all block mx-auto"
          >
            Go to Dashboard
          </button>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl mb-2">📖</div>
              <p className="text-white/90 font-medium mb-1">Create Stories</p>
              <p className="text-white/60 text-sm">Use your credits to generate amazing stories</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl mb-2">🎨</div>
              <p className="text-white/90 font-medium mb-1">Add Illustrations</p>
              <p className="text-white/60 text-sm">Bring stories to life with AI images</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl mb-2">🎧</div>
              <p className="text-white/90 font-medium mb-1">Add Narration</p>
              <p className="text-white/60 text-sm">Professional voice narration for your stories</p>
            </div>
          </div>
        </div>
      </UnifiedCard>
    </StandardPage>
  );
};

export default PaymentSuccessPage;