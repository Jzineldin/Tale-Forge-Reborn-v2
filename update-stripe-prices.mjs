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

console.log('📊 Updating Stripe Products to Match Pricing Page\n');
console.log('=================================================\n');

async function archiveOldSubscriptions() {
  console.log('🔍 Finding and archiving old subscription products...\n');
  
  const products = await stripe.products.list({ limit: 100 });
  const subscriptionProducts = products.data.filter(p => 
    p.name.includes('Premium') || 
    p.name.includes('Pro') || 
    p.name.includes('Family')
  );
  
  for (const product of subscriptionProducts) {
    try {
      await stripe.products.update(product.id, { active: false });
      console.log(`📦 Archived: ${product.name} (${product.id})`);
    } catch (error) {
      console.log(`⚠️  Could not archive ${product.name}: ${error.message}`);
    }
  }
  
  console.log('');
}

async function createCorrectSubscriptions() {
  console.log('✨ Creating correct subscription plans...\n');
  
  const subscriptionPlans = [
    {
      name: 'Tale Forge Basic Creator',
      description: '100 credits per month for regular storytellers',
      price: 999, // $9.99
      credits: 100,
      metadata: {
        tier: 'basic',
        credits_per_month: '100',
        plan_type: 'subscription'
      }
    },
    {
      name: 'Tale Forge Pro Storyteller',
      description: '250 credits per month - Best value for families',
      price: 1999, // $19.99
      credits: 250,
      metadata: {
        tier: 'pro',
        credits_per_month: '250',
        plan_type: 'subscription',
        popular: 'true'
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

async function updateCreditPackagePrices() {
  console.log('💳 Updating credit package prices...\n');
  
  // Correct prices from your pricing page
  const correctPrices = {
    'prod_SvymmYp2coYnM0': { name: 'Small Bundle', credits: 50, price: 500 },    // $5
    'prod_Svym6HPv40z2k1': { name: 'Medium Bundle', credits: 100, price: 1000 }, // $10
    'prod_SvymqbrtoB9AxI': { name: 'Large Bundle', credits: 250, price: 2250 },  // $22.50
    'prod_Svyn8Cpibzu67p': { name: 'Mega Bundle', credits: 500, price: 4000 }    // $40
  };
  
  for (const [productId, details] of Object.entries(correctPrices)) {
    try {
      // Update product name and metadata
      await stripe.products.update(productId, {
        name: `Tale Forge Credits - ${details.name}`,
        description: `${details.credits} Story Credits for Tale Forge`,
        metadata: {
          credits: details.credits.toString(),
          bundle_type: details.name.toLowerCase().replace(' ', '_')
        }
      });
      
      // Get existing prices for this product
      const prices = await stripe.prices.list({ product: productId, limit: 100 });
      
      // Archive old prices if they don't match
      for (const price of prices.data) {
        if (price.unit_amount !== details.price) {
          await stripe.prices.update(price.id, { active: false });
          console.log(`📦 Archived old price: ${price.id}`);
        }
      }
      
      // Check if correct price exists
      const correctPrice = prices.data.find(p => p.unit_amount === details.price && p.active);
      
      if (!correctPrice) {
        // Create new price
        const newPrice = await stripe.prices.create({
          product: productId,
          unit_amount: details.price,
          currency: 'usd',
          metadata: {
            credits: details.credits.toString(),
            bundle_name: details.name
          }
        });
        
        console.log(`✅ Updated ${details.name}:`);
        console.log(`   Product ID: ${productId}`);
        console.log(`   New Price ID: ${newPrice.id}`);
        console.log(`   Amount: $${details.price / 100} for ${details.credits} credits\n`);
      } else {
        console.log(`✅ ${details.name} already has correct price:`);
        console.log(`   Product ID: ${productId}`);
        console.log(`   Price ID: ${correctPrice.id}`);
        console.log(`   Amount: $${details.price / 100} for ${details.credits} credits\n`);
      }
      
    } catch (error) {
      console.error(`❌ Error updating ${productId}: ${error.message}\n`);
    }
  }
}

async function updateEnvironmentVariables(products) {
  console.log('\n📝 Environment Variables to Update:\n');
  console.log('Add these to your .env and Supabase secrets:\n');
  
  for (const { price, plan } of products) {
    const tier = plan.metadata.tier.toUpperCase();
    console.log(`STRIPE_PRICE_${tier}=${price.id}`);
  }
  
  console.log('\nCredit Package Price IDs (already set):');
  console.log('STRIPE_PRICE_SMALL=<get from Stripe dashboard>');
  console.log('STRIPE_PRICE_MEDIUM=<get from Stripe dashboard>');
  console.log('STRIPE_PRICE_LARGE=<get from Stripe dashboard>');
  console.log('STRIPE_PRICE_MEGA=<get from Stripe dashboard>');
}

async function main() {
  try {
    // Archive old subscriptions
    await archiveOldSubscriptions();
    
    // Create correct subscription plans
    const subscriptionProducts = await createCorrectSubscriptions();
    
    // Update credit package prices
    await updateCreditPackagePrices();
    
    // Show environment variables to update
    await updateEnvironmentVariables(subscriptionProducts);
    
    console.log('\n=================================================');
    console.log('✅ Stripe products updated to match pricing page!\n');
    
    console.log('📋 Next steps:');
    console.log('1. Update environment variables in .env');
    console.log('2. Update Supabase secrets with: supabase secrets set');
    console.log('3. Redeploy edge functions');
    console.log('4. Test purchases at /stripe-test\n');
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  }
}

// Run the update
main();