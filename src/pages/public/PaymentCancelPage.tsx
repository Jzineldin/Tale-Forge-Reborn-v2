import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StandardPage, UnifiedCard } from '@/components/design-system';
import { XCircle, ShoppingCart, ArrowLeft } from 'lucide-react';

const PaymentCancelPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <StandardPage 
      title="Payment Cancelled"
      subtitle="Your purchase was not completed"
      icon="🛍️"
      containerSize="small"
    >
      <UnifiedCard variant="glass" className="text-center py-12">
        <div className="flex justify-center mb-6">
          <XCircle className="w-24 h-24 text-red-400" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          Payment Cancelled
        </h2>
        
        <p className="text-white/80 text-lg mb-8">
          Your payment was cancelled and no charges were made to your account.
        </p>
        
        <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-6 mb-8">
          <p className="text-white/90 mb-2">💡 Did you know?</p>
          <p className="text-white/70">
            You can start with our free tier and get 15 credits every month - enough to create 2-3 complete stories!
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/pricing')}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center mx-auto"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            View Credit Packages
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return Home
          </button>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Why Purchase Credits?</h3>
          <div className="space-y-3 text-left max-w-md mx-auto">
            <div className="flex items-start">
              <span className="text-green-400 mr-3 mt-1">✓</span>
              <p className="text-white/80">Create unlimited personalized stories</p>
            </div>
            <div className="flex items-start">
              <span className="text-green-400 mr-3 mt-1">✓</span>
              <p className="text-white/80">Add beautiful AI-generated illustrations</p>
            </div>
            <div className="flex items-start">
              <span className="text-green-400 mr-3 mt-1">✓</span>
              <p className="text-white/80">Professional voice narration for every story</p>
            </div>
            <div className="flex items-start">
              <span className="text-green-400 mr-3 mt-1">✓</span>
              <p className="text-white/80">Credits never expire - use at your own pace</p>
            </div>
          </div>
        </div>
      </UnifiedCard>
      
      <UnifiedCard variant="glass" className="text-center mt-6">
        <p className="text-white/70">
          Need help? Contact our support team at{' '}
          <a href="mailto:support@taleforge.com" className="text-amber-400 hover:text-amber-500">
            support@taleforge.com
          </a>
        </p>
      </UnifiedCard>
    </StandardPage>
  );
};

export default PaymentCancelPage;