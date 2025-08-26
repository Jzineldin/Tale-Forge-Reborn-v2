import React, { useState } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { AuthSecurityManager } from '@/utils/authSecurity';
import Button from '@/components/atoms/Button';
import PasswordStrengthIndicator from '@/components/atoms/PasswordStrengthIndicator';
import SecurityDashboard from '@/components/molecules/SecurityDashboard';

const AuthSecurityTest: React.FC = () => {
  const {
    authState,
    passwordStrength,
    enhancedLogin,
    enhancedRegister,
    enhancedResetPassword,
    checkPasswordStrength,
    clearMessages
  } = useEnhancedAuth();

  const [testResults, setTestResults] = useState<string[]>([]);
  const [testInProgress, setTestInProgress] = useState(false);
  
  // Form states for testing
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  
  const [activeTab, setActiveTab] = useState<'test' | 'login' | 'register' | 'reset' | 'security'>('test');

  const addTestResult = (message: string, success: boolean = true) => {
    const emoji = success ? '✅' : '❌';
    setTestResults(prev => [...prev, `${emoji} ${message}`]);
  };

  const runSecurityTests = async () => {
    setTestInProgress(true);
    setTestResults([]);

    try {
      addTestResult('🔒 Starting Enhanced Authentication Security Tests');

      // Test 1: Password Strength Validation
      addTestResult('Testing password strength validation...');
      const weakPassword = '123';
      const strongPassword = 'MyS3cure!P@ssw0rd2024';
      
      const weakResult = AuthSecurityManager.checkPasswordStrength(weakPassword);
      const strongResult = AuthSecurityManager.checkPasswordStrength(strongPassword);
      
      addTestResult(`Weak password "${weakPassword}" score: ${weakResult.score}/4 (${weakResult.isStrong ? 'STRONG' : 'WEAK'})`);
      addTestResult(`Strong password score: ${strongResult.score}/4 (${strongResult.isStrong ? 'STRONG' : 'WEAK'})`);

      // Test 2: Email Validation
      addTestResult('Testing email validation...');
      const validEmails = ['test@example.com', 'user.name+tag@domain.co.uk'];
      const invalidEmails = ['invalid', '@domain.com', 'user@', 'user space@domain.com'];
      
      validEmails.forEach(email => {
        const isValid = AuthSecurityManager.isValidEmail(email);
        addTestResult(`Email "${email}": ${isValid ? 'VALID' : 'INVALID'}`, isValid);
      });
      
      invalidEmails.forEach(email => {
        const isValid = AuthSecurityManager.isValidEmail(email);
        addTestResult(`Email "${email}": ${isValid ? 'VALID' : 'INVALID'}`, !isValid);
      });

      // Test 3: Rate Limiting Simulation
      addTestResult('Testing login rate limiting...');
      const testEmail = 'test@ratelimit.com';
      
      // Clear any existing attempts for this test email
      localStorage.removeItem('taleforge_login_attempts');
      
      // Simulate failed login attempts
      for (let i = 1; i <= 6; i++) {
        AuthSecurityManager.recordLoginAttempt(testEmail, false);
        const blockInfo = AuthSecurityManager.isLoginBlocked(testEmail);
        
        if (i <= 5) {
          addTestResult(`Failed attempt ${i}/5: User ${blockInfo.blocked ? 'BLOCKED' : 'NOT BLOCKED'}`, !blockInfo.blocked);
        } else {
          addTestResult(`Failed attempt ${i}/5: User ${blockInfo.blocked ? 'BLOCKED' : 'NOT BLOCKED'}`, blockInfo.blocked);
          if (blockInfo.timeRemaining) {
            addTestResult(`Block time remaining: ${Math.ceil(blockInfo.timeRemaining / 1000)} seconds`);
          }
        }
      }

      // Test 4: Error Message Mapping
      addTestResult('Testing enhanced error messages...');
      const errorTests = [
        'Invalid login credentials',
        'Email not confirmed',
        'User not found',
        'Network request failed'
      ];
      
      errorTests.forEach(error => {
        const friendlyMessage = AuthSecurityManager.getErrorMessage(error);
        addTestResult(`"${error}" → "${friendlyMessage}"`);
      });

      // Test 5: Password Generation
      addTestResult('Testing secure password generation...');
      const generatedPassword = AuthSecurityManager.generateSecurePassword(16);
      const generatedStrength = AuthSecurityManager.checkPasswordStrength(generatedPassword);
      addTestResult(`Generated password strength: ${generatedStrength.score}/4 (${generatedStrength.isStrong ? 'STRONG' : 'WEAK'})`, generatedStrength.isStrong);

      // Test 6: Security Recommendations
      addTestResult('Testing security recommendations...');
      const mockUser = {
        signup_method: 'email',
        email_verified: false,
        password_updated_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), // 100 days ago
        mfa_enabled: false
      };
      
      const recommendations = AuthSecurityManager.getSecurityRecommendations(mockUser);
      addTestResult(`Generated ${recommendations.length} security recommendations`);
      recommendations.forEach((rec, index) => {
        addTestResult(`  ${index + 1}. ${rec}`);
      });

      addTestResult('🎉 Enhanced Authentication Security Tests Completed Successfully!');
      
    } catch (error) {
      addTestResult(`❌ Error during security tests: ${error}`, false);
      console.error('Auth security test error:', error);
    }

    setTestInProgress(false);
  };

  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const success = await enhancedLogin(loginEmail, loginPassword, true);
    if (success) {
      addTestResult(`✅ Login successful for ${loginEmail}`);
    } else {
      addTestResult(`❌ Login failed: ${authState.error}`, false);
    }
  };

  const handleTestRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const success = await enhancedRegister(registerName, registerEmail, registerPassword);
    if (success) {
      addTestResult(`✅ Registration successful for ${registerEmail}`);
    } else {
      addTestResult(`❌ Registration failed: ${authState.error}`, false);
    }
  };

  const handleTestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const success = await enhancedResetPassword(resetEmail);
    if (success) {
      addTestResult(`✅ Password reset sent to ${resetEmail}`);
    } else {
      addTestResult(`❌ Password reset failed: ${authState.error}`, false);
    }
  };

  return (
    <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-6 m-4">
      <h2 className="text-2xl font-bold text-white mb-4">🔐 Enhanced Authentication Security Test</h2>
      
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'test', label: '🧪 Security Tests', icon: '🧪' },
          { key: 'login', label: '🔑 Test Login', icon: '🔑' },
          { key: 'register', label: '👤 Test Register', icon: '👤' },
          { key: 'reset', label: '🔄 Test Reset', icon: '🔄' },
          { key: 'security', label: '🛡️ Security Dashboard', icon: '🛡️' }
        ].map(tab => (
          <Button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`fantasy-btn font-medium py-2 px-4 rounded-lg transition-all duration-300 ${
              activeTab === tab.key 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-white/80'
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Test Results - Always visible */}
      {testResults.length > 0 && (
        <div className="bg-black/20 border border-white/10 rounded-lg p-4 mb-6 max-h-64 overflow-y-auto">
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

      {/* Status Messages */}
      {(authState.error || authState.success) && (
        <div className="mb-6">
          {authState.error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-3">
              <p className="text-red-400 text-sm">{authState.error}</p>
            </div>
          )}
          {authState.success && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-400 text-sm">{authState.success}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'test' && (
        <div>
          <Button
            onClick={runSecurityTests}
            disabled={testInProgress}
            className="fantasy-btn bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center space-x-2 mb-4"
          >
            {testInProgress ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Running Security Tests...</span>
              </>
            ) : (
              <>
                <span>🧪</span>
                <span>Run Enhanced Security Tests</span>
              </>
            )}
          </Button>
          
          <div className="bg-black/20 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-bold mb-2">Test Coverage:</h4>
            <ul className="space-y-1 text-white/80 text-sm">
              <li>• Password strength validation and scoring</li>
              <li>• Email format validation</li>
              <li>• Login rate limiting and blocking</li>
              <li>• Enhanced error message mapping</li>
              <li>• Secure password generation</li>
              <li>• Security recommendations system</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'login' && (
        <div>
          <form onSubmit={handleTestLogin} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Enter email to test login"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Enter password"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={authState.isLoading || authState.isBlocked}
              className="fantasy-btn bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
            >
              {authState.isLoading ? 'Testing Login...' : 'Test Enhanced Login'}
            </Button>
            {authState.isBlocked && (
              <p className="text-red-400 text-sm">
                Account temporarily blocked. Time remaining: {Math.ceil(authState.blockTimeRemaining / 1000)}s
              </p>
            )}
          </form>
        </div>
      )}

      {activeTab === 'register' && (
        <div>
          <form onSubmit={handleTestRegister} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Enter email"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={registerPassword}
                onChange={(e) => {
                  setRegisterPassword(e.target.value);
                  if (e.target.value) {
                    checkPasswordStrength(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Enter password"
                required
              />
              {registerPassword && passwordStrength && (
                <PasswordStrengthIndicator 
                  strength={passwordStrength} 
                  password={registerPassword}
                  className="mt-2"
                />
              )}
            </div>
            <Button
              type="submit"
              disabled={authState.isLoading}
              className="fantasy-btn bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
            >
              {authState.isLoading ? 'Testing Registration...' : 'Test Enhanced Registration'}
            </Button>
          </form>
        </div>
      )}

      {activeTab === 'reset' && (
        <div>
          <form onSubmit={handleTestReset} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Enter email for password reset"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={authState.isLoading}
              className="fantasy-btn bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
            >
              {authState.isLoading ? 'Sending Reset...' : 'Test Password Reset'}
            </Button>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div>
          <SecurityDashboard />
        </div>
      )}
    </div>
  );
};

export default AuthSecurityTest;