// Tale Forge - Stripe Webhook Edge Function
// This function handles Stripe webhook events for subscription management

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';
import Stripe from 'https://esm.sh/stripe?target=deno&no-check';

console.log("Stripe Webhook function started");

serve(async (req) => {
  try {
    // Validate environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Initialize Stripe
    const stripe = Stripe(stripeSecretKey);

    // Get the webhook signature
    const signature = req.headers.get('Stripe-Signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing Stripe-Signature header' }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get raw body for signature verification
    const body = await req.text();
    
    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        stripeWebhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object;
        const userId = checkoutSession.client_reference_id;
        
        if (userId) {
          // Get subscription details from the session
          const subscriptionId = checkoutSession.subscription;
          
          // Fetch subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0].price.id;
          
          // Map price ID to tier
          const priceToTierMap: Record<string, string> = {
            // These would be actual Stripe price IDs in production
            'price_basic_monthly': 'basic',
            'price_premium_monthly': 'premium',
            'price_family_monthly': 'family'
          };
          
          const tier = priceToTierMap[priceId] || 'basic';
          
          // Update user's subscription in Supabase
          const { error: updateError } = await supabase
            .from('subscribers')
            .upsert({
              user_id: userId,
              tier: tier,
              status: 'active',
              stripe_customer_id: checkoutSession.customer,
              stripe_subscription_id: subscriptionId,
              started_at: new Date().toISOString(),
              expires_at: new Date(subscription.current_period_end * 1000).toISOString()
            }, {
              onConflict: 'user_id'
            });
          
          if (updateError) {
            console.error('Error updating subscription:', updateError);
          }
        }
        break;
        
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        const customerId = updatedSubscription.customer;
        
        // Update subscription status in Supabase
        const { error: updateSubError } = await supabase
          .from('subscribers')
          .update({
            status: updatedSubscription.status,
            expires_at: new Date(updatedSubscription.current_period_end * 1000).toISOString()
          })
          .eq('stripe_subscription_id', updatedSubscription.id);
        
        if (updateSubError) {
          console.error('Error updating subscription status:', updateSubError);
        }
        break;
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        
        // Mark subscription as cancelled in Supabase
        const { error: deleteError } = await supabase
          .from('subscribers')
          .update({
            status: 'cancelled',
            expires_at: new Date(deletedSubscription.current_period_end * 1000).toISOString()
          })
          .eq('stripe_subscription_id', deletedSubscription.id);
        
        if (deleteError) {
          console.error('Error cancelling subscription:', deleteError);
        }
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in stripe-webhook function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});