import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, type User as SupabaseUser, type Session, type AuthError } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
  welcome_email_sent?: boolean;
  signup_method?: string;
  role?: 'user' | 'admin';
  // Gamification data
  credits_balance?: number;
  total_achievements?: number;
  current_streak?: number;
  subscription_tier?: 'free' | 'creator' | 'master';
  is_premium?: boolean;
}

interface UserProfile {
  subscription_tier: 'free' | 'creator' | 'master';
  is_premium: boolean;
  credits_balance: number;
  total_achievements: number;
  current_streak: number;
  templates_public_count?: number;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean | null; // null means loading
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: AuthError }>;
  logout: () => Promise<{ error?: AuthError }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: AuthError }>;
  resetPassword: (email: string) => Promise<{ error?: AuthError }>;
  signInWithGoogle: () => Promise<{ error?: AuthError }>;
  signInWithGitHub: () => Promise<{ error?: AuthError }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to transform Supabase user to our User interface
  const transformUser = (supabaseUser: SupabaseUser, profile?: any, _userProfile?: any): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      full_name: profile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
      username: profile?.username || supabaseUser.user_metadata?.username,
      avatar_url: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
      bio: profile?.bio,
      created_at: profile?.created_at || supabaseUser.created_at,
      updated_at: profile?.updated_at,
      welcome_email_sent: profile?.welcome_email_sent,
      signup_method: profile?.signup_method || 'email',
      role: profile?.role || supabaseUser.user_metadata?.role || 'user'
    };
  };

  // Check if user is authenticated on app load
  useEffect(() => {
    console.log('🔍 AuthProvider: Starting useEffect hook');
    console.log('🔍 AuthProvider: Initializing SIMPLIFIED authentication check - BYPASSING DATABASE CALLS');

    // SIMPLIFIED VERSION: Just check basic auth session without any database calls
    const getInitialSession = async () => {
      try {
        console.log('🔍 AuthProvider: About to call supabase.auth.getSession()');

        const result = await supabase.auth.getSession();
        console.log('🔍 AuthProvider: getSession() returned:', result);
        const { data: { session }, error } = result;

        if (error) {
          console.error('AuthProvider: Error getting session:', error);
        }

        if (session) {
          console.log('AuthProvider: Initial session found:', session.user.email);
          setSession(session);

          // Set user with minimal data - NO DATABASE CALLS
          const basicUserData = {
            role: session.user.email === 'jzineldin@gmail.com' ? 'admin' : 'user'
          };

          setUser(transformUser(session.user, basicUserData));
          console.log('AuthProvider: Basic user data set - SKIPPING DATABASE PROFILE CALLS');
        } else {
          console.log('AuthProvider: No initial session found');
        }
      } catch (error) {
        console.error('🚨 AuthProvider: Unexpected error in getInitialSession:', error);
      } finally {
        console.log('🔍 AuthProvider: Reached finally block - Setting loading to false');
        console.log('🔍 AuthProvider: APP SHOULD NOW RENDER');
        setLoading(false);
        console.log('🔍 AuthProvider: setLoading(false) called');
      }
    };

    console.log('🔍 AuthProvider: About to call getInitialSession()');
    getInitialSession();
    console.log('🔍 AuthProvider: getInitialSession() called (async)');

    // Listen for auth changes - SIMPLIFIED VERSION
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed (SIMPLIFIED):', event, session?.user?.email || 'no session');

        setSession(session);

        if (session) {
          // Set user immediately with basic data - NO DATABASE CALLS
          const basicUserData = {
            role: session.user.email === 'jzineldin@gmail.com' ? 'admin' : 'user'
          };

          setUser(transformUser(session.user, basicUserData));
          console.log('AuthProvider: Auth state change - user set with basic data');
        } else {
          setUser(null);
          setUserProfile(null);
          console.log('AuthProvider: Auth state change - user cleared');
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log('AuthProvider: Login called with email:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('AuthProvider: Login error:', error);
      return { error };
    }

    console.log('AuthProvider: Login successful:', data);
    return { error: undefined };
  };

  const logout = async () => {
    console.log('AuthProvider: Logout called');

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('AuthProvider: Logout error:', error);
      return { error };
    }

    console.log('AuthProvider: Logout successful');
    return { error: undefined };
  };

  const register = async (name: string, email: string, password: string) => {
    console.log('AuthProvider: Register called with name:', name, 'email:', email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      console.error('AuthProvider: Registration error:', error);
      return { error };
    }

    console.log('AuthProvider: Registration successful:', data);
    return { error: undefined };
  };

  const resetPassword = async (email: string) => {
    console.log('AuthProvider: Reset password called for email:', email);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) {
      console.error('AuthProvider: Reset password error:', error);
      return { error };
    }

    console.log('AuthProvider: Reset password email sent');
    return { error: undefined };
  };

  const signInWithGoogle = async () => {
    console.log('AuthProvider: Google sign-in called');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error('AuthProvider: Google sign-in error:', error);
      return { error };
    }

    console.log('AuthProvider: Google sign-in initiated:', data);
    return { error: undefined };
  };

  const signInWithGitHub = async () => {
    console.log('AuthProvider: GitHub sign-in called');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error('AuthProvider: GitHub sign-in error:', error);
      return { error };
    }

    console.log('AuthProvider: GitHub sign-in initiated:', data);
    return { error: undefined };
  };

  const value = {
    user,
    userProfile,
    session,
    isAuthenticated: loading ? null : !!user, // null means loading
    isAdmin: user?.role === 'admin' || false,
    loading,
    login,
    logout,
    register,
    resetPassword,
    signInWithGoogle,
    signInWithGitHub
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading Tale Forge...</p>
        </div>
      </div>
    );
  }
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};