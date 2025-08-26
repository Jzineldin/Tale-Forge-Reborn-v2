import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, subscriptionId } = await req.json();

    switch (action) {
      case 'cancel': {
        // Get subscription from database
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', user.id)
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (!sub) {
          throw new Error('Subscription not found');
        }

        // Cancel at period end
        const subscription = await stripe.subscriptions.update(
          sub.stripe_subscription_id,
          {
            cancel_at_period_end: true,
          }
        );

        // Update database
        await supabase
          .from('user_subscriptions')
          .update({
            cancel_at_period_end: true,
            cancel_at: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', sub.stripe_subscription_id);

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Subscription will be cancelled at period end',
            cancel_at: subscription.current_period_end,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      case 'reactivate': {
        // Get subscription from database
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', user.id)
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (!sub) {
          throw new Error('Subscription not found');
        }

        // Reactivate subscription
        const subscription = await stripe.subscriptions.update(
          sub.stripe_subscription_id,
          {
            cancel_at_period_end: false,
          }
        );

        // Update database
        await supabase
          .from('user_subscriptions')
          .update({
            cancel_at_period_end: false,
            cancel_at: null,
          })
          .eq('stripe_subscription_id', sub.stripe_subscription_id);

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Subscription reactivated',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      case 'portal': {
        // Get customer ID
        const { data: customer } = await supabase
          .from('customers')
          .select('stripe_customer_id')
          .eq('user_id', user.id)
          .single();

        if (!customer?.stripe_customer_id) {
          throw new Error('No customer found');
        }

        // Create portal session
        const session = await stripe.billingPortal.sessions.create({
          customer: customer.stripe_customer_id,
          return_url: `${req.headers.get('origin')}/account/billing`,
        });

        return new Response(
          JSON.stringify({ 
            url: session.url,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error managing subscription:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to manage subscription' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});