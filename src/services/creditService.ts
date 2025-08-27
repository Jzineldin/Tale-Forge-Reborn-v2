import { supabase } from '../lib/supabase';

export interface CreditTransaction {
  id: string;
  user_id: string;
  transaction_type: 'purchase' | 'subscription' | 'story_creation' | 'audio_purchase' | 'admin_grant';
  amount: number;
  description: string;
  reference_id?: string;
  reference_type?: 'story' | 'user';
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UserCredits {
  user_id: string;
  credits_balance: number;
  credits_used_total: number;
  credits_earned_total: number;
  last_transaction_at?: string;
  updated_at: string;
}

export interface CreditCost {
  story_segment: number; // 1 credit per segment (text + image)
  audio_narration: number; // 5 credits for full story audio
}

class CreditService {
  
  private readonly CREDIT_COSTS: CreditCost = {
    story_segment: 1,      // 1 credit per chapter/segment (text + image)
    audio_narration: 5     // 5 credits for full story audio
  };

  /**
   * Get user's credit balance and info
   */
  async getUserCredits(userId: string): Promise<UserCredits | null> {
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User doesn't exist, initialize credits
        return this.initializeUserCredits(userId);
      }
      console.error('Error fetching user credits:', error);
      throw new Error(`Failed to fetch user credits: ${error.message}`);
    }

    return data;
  }

  /**
   * Initialize credits for a new user
   */
  async initializeUserCredits(userId: string): Promise<UserCredits> {
    // Check user subscription tier for initial credits
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('tier, credits_included')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const initialCredits = subscription?.credits_included || 15; // Default free tier

    const { data, error } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        credits_balance: initialCredits
      })
      .select()
      .single();

    if (error) {
      console.error('Error initializing user credits:', error);
      throw new Error(`Failed to initialize user credits: ${error.message}`);
    }

    // Create initial credit transaction
    await this.addCreditTransaction(userId, 'subscription', initialCredits, 
      'Initial credit allocation', userId, 'user');

    return data;
  }

  /**
   * Check if user has sufficient credits
   */
  async hasCredits(userId: string, requiredCredits: number): Promise<boolean> {
    const userCredits = await this.getUserCredits(userId);
    return userCredits ? userCredits.credits_balance >= requiredCredits : false;
  }

  /**
   * Spend credits for story creation or other features
   */
  async spendCredits(
    userId: string, 
    amount: number, 
    description: string,
    referenceId?: string,
    referenceType?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('spend_user_credits', {
        user_uuid: userId,
        credit_amount: amount,
        transaction_description: description,
        ref_id: referenceId,
        ref_type: referenceType
      });

      if (error) {
        console.error('Error spending credits:', error);
        return false;
      }

      return data; // Returns true/false based on success
    } catch (error) {
      console.error('Error spending credits:', error);
      return false;
    }
  }

  /**
   * Award credits to user
   */
  async awardCredits(
    userId: string,
    transactionType: string,
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('award_user_credits', {
        user_uuid: userId,
        transaction_type_param: transactionType,
        credit_amount: amount,
        transaction_description: description,
        ref_id: referenceId,
        ref_type: referenceType,
        meta_data: metadata
      });

      if (error) {
        console.error('Error awarding credits:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error awarding credits:', error);
      return false;
    }
  }

  /**
   * Calculate story creation cost: 1 credit per chapter
   */
  calculateStoryCost(chapterCount: number): number {
    return chapterCount * this.CREDIT_COSTS.story_segment;
  }

  /**
   * Calculate audio narration cost for a story
   */
  calculateAudioCost(): number {
    return this.CREDIT_COSTS.audio_narration;
  }

  /**
   * Get user's credit transaction history
   */
  async getCreditHistory(
    userId: string,
    limit: number = 20,
    transactionType?: string
  ): Promise<CreditTransaction[]> {
    let query = supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (transactionType) {
      query = query.eq('transaction_type', transactionType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching credit history:', error);
      throw new Error(`Failed to fetch credit history: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get credit statistics for user
   */
  async getCreditStats(userId: string): Promise<{
    total_earned: number;
    total_spent: number;
    current_balance: number;
    transactions_count: number;
    avg_monthly_earned: number;
    top_earning_activity: string;
  }> {
    const [userCredits, transactions] = await Promise.all([
      this.getUserCredits(userId),
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

    // Calculate average monthly earned (simplified - based on last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEarned = earnedTransactions
      .filter(t => new Date(t.created_at) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      total_earned: totalEarned,
      total_spent: totalSpent,
      current_balance: userCredits?.credits_balance || 0,
      transactions_count: transactions.length,
      avg_monthly_earned: recentEarned,
      top_earning_activity: topEarningActivity
    };
  }


  /**
   * Get credit costs for display
   */
  getCreditCosts(): CreditCost {
    return { ...this.CREDIT_COSTS };
  }


  /**
   * Private helper functions
   */
  private async addCreditTransaction(
    userId: string,
    transactionType: string,
    amount: number,
    description: string,
    referenceId?: string,
    referenceType?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: transactionType,
        amount,
        description,
        reference_id: referenceId,
        reference_type: referenceType,
        metadata
      });

    if (error) {
      console.error('Error adding credit transaction:', error);
    }
  }

}

export const creditService = new CreditService();