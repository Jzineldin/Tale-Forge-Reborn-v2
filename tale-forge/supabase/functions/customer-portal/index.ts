// Tale Forge - Customer Portal Edge Function
// This function creates a Stripe customer portal session

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';
import Stripe from 'https://esm.sh/stripe?target=deno&no-check';

console.log("Customer Portal function started");

serve(async (req) => {
  try {
    // Validate environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
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
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId in request body' }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch user's subscription data from Supabase
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscription' }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!subscription || !subscription.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: 'No active subscription found for user' }),
        { headers: { "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Get the base URL for redirect URLs
    const baseUrl = Deno.env.get('BASE_URL') || 'http://localhost:3000';
    
    // Create Stripe customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${baseUrl}/account/billing`
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        portalUrl: session.url,
        message: 'Customer portal session created successfully'
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in customer-portal function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});