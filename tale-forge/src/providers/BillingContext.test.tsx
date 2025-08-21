import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BillingProvider, useBilling } from './BillingContext';

// Test component that uses the billing context
const TestComponent: React.FC = () => {
  const { 
    subscription, 
    billingHistory, 
    isLoading,
    subscribeToPlan, 
    cancelSubscription
  } = useBilling();
  
  return (
    <div>
      <div data-testid="loading-status">
        {isLoading ? 'Loading' : 'Loaded'}
      </div>
      <div data-testid="subscription-name">
        {subscription ? subscription.name : 'No Subscription'}
      </div>
      <div data-testid="billing-history-count">
        {billingHistory.length}
      </div>
      <button onClick={() => subscribeToPlan('premium')}>
        Subscribe to Premium
      </button>
      <button onClick={cancelSubscription}>
        Cancel Subscription
      </button>
    </div>
  );
};

describe('BillingContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('provides initial state', () => {
    render(
      <BillingProvider>
        <TestComponent />
      </BillingProvider>
    );
    
    expect(screen.getByTestId('loading-status')).toHaveTextContent('Loaded');
    expect(screen.getByTestId('subscription-name')).toHaveTextContent('No Subscription');
    expect(screen.getByTestId('billing-history-count')).toHaveTextContent('0');
  });

  test('subscribes to a plan', async () => {
    const user = userEvent.setup();
    
    render(
      <BillingProvider>
        <TestComponent />
      </BillingProvider>
    );
    
    // Initially no subscription
    expect(screen.getByTestId('subscription-name')).toHaveTextContent('No Subscription');
    
    // Subscribe to premium plan
    await user.click(screen.getByText('Subscribe to Premium'));
    
    // Should now have premium subscription
    await waitFor(() => {
      expect(screen.getByTestId('subscription-name')).toHaveTextContent('Premium');
    });
    
    // Should have one billing history item
    expect(screen.getByTestId('billing-history-count')).toHaveTextContent('1');
  });

  test('cancels subscription', async () => {
    const user = userEvent.setup();
    
    render(
      <BillingProvider>
        <TestComponent />
      </BillingProvider>
    );
    
    // Subscribe to premium plan first
    await user.click(screen.getByText('Subscribe to Premium'));
    
    await waitFor(() => {
      expect(screen.getByTestId('subscription-name')).toHaveTextContent('Premium');
    });
    
    // Cancel subscription
    await user.click(screen.getByText('Cancel Subscription'));
    
    // Should now have no subscription
    await waitFor(() => {
      expect(screen.getByTestId('subscription-name')).toHaveTextContent('No Subscription');
    });
  });

  test('loads subscription from localStorage', async () => {
    // Set up localStorage with a subscription
    const mockSubscription = {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      features: ['Unlimited stories', 'All story elements'],
      maxStories: Infinity,
      maxCharacters: Infinity
    };
    
    localStorage.setItem('subscription', JSON.stringify(mockSubscription));
    
    render(
      <BillingProvider>
        <TestComponent />
      </BillingProvider>
    );
    
    // Should load the subscription from localStorage
    await waitFor(() => {
      expect(screen.getByTestId('subscription-name')).toHaveTextContent('Premium');
    });
  });
});