-- =============================================================================
-- TALE FORGE REBORN 2025 - MIGRATION STEP 1: CLEANUP
-- Run this first to clean up unused tables
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Drop old subscription system (it's empty)
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- Drop any test tables that might exist
DROP TABLE IF EXISTS public.test_table CASCADE;
DROP TABLE IF EXISTS public.temp_migration CASCADE;
DROP TABLE IF EXISTS public._supabase_migrations CASCADE;

-- Success message
SELECT 'Step 1 Complete: Cleanup finished' as result;