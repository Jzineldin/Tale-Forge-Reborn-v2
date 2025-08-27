import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Text from '@/components/atoms/Text';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        
        if (error) {
          console.error('Auth callback error:', error, errorDescription);
          setError(errorDescription || 'Authentication failed');
          setTimeout(() => navigate('/signin'), 3000);
          return;
        }

        // Check if we have a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to establish session');
          setTimeout(() => navigate('/signin'), 3000);
          return;
        }
        
        if (session) {
          // Successfully authenticated
          console.log('Authentication successful, redirecting to dashboard');
          navigate('/dashboard');
        } else {
          // No session found, redirect to signin
          console.log('No session found, redirecting to signin');
          navigate('/signin');
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        setError('An unexpected error occurred');
        setTimeout(() => navigate('/signin'), 3000);
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
          {error ? 'Authentication Failed' : 'Authenticating...'}
        </Text>
        <Text variant="p" color="secondary">
          {error ? error : 'Please wait while we complete the authentication process.'}
        </Text>
        {error && (
          <Text variant="p" color="secondary" className="mt-2">
            Redirecting to sign in page...
          </Text>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;