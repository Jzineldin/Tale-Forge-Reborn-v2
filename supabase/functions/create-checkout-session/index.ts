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

    const { planId, mode = 'subscription', productId, successUrl, cancelUrl } = await req.json();

    // Price IDs for subscriptions and credit packages
    const priceIds: Record<string, string> = {
      // Subscriptions
      'basic': Deno.env.get('STRIPE_PRICE_BASIC') ?? '',
      'pro': Deno.env.get('STRIPE_PRICE_PRO') ?? '',
      // Credit packages
      'small': Deno.env.get('STRIPE_PRICE_SMALL') ?? '',
      'medium': Deno.env.get('STRIPE_PRICE_MEDIUM') ?? '',
      'large': Deno.env.get('STRIPE_PRICE_LARGE') ?? '',
      'mega': Deno.env.get('STRIPE_PRICE_MEGA') ?? '',
    };

    // For one-time payments, use productId; for subscriptions, use planId
    const priceId = mode === 'payment' ? priceIds[productId] : priceIds[planId];
    if (!priceId) {
      throw new Error(`Invalid ${mode === 'payment' ? 'product' : 'plan'} ID`);
    }

    // Check if customer exists
    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let stripeCustomerId = customer?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      stripeCustomerId = stripeCustomer.id;

      // Save customer ID
      await supabase
        .from('customers')
        .upsert({
          user_id: user.id,
          stripe_customer_id: stripeCustomerId,
        });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode as 'payment' | 'subscription',
      allow_promotion_codes: true,
      success_url: successUrl || `${req.headers.get('origin')}/account/billing?success=true`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/credits`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
    });

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        sessionUrl: session.url 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create checkout session' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});