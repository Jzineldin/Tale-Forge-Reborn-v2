#!/usr/bin/env node

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

console.log('🧪 Testing Stripe Integration for Tale-Forge\n');
console.log('============================================\n');

async function testStripeConnection() {
  try {
    // Test 1: Verify API key works
    console.log('1. Testing API connection...');
    const account = await stripe.accounts.retrieve();
    console.log('✅ Connected to Stripe account:', account.email || account.id);
    console.log('   Business Name:', account.business_profile?.name || 'Not set');
    console.log('   Country:', account.country);
    console.log('');

    // Test 2: List products
    console.log('2. Fetching products...');
    const products = await stripe.products.list({ limit: 10 });
    if (products.data.length > 0) {
      console.log('✅ Found', products.data.length, 'products:');
      for (const product of products.data) {
        console.log(`   - ${product.name} (${product.id})`);
        if (product.description) {
          console.log(`     ${product.description}`);
        }
      }
    } else {
      console.log('⚠️  No products found');
    }
    console.log('');

    // Test 3: List prices
    console.log('3. Fetching prices...');
    const prices = await stripe.prices.list({ limit: 10 });
    if (prices.data.length > 0) {
      console.log('✅ Found', prices.data.length, 'prices:');
      for (const price of prices.data) {
        const product = typeof price.product === 'string' 
          ? await stripe.products.retrieve(price.product)
          : price.product;
        
        const amount = price.unit_amount 
          ? `${(price.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()}`
          : 'Custom';
        
        const recurring = price.recurring 
          ? ` / ${price.recurring.interval}`
          : '';
          
        console.log(`   - ${product.name}: ${amount}${recurring}`);
        console.log(`     Price ID: ${price.id}`);
        console.log(`     Product ID: ${typeof price.product === 'string' ? price.product : price.product.id}`);
      }
    } else {
      console.log('⚠️  No prices found');
    }
    console.log('');

    // Test 4: Check for subscription plans
    console.log('4. Checking subscription configuration...');
    const subscriptionProducts = products.data.filter(p => 
      p.name.toLowerCase().includes('subscription') || 
      p.name.toLowerCase().includes('premium') ||
      p.name.toLowerCase().includes('pro') ||
      p.name.toLowerCase().includes('family')
    );
    
    if (subscriptionProducts.length > 0) {
      console.log('✅ Found', subscriptionProducts.length, 'subscription products');
    } else {
      console.log('⚠️  No subscription products found - you may need to create them');
    }

    // Test 5: Check for credit packages
    console.log('\n5. Checking credit packages...');
    const creditProducts = products.data.filter(p => 
      p.name.toLowerCase().includes('credit') || 
      p.name.toLowerCase().includes('pack') ||
      p.name.toLowerCase().includes('starter') ||
      p.name.toLowerCase().includes('popular') ||
      p.name.toLowerCase().includes('value') ||
      p.name.toLowerCase().includes('mega')
    );
    
    if (creditProducts.length > 0) {
      console.log('✅ Found', creditProducts.length, 'credit packages');
    } else {
      console.log('⚠️  No credit packages found - you may need to create them');
    }

    // Test 6: Check webhook endpoints
    console.log('\n6. Checking webhook endpoints...');
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    if (webhooks.data.length > 0) {
      console.log('✅ Found', webhooks.data.length, 'webhook endpoints:');
      for (const webhook of webhooks.data) {
        console.log(`   - ${webhook.url}`);
        console.log(`     Status: ${webhook.status}`);
        console.log(`     Events: ${webhook.enabled_events.slice(0, 3).join(', ')}...`);
      }
    } else {
      console.log('⚠️  No webhook endpoints configured');
      console.log('   You need to set up a webhook endpoint for handling payments');
    }

    console.log('\n============================================');
    console.log('✅ Stripe integration test completed!\n');

    // Provide recommendations
    console.log('📋 Recommendations:\n');
    
    if (products.data.length === 0) {
      console.log('1. Create products in Stripe Dashboard:');
      console.log('   - Credit packages (Starter, Popular, Value, Mega)');
      console.log('   - Subscription tiers (Premium, Pro, Family)\n');
    }

    if (webhooks.data.length === 0) {
      console.log('2. Set up webhook endpoint:');
      console.log('   URL: https://your-domain.com/functions/v1/stripe-webhook');
      console.log('   Events: checkout.session.completed, customer.subscription.*\n');
    }

    console.log('3. Environment variables needed in Supabase:');
    console.log('   - STRIPE_SECRET_KEY');
    console.log('   - STRIPE_WEBHOOK_SECRET');
    console.log('   - STRIPE_PRICE_PREMIUM');
    console.log('   - STRIPE_PRICE_PRO');
    console.log('   - STRIPE_PRICE_FAMILY\n');

  } catch (error) {
    console.error('❌ Error testing Stripe:', error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n⚠️  Invalid API key. Please check your STRIPE_SECRET_KEY in .env');
    } else if (error.type === 'StripePermissionError') {
      console.error('\n⚠️  API key doesn\'t have required permissions');
    }
  }
}

// Run the test
testStripeConnection();