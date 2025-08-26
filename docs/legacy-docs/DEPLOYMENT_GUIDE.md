# Tale Forge - Credit System Deployment Guide

## Overview
This guide documents the steps needed to deploy the credit system to your Supabase database. The credit system is fully integrated into the frontend with fallback support, but requires database functions to be applied for full functionality.

## Current Status
✅ **Frontend Integration Complete**
- Credit display in navigation bar
- Credit checking in story creation wizard
- Fallback implementation handles missing database functions gracefully
- TypeScript errors fixed
- Development server running successfully

❌ **Database Functions Pending**
- Credit system tables and functions need to be applied
- MCP Supabase connection is in read-only mode
- Manual deployment required

## Manual Database Migration Steps

### Step 1: Apply Credit System Migration
Navigate to your Supabase project dashboard SQL Editor and run the migration:

**File:** `supabase/migrations/20250824000003_credit_system.sql`

This migration includes:
- `user_credits` table for balance tracking
- `credit_transactions` table for transaction history
- `credit_costs` table for pricing configuration
- Core functions: `initialize_user_credits`, `get_user_credits`, `spend_credits`, `add_credits`
- RLS policies for security
- Automatic triggers for user initialization

### Step 2: Apply Analytics System (Optional)
**File:** `supabase/migrations/20250824000002_analytics_system.sql`

### Step 3: Apply Founders Program (Optional)  
**File:** `supabase/migrations/20250824000001_founders_program.sql`

### Step 4: Verify Deployment
Run these verification queries:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_credits', 'credit_transactions', 'credit_costs');

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_user_credits', 'spend_credits', 'calculate_story_cost');

-- Test cost calculation
SELECT * FROM calculate_story_cost('short', true, true);
```

## Alternative: CLI Deployment (If Authentication Fixed)

If you can resolve the Supabase CLI authentication issue:

```bash
# Set environment variable
set SUPABASE_ACCESS_TOKEN=sbp_8ee139e2d600147f4ecf6908a6ce8cce489b3030

# Link project
npx supabase link --project-ref fyihypkigbcmsxyvseca

# Push migrations
npx supabase db push
```

## Testing After Deployment

1. **Credit Display**: Navigate to any page - credit balance should show in top navigation
2. **Story Creation**: Go to `/create` - cost calculation should work without fallbacks
3. **Credit Deduction**: Create a story - credits should be properly deducted
4. **Transaction History**: Check that transactions are logged

## Credit System Configuration

Default costs (configurable via `credit_costs` table):
- Text: 1 credit per chapter
- Images: 2 credits per image (Updated from 3 to 2 in migration)
- Audio: 2 credits per audio segment (Updated from 3 to 2 in migration)

Story types:
- Short: 3 chapters = 15 credits total (with images & audio)
- Medium: 5 chapters = 25 credits total
- Long: 8 chapters = 40 credits total

## Troubleshooting

### If Credit Functions Don't Exist
The frontend includes fallback logic that returns default values:
- Default balance: 15 credits
- Default costs: Original pricing model

### If Users Don't Have Credit Records
The `initialize_user_credits` function handles this automatically, and there's a batch initialization script for existing users.

### If RLS Policies Block Access
Ensure service role authentication is working for Edge Functions.

## Files Modified

### Frontend
- `src/components/navigation/PrimaryNavigation.tsx` - Added credit indicator
- `src/components/business/CreditDisplay.tsx` - Credit display components
- `src/components/organisms/story-creation-wizard/Step5ReviewGenerate.tsx` - Credit checking
- `src/services/creditsService.ts` - Credit management with fallbacks
- `src/hooks/useCredits.ts` - React hooks for credit management

### Backend
- `supabase/migrations/20250824000003_credit_system.sql` - Complete credit system
- `database-setup-complete.sql` - Comprehensive setup script (alternative)

## Next Steps After Deployment

1. Test end-to-end story creation with credit deduction
2. Verify credit refresh works for monthly limits
3. Test subscription upgrade flow (Premium/Pro unlimited credits)
4. Monitor credit transaction logs for accuracy

## Support
The credit system is designed to be resilient - it will work with default values even if database functions are missing. Deploy the migrations when ready to enable full functionality.