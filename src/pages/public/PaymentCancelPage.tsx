import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import { XCircle, ShoppingCart, ArrowLeft } from 'lucide-react';

const PaymentCancelPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <section className="p-section text-center">
        <div className="container-lg">
          <div className="glass-card max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🛍️</div>
            <h1 className="title-hero mb-4">Payment Cancelled</h1>
            <p className="text-body text-lg">Your purchase was not completed</p>
          </div>
        </div>
      </section>

      <section className="p-section">
        <div className="container-lg">
          <div className="glass-card text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <XCircle className="w-24 h-24 text-red-400" />
            </div>
            
            <h2 className="title-section mb-4">
              Payment Cancelled
            </h2>
            
            <p className="text-body text-lg mb-8">
              Your payment was cancelled and no charges were made to your account.
            </p>
            
            <div className="glass-card border border-blue-400/30 mb-8">
              <p className="text-body font-medium mb-2">💡 Did you know?</p>
              <p className="text-body-sm">
                You can start with our free tier and get 15 credits every month - enough to create 2-3 complete stories!
              </p>
            </div>
            
            <div className="space-y-4 mb-12">
              <Button
                onClick={() => navigate('/pricing')}
                variant="primary"
                size="large"
                className="w-full sm:w-auto"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                View Credit Packages
              </Button>
              
              <Button
                onClick={() => navigate('/')}
                variant="secondary"
                size="large"
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Return Home
              </Button>
            </div>
            
            <div className="pt-8 border-t border-white/10">
              <h3 className="title-card mb-6">Why Purchase Credits?</h3>
              <div className="space-y-3 text-left max-w-md mx-auto">
                <div className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1">✓</span>
                  <p className="text-body-sm">Create unlimited personalized stories</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1">✓</span>
                  <p className="text-body-sm">Add beautiful AI-generated illustrations</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1">✓</span>
                  <p className="text-body-sm">Professional voice narration for every story</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1">✓</span>
                  <p className="text-body-sm">Credits never expire - use at your own pace</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-card text-center mt-6 max-w-2xl mx-auto">
            <p className="text-body-sm">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@taleforge.com" className="text-amber-400 hover:text-amber-500">
                support@taleforge.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaymentCancelPage;