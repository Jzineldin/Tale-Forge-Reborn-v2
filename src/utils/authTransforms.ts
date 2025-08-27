import { type User as SupabaseUser } from '@/lib/supabase';

export interface User {
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
  credits_balance?: number;
  total_achievements?: number;
  current_streak?: number;
  subscription_tier?: 'free' | 'creator' | 'master';
  is_premium?: boolean;
}

export interface UserProfile {
  subscription_tier: 'free' | 'creator' | 'master';
  is_premium: boolean;
  credits_balance: number;
  total_achievements: number;
  current_streak: number;
  templates_public_count?: number;
}

export const transformUser = (supabaseUser: SupabaseUser, profile?: any, _userProfile?: any): User => {
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

export const isAdminUser = (user: User | null): boolean => {
  return user?.email === 'jzineldin@gmail.com' || user?.role === 'admin';
};