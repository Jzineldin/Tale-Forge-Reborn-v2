import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Text from '@/components/atoms/Text';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, this would handle OAuth callback logic
    // For now, we'll simulate the process
    
    const handleAuthCallback = async () => {
      try {
        // Simulate API call to exchange code for tokens
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Redirect to dashboard after successful authentication
        navigate('/dashboard');
      } catch (error) {
        // Redirect to signin page if authentication fails
        navigate('/signin');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <Text variant="h1" weight="bold" className="text-2xl mb-4">
          Authenticating...
        </Text>
        <Text variant="p" color="secondary">
          Please wait while we complete the authentication process.
        </Text>
      </div>
    </div>
  );
};

export default AuthCallbackPage;