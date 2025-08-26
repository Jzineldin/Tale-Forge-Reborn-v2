import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

serve(async (req: Request) => {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id;

        if (!userId || !planId) {
          throw new Error('Missing metadata');
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Calculate credits based on plan
        const planCredits: Record<string, number> = {
          'premium': 100,
          'pro': 500,
          'family': 1000,
        };

        // Update user subscription in database
        await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: session.customer as string,
            plan_id: planId,
            status: 'active',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            credits_included: planCredits[planId] || 0,
          });

        // Award initial credits
        await supabase.rpc('award_user_credits', {
          user_uuid: userId,
          transaction_type_param: 'subscription',
          credit_amount: planCredits[planId] || 0,
          transaction_description: `${planId} subscription activated`,
          ref_id: subscription.id,
          ref_type: 'subscription',
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user from customer ID
        const { data: customer } = await supabase
          .from('customers')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (customer) {
          await supabase
            .from('user_subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at: subscription.cancel_at 
                ? new Date(subscription.cancel_at * 1000).toISOString() 
                : null,
            })
            .eq('stripe_subscription_id', subscription.id);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        // Get subscription to find user
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('user_id, plan_id, credits_included')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (sub && invoice.billing_reason === 'subscription_cycle') {
          // Award monthly credits on renewal
          await supabase.rpc('award_user_credits', {
            user_uuid: sub.user_id,
            transaction_type_param: 'subscription',
            credit_amount: sub.credits_included,
            transaction_description: 'Monthly subscription renewal',
            ref_id: invoice.id,
            ref_type: 'subscription',
          });
        }

        // Record payment
        await supabase
          .from('payment_history')
          .insert({
            user_id: sub?.user_id,
            stripe_invoice_id: invoice.id,
            amount: invoice.amount_paid / 100, // Convert from cents
            currency: invoice.currency,
            status: 'succeeded',
            description: invoice.description || 'Subscription payment',
          });

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Record failed payment
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', invoice.subscription as string)
          .single();

        if (sub) {
          await supabase
            .from('payment_history')
            .insert({
              user_id: sub.user_id,
              stripe_invoice_id: invoice.id,
              amount: invoice.amount_due / 100,
              currency: invoice.currency,
              status: 'failed',
              description: 'Payment failed',
            });
        }

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});