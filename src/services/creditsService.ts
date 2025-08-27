import { supabase } from '@/lib/supabase';

export interface UserCredits {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  lastRefresh: string;
}

export interface CreditTransaction {
  id: string;
  transactionType: string;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface StoryCost {
  chapters: number;
  storyCost: number; // 1 credit per chapter (includes text + image)
  audioCost: number; // 5 credits for audio narration
  totalCost: number;
}

export interface CreditCost {
  actionType: string;
  costPerUnit: number;
  description: string;
}

class CreditsService {
  /**
   * Get current user's credit balance and statistics
   */
  async getUserCredits(): Promise<UserCredits | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_user_credits', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error fetching user credits:', error);
        
        // If the RPC function doesn't exist yet, return default credits
        if (error.message.includes('function get_user_credits') || error.code === '42883') {
          console.warn('Credit system not initialized - returning default credits');
          return {
            currentBalance: 15, // Default free tier credits
            totalEarned: 15,
            totalSpent: 0,
            lastRefresh: new Date().toISOString()
          };
        }
        
        throw new Error(`Failed to fetch user credits: ${error.message}`);
      }

      if (!data || data.length === 0) {
        // Initialize credits if user doesn't have any
        await this.initializeUserCredits();
        return {
          currentBalance: 15,
          totalEarned: 15,
          totalSpent: 0,
          lastRefresh: new Date().toISOString()
        };
      }

      const credits = data[0];
      return {
        currentBalance: credits.current_balance,
        totalEarned: credits.total_earned,
        totalSpent: credits.total_spent,
        lastRefresh: credits.last_refresh
      };
    } catch (error) {
      console.error('CreditsService.getUserCredits error:', error);
      throw error;
    }
  }

  /**
   * Initialize credits for a new user
   */
  async initializeUserCredits(): Promise<void> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.rpc('initialize_user_credits', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error initializing user credits:', error);
        throw new Error(`Failed to initialize user credits: ${error.message}`);
      }
    } catch (error) {
      console.error('CreditsService.initializeUserCredits error:', error);
      throw error;
    }
  }

  /**
   * Spend credits for an action
   */
  async spendCredits(
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('spend_credits', {
        user_uuid: user.id,
        credits_to_spend: amount,
        description_text: description,
        ref_id: referenceId || null,
        ref_type: referenceType || null,
        transaction_metadata: metadata || {}
      });

      if (error) {
        console.error('Error spending credits:', error);
        throw new Error(`Failed to spend credits: ${error.message}`);
      }

      return data; // Returns true if successful, false if insufficient credits
    } catch (error) {
      console.error('CreditsService.spendCredits error:', error);
      throw error;
    }
  }

  /**
   * Add credits to user account
   */
  async addCredits(
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('add_credits', {
        user_uuid: user.id,
        credits_to_add: amount,
        description_text: description,
        ref_id: referenceId || null,
        ref_type: referenceType || null,
        transaction_metadata: metadata || {}
      });

      if (error) {
        console.error('Error adding credits:', error);
        throw new Error(`Failed to add credits: ${error.message}`);
      }

      return data; // Returns true if successful
    } catch (error) {
      console.error('CreditsService.addCredits error:', error);
      throw error;
    }
  }

  /**
   * Refresh monthly credits for free tier users
   */
  async refreshMonthlyCredits(): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('refresh_monthly_credits', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error refreshing monthly credits:', error);
        throw new Error(`Failed to refresh monthly credits: ${error.message}`);
      }

      return data; // Returns true if refresh was applied, false if not needed
    } catch (error) {
      console.error('CreditsService.refreshMonthlyCredits error:', error);
      throw error;
    }
  }

  /**
   * Get user's credit transaction history
   */
  async getCreditTransactions(limit = 50, offset = 0): Promise<CreditTransaction[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_credit_transactions', {
        user_uuid: user.id,
        limit_count: limit,
        offset_count: offset
      });

      if (error) {
        console.error('Error fetching credit transactions:', error);
        throw new Error(`Failed to fetch credit transactions: ${error.message}`);
      }

      return (data || []).map((transaction: any) => ({
        id: transaction.id,
        transactionType: transaction.transaction_type,
        amount: transaction.amount,
        balanceAfter: transaction.balance_after,
        description: transaction.description,
        referenceId: transaction.reference_id,
        referenceType: transaction.reference_type,
        metadata: transaction.metadata,
        createdAt: transaction.created_at
      }));
    } catch (error) {
      console.error('CreditsService.getCreditTransactions error:', error);
      throw error;
    }
  }

  /**
   * Calculate the cost of creating a story
   */
  async calculateStoryCost(
    storyType: 'short' | 'medium' | 'long',
    includeImages = true,
    includeAudio = true
  ): Promise<StoryCost> {
    try {
      const { data, error } = await supabase.rpc('calculate_story_cost', {
        story_type: storyType,
        include_images: includeImages,
        include_audio: includeAudio
      });

      if (error) {
        console.error('Error calculating story cost:', error);
        
        // If the RPC function doesn't exist yet, return default costs
        if (error.message.includes('function calculate_story_cost') || error.code === '42883') {
          console.warn('Credit system not initialized - returning default story costs');
          return this.getDefaultStoryCost(storyType, includeImages, includeAudio);
        }
        
        throw new Error(`Failed to calculate story cost: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('No cost data returned');
      }

      const cost = data[0];
      return {
        chapters: cost.chapters,
        storyCost: cost.story_cost,
        audioCost: cost.audio_cost,
        totalCost: cost.total_cost
      };
    } catch (error) {
      console.error('CreditsService.calculateStoryCost error:', error);
      throw error;
    }
  }

  /**
   * Default story cost calculation (simple model)
   */
  private getDefaultStoryCost(
    storyType: 'short' | 'medium' | 'long',
    includeImages = true,
    includeAudio = false
  ): StoryCost {
    const storySpecs = {
      short: { chapters: 3 },
      medium: { chapters: 5 },
      long: { chapters: 8 }
    };

    const spec = storySpecs[storyType];
    const storyCost = spec.chapters; // 1 credit per chapter (includes text + image)
    const audioCost = includeAudio ? 5 : 0; // Flat 5 credits for audio
    
    return {
      chapters: spec.chapters,
      storyCost,
      audioCost,
      totalCost: storyCost + audioCost
    };
  }

  /**
   * Get credit costs configuration
   */
  async getCreditCosts(): Promise<CreditCost[]> {
    try {
      const { data, error } = await supabase
        .from('credit_costs')
        .select('action_type, cost_per_unit, description')
        .order('action_type');

      if (error) {
        console.error('Error fetching credit costs:', error);
        throw new Error(`Failed to fetch credit costs: ${error.message}`);
      }

      return (data || []).map((cost: any) => ({
        actionType: cost.action_type,
        costPerUnit: cost.cost_per_unit,
        description: cost.description
      }));
    } catch (error) {
      console.error('CreditsService.getCreditCosts error:', error);
      throw error;
    }
  }

  /**
   * Check if user has enough credits for a story
   */
  async canAffordStory(
    storyType: 'short' | 'medium' | 'long',
    includeImages = true,
    includeAudio = true
  ): Promise<{ canAfford: boolean; userCredits: number; storyCost: number }> {
    try {
      const [userCredits, storyCost] = await Promise.all([
        this.getUserCredits(),
        this.calculateStoryCost(storyType, includeImages, includeAudio)
      ]);

      const currentBalance = userCredits?.currentBalance || 0;
      const totalCost = storyCost.totalCost;

      return {
        canAfford: currentBalance >= totalCost,
        userCredits: currentBalance,
        storyCost: totalCost
      };
    } catch (error) {
      console.error('CreditsService.canAffordStory error:', error);
      throw error;
    }
  }

  /**
   * Process story creation payment
   */
  async processStoryPayment(
    storyId: string,
    storyType: 'short' | 'medium' | 'long',
    includeImages = true,
    includeAudio = true
  ): Promise<boolean> {
    try {
      const storyCost = await this.calculateStoryCost(storyType, includeImages, includeAudio);
      
      const success = await this.spendCredits(
        storyCost.totalCost,
        `Story creation: ${storyType} story with ${storyCost.chapters} chapters`,
        storyId,
        'story',
        {
          story_type: storyType,
          chapters: storyCost.chapters,
          include_images: includeImages,
          include_audio: includeAudio,
          story_cost: storyCost.storyCost,
          audio_cost: storyCost.audioCost
        }
      );

      return success;
    } catch (error) {
      console.error('CreditsService.processStoryPayment error:', error);
      throw error;
    }
  }

  /**
   * Get credit balance summary for UI display
   */
  async getCreditSummary(): Promise<{
    balance: number;
    canCreateShort: boolean;
    canCreateMedium: boolean;
    canCreateLong: boolean;
  }> {
    try {
      const userCredits = await this.getUserCredits();
      const balance = userCredits?.currentBalance || 0;

      const [shortCost, mediumCost, longCost] = await Promise.all([
        this.calculateStoryCost('short'),
        this.calculateStoryCost('medium'),
        this.calculateStoryCost('long')
      ]);

      return {
        balance,
        canCreateShort: balance >= shortCost.totalCost,
        canCreateMedium: balance >= mediumCost.totalCost,
        canCreateLong: balance >= longCost.totalCost
      };
    } catch (error) {
      console.error('CreditsService.getCreditSummary error:', error);
      throw error;
    }
  }

  /**
   * Get credit history for a specific user (for gamification/admin use)
   */
  async getCreditHistory(userId: string, limit = 50): Promise<CreditTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('CreditsService.getCreditHistory error:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('CreditsService.getCreditHistory error:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive credit statistics for gamification dashboard
   */
  async getCreditStats(userId: string): Promise<{
    total_earned: number;
    total_spent: number;
    current_balance: number;
    transactions_count: number;
    avg_monthly_earned: number;
    top_earning_activity: string;
  }> {
    try {
      const [userCredits, transactions] = await Promise.all([
        this.getUserCreditsById(userId),
        this.getCreditHistory(userId, 100)
      ]);

      const earnedTransactions = transactions.filter(t => t.amount > 0);
      const spentTransactions = transactions.filter(t => t.amount < 0);

      const totalEarned = earnedTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const totalSpent = spentTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Calculate top earning activity
      const activityCounts: Record<string, number> = {};
      earnedTransactions.forEach(t => {
        activityCounts[t.transaction_type] = (activityCounts[t.transaction_type] || 0) + t.amount;
      });

      const topEarningActivity = Object.entries(activityCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

      // Calculate average monthly earned (based on last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentEarned = earnedTransactions
        .filter(t => new Date(t.created_at) >= thirtyDaysAgo)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        total_earned: totalEarned,
        total_spent: totalSpent,
        current_balance: userCredits?.currentBalance || 0,
        transactions_count: transactions.length,
        avg_monthly_earned: recentEarned,
        top_earning_activity: topEarningActivity
      };
    } catch (error) {
      console.error('CreditsService.getCreditStats error:', error);
      throw error;
    }
  }

  /**
   * Get user credits by ID (for admin/gamification use)
   */
  private async getUserCreditsById(userId: string): Promise<UserCredits | null> {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User doesn't exist
        }
        console.error('CreditsService.getUserCreditsById error:', error);
        throw error;
      }

      if (!data) return null;

      return {
        currentBalance: data.credits_balance || 0,
        totalEarned: data.credits_earned_total || 0,
        totalSpent: data.credits_used_total || 0,
        lastTransactionAt: data.last_transaction_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('CreditsService.getUserCreditsById error:', error);
      throw error;
    }
  }
}

export const creditsService = new CreditsService();