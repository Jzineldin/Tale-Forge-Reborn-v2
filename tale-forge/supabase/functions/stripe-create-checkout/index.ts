// Tale Forge - Stripe Create Checkout Edge Function
// This function creates a Stripe checkout session for subscription payments

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';
import Stripe from 'https://esm.sh/stripe?target=deno&no-check';

console.log("Stripe Create Checkout function started");

serve(async (req) => {
  try {
    // Validate environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Initialize Stripe
    const stripe = Stripe(stripeSecretKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { headers: { "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get request body
    const { priceId, userId } = await req.json();

    if (!priceId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing priceId or userId in request body' }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch user data from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, id')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user' }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { headers: { "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Get the base URL for redirect URLs
    const baseUrl = Deno.env.get('BASE_URL') || 'http://localhost:3000';
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      success_url: `${baseUrl}/account/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/account/billing`,
      client_reference_id: userId,
      subscription_data: {
        metadata: {
          user_id: userId
        }
      }
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sessionId: session.id,
        checkoutUrl: session.url,
        message: 'Checkout session created successfully'
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in stripe-create-checkout function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});