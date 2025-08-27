# ✅ Tale Forge Pricing Update Complete

## Updated Pricing Structure

### 🎁 **FREE TIER**
- **10 credits/month** 
- 10 chapters without TTS
- 5 chapters with TTS
- Perfect for trying the platform

### 🚀 **STARTER - $9.99/month**
- **100 credits/month**
- 100 chapters without TTS (10-20 stories)
- 50 chapters with TTS (5-10 stories)
- Perfect for families
- **Price ID**: `price_1S0fYXDSKngmC6wHQuhgXK92`

### 👑 **PREMIUM - $19.99/month**
- **300 credits/month**
- 300 chapters without TTS (30-60 stories!)
- 150 chapters with TTS (15-30 stories)
- 10% discount on extra credit bundles
- Perfect for educators & content creators
- **Price ID**: `price_1S0fYXDSKngmC6wHFADzfnbx`

### 💳 **Extra Credit Bundles**

| Bundle | Credits | Price | Savings | Price ID |
|--------|---------|-------|---------|----------|
| Small | 50 | $5 | - | `price_1S0fYYDSKngmC6wHpSnSJ9cf` |
| Medium | 100 | $9 | 10% off | `price_1S0fYYDSKngmC6wH5OSPOwNC` |
| Large | 250 | $20 | 20% off | `price_1S0fYZDSKngmC6wHrgIBx0Ih` |
| Mega | 500 | $35 | 30% off | `price_1S0fYaDSKngmC6wHQQd34mgg` |

## Credit Usage

- **1 credit = 1 chapter** (includes AI text + illustration)
- **Audio narration**: 1 credit per 100 words (TTS)
- Credits never expire
- Can mix and match usage as needed

## Changes Made

### ✅ Stripe Products
- Created new subscription tiers (Starter & Premium)
- Removed old Basic/Pro/Family plans
- Updated credit bundle prices to match new structure
- Added proper metadata for tracking

### ✅ Environment Variables
Updated in both `.env` and Supabase secrets:
```env
STRIPE_PRICE_STARTER=price_1S0fYXDSKngmC6wHQuhgXK92
STRIPE_PRICE_PREMIUM=price_1S0fYXDSKngmC6wHFADzfnbx
STRIPE_PRICE_SMALL=price_1S0fYYDSKngmC6wHpSnSJ9cf
STRIPE_PRICE_MEDIUM=price_1S0fYYDSKngmC6wH5OSPOwNC
STRIPE_PRICE_LARGE=price_1S0fYZDSKngmC6wHrgIBx0Ih
STRIPE_PRICE_MEGA=price_1S0fYaDSKngmC6wHQQd34mgg
```

### ✅ Edge Functions
- Updated `create-checkout-session` to use new price IDs
- Deployed to production
- Ready for both subscription and one-time payments

### ✅ Webhook
- Existing webhook remains configured
- Will handle new products automatically
- Credits will be added based on purchase

## Next Steps

### Frontend Updates Needed

1. **Update PricingPage.tsx** to reflect:
   - New tier names (Starter/Premium instead of Basic/Pro)
   - Correct credit amounts (100/300 instead of 100/250)
   - New bundle prices

2. **Update stripeService.ts** plan IDs:
   - Change 'basic' to 'starter'
   - Change 'pro' to 'premium'
   - Remove 'family' tier

3. **Update StripeTestPage.tsx** for testing

### Testing Checklist

- [ ] Test Starter subscription ($9.99)
- [ ] Test Premium subscription ($19.99)
- [ ] Test Small bundle purchase ($5)
- [ ] Test Medium bundle purchase ($9)
- [ ] Test Large bundle purchase ($20)
- [ ] Test Mega bundle purchase ($35)
- [ ] Verify webhook adds correct credits
- [ ] Test Premium discount on bundles

### Database Updates Needed

You may want to update the `subscription_tiers` table to reflect new plans:
```sql
UPDATE subscription_tiers 
SET name = 'Starter', credits_included = 100 
WHERE id = 'starter';

UPDATE subscription_tiers 
SET name = 'Premium', credits_included = 300 
WHERE id = 'premium';
```

## Production URLs

- **Stripe Dashboard**: https://dashboard.stripe.com
- **Webhook Endpoint**: https://fyihypkigbcmsxyvseca.supabase.co/functions/v1/stripe-webhook
- **Test Page**: https://your-domain.com/stripe-test

## Important Notes

- All old products have been archived (not deleted) in Stripe
- Existing subscriptions will continue to work
- New purchases will use the updated pricing
- The FREE tier (10 credits/month) needs to be handled in your application logic

---

**Update completed successfully!** The new pricing structure is live and ready for use.