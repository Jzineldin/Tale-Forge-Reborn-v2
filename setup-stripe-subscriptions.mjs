#!/usr/bin/env node

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

console.log('🚀 Setting up Stripe Subscriptions for Tale-Forge\n');
console.log('================================================\n');

const SUBSCRIPTION_PLANS = [
  {
    name: 'Tale Forge Premium',
    description: 'Perfect for regular storytellers - 100 credits/month + premium features',
    features: [
      '100 story credits per month',
      'Advanced story customization',
      'Priority AI generation',
      'Export to PDF & audio',
      'Email support'
    ],
    price: 999, // $9.99
    credits: 100,
    metadata: {
      tier: 'premium',
      credits_per_month: '100'
    }
  },
  {
    name: 'Tale Forge Pro',
    description: 'For creative professionals - 500 credits/month + all features',
    features: [
      '500 story credits per month',
      'All Premium features',
      'API access',
      'Custom templates',
      'Priority support',
      'Commercial usage rights'
    ],
    price: 2499, // $24.99
    credits: 500,
    metadata: {
      tier: 'pro',
      credits_per_month: '500'
    }
  },
  {
    name: 'Tale Forge Family',
    description: 'Share the magic - 1000 credits/month for the whole family',
    features: [
      '1000 story credits per month',
      'Up to 5 user accounts',
      'All Pro features',
      'Family sharing',
      'Parental controls',
      'Dedicated support'
    ],
    price: 3999, // $39.99
    credits: 1000,
    metadata: {
      tier: 'family',
      credits_per_month: '1000',
      max_users: '5'
    }
  }
];

async function createSubscriptionProducts() {
  const createdProducts = [];
  
  for (const plan of SUBSCRIPTION_PLANS) {
    try {
      console.log(`Creating ${plan.name}...`);
      
      // Create product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: plan.metadata
      });
      
      console.log(`✅ Created product: ${product.id}`);
      
      // Create price (monthly subscription)
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: {
          ...plan.metadata,
          product_name: plan.name
        }
      });
      
      console.log(`✅ Created price: ${price.id} ($${plan.price / 100}/month)`);
      
      createdProducts.push({
        product,
        price,
        plan
      });
      
      console.log('');
    } catch (error) {
      console.error(`❌ Error creating ${plan.name}:`, error.message);
    }
  }
  
  return createdProducts;
}

async function updateEnvironmentFile(products) {
  console.log('\n📝 Updating environment variables...\n');
  
  const envPath = join(__dirname, '.env');
  let envContent = await fs.readFile(envPath, 'utf-8');
  
  const updates = [];
  
  // Find the price IDs for each tier
  for (const { price, plan } of products) {
    const tier = plan.metadata.tier.toUpperCase();
    const key = `STRIPE_PRICE_${tier}`;
    const value = price.id;
    
    // Check if key already exists
    if (envContent.includes(key)) {
      // Update existing key
      envContent = envContent.replace(
        new RegExp(`^${key}=.*$`, 'm'),
        `${key}=${value}`
      );
      console.log(`✅ Updated ${key}=${value}`);
    } else {
      // Add new key
      envContent += `\n${key}=${value}`;
      console.log(`✅ Added ${key}=${value}`);
    }
    
    updates.push({ key, value });
  }
  
  // Save the updated .env file
  await fs.writeFile(envPath, envContent);
  console.log('\n✅ Environment file updated successfully!');
  
  return updates;
}

async function setupWebhook() {
  console.log('\n🔗 Setting up webhook endpoint...\n');
  
  try {
    // Check if webhook already exists
    const existingWebhooks = await stripe.webhookEndpoints.list({ limit: 100 });
    
    // Your production URL - update this with your actual domain
    const webhookUrl = 'https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/stripe-webhook';
    
    const existingWebhook = existingWebhooks.data.find(w => w.url === webhookUrl);
    
    if (existingWebhook) {
      console.log('✅ Webhook already exists:', existingWebhook.id);
      console.log('   URL:', existingWebhook.url);
      console.log('   Status:', existingWebhook.status);
      return existingWebhook;
    }
    
    // Create new webhook
    const webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'payment_intent.succeeded',
        'payment_intent.payment_failed'
      ]
    });
    
    console.log('✅ Webhook created successfully!');
    console.log('   ID:', webhook.id);
    console.log('   URL:', webhook.url);
    console.log('   Secret:', webhook.secret);
    console.log('\n⚠️  IMPORTANT: Update your .env file with:');
    console.log(`   STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
    
    return webhook;
  } catch (error) {
    console.error('❌ Error setting up webhook:', error.message);
    console.log('\n💡 You can manually create a webhook in the Stripe Dashboard:');
    console.log('   1. Go to https://dashboard.stripe.com/webhooks');
    console.log('   2. Click "Add endpoint"');
    console.log('   3. Use URL: https://your-domain.supabase.co/functions/v1/stripe-webhook');
    console.log('   4. Select the events listed above');
    console.log('   5. Copy the signing secret to your .env file');
  }
}

async function main() {
  try {
    // Check for existing subscription products
    console.log('🔍 Checking for existing subscription products...\n');
    const existingProducts = await stripe.products.list({ limit: 100 });
    const subscriptionProducts = existingProducts.data.filter(p => 
      p.name.includes('Premium') || 
      p.name.includes('Pro') || 
      p.name.includes('Family')
    );
    
    if (subscriptionProducts.length > 0) {
      console.log('✅ Found existing subscription products:');
      for (const product of subscriptionProducts) {
        console.log(`   - ${product.name} (${product.id})`);
      }
      
      console.log('\n⚠️  Subscription products already exist.');
      console.log('   Delete them in Stripe Dashboard if you want to recreate.\n');
      
      // Get prices for existing products
      const prices = await stripe.prices.list({ limit: 100 });
      console.log('📋 Price IDs for environment variables:');
      for (const product of subscriptionProducts) {
        const productPrices = prices.data.filter(p => p.product === product.id);
        if (productPrices.length > 0) {
          const tier = product.metadata?.tier || product.name.split(' ').pop().toLowerCase();
          console.log(`   STRIPE_PRICE_${tier.toUpperCase()}=${productPrices[0].id}`);
        }
      }
    } else {
      // Create new subscription products
      const products = await createSubscriptionProducts();
      
      if (products.length > 0) {
        // Update environment file
        await updateEnvironmentFile(products);
      }
    }
    
    // Setup webhook
    await setupWebhook();
    
    console.log('\n================================================');
    console.log('✅ Stripe subscription setup complete!\n');
    
    console.log('📋 Next steps:');
    console.log('1. Update Supabase Edge Function environment variables');
    console.log('2. Deploy your edge functions to Supabase');
    console.log('3. Test the payment flow in development');
    console.log('4. Verify webhook events are being received\n');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
main();