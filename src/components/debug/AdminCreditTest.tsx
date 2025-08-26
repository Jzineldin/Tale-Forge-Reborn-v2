import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthContext';
import { useCredits } from '@/hooks/useCredits';
import Button from '@/components/atoms/Button';

const AdminCreditTest: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { 
    credits, 
    loading, 
    error, 
    spendCredits, 
    canAffordStory,
    processStoryPayment,
    refreshCredits 
  } = useCredits();
  
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testInProgress, setTestInProgress] = useState(false);

  const addTestResult = (message: string, success: boolean = true) => {
    const emoji = success ? '✅' : '❌';
    setTestResults(prev => [...prev, `${emoji} ${message}`]);
  };

  const runAdminCreditTests = async () => {
    setTestInProgress(true);
    setTestResults([]);

    try {
      addTestResult(`Testing user: ${user?.email}`);
      addTestResult(`Is admin: ${isAdmin}`);
      
      // Test 1: Check initial credits
      await refreshCredits();
      if (credits) {
        addTestResult(`Current balance: ${credits.currentBalance} credits`);
        addTestResult(`Total earned: ${credits.totalEarned} credits`);
        addTestResult(`Total spent: ${credits.totalSpent} credits`);
      }

      // Test 2: Test unlimited spending (admin should be able to spend even with low balance)
      addTestResult('Testing unlimited credit spending...');
      const spendResult = await spendCredits(
        50, 
        'Admin credit test - story creation',
        'test-story-1',
        'admin_test'
      );
      addTestResult(`Spend 50 credits result: ${spendResult}`);

      // Test 3: Test story affordability 
      const shortStoryTest = await canAffordStory('short', true, true);
      addTestResult(`Can afford short story: ${shortStoryTest.canAfford} (Cost: ${shortStoryTest.storyCost})`);

      const mediumStoryTest = await canAffordStory('medium', true, true);
      addTestResult(`Can afford medium story: ${mediumStoryTest.canAfford} (Cost: ${mediumStoryTest.storyCost})`);

      const longStoryTest = await canAffordStory('long', true, true);
      addTestResult(`Can afford long story: ${longStoryTest.canAfford} (Cost: ${longStoryTest.storyCost})`);

      // Test 4: Test story payment processing
      const paymentResult = await processStoryPayment('test-story-admin', 'medium', true, true);
      addTestResult(`Story payment processed: ${paymentResult}`);

      // Test 5: Final credit balance check
      await refreshCredits();
      if (credits) {
        addTestResult(`Final balance: ${credits.currentBalance} credits`);
      }

      addTestResult('🎉 Admin credit tests completed!');
      
    } catch (error) {
      addTestResult(`Error during testing: ${error}`, false);
      console.error('Admin credit test error:', error);
    }

    setTestInProgress(false);
  };

  if (!user) {
    return (
      <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-6 m-4">
        <h2 className="text-2xl font-bold text-white mb-4">⚠️ Admin Credit Test</h2>
        <p className="text-red-400">Please log in to test admin credits</p>
      </div>
    );
  }

  return (
    <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-6 m-4">
      <h2 className="text-2xl font-bold text-white mb-4">🔑 Admin Credit System Test</h2>
      
      <div className="mb-6">
        <div className="bg-black/20 border border-white/10 rounded-lg p-4 mb-4">
          <h3 className="text-white font-bold mb-2">Current User Info:</h3>
          <p className="text-white/80">Email: {user.email}</p>
          <p className="text-white/80">Role: {user.role}</p>
          <p className="text-white/80">Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
        </div>

        {credits && !loading && (
          <div className="bg-black/20 border border-white/10 rounded-lg p-4 mb-4">
            <h3 className="text-white font-bold mb-2">Credit Status:</h3>
            <p className="text-green-400 font-bold">Balance: {credits.currentBalance} credits</p>
            <p className="text-white/60">Total Earned: {credits.totalEarned}</p>
            <p className="text-white/60">Total Spent: {credits.totalSpent}</p>
          </div>
        )}

        {loading && (
          <div className="bg-black/20 border border-white/10 rounded-lg p-4 mb-4">
            <p className="text-amber-400">Loading credit data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <Button
          onClick={runAdminCreditTests}
          disabled={testInProgress || loading}
          className="fantasy-btn bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center space-x-2"
        >
          {testInProgress ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Running Tests...</span>
            </>
          ) : (
            <>
              <span>🧪</span>
              <span>Run Admin Credit Tests</span>
            </>
          )}
        </Button>
      </div>

      {testResults.length > 0 && (
        <div className="bg-black/20 border border-white/10 rounded-lg p-4 max-h-96 overflow-y-auto">
          <h3 className="text-white font-bold mb-2">🧪 Test Results:</h3>
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <p key={index} className="text-white/80 text-sm font-mono">
                {result}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCreditTest;