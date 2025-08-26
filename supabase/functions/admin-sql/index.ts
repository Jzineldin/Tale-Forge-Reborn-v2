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

    // Execute the SQL to make jzineldin@gmail.com an admin with unlimited credits
    const { data, error } = await supabaseAdmin.rpc('exec_admin_setup', {});

    if (error) {
      // If the function doesn't exist, run the raw SQL
      console.log('Function does not exist, executing raw SQL...');
      
      // First, find the user
      const { data: users, error: userListError } = await supabaseAdmin.auth.admin.listUsers()
      if (userListError) throw userListError

      const user = users?.users.find(u => u.email === 'jzineldin@gmail.com')
      if (!user) {
        throw new Error('User jzineldin@gmail.com not found')
      }

      // Make them admin
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .upsert({
          id: user.id,
          role: 'admin',
          updated_at: new Date().toISOString()
        })

      if (profileError) throw profileError

      // Give them unlimited credits
      const { error: creditError } = await supabaseAdmin
        .from('user_credits')
        .upsert({
          user_id: user.id,
          current_balance: 999999,
          total_earned: 999999,
          updated_at: new Date().toISOString()
        })

      if (creditError) throw creditError

      // Log the admin setup transaction
      const { error: transactionError } = await supabaseAdmin
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'admin_setup',
          amount: 999999,
          balance_after: 999999,
          description: 'Admin user setup - unlimited credits granted',
          reference_type: 'admin'
        })

      if (transactionError) throw transactionError

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully made ${user.email} an admin with unlimited credits`,
          user_id: user.id,
          credits: 999999
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})