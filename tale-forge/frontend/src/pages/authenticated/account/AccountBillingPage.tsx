import React from 'react';
import { useBilling } from '@/providers/BillingContext';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';

const AccountBillingPage: React.FC = () => {
  const { subscription, billingHistory, subscribeToPlan, cancelSubscription } = useBilling();

  // Mock plans data
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: ['Up to 3 stories', 'Basic story elements', 'Community access'],
      maxStories: 3,
      maxCharacters: 5000
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      features: ['Up to 20 stories', 'Advanced story elements', 'Priority support'],
      maxStories: 20,
      maxCharacters: 50000
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      features: ['Unlimited stories', 'All story elements', 'AI assistance', 'Priority support'],
      maxStories: Infinity,
      maxCharacters: Infinity
    }
  ];

  const handleSubscribe = (planId: string) => {
    subscribeToPlan(planId);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      cancelSubscription();
    }
  };

  return (
    <div className="py-6">
      <div className="mb-8">
        <Text 
          variant="h1" 
          weight="bold" 
          className="text-3xl mb-2"
          id="billing-heading"
        >
          Billing & Subscription
        </Text>
        <Text variant="p" color="secondary">
          Manage your subscription and payment methods
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <Text 
                variant="h2" 
                weight="semibold" 
                className="text-xl"
                id="current-plan-heading"
              >
                Current Plan
              </Text>
            </div>
            
            {subscription ? (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <Text 
                      variant="h3" 
                      weight="semibold" 
                      className="text-lg"
                      id="plan-name"
                    >
                      {subscription.name} Plan
                    </Text>
                    <Text variant="p" color="secondary">
                      ${subscription.price}/month
                    </Text>
                  </div>
                  {subscription.id !== 'free' && (
                    <Button 
                      variant="danger" 
                      onClick={handleCancel}
                      aria-label="Cancel subscription"
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
                
                <div className="mb-6">
                  <Text 
                    variant="h3" 
                    weight="semibold" 
                    className="mb-3"
                    id="plan-features-heading"
                  >
                    Plan Features
                  </Text>
                  <ul 
                    className="space-y-2"
                    aria-labelledby="plan-features-heading"
                  >
                    {subscription.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg 
                          className="h-5 w-5 text-green-500 mr-2" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <Text variant="p">{feature}</Text>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <Text variant="p" color="secondary" className="mb-1">
                      Stories Created
                    </Text>
                    <Text variant="p" weight="semibold">
                      5 of {subscription.maxStories === Infinity ? '∞' : subscription.maxStories}
                    </Text>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <Text variant="p" color="secondary" className="mb-1">
                      Characters Used
                    </Text>
                    <Text variant="p" weight="semibold">
                      2,450 of {subscription.maxCharacters === Infinity ? '∞' : subscription.maxCharacters.toLocaleString()}
                    </Text>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <Text variant="p" color="secondary">
                  You don't have an active subscription.
                </Text>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <Text 
                variant="h2" 
                weight="semibold" 
                className="text-xl"
                id="billing-history-heading"
              >
                Billing History
              </Text>
            </div>
            
            <div className="p-6">
              {billingHistory.length > 0 ? (
                <div className="space-y-4">
                  {billingHistory.map((transaction, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center py-3 border-b border-gray-100"
                      role="listitem"
                    >
                      <div>
                        <Text variant="p" weight="semibold">
                          {transaction.description}
                        </Text>
                        <Text variant="p" size="sm" color="secondary">
                          {new Date(transaction.date).toLocaleDateString()}
                        </Text>
                      </div>
                      <div className="text-right">
                        <Text variant="p" weight="semibold">
                          ${transaction.amount}
                        </Text>
                        <Text variant="p" size="sm" color="secondary">
                          {transaction.status}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Text 
                  variant="p" 
                  color="secondary" 
                  className="text-center py-4"
                  role="status"
                >
                  No billing history available.
                </Text>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <Text 
                variant="h2" 
                weight="semibold" 
                className="text-xl"
                id="upgrade-plan-heading"
              >
                Upgrade Your Plan
              </Text>
            </div>
            
            <div className="p-6 space-y-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`border rounded-lg p-4 ${
                    subscription?.id === plan.id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200'
                  }`}
                  role="region"
                  aria-labelledby={`plan-title-${plan.id}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Text 
                        variant="h3" 
                        weight="semibold"
                        id={`plan-title-${plan.id}`}
                      >
                        {plan.name}
                      </Text>
                      <Text variant="p" color="secondary">
                        ${plan.price}/month
                      </Text>
                    </div>
                    {subscription?.id === plan.id && (
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        aria-label="Current plan"
                      >
                        Current
                      </span>
                    )}
                  </div>
                  
                  <ul 
                    className="space-y-2 mb-4"
                    aria-labelledby={`plan-title-${plan.id}`}
                  >
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg 
                          className="h-4 w-4 text-green-500 mr-2" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <Text variant="p" size="sm">{feature}</Text>
                      </li>
                    ))}
                  </ul>
                  
                  {subscription?.id !== plan.id && (
                    <Button 
                      variant={plan.id === 'free' ? 'secondary' : 'primary'} 
                      className="w-full"
                      onClick={() => handleSubscribe(plan.id)}
                      aria-label={`Subscribe to ${plan.name} plan`}
                    >
                      {plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <Text 
                variant="h2" 
                weight="semibold" 
                className="text-xl"
                id="payment-methods-heading"
              >
                Payment Methods
              </Text>
            </div>
            
            <div className="p-6">
              <Button 
                variant="secondary" 
                className="w-full"
                aria-label="Add payment method"
              >
                + Add Payment Method
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountBillingPage;