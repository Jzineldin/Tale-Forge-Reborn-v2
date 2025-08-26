--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA _realtime;


--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- Name: add_credits(uuid, integer, text, uuid, character varying, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_credits(user_uuid uuid, credits_to_add integer, description_text text, ref_id uuid DEFAULT NULL::uuid, ref_type character varying DEFAULT NULL::character varying, transaction_metadata jsonb DEFAULT '{}'::jsonb) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Get current balance with row lock
  SELECT current_balance INTO current_balance
  FROM user_credits
  WHERE user_id = user_uuid
  FOR UPDATE;
  
  -- Initialize if user doesn't exist
  IF current_balance IS NULL THEN
    PERFORM initialize_user_credits(user_uuid);
    current_balance := 15; -- Default initial credits
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance + credits_to_add;
  
  -- Update user credits
  UPDATE user_credits
  SET 
    current_balance = new_balance,
    total_earned = total_earned + credits_to_add,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  -- Record transaction
  INSERT INTO credit_transactions (
    user_id,
    transaction_type,
    amount,
    balance_after,
    description,
    reference_id,
    reference_type,
    metadata
  ) VALUES (
    user_uuid,
    'earn',
    credits_to_add,
    new_balance,
    description_text,
    ref_id,
    ref_type,
    transaction_metadata
  );
  
  RETURN TRUE;
END;
$$;


--
-- Name: calculate_story_cost(character varying, boolean, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_story_cost(story_type character varying, include_images boolean DEFAULT true, include_audio boolean DEFAULT true) RETURNS TABLE(chapters integer, text_cost integer, image_cost integer, audio_cost integer, total_cost integer)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  chapter_count INTEGER;
  text_unit_cost INTEGER;
  image_unit_cost INTEGER;
  audio_unit_cost INTEGER;
BEGIN
  -- Get unit costs
  SELECT cost_per_unit INTO text_unit_cost FROM credit_costs WHERE action_type = 'story_text';
  SELECT cost_per_unit INTO image_unit_cost FROM credit_costs WHERE action_type = 'story_image';
  SELECT cost_per_unit INTO audio_unit_cost FROM credit_costs WHERE action_type = 'story_audio';
  
  -- Determine chapter count based on story type
  CASE story_type
    WHEN 'short' THEN chapter_count := 3;
    WHEN 'medium' THEN chapter_count := 5;
    WHEN 'long' THEN chapter_count := 8;
    ELSE chapter_count := 3; -- default to short
  END CASE;
  
  RETURN QUERY SELECT
    chapter_count,
    chapter_count * text_unit_cost,
    CASE WHEN include_images THEN chapter_count * image_unit_cost ELSE 0 END,
    CASE WHEN include_audio THEN chapter_count * audio_unit_cost ELSE 0 END,
    chapter_count * text_unit_cost + 
    CASE WHEN include_images THEN chapter_count * image_unit_cost ELSE 0 END +
    CASE WHEN include_audio THEN chapter_count * audio_unit_cost ELSE 0 END;
END;
$$;


--
-- Name: get_credit_transactions(uuid, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_credit_transactions(user_uuid uuid, limit_count integer DEFAULT 50, offset_count integer DEFAULT 0) RETURNS TABLE(id uuid, transaction_type character varying, amount integer, balance_after integer, description text, reference_id uuid, reference_type character varying, metadata jsonb, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.id,
    ct.transaction_type,
    ct.amount,
    ct.balance_after,
    ct.description,
    ct.reference_id,
    ct.reference_type,
    ct.metadata,
    ct.created_at
  FROM credit_transactions ct
  WHERE ct.user_id = user_uuid
  ORDER BY ct.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;


--
-- Name: get_founders_program_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_founders_program_status() RETURNS TABLE(is_active boolean, total_spots integer, spots_claimed integer, spots_remaining integer, program_end_date timestamp with time zone, last_founder_number integer)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fps.is_active,
        fps.total_spots,
        fps.spots_claimed,
        (fps.total_spots - fps.spots_claimed) as spots_remaining,
        fps.program_end_date,
        COALESCE(MAX(fp.founder_number), 0) as last_founder_number
    FROM founders_program_settings fps
    LEFT JOIN founders_program fp ON fp.is_active = true
    WHERE fps.id = 1
    GROUP BY fps.is_active, fps.total_spots, fps.spots_claimed, fps.program_end_date;
END;
$$;


--
-- Name: FUNCTION get_founders_program_status(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_founders_program_status() IS 'Returns current program status for real-time counters';


--
-- Name: get_next_founder_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_next_founder_number() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    next_number INTEGER;
    program_active BOOLEAN;
    spots_remaining INTEGER;
BEGIN
    -- Check if program is still active
    SELECT 
        is_active,
        (total_spots - spots_claimed)
    INTO 
        program_active,
        spots_remaining
    FROM founders_program_settings 
    WHERE id = 1;
    
    -- Return NULL if program is inactive or full
    IF NOT program_active OR spots_remaining <= 0 THEN
        RETURN NULL;
    END IF;
    
    -- Get the next available number
    SELECT spots_claimed + 1 
    INTO next_number
    FROM founders_program_settings 
    WHERE id = 1;
    
    -- Ensure we don't exceed 200
    IF next_number > 200 THEN
        RETURN NULL;
    END IF;
    
    RETURN next_number;
END;
$$;


--
-- Name: get_user_credits(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_credits(user_uuid uuid) RETURNS TABLE(current_balance integer, total_earned integer, total_spent integer, last_refresh timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.current_balance,
    uc.total_earned,
    uc.total_spent,
    uc.last_monthly_refresh
  FROM user_credits uc
  WHERE uc.user_id = user_uuid;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;


--
-- Name: initialize_user_credits(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.initialize_user_credits(user_uuid uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  initial_credits INTEGER := 15; -- Free tier monthly credits
BEGIN
  INSERT INTO user_credits (user_id, current_balance, total_earned, last_monthly_refresh)
  VALUES (user_uuid, initial_credits, initial_credits, NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Record the initial credit grant transaction
  INSERT INTO credit_transactions (
    user_id, 
    transaction_type, 
    amount, 
    balance_after, 
    description,
    reference_type
  ) VALUES (
    user_uuid,
    'monthly_refresh',
    initial_credits,
    initial_credits,
    'Initial free tier credits',
    'signup'
  ) ON CONFLICT DO NOTHING;
END;
$$;


--
-- Name: refresh_monthly_credits(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.refresh_monthly_credits(user_uuid uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  user_role TEXT;
  monthly_credits INTEGER := 15;
  current_balance INTEGER;
  last_refresh TIMESTAMP WITH TIME ZONE;
  should_refresh BOOLEAN := FALSE;
BEGIN
  -- Get user role and current credit info
  SELECT 
    up.role,
    uc.current_balance,
    uc.last_monthly_refresh
  INTO user_role, current_balance, last_refresh
  FROM user_profiles up
  LEFT JOIN user_credits uc ON up.id = uc.user_id
  WHERE up.id = user_uuid;
  
  -- Only refresh for free tier users
  IF user_role != 'free' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if it's been at least 30 days since last refresh
  IF last_refresh IS NULL OR last_refresh < (NOW() - INTERVAL '30 days') THEN
    should_refresh := TRUE;
  END IF;
  
  IF should_refresh THEN
    -- Initialize credits if user doesn't have record
    IF current_balance IS NULL THEN
      PERFORM initialize_user_credits(user_uuid);
    ELSE
      -- Reset to monthly allowance
      UPDATE user_credits
      SET 
        current_balance = monthly_credits,
        total_earned = total_earned + monthly_credits,
        last_monthly_refresh = NOW(),
        updated_at = NOW()
      WHERE user_id = user_uuid;
      
      -- Record transaction
      INSERT INTO credit_transactions (
        user_id,
        transaction_type,
        amount,
        balance_after,
        description,
        reference_type
      ) VALUES (
        user_uuid,
        'monthly_refresh',
        monthly_credits,
        monthly_credits,
        'Monthly free tier credit refresh',
        'subscription'
      );
    END IF;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;


--
-- Name: register_founder(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.register_founder(p_user_id uuid, p_tier text) RETURNS TABLE(founder_number integer, referral_code text, success boolean, message text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_founder_number INTEGER;
    v_referral_code TEXT;
    v_program_active BOOLEAN;
    v_spots_remaining INTEGER;
BEGIN
    -- Check if user is already a founder
    IF EXISTS (SELECT 1 FROM founders_program WHERE user_id = p_user_id) THEN
        RETURN QUERY SELECT NULL::INTEGER, NULL::TEXT, false, 'User is already a founder';
        RETURN;
    END IF;
    
    -- Check program status
    SELECT 
        is_active,
        (total_spots - spots_claimed)
    INTO 
        v_program_active,
        v_spots_remaining
    FROM founders_program_settings 
    WHERE id = 1;
    
    IF NOT v_program_active THEN
        RETURN QUERY SELECT NULL::INTEGER, NULL::TEXT, false, 'Founders program is not active';
        RETURN;
    END IF;
    
    IF v_spots_remaining <= 0 THEN
        RETURN QUERY SELECT NULL::INTEGER, NULL::TEXT, false, 'All founder spots have been claimed';
        RETURN;
    END IF;
    
    -- Get next founder number
    SELECT get_next_founder_number() INTO v_founder_number;
    
    IF v_founder_number IS NULL THEN
        RETURN QUERY SELECT NULL::INTEGER, NULL::TEXT, false, 'No founder spots available';
        RETURN;
    END IF;
    
    -- Generate unique referral code
    v_referral_code := 'FOUNDER' || LPAD(v_founder_number::TEXT, 3, '0');
    
    -- Insert new founder record
    INSERT INTO founders_program (
        user_id,
        founder_number,
        tier_when_qualified,
        referral_code,
        payment_verified_at
    ) VALUES (
        p_user_id,
        v_founder_number,
        p_tier,
        v_referral_code,
        NOW()
    );
    
    -- Update user profile
    UPDATE user_profiles 
    SET 
        is_founder = true,
        founder_number = v_founder_number,
        founder_benefits_active = true
    WHERE id = p_user_id;
    
    -- Update program counter
    UPDATE founders_program_settings 
    SET 
        spots_claimed = spots_claimed + 1,
        updated_at = NOW()
    WHERE id = 1;
    
    -- Log the founder registration
    INSERT INTO founder_benefits_log (
        founder_id,
        benefit_type,
        description
    ) SELECT 
        fp.id,
        'founder_registration',
        'Founder #' || v_founder_number || ' registered with ' || p_tier || ' tier'
    FROM founders_program fp 
    WHERE fp.user_id = p_user_id;
    
    RETURN QUERY SELECT v_founder_number, v_referral_code, true, 'Successfully registered as founder #' || v_founder_number;
END;
$$;


--
-- Name: FUNCTION register_founder(p_user_id uuid, p_tier text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.register_founder(p_user_id uuid, p_tier text) IS 'Atomically registers a new founder and assigns founder number';


--
-- Name: spend_credits(uuid, integer, text, uuid, character varying, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.spend_credits(user_uuid uuid, credits_to_spend integer, description_text text, ref_id uuid DEFAULT NULL::uuid, ref_type character varying DEFAULT NULL::character varying, transaction_metadata jsonb DEFAULT '{}'::jsonb) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  user_balance INTEGER;
  new_balance INTEGER;
  user_role TEXT;
BEGIN
  -- Check if user is admin first
  SELECT up.role INTO user_role
  FROM user_profiles up
  WHERE up.id = user_uuid;
  
  -- If admin, allow unlimited spending
  IF user_role = 'admin' THEN
    -- Get current balance (or set to a high value if NULL)
    SELECT COALESCE(uc.current_balance, 999999) INTO user_balance
    FROM user_credits uc
    WHERE uc.user_id = user_uuid;
    
    -- For admins, maintain high balance
    new_balance := GREATEST(user_balance, 999999);
    
    -- Update or insert credits record
    INSERT INTO user_credits (user_id, current_balance, total_spent, updated_at)
    VALUES (user_uuid, new_balance, credits_to_spend, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      current_balance = GREATEST(user_credits.current_balance, 999999),
      total_spent = user_credits.total_spent + credits_to_spend,
      updated_at = NOW();
    
    -- Record transaction 
    INSERT INTO credit_transactions (
      user_id,
      transaction_type,
      amount,
      balance_after,
      description,
      reference_id,
      reference_type,
      metadata
    ) VALUES (
      user_uuid,
      'admin_spend',
      -credits_to_spend,
      new_balance,
      description_text || ' (Admin - Unlimited)',
      ref_id,
      ref_type,
      transaction_metadata
    );
    
    RETURN TRUE;
  END IF;
  
  -- For non-admin users, use the original logic
  -- Get current balance with row lock
  SELECT uc.current_balance INTO user_balance
  FROM user_credits uc
  WHERE uc.user_id = user_uuid
  FOR UPDATE;
  
  -- Check if user exists and has sufficient credits
  IF user_balance IS NULL THEN
    RAISE EXCEPTION 'User credits not found';
  END IF;
  
  IF user_balance < credits_to_spend THEN
    RETURN FALSE; -- Insufficient credits
  END IF;
  
  -- Calculate new balance
  new_balance := user_balance - credits_to_spend;
  
  -- Update user credits
  UPDATE user_credits
  SET 
    current_balance = new_balance,
    total_spent = total_spent + credits_to_spend,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  -- Record transaction
  INSERT INTO credit_transactions (
    user_id,
    transaction_type,
    amount,
    balance_after,
    description,
    reference_id,
    reference_type,
    metadata
  ) VALUES (
    user_uuid,
    'spend',
    -credits_to_spend,
    new_balance,
    description_text,
    ref_id,
    ref_type,
    transaction_metadata
  );
  
  RETURN TRUE;
END;
$$;


--
-- Name: trigger_initialize_user_credits(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_initialize_user_credits() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  PERFORM initialize_user_credits(NEW.id);
  RETURN NEW;
END;
$$;


--
-- Name: update_story_template_likes_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_story_template_likes_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE story_templates SET likes_count = likes_count + 1 WHERE id = NEW.template_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE story_templates SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.template_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


--
-- Name: update_story_template_reviews_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_story_template_reviews_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE story_templates SET 
      reviews_count = reviews_count + 1,
      rating_average = (
        SELECT AVG(rating)::DECIMAL(3,2) 
        FROM story_template_reviews 
        WHERE template_id = NEW.template_id
      )
    WHERE id = NEW.template_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE story_templates SET 
      reviews_count = GREATEST(reviews_count - 1, 0),
      rating_average = COALESCE((
        SELECT AVG(rating)::DECIMAL(3,2) 
        FROM story_template_reviews 
        WHERE template_id = OLD.template_id
      ), 0)
    WHERE id = OLD.template_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE story_templates SET 
      rating_average = (
        SELECT AVG(rating)::DECIMAL(3,2) 
        FROM story_template_reviews 
        WHERE template_id = NEW.template_id
      )
    WHERE id = NEW.template_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;


--
-- Name: update_story_templates_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_story_templates_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: extensions; Type: TABLE; Schema: _realtime; Owner: -
--

CREATE TABLE _realtime.extensions (
    id uuid NOT NULL,
    type text,
    settings jsonb,
    tenant_external_id text,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: _realtime; Owner: -
--

CREATE TABLE _realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: tenants; Type: TABLE; Schema: _realtime; Owner: -
--

CREATE TABLE _realtime.tenants (
    id uuid NOT NULL,
    name text,
    external_id text,
    jwt_secret text,
    max_concurrent_users integer DEFAULT 200 NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    max_events_per_second integer DEFAULT 100 NOT NULL,
    postgres_cdc_default text DEFAULT 'postgres_cdc_rls'::text,
    max_bytes_per_second integer DEFAULT 100000 NOT NULL,
    max_channels_per_client integer DEFAULT 100 NOT NULL,
    max_joins_per_second integer DEFAULT 500 NOT NULL,
    suspend boolean DEFAULT false,
    jwt_jwks jsonb,
    notify_private_alpha boolean DEFAULT false,
    private_only boolean DEFAULT false NOT NULL,
    migrations_ran integer DEFAULT 0,
    broadcast_adapter character varying(255) DEFAULT 'gen_rpc'::character varying
);


--
-- Name: credit_costs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_costs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    action_type character varying(50) NOT NULL,
    cost_per_unit integer NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: credit_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    transaction_type character varying(50) NOT NULL,
    amount integer NOT NULL,
    balance_after integer NOT NULL,
    description text NOT NULL,
    reference_id uuid,
    reference_type character varying(50),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: featured_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.featured_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_type text NOT NULL,
    content_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    featured_image_url text,
    feature_type text NOT NULL,
    featured_from timestamp without time zone DEFAULT now() NOT NULL,
    featured_until timestamp without time zone NOT NULL,
    display_order integer DEFAULT 0,
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    conversions integer DEFAULT 0,
    created_by uuid,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT featured_content_content_type_check CHECK ((content_type = ANY (ARRAY['template'::text, 'story'::text])))
);


--
-- Name: founder_benefits_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.founder_benefits_log (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    founder_id uuid NOT NULL,
    benefit_type text NOT NULL,
    benefit_amount numeric,
    description text,
    applied_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE founder_benefits_log; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.founder_benefits_log IS 'Audit log of all founder benefits applied';


--
-- Name: founder_referrals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.founder_referrals (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    referrer_founder_id uuid NOT NULL,
    referred_user_id uuid NOT NULL,
    referral_code text NOT NULL,
    signup_date timestamp with time zone DEFAULT now(),
    converted_to_paid boolean DEFAULT false,
    conversion_date timestamp with time zone,
    bonus_credits_awarded integer DEFAULT 0
);


--
-- Name: TABLE founder_referrals; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.founder_referrals IS 'Tracks successful referrals made by founders';


--
-- Name: founders_program; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.founders_program (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    founder_number integer,
    qualified_at timestamp with time zone DEFAULT now(),
    payment_verified_at timestamp with time zone,
    tier_when_qualified text NOT NULL,
    certificate_url text,
    is_active boolean DEFAULT true,
    referral_code text,
    total_referrals integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT founders_program_founder_number_check CHECK (((founder_number >= 1) AND (founder_number <= 200))),
    CONSTRAINT founders_program_tier_when_qualified_check CHECK ((tier_when_qualified = ANY (ARRAY['premium'::text, 'professional'::text])))
);


--
-- Name: TABLE founders_program; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.founders_program IS 'Tracks the first 200 paid subscribers who qualify for lifetime founder benefits';


--
-- Name: founders_program_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.founders_program_settings (
    id integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true,
    total_spots integer DEFAULT 200,
    spots_claimed integer DEFAULT 0,
    program_start_date timestamp with time zone DEFAULT now(),
    program_end_date timestamp with time zone DEFAULT (now() + '60 days'::interval),
    lifetime_discount_percent integer DEFAULT 40,
    monthly_bonus_credits integer DEFAULT 50,
    credit_purchase_bonus_percent integer DEFAULT 50,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT founders_program_settings_id_check CHECK ((id = 1))
);


--
-- Name: TABLE founders_program_settings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.founders_program_settings IS 'Configuration and counters for the founders program';


--
-- Name: public_founders_leaderboard; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.public_founders_leaderboard AS
 SELECT fp.founder_number,
    au.email,
    COALESCE((au.raw_user_meta_data ->> 'full_name'::text), (au.email)::text) AS display_name,
    (au.raw_user_meta_data ->> 'avatar_url'::text) AS avatar_url,
    fp.qualified_at,
    fp.total_referrals,
    fp.tier_when_qualified
   FROM (public.founders_program fp
     JOIN auth.users au ON ((au.id = fp.user_id)))
  WHERE (fp.is_active = true)
  ORDER BY fp.founder_number;


--
-- Name: stories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    description text,
    user_id uuid,
    genre text,
    target_age integer,
    story_mode text DEFAULT 'interactive'::text,
    is_completed boolean DEFAULT false,
    is_public boolean DEFAULT false,
    language text DEFAULT 'en'::text,
    content_rating text DEFAULT 'G'::text,
    ai_model_used text,
    generation_settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: story_segments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.story_segments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    story_id uuid NOT NULL,
    segment_number integer DEFAULT 0 NOT NULL,
    title text,
    content text DEFAULT ''::text NOT NULL,
    image_url text,
    image_prompt text,
    audio_url text,
    choices jsonb DEFAULT '[]'::jsonb,
    "position" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE story_segments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.story_segments IS 'Individual segments/chapters of stories with content, choices, and media';


--
-- Name: COLUMN story_segments.segment_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.story_segments.segment_number IS 'Sequential number of the segment in the story';


--
-- Name: COLUMN story_segments.content; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.story_segments.content IS 'The main text content of this story segment';


--
-- Name: COLUMN story_segments.image_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.story_segments.image_url IS 'URL to the generated illustration for this segment';


--
-- Name: COLUMN story_segments.choices; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.story_segments.choices IS 'JSON array of available choices for the reader';


--
-- Name: COLUMN story_segments."position"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.story_segments."position" IS 'Order position of segment within the story (0-based)';


--
-- Name: story_template_bookmarks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.story_template_bookmarks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    user_id uuid NOT NULL,
    collection_name text DEFAULT 'default'::text,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: story_template_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.story_template_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: story_template_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.story_template_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating integer NOT NULL,
    title text,
    content text,
    tags text[] DEFAULT '{}'::text[],
    helpful_votes integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT story_template_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: story_template_shares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.story_template_shares (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    user_id uuid,
    platform text NOT NULL,
    referrer text,
    ip_address inet,
    user_agent text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: story_template_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.story_template_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    user_id uuid,
    story_id uuid,
    session_id text NOT NULL,
    time_spent integer DEFAULT 0,
    completed boolean DEFAULT false,
    abandoned_at_step text,
    ip_address inet,
    user_agent text,
    referrer text,
    created_at timestamp without time zone DEFAULT now(),
    completed_at timestamp without time zone
);


--
-- Name: story_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.story_templates (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    description text,
    category text NOT NULL,
    genre text,
    target_age_min integer DEFAULT 4,
    target_age_max integer DEFAULT 12,
    template_structure jsonb DEFAULT '{}'::jsonb NOT NULL,
    character_templates jsonb DEFAULT '[]'::jsonb,
    setting_options jsonb DEFAULT '[]'::jsonb,
    plot_points jsonb DEFAULT '[]'::jsonb,
    moral_themes jsonb DEFAULT '[]'::jsonb,
    language text DEFAULT 'en'::text,
    content_rating text DEFAULT 'G'::text,
    difficulty_level text DEFAULT 'beginner'::text,
    estimated_duration integer DEFAULT 10,
    created_by uuid,
    is_premium boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    likes_count integer DEFAULT 0,
    bookmarks_count integer DEFAULT 0,
    shares_count integer DEFAULT 0,
    reviews_count integer DEFAULT 0,
    usage_count integer DEFAULT 0,
    rating_average numeric(3,2) DEFAULT 0,
    quality_score numeric(5,2) DEFAULT 0,
    is_public boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    featured_until timestamp without time zone
);


--
-- Name: TABLE story_templates; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.story_templates IS 'Templates for generating interactive stories with predefined structures and themes';


--
-- Name: user_credits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_credits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    current_balance integer DEFAULT 0 NOT NULL,
    total_earned integer DEFAULT 0 NOT NULL,
    total_spent integer DEFAULT 0 NOT NULL,
    last_monthly_refresh timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id uuid NOT NULL,
    role text DEFAULT 'user'::text,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_founder boolean DEFAULT false,
    founder_number integer,
    founder_benefits_active boolean DEFAULT false,
    CONSTRAINT user_profiles_role_check CHECK ((role = ANY (ARRAY['user'::text, 'admin'::text, 'moderator'::text])))
);


--
-- Name: TABLE user_profiles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.user_profiles IS 'Extended user profiles with roles and metadata';


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


--
-- Name: extensions extensions_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: -
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: -
--

ALTER TABLE ONLY _realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: -
--

ALTER TABLE ONLY _realtime.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: credit_costs credit_costs_action_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_costs
    ADD CONSTRAINT credit_costs_action_type_key UNIQUE (action_type);


--
-- Name: credit_costs credit_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_costs
    ADD CONSTRAINT credit_costs_pkey PRIMARY KEY (id);


--
-- Name: credit_transactions credit_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_pkey PRIMARY KEY (id);


--
-- Name: featured_content featured_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.featured_content
    ADD CONSTRAINT featured_content_pkey PRIMARY KEY (id);


--
-- Name: founder_benefits_log founder_benefits_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.founder_benefits_log
    ADD CONSTRAINT founder_benefits_log_pkey PRIMARY KEY (id);


--
-- Name: founder_referrals founder_referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.founder_referrals
    ADD CONSTRAINT founder_referrals_pkey PRIMARY KEY (id);


--
-- Name: founders_program founders_program_founder_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.founders_program
    ADD CONSTRAINT founders_program_founder_number_key UNIQUE (founder_number);


--
-- Name: founders_program founders_program_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.founders_program
    ADD CONSTRAINT founders_program_pkey PRIMARY KEY (id);


--
-- Name: founders_program founders_program_referral_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.founders_program
    ADD CONSTRAINT founders_program_referral_code_key UNIQUE (referral_code);


--
-- Name: founders_program_settings founders_program_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.founders_program_settings
    ADD CONSTRAINT founders_program_settings_pkey PRIMARY KEY (id);


--
-- Name: founders_program founders_program_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.founders_program
    ADD CONSTRAINT founders_program_user_id_key UNIQUE (user_id);


--
-- Name: stories stories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_pkey PRIMARY KEY (id);


--
-- Name: story_segments story_segments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_segments
    ADD CONSTRAINT story_segments_pkey PRIMARY KEY (id);


--
-- Name: story_template_bookmarks story_template_bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_bookmarks
    ADD CONSTRAINT story_template_bookmarks_pkey PRIMARY KEY (id);


--
-- Name: story_template_bookmarks story_template_bookmarks_template_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_bookmarks
    ADD CONSTRAINT story_template_bookmarks_template_id_user_id_key UNIQUE (template_id, user_id);


--
-- Name: story_template_likes story_template_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_likes
    ADD CONSTRAINT story_template_likes_pkey PRIMARY KEY (id);


--
-- Name: story_template_likes story_template_likes_template_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_likes
    ADD CONSTRAINT story_template_likes_template_id_user_id_key UNIQUE (template_id, user_id);


--
-- Name: story_template_reviews story_template_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_reviews
    ADD CONSTRAINT story_template_reviews_pkey PRIMARY KEY (id);


--
-- Name: story_template_reviews story_template_reviews_template_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_reviews
    ADD CONSTRAINT story_template_reviews_template_id_user_id_key UNIQUE (template_id, user_id);


--
-- Name: story_template_shares story_template_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_shares
    ADD CONSTRAINT story_template_shares_pkey PRIMARY KEY (id);


--
-- Name: story_template_usage story_template_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_usage
    ADD CONSTRAINT story_template_usage_pkey PRIMARY KEY (id);


--
-- Name: story_templates story_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_templates
    ADD CONSTRAINT story_templates_pkey PRIMARY KEY (id);


--
-- Name: user_credits user_credits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_pkey PRIMARY KEY (id);


--
-- Name: user_credits user_credits_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_user_id_key UNIQUE (user_id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: extensions_tenant_external_id_index; Type: INDEX; Schema: _realtime; Owner: -
--

CREATE INDEX extensions_tenant_external_id_index ON _realtime.extensions USING btree (tenant_external_id);


--
-- Name: extensions_tenant_external_id_type_index; Type: INDEX; Schema: _realtime; Owner: -
--

CREATE UNIQUE INDEX extensions_tenant_external_id_type_index ON _realtime.extensions USING btree (tenant_external_id, type);


--
-- Name: tenants_external_id_index; Type: INDEX; Schema: _realtime; Owner: -
--

CREATE UNIQUE INDEX tenants_external_id_index ON _realtime.tenants USING btree (external_id);


--
-- Name: idx_credit_transactions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions USING btree (created_at DESC);


--
-- Name: idx_credit_transactions_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credit_transactions_reference ON public.credit_transactions USING btree (reference_id, reference_type);


--
-- Name: idx_credit_transactions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions USING btree (user_id);


--
-- Name: idx_founder_benefits_founder; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_founder_benefits_founder ON public.founder_benefits_log USING btree (founder_id);


--
-- Name: idx_founder_referrals_referrer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_founder_referrals_referrer ON public.founder_referrals USING btree (referrer_founder_id);


--
-- Name: idx_founders_program_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_founders_program_number ON public.founders_program USING btree (founder_number);


--
-- Name: idx_founders_program_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_founders_program_user_id ON public.founders_program USING btree (user_id);


--
-- Name: idx_story_segments_position; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_story_segments_position ON public.story_segments USING btree (story_id, "position");


--
-- Name: idx_story_segments_segment_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_story_segments_segment_number ON public.story_segments USING btree (story_id, segment_number);


--
-- Name: idx_story_segments_story_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_story_segments_story_id ON public.story_segments USING btree (story_id);


--
-- Name: idx_story_templates_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_story_templates_active ON public.story_templates USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_story_templates_age_range; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_story_templates_age_range ON public.story_templates USING btree (target_age_min, target_age_max);


--
-- Name: idx_story_templates_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_story_templates_category ON public.story_templates USING btree (category);


--
-- Name: idx_story_templates_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_story_templates_created_at ON public.story_templates USING btree (created_at DESC);


--
-- Name: idx_story_templates_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_story_templates_featured ON public.story_templates USING btree (is_featured, featured_until, quality_score DESC) WHERE (is_featured = true);


--
-- Name: idx_story_templates_genre; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_story_templates_genre ON public.story_templates USING btree (genre);


--
-- Name: idx_story_templates_social_ranking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_story_templates_social_ranking ON public.story_templates USING btree (is_public, quality_score DESC, likes_count DESC, created_at DESC) WHERE (is_public = true);


--
-- Name: idx_user_credits_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_credits_user_id ON public.user_credits USING btree (user_id);


--
-- Name: idx_user_profiles_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_profiles_created_at ON public.user_profiles USING btree (created_at);


--
-- Name: idx_user_profiles_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_profiles_role ON public.user_profiles USING btree (role);


--
-- Name: user_profiles on_user_profile_created_init_credits; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_user_profile_created_init_credits AFTER INSERT ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.trigger_initialize_user_credits();


--
-- Name: story_template_likes story_template_likes_count_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER story_template_likes_count_trigger AFTER INSERT OR DELETE ON public.story_template_likes FOR EACH ROW EXECUTE FUNCTION public.update_story_template_likes_count();


--
-- Name: story_template_reviews story_template_reviews_count_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER story_template_reviews_count_trigger AFTER INSERT OR DELETE OR UPDATE ON public.story_template_reviews FOR EACH ROW EXECUTE FUNCTION public.update_story_template_reviews_count();


--
-- Name: story_templates story_templates_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER story_templates_updated_at_trigger BEFORE UPDATE ON public.story_templates FOR EACH ROW EXECUTE FUNCTION public.update_story_templates_updated_at();


--
-- Name: extensions extensions_tenant_external_id_fkey; Type: FK CONSTRAINT; Schema: _realtime; Owner: -
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_tenant_external_id_fkey FOREIGN KEY (tenant_external_id) REFERENCES _realtime.tenants(external_id) ON DELETE CASCADE;


--
-- Name: credit_transactions credit_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_transactions
    ADD CONSTRAINT credit_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: featured_content featured_content_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.featured_content
    ADD CONSTRAINT featured_content_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: founder_benefits_log founder_benefits_log_founder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.founder_benefits_log
    ADD CONSTRAINT founder_benefits_log_founder_id_fkey FOREIGN KEY (founder_id) REFERENCES public.founders_program(id);


--
-- Name: founder_referrals founder_referrals_referred_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.founder_referrals
    ADD CONSTRAINT founder_referrals_referred_user_id_fkey FOREIGN KEY (referred_user_id) REFERENCES auth.users(id);


--
-- Name: founder_referrals founder_referrals_referrer_founder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.founder_referrals
    ADD CONSTRAINT founder_referrals_referrer_founder_id_fkey FOREIGN KEY (referrer_founder_id) REFERENCES public.founders_program(id);


--
-- Name: founders_program founders_program_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.founders_program
    ADD CONSTRAINT founders_program_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: stories stories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: story_segments story_segments_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_segments
    ADD CONSTRAINT story_segments_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;


--
-- Name: story_template_bookmarks story_template_bookmarks_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_bookmarks
    ADD CONSTRAINT story_template_bookmarks_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.story_templates(id) ON DELETE CASCADE;


--
-- Name: story_template_bookmarks story_template_bookmarks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_bookmarks
    ADD CONSTRAINT story_template_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: story_template_likes story_template_likes_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_likes
    ADD CONSTRAINT story_template_likes_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.story_templates(id) ON DELETE CASCADE;


--
-- Name: story_template_likes story_template_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_likes
    ADD CONSTRAINT story_template_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: story_template_reviews story_template_reviews_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_reviews
    ADD CONSTRAINT story_template_reviews_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.story_templates(id) ON DELETE CASCADE;


--
-- Name: story_template_reviews story_template_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_reviews
    ADD CONSTRAINT story_template_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: story_template_shares story_template_shares_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_shares
    ADD CONSTRAINT story_template_shares_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.story_templates(id) ON DELETE CASCADE;


--
-- Name: story_template_shares story_template_shares_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_shares
    ADD CONSTRAINT story_template_shares_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: story_template_usage story_template_usage_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_usage
    ADD CONSTRAINT story_template_usage_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE SET NULL;


--
-- Name: story_template_usage story_template_usage_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_usage
    ADD CONSTRAINT story_template_usage_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.story_templates(id) ON DELETE CASCADE;


--
-- Name: story_template_usage story_template_usage_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_template_usage
    ADD CONSTRAINT story_template_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: story_templates story_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.story_templates
    ADD CONSTRAINT story_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: user_credits user_credits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credits
    ADD CONSTRAINT user_credits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: founders_program Admins can manage founders program; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage founders program" ON public.founders_program USING ((EXISTS ( SELECT 1
   FROM public.user_profiles
  WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.role = 'admin'::text)))));


--
-- Name: founders_program_settings Anyone can read program status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read program status" ON public.founders_program_settings FOR SELECT USING (true);


--
-- Name: story_templates Anyone can view active templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active templates" ON public.story_templates FOR SELECT USING ((is_active = true));


--
-- Name: story_template_reviews Anyone can view reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view reviews" ON public.story_template_reviews FOR SELECT USING (true);


--
-- Name: user_credits Service can manage all credits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service can manage all credits" ON public.user_credits USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


--
-- Name: credit_transactions Service can manage all transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service can manage all transactions" ON public.credit_transactions USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));


--
-- Name: story_template_bookmarks Users can bookmark templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can bookmark templates" ON public.story_template_bookmarks USING ((auth.uid() = user_id));


--
-- Name: story_templates Users can create templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create templates" ON public.story_templates FOR INSERT WITH CHECK ((auth.uid() = created_by));


--
-- Name: user_profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: story_segments Users can insert segments for their own stories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert segments for their own stories" ON public.story_segments FOR INSERT WITH CHECK ((auth.uid() IN ( SELECT stories.user_id
   FROM public.stories
  WHERE (stories.id = story_segments.story_id))));


--
-- Name: story_template_likes Users can like templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can like templates" ON public.story_template_likes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: founder_benefits_log Users can read own benefits log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own benefits log" ON public.founder_benefits_log FOR SELECT USING ((founder_id IN ( SELECT founders_program.id
   FROM public.founders_program
  WHERE (founders_program.user_id = auth.uid()))));


--
-- Name: founders_program Users can read own founder record; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own founder record" ON public.founders_program FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: founder_referrals Users can read own referrals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own referrals" ON public.founder_referrals FOR SELECT USING ((referrer_founder_id IN ( SELECT founders_program.id
   FROM public.founders_program
  WHERE (founders_program.user_id = auth.uid()))));


--
-- Name: story_template_reviews Users can review templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can review templates" ON public.story_template_reviews USING ((auth.uid() = user_id));


--
-- Name: story_template_likes Users can unlike their own likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can unlike their own likes" ON public.story_template_likes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: story_templates Users can update own templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own templates" ON public.story_templates FOR UPDATE USING ((auth.uid() = created_by));


--
-- Name: story_segments Users can update segments for their own stories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update segments for their own stories" ON public.story_segments FOR UPDATE USING ((auth.uid() IN ( SELECT stories.user_id
   FROM public.stories
  WHERE (stories.id = story_segments.story_id))));


--
-- Name: story_template_likes Users can view all likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view all likes" ON public.story_template_likes FOR SELECT USING (true);


--
-- Name: user_credits Users can view own credits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own credits" ON public.user_credits FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: credit_transactions Users can view own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own transactions" ON public.credit_transactions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: story_segments Users can view their own story segments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own story segments" ON public.story_segments FOR SELECT USING ((auth.uid() IN ( SELECT stories.user_id
   FROM public.stories
  WHERE (stories.id = story_segments.story_id))));


--
-- Name: credit_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: founder_benefits_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.founder_benefits_log ENABLE ROW LEVEL SECURITY;

--
-- Name: founder_referrals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.founder_referrals ENABLE ROW LEVEL SECURITY;

--
-- Name: founders_program; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.founders_program ENABLE ROW LEVEL SECURITY;

--
-- Name: story_template_bookmarks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.story_template_bookmarks ENABLE ROW LEVEL SECURITY;

--
-- Name: story_template_likes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.story_template_likes ENABLE ROW LEVEL SECURITY;

--
-- Name: story_template_reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.story_template_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: story_template_shares; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.story_template_shares ENABLE ROW LEVEL SECURITY;

--
-- Name: story_template_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.story_template_usage ENABLE ROW LEVEL SECURITY;

--
-- Name: story_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.story_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: user_credits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

