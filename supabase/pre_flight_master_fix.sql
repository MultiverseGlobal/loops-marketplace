-- 🛡️ LOOPS PRE-FLIGHT MASTER FIX
-- This script aligns the database with the latest app logic (v1.0 Launch Ready).
-- Run this in your Supabase SQL Editor to prevent onboarding/creation errors.

DO $$ 
BEGIN
    -- 1. FIX PROFILES TABLE
    -- Add basic onboarding columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='whatsapp_number') THEN
        ALTER TABLE public.profiles ADD COLUMN whatsapp_number TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='store_name') THEN
        ALTER TABLE public.profiles ADD COLUMN store_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='store_category') THEN
        ALTER TABLE public.profiles ADD COLUMN store_category TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='store_banner_color') THEN
        ALTER TABLE public.profiles ADD COLUMN store_banner_color TEXT DEFAULT 'bg-loops-primary';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_plug') THEN
        ALTER TABLE public.profiles ADD COLUMN is_plug BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    END IF;

    -- Update primary_role constraints (Code uses 'buying' | 'plug', DB had 'buying' | 'selling')
    -- We'll allow 'plug' as a valid role
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_primary_role_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_primary_role_check 
        CHECK (primary_role IN ('buying', 'selling', 'plug'));

    -- 2. FIX LISTINGS TABLE (Final Audit)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='type') THEN
        ALTER TABLE public.listings ADD COLUMN type TEXT DEFAULT 'product';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='availability') THEN
        ALTER TABLE public.listings ADD COLUMN availability TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='condition') THEN
        ALTER TABLE public.listings ADD COLUMN condition TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='meetup_locations') THEN
        ALTER TABLE public.listings ADD COLUMN meetup_locations TEXT[] DEFAULT '{}';
    END IF;

    -- 3. ENSURE VERIFICATION STORAGE EXISTS
    CREATE TABLE IF NOT EXISTS public.student_verifications (
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        matric_number TEXT NOT NULL,
        verification_status TEXT DEFAULT 'pending',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    -- 4. REFRESH SCHEMA CACHE
    NOTIFY pgrst, 'reload schema';

END $$;
