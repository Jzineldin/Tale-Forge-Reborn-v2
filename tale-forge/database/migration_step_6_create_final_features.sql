-- =============================================================================
-- TALE FORGE REBORN 2025 - MIGRATION STEP 6: CREATE FINAL FEATURES
-- Run this sixth to create image generation, admin tools, and analytics
-- =============================================================================

-- AI Image generations tracking
CREATE TABLE IF NOT EXISTS public.image_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES public.story_segments(id) ON DELETE CASCADE,
    character_id UUID REFERENCES public.story_characters(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    style TEXT DEFAULT 'fantasy',
    model TEXT DEFAULT 'stable-diffusion',
    image_url TEXT,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    generation_time INTEGER,
    cost_credits INTEGER DEFAULT 1,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add status constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'image_generations_status_check'
    ) THEN
        ALTER TABLE public.image_generations ADD CONSTRAINT image_generations_status_check 
        CHECK (status IN ('pending', 'generating', 'completed', 'failed'));
    END IF;
END$$;

-- Content reports for moderation
CREATE TABLE IF NOT EXISTS public.content_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES auth.users(id),
    story_id UUID REFERENCES public.stories(id),
    segment_id UUID REFERENCES public.story_segments(id),
    report_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    admin_notes TEXT,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add report constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'content_reports_type_check'
    ) THEN
        ALTER TABLE public.content_reports ADD CONSTRAINT content_reports_type_check 
        CHECK (report_type IN ('inappropriate', 'spam', 'copyright', 'violence', 'other'));
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'content_reports_status_check'
    ) THEN
        ALTER TABLE public.content_reports ADD CONSTRAINT content_reports_status_check 
        CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'));
    END IF;
END$$;

-- Admin actions for audit trail
CREATE TABLE IF NOT EXISTS public.admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add notification type constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'notifications_type_check'
    ) THEN
        ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
        CHECK (type IN ('story_liked', 'story_shared', 'new_follower', 'admin_message', 'system'));
    END IF;
END$$;

-- Success message
SELECT 'Step 6 Complete: Final features created (image generation, admin tools, notifications)' as result;