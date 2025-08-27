import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, type Session, type AuthError } from '@/lib/supabase';
import { User, UserProfile, transformUser, isAdminUser } from '@/utils/authTransforms';
import { useAuthMethods } from '@/hooks/useAuthMethods';

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

  const authMethods = useAuthMethods();

  // Initialize auth state
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('AuthProvider: Error getting session:', error);
        }

        if (session) {
          setSession(session);
          const basicUserData = {
            role: session.user.email === 'jzineldin@gmail.com' ? 'admin' : 'user'
          };
          setUser(transformUser(session.user, basicUserData));
        }
      } catch (error) {
        console.error('AuthProvider: Unexpected error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);

        if (session) {
          const basicUserData = {
            role: session.user.email === 'jzineldin@gmail.com' ? 'admin' : 'user'
          };
          setUser(transformUser(session.user, basicUserData));
        } else {
          setUser(null);
          setUserProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    isAuthenticated: user !== null,
    isAdmin: isAdminUser(user),
    loading,
    ...authMethods
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export types for external use
export type { User, UserProfile };
export { isAdminUser, transformUser };