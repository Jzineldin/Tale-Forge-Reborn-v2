import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, email } = await req.json()

    if (action === 'make_admin' && email === 'jzineldin@gmail.com') {
      // First, get the user by email
      const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers()
      if (userError) throw userError

      const user = users?.users.find(u => u.email === email)
      if (!user) {
        throw new Error('User not found')
      }

      // Update user profile to admin
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .upsert({
          id: user.id,
          role: 'admin',
          updated_at: new Date().toISOString()
        })

      if (profileError) throw profileError

      // Give unlimited credits (999999)
      const { error: creditError } = await supabaseAdmin
        .from('user_credits')
        .upsert({
          user_id: user.id,
          current_balance: 999999,
          total_earned: 999999,
          updated_at: new Date().toISOString()
        })

      if (creditError) throw creditError

      // Log the transaction
      const { error: transactionError } = await supabaseAdmin
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'admin_grant',
          amount: 999999,
          balance_after: 999999,
          description: 'Admin user - unlimited credits granted',
          reference_type: 'admin_setup'
        })

      if (transactionError) throw transactionError

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully made ${email} an admin with unlimited credits`,
          user_id: user.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'check_user' && email) {
      // Get user info
      const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers()
      if (userError) throw userError

      const user = users?.users.find(u => u.email === email)
      if (!user) {
        return new Response(
          JSON.stringify({ success: false, message: 'User not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get user profile and credits
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const { data: credits } = await supabaseAdmin
        .from('user_credits')
        .select('current_balance, total_earned, total_spent')
        .eq('user_id', user.id)
        .single()

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: {
            id: user.id,
            email: user.email,
            role: profile?.role || 'user',
            credits: credits || { current_balance: 0, total_earned: 0, total_spent: 0 }
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action or email')

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})