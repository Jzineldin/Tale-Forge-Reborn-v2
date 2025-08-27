import { supabase, type AuthError } from '@/lib/supabase';

export const useAuthMethods = () => {
  const login = async (email: string, password: string): Promise<{ error?: AuthError }> => {
    console.log('AuthMethods: Login attempt for:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('AuthMethods: Login failed:', error);
    } else {
      console.log('AuthMethods: Login successful');
    }

    return { error };
  };

  const logout = async (): Promise<{ error?: AuthError }> => {
    console.log('AuthMethods: Logout requested');
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('AuthMethods: Logout failed:', error);
    } else {
      console.log('AuthMethods: Logout successful');
    }

    return { error };
  };

  const register = async (name: string, email: string, password: string): Promise<{ error?: AuthError }> => {
    console.log('AuthMethods: Registration attempt for:', email);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          name: name
        }
      }
    });

    if (error) {
      console.error('AuthMethods: Registration failed:', error);
    } else {
      console.log('AuthMethods: Registration successful');
    }

    return { error };
  };

  const resetPassword = async (email: string): Promise<{ error?: AuthError }> => {
    console.log('AuthMethods: Password reset for:', email);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      console.error('AuthMethods: Password reset failed:', error);
    } else {
      console.log('AuthMethods: Password reset email sent');
    }

    return { error };
  };

  const signInWithGoogle = async (): Promise<{ error?: AuthError }> => {
    console.log('AuthMethods: Google sign-in attempt');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (error) {
      console.error('AuthMethods: Google sign-in failed:', error);
    } else {
      console.log('AuthMethods: Google sign-in initiated');
    }

    return { error };
  };

  const signInWithGitHub = async (): Promise<{ error?: AuthError }> => {
    console.log('AuthMethods: GitHub sign-in attempt');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (error) {
      console.error('AuthMethods: GitHub sign-in failed:', error);
    } else {
      console.log('AuthMethods: GitHub sign-in initiated');
    }

    return { error };
  };

  return {
    login,
    logout,
    register,
    resetPassword,
    signInWithGoogle,
    signInWithGitHub
  };
};