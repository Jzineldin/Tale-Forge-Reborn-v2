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
}

interface AuthContextType {
  user: User | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to transform Supabase user to our User interface
  const transformUser = (supabaseUser: SupabaseUser, profile?: any, userProfile?: any): User => {
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
    console.log('AuthProvider: Initializing Supabase authentication check');

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error('AuthProvider: Authentication check timed out after 10 seconds');
      setLoading(false);
    }, 10000);

    // Skip database connection test for now - focus on basic auth
    console.log('AuthProvider: Skipping database test, checking auth only...');

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthProvider: Getting initial session...');

        // Get session without timeout (let Supabase handle its own timeout)
        const result = await supabase.auth.getSession();
        const { data: { session }, error } = result;

        if (error) {
          console.error('AuthProvider: Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session) {
          console.log('AuthProvider: Initial session found:', session.user.email);
          setSession(session);

          // Try to fetch user profile and user_profile data
          console.log('AuthProvider: Fetching user profile data...');
          
          // Always set user first, then try to enhance with profile data
          const basicUserData = {
            role: session.user.email === 'jzineldin@gmail.com' ? 'admin' : 'user'
          };

          setUser(transformUser(session.user, basicUserData));

          // Try to fetch profile data in background (don't block auth)
          try {
            console.log('AuthProvider: Fetching profile data in background...');
            
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            const { data: userProfileData } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            console.log('AuthProvider: Profile data:', profileData);
            console.log('AuthProvider: User profile data:', userProfileData);

            if (profileData || userProfileData) {
              const enhancedProfileData = {
                ...profileData,
                role: session.user.email === 'jzineldin@gmail.com' ? 'admin' : (profileData?.role || 'user'),
                subscription_tier: userProfileData?.subscription_tier || 'regular',
                is_premium: userProfileData?.is_premium || false
              };

              setUser(transformUser(session.user, enhancedProfileData, userProfileData));
              console.log('AuthProvider: Enhanced user data loaded');
            }
          } catch (profileError) {
            console.log('AuthProvider: Profile fetch failed, keeping basic user data:', profileError);
          }
        } else {
          console.log('AuthProvider: No initial session found');
        }
      } catch (error) {
        console.error('AuthProvider: Unexpected error in getInitialSession:', error);
      } finally {
        console.log('AuthProvider: Setting loading to false');
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed:', event, session);

        setSession(session);

        if (session) {
          console.log('AuthProvider: Auth state change - setting user immediately');
          
          // Set user immediately with basic data
          const basicUserData = {
            role: session.user.email === 'jzineldin@gmail.com' ? 'admin' : 'user'
          };

          setUser(transformUser(session.user, basicUserData));

          // Enhance with profile data in background
          setTimeout(async () => {
            try {
              console.log('AuthProvider: Enhancing user with profile data...');
              
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              const { data: userProfileData } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (profileData || userProfileData) {
                const enhancedProfileData = {
                  ...profileData,
                  role: session.user.email === 'jzineldin@gmail.com' ? 'admin' : (profileData?.role || 'user'),
                  subscription_tier: userProfileData?.subscription_tier || 'regular',
                  is_premium: userProfileData?.is_premium || false
                };

                setUser(transformUser(session.user, enhancedProfileData, userProfileData));
                console.log('AuthProvider: User enhanced with profile data');
              }
            } catch (error) {
              console.log('AuthProvider: Profile enhancement failed, keeping basic data:', error);
            }
          }, 100);
        } else {
          setUser(null);
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

  console.log('AuthProvider: Rendering with loading:', loading, 'user:', user, 'isAuthenticated:', value.isAuthenticated);

  if (loading) {
    console.log('AuthProvider: Returning loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading Tale Forge...</p>
        </div>
      </div>
    );
  }

  console.log('AuthProvider: Rendering children with context value:', value);
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  console.log('useAuth: Called');
  const context = useContext(AuthContext);
  console.log('useAuth: Context value:', context);
  if (context === undefined) {
    console.error('useAuth: Context is undefined, throwing error');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  console.log('useAuth: Returning context');
  return context;
};