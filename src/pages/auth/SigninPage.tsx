import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import Button from '@/components/atoms/Button';
import { PageLayout, CardLayout, TypographyLayout } from '@/components/layout';

const SigninPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signInWithGoogle, signInWithGitHub } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await login(email, password);

    if (error) {
      setError(error.message || 'Failed to sign in. Please check your credentials and try again.');
    } else {
      navigate('/dashboard');
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    const { error } = await signInWithGoogle();

    if (error) {
      setError(error.message || 'Failed to sign in with Google.');
      setLoading(false);
    }
    // Note: For OAuth, the user will be redirected, so we don't set loading to false here
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    setError('');

    const { error } = await signInWithGitHub();

    if (error) {
      setError(error.message || 'Failed to sign in with GitHub.');
      setLoading(false);
    }
    // Note: For OAuth, the user will be redirected, so we don't set loading to false here
  };

  return (
    <PageLayout maxWidth="sm" showFloatingElements noPadding>
      <div className="flex items-center justify-center min-h-screen">
        {/* Main Sign In Card */}
        <CardLayout variant="default" padding="xl" className="w-full max-w-md mx-6">
          {/* Header */}
          <div className="text-center mb-8">
            <TypographyLayout variant="hero" as="h1" align="center" className="mb-2">
              Welcome Back
            </TypographyLayout>
            <TypographyLayout variant="body" align="center" className="text-xl">
              Continue your storytelling journey
            </TypographyLayout>
          </div>

          {/* Error Message */}
          {error && (
            <div className="glass-card bg-red-900/30 border border-red-500/50 p-4 rounded-lg mb-6">
              <TypographyLayout variant="body" align="center" className="text-red-200 text-body-sm">
                {error}
              </TypographyLayout>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full glass-card hover:border-amber-400/50 p-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <TypographyLayout variant="body" className="text-white/90 font-medium group-hover:text-white transition-colors">
                Continue with Google
              </TypographyLayout>
            </button>

            <button
              onClick={handleGitHubSignIn}
              disabled={loading}
              className="w-full glass-card hover:border-amber-400/50 p-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 group"
            >
              <svg className="w-5 h-5 fill-white/90 group-hover:fill-white transition-colors" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <TypographyLayout variant="body" className="text-white/90 font-medium group-hover:text-white transition-colors">
                Continue with GitHub
              </TypographyLayout>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center">
              <TypographyLayout variant="body" className="px-4 bg-slate-900/50 text-white/60 font-medium text-body-sm">
                Or continue with email
              </TypographyLayout>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <TypographyLayout variant="body" as="label" htmlFor="email" className="block text-body-sm font-medium text-white/80 mb-2">
                Email address
              </TypographyLayout>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-primary w-full"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <TypographyLayout variant="body" as="label" htmlFor="password" className="block text-body-sm font-medium text-white/80 mb-2">
                Password
              </TypographyLayout>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-primary w-full"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-amber-400 focus:ring-amber-400/20 border-white/30 rounded bg-transparent"
                />
                <TypographyLayout variant="body" as="label" htmlFor="remember-me" className="ml-2 block text-body-sm text-white/70">
                  Remember me
                </TypographyLayout>
              </div>

              <Link
                to="/auth/reset-password"
                className="text-body-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="large"
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <TypographyLayout variant="body" align="center">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                Create one here
              </Link>
            </TypographyLayout>
          </div>
        </CardLayout>
      </div>
    </PageLayout>
  );
};

export default SigninPage;