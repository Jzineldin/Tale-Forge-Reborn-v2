import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

// Credit package mappings
const CREDIT_PACKAGES: Record<string, number> = {
  'prod_SvymmYp2coYnM0': 50,  // Starter Pack
  'prod_Svym6HPv40z2k1': 100, // Popular Pack  
  'prod_SvymqbrtoB9AxI': 250, // Value Pack
  'prod_Svyn8Cpibzu67p': 500, // Mega Pack
};

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify webhook signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    const body = await req.text();
    
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get customer email
        const customerEmail = session.customer_email;
        if (!customerEmail) {
          console.error('No customer email in session');
          return new Response('No customer email', { status: 400 });
        }

        // Get user by email
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .single();

        if (userError || !userData) {
          console.error('User not found:', customerEmail);
          return new Response('User not found', { status: 404 });
        }

        const userId = userData.id;

        // Get line items to determine which product was purchased
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        
        for (const item of lineItems.data) {
          if (item.price?.product) {
            const productId = typeof item.price.product === 'string' 
              ? item.price.product 
              : item.price.product.id;
            
            const creditsToAdd = CREDIT_PACKAGES[productId];
            
            if (creditsToAdd) {
              // Check if user_credits record exists
              const { data: existingCredits } = await supabase
                .from('user_credits')
                .select('balance')
                .eq('user_id', userId)
                .single();

              if (existingCredits) {
                // Update existing record
                const { error: updateError } = await supabase
                  .from('user_credits')
                  .update({ 
                    balance: existingCredits.balance + creditsToAdd,
                    updated_at: new Date().toISOString()
                  })
                  .eq('user_id', userId);

                if (updateError) {
                  console.error('Error updating credits:', updateError);
                  return new Response('Failed to update credits', { status: 500 });
                }
              } else {
                // Create new record
                const { error: insertError } = await supabase
                  .from('user_credits')
                  .insert({ 
                    user_id: userId,
                    balance: creditsToAdd,
                    lifetime_earned: creditsToAdd,
                    lifetime_spent: 0
                  });

                if (insertError) {
                  console.error('Error creating credits:', insertError);
                  return new Response('Failed to create credits', { status: 500 });
                }
              }

              // Log the transaction
              const { error: transactionError } = await supabase
                .from('credit_transactions')
                .insert({
                  user_id: userId,
                  transaction_type: 'purchase',
                  amount: creditsToAdd,
                  description: `Purchased ${creditsToAdd} credits`,
                  reference_id: session.id,
                  reference_type: 'stripe_session',
                  metadata: {
                    product_id: productId,
                    payment_intent: session.payment_intent,
                    amount_total: session.amount_total,
                    currency: session.currency
                  }
                });

              if (transactionError) {
                console.error('Error logging transaction:', transactionError);
                // Don't fail the webhook for this
              }

              console.log(`Added ${creditsToAdd} credits to user ${userId}`);
            }
          }
        }
        
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        // Could send failure notification email here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});