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

console.log('📊 Updating Stripe Products to New Pricing Structure\n');
console.log('====================================================\n');

async function archiveAllOldProducts() {
  console.log('🔍 Archiving all old products...\n');
  
  const products = await stripe.products.list({ limit: 100 });
  
  for (const product of products.data) {
    if (product.active) {
      try {
        await stripe.products.update(product.id, { active: false });
        console.log(`📦 Archived: ${product.name} (${product.id})`);
      } catch (error) {
        console.log(`⚠️  Could not archive ${product.name}: ${error.message}`);
      }
    }
  }
  
  console.log('');
}

async function createNewSubscriptions() {
  console.log('✨ Creating new subscription plans...\n');
  
  const subscriptionPlans = [
    {
      name: 'Tale Forge Starter',
      description: '100 credits per month - Perfect for families',
      price: 999, // $9.99
      credits: 100,
      metadata: {
        tier: 'starter',
        credits_per_month: '100',
        plan_type: 'subscription'
      }
    },
    {
      name: 'Tale Forge Premium',
      description: '300 credits per month - For educators & creators + 10% discount on bundles',
      price: 1999, // $19.99
      credits: 300,
      metadata: {
        tier: 'premium',
        credits_per_month: '300',
        plan_type: 'subscription',
        popular: 'true',
        bundle_discount: '10'
      }
    }
  ];
  
  const createdProducts = [];
  
  for (const plan of subscriptionPlans) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: plan.metadata
      });
      
      console.log(`✅ Created product: ${product.name}`);
      
      // Create monthly price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: plan.metadata
      });
      
      console.log(`   Price ID: ${price.id} ($${plan.price / 100}/month)`);
      console.log(`   Credits: ${plan.credits}/month\n`);
      
      createdProducts.push({ product, price, plan });
    } catch (error) {
      console.error(`❌ Error creating ${plan.name}: ${error.message}\n`);
    }
  }
  
  return createdProducts;
}

async function createCreditBundles() {
  console.log('💳 Creating credit bundles...\n');
  
  const creditBundles = [
    {
      name: 'Tale Forge Credits - Small Bundle',
      description: '50 Story Credits',
      price: 500, // $5
      credits: 50,
      metadata: {
        credits: '50',
        bundle_type: 'small'
      }
    },
    {
      name: 'Tale Forge Credits - Medium Bundle',
      description: '100 Story Credits',
      price: 900, // $9
      credits: 100,
      metadata: {
        credits: '100',
        bundle_type: 'medium',
        savings: '10% off'
      }
    },
    {
      name: 'Tale Forge Credits - Large Bundle',
      description: '250 Story Credits - Save 20%',
      price: 2000, // $20
      credits: 250,
      metadata: {
        credits: '250',
        bundle_type: 'large',
        savings: '20% off',
        popular: 'true'
      }
    },
    {
      name: 'Tale Forge Credits - Mega Bundle',
      description: '500 Story Credits - Save 30%',
      price: 3500, // $35
      credits: 500,
      metadata: {
        credits: '500',
        bundle_type: 'mega',
        savings: '30% off'
      }
    }
  ];
  
  const createdBundles = [];
  
  for (const bundle of creditBundles) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: bundle.name,
        description: bundle.description,
        metadata: bundle.metadata
      });
      
      console.log(`✅ Created product: ${product.name}`);
      
      // Create one-time price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: bundle.price,
        currency: 'usd',
        metadata: bundle.metadata
      });
      
      console.log(`   Price ID: ${price.id} ($${bundle.price / 100})`);
      console.log(`   Credits: ${bundle.credits}\n`);
      
      createdBundles.push({ product, price, bundle });
    } catch (error) {
      console.error(`❌ Error creating ${bundle.name}: ${error.message}\n`);
    }
  }
  
  return createdBundles;
}

async function outputEnvironmentVariables(subscriptions, bundles) {
  console.log('\n📝 New Environment Variables:\n');
  console.log('Add these to your .env and Supabase secrets:\n');
  
  console.log('# Subscription Plans');
  for (const { price, plan } of subscriptions) {
    const tier = plan.metadata.tier.toUpperCase();
    console.log(`STRIPE_PRICE_${tier}=${price.id}`);
  }
  
  console.log('\n# Credit Bundles');
  for (const { price, bundle } of bundles) {
    const type = bundle.metadata.bundle_type.toUpperCase();
    console.log(`STRIPE_PRICE_${type}=${price.id}`);
  }
  
  console.log('\n# Product IDs (for checkout)');
  for (const { product, bundle } of bundles) {
    const type = bundle.metadata.bundle_type.toUpperCase();
    console.log(`STRIPE_PRODUCT_${type}=${product.id}`);
  }
}

async function main() {
  try {
    // Archive old products
    await archiveAllOldProducts();
    
    // Create new subscription plans
    const subscriptions = await createNewSubscriptions();
    
    // Create credit bundles
    const bundles = await createCreditBundles();
    
    // Output environment variables
    await outputEnvironmentVariables(subscriptions, bundles);
    
    console.log('\n====================================================');
    console.log('✅ Stripe products updated to new pricing structure!\n');
    
    console.log('📋 Next steps:');
    console.log('1. Update .env with new price IDs');
    console.log('2. Run: supabase secrets set <variables>');
    console.log('3. Update PricingPage.tsx with new structure');
    console.log('4. Deploy edge functions');
    console.log('5. Test at /stripe-test\n');
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  }
}

// Run the update
main();