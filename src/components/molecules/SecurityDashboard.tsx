import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthContext';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

const SecurityDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    getSecurityRecommendations, 
    sessionTimeRemaining, 
    shouldWarnSessionExpiry,
    generateSecurePassword
  } = useEnhancedAuth();

  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  useEffect(() => {
    setRecommendations(getSecurityRecommendations());
  }, [getSecurityRecommendations, user]);

  const formatTimeRemaining = (ms: number | null): string => {
    if (!ms || ms <= 0) return 'Session expired';
    
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  const getSecurityScore = (): number => {
    let score = 0;
    
    if (user?.email) score += 20;
    if (user?.signup_method === 'google' || user?.signup_method === 'github') score += 20; // OAuth is generally more secure
    if (user?.signup_method === 'email') score += 15; // Email signup is still secure
    if (recommendations.length === 0) score += 25; // No recommendations means good security
    if (sessionTimeRemaining && sessionTimeRemaining > 30 * 60 * 1000) score += 20; // More than 30 min session

    return Math.min(100, score);
  };

  const getSecurityScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSecurityScoreBackground = (score: number): string => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setGeneratedPassword(newPassword);
    setShowPasswordGenerator(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
      console.log('Password copied to clipboard');
    });
  };

  const securityScore = getSecurityScore();

  return (
    <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center">
          🛡️ Security Dashboard
        </h3>
        <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getSecurityScoreBackground(securityScore)}`}>
          <span className={getSecurityScoreColor(securityScore)}>
            Security Score: {securityScore}/100
          </span>
        </div>
      </div>

      {/* Session Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-black/20 border border-white/10 rounded-lg p-4">
          <h4 className="text-white font-bold mb-3 flex items-center">
            ⏱️ Session Status
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Session expires:</span>
              <span className={`font-medium ${shouldWarnSessionExpiry ? 'text-amber-400' : 'text-white'}`}>
                {formatTimeRemaining(sessionTimeRemaining)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Login method:</span>
              <span className="text-white font-medium capitalize">
                {user?.signup_method || 'Email'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Account role:</span>
              <span className="text-white font-medium capitalize">
                {user?.role || 'User'}
              </span>
            </div>
          </div>
          
          {shouldWarnSessionExpiry && (
            <div className="mt-3 p-2 bg-amber-500/20 border border-amber-500/30 rounded text-amber-300 text-sm">
              ⚠️ Your session will expire soon. Save your work!
            </div>
          )}
        </div>

        <div className="bg-black/20 border border-white/10 rounded-lg p-4">
          <h4 className="text-white font-bold mb-3 flex items-center">
            👤 Account Info
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Email verified:</span>
              <span className={`font-medium ${user?.welcome_email_sent ? 'text-green-400' : 'text-amber-400'}`}>
                {user?.welcome_email_sent ? '✓ Verified' : '? Unknown'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Account created:</span>
              <span className="text-white font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Last updated:</span>
              <span className="text-white font-medium">
                {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
          <h4 className="text-amber-300 font-bold mb-3 flex items-center">
            💡 Security Recommendations
          </h4>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="text-amber-200 text-sm flex items-start">
                <span className="mr-2 mt-0.5">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Security Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={handleGeneratePassword}
          className="fantasy-btn bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
        >
          <Icon name="key" size={16} className="mr-2" />
          Generate Secure Password
        </Button>

        <Button
          onClick={() => window.location.href = '/account/settings'}
          className="fantasy-btn bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
        >
          <Icon name="settings" size={16} className="mr-2" />
          Account Settings
        </Button>
      </div>

      {/* Password Generator Modal */}
      {showPasswordGenerator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-white font-bold">Generated Secure Password</h4>
              <button
                onClick={() => setShowPasswordGenerator(false)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-black/20 border border-white/10 rounded-lg p-3 mb-4">
              <p className="font-mono text-sm text-white break-all">
                {generatedPassword}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => copyToClipboard(generatedPassword)}
                className="fantasy-btn bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex-1"
              >
                📋 Copy Password
              </Button>
              
              <Button
                onClick={handleGeneratePassword}
                className="fantasy-btn bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
              >
                🔄 Generate New
              </Button>
            </div>
            
            <p className="text-white/60 text-xs mt-3 text-center">
              Make sure to store this password securely!
            </p>
          </div>
        </div>
      )}

      {/* Security Tips */}
      <div className="mt-6 bg-black/20 border border-white/10 rounded-lg p-4">
        <h4 className="text-white font-bold mb-3 flex items-center">
          💡 Security Tips
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
          <div>
            <p className="font-medium text-white mb-1">🔐 Strong Passwords</p>
            <p>Use unique passwords with 12+ characters, mixing letters, numbers, and symbols.</p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">📧 Email Security</p>
            <p>Keep your email secure and verify your account to prevent unauthorized access.</p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">🔄 Regular Updates</p>
            <p>Change your password every 3-6 months and review account activity.</p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">🚨 Stay Alert</p>
            <p>Be cautious of phishing emails and always log out on shared devices.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;