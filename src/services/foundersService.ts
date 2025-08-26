import { supabase } from '@/lib/supabase';

export interface FoundersProgramStatus {
  isActive: boolean;
  totalSpots: number;
  spotsClaimed: number;
  spotsRemaining: number;
  programEndDate: string;
  lastFounderNumber: number;
}

export interface FounderRegistrationResult {
  founderNumber?: number;
  referralCode?: string;
  success: boolean;
  message: string;
}

export interface FounderProfile {
  id: string;
  userId: string;
  founderNumber: number;
  qualifiedAt: string;
  paymentVerifiedAt?: string;
  tierWhenQualified: 'premium' | 'professional';
  referralCode: string;
  totalReferrals: number;
  isActive: boolean;
}

class FoundersService {
  /**
   * Get current founders program status for real-time display
   */
  async getFoundersProgramStatus(): Promise<FoundersProgramStatus> {
    try {
      const { data, error } = await supabase.rpc('get_founders_program_status');
      
      if (error) {
        console.error('Error fetching founders program status:', error);
        throw new Error(`Failed to fetch founders program status: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        // Return default values if no data
        return {
          isActive: false,
          totalSpots: 200,
          spotsClaimed: 0,
          spotsRemaining: 200,
          programEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastFounderNumber: 0
        };
      }
      
      const status = data[0];
      return {
        isActive: status.is_active,
        totalSpots: status.total_spots,
        spotsClaimed: status.spots_claimed,
        spotsRemaining: status.spots_remaining,
        programEndDate: status.program_end_date,
        lastFounderNumber: status.last_founder_number
      };
    } catch (error) {
      console.error('FoundersService.getFoundersProgramStatus error:', error);
      throw error;
    }
  }

  /**
   * Register a new founder (requires authenticated user)
   */
  async registerFounder(tier: 'premium' | 'professional'): Promise<FounderRegistrationResult> {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          message: 'You must be signed in to join the founders program'
        };
      }

      const { data, error } = await supabase.rpc('register_founder', {
        p_user_id: user.id,
        p_tier: tier
      });
      
      if (error) {
        console.error('Error registering founder:', error);
        return {
          success: false,
          message: error.message || 'Failed to register as founder'
        };
      }
      
      if (!data || data.length === 0) {
        return {
          success: false,
          message: 'No response from founder registration'
        };
      }
      
      const result = data[0];
      return {
        founderNumber: result.founder_number,
        referralCode: result.referral_code,
        success: result.success,
        message: result.message
      };
    } catch (error) {
      console.error('FoundersService.registerFounder error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during founder registration'
      };
    }
  }

  /**
   * Get founder profile for current authenticated user
   */
  async getFounderProfile(): Promise<FounderProfile | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return null;
      }

      const { data, error } = await supabase
        .from('founders_program')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No founder record found
          return null;
        }
        console.error('Error fetching founder profile:', error);
        throw new Error(`Failed to fetch founder profile: ${error.message}`);
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        founderNumber: data.founder_number,
        qualifiedAt: data.qualified_at,
        paymentVerifiedAt: data.payment_verified_at,
        tierWhenQualified: data.tier_when_qualified,
        referralCode: data.referral_code,
        totalReferrals: data.total_referrals,
        isActive: data.is_active
      };
    } catch (error) {
      console.error('FoundersService.getFounderProfile error:', error);
      throw error;
    }
  }

  /**
   * Get public founders leaderboard
   */
  async getFoundersLeaderboard(limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('public_founders_leaderboard')
        .select('*')
        .order('founder_number', { ascending: true })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching founders leaderboard:', error);
        throw new Error(`Failed to fetch founders leaderboard: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('FoundersService.getFoundersLeaderboard error:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time founders program status changes
   */
  subscribeToFoundersStatus(callback: (status: FoundersProgramStatus) => void) {
    const subscription = supabase
      .channel('founders_program_status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'founders_program_settings'
        },
        async () => {
          // Fetch updated status when settings change
          try {
            const status = await this.getFoundersProgramStatus();
            callback(status);
          } catch (error) {
            console.error('Error in founders status subscription:', error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'founders_program'
        },
        async () => {
          // Fetch updated status when new founder registers
          try {
            const status = await this.getFoundersProgramStatus();
            callback(status);
          } catch (error) {
            console.error('Error in founders program subscription:', error);
          }
        }
      )
      .subscribe();

    return subscription;
  }
}

export const foundersService = new FoundersService();