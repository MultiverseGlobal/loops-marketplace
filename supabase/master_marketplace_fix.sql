-- 🛡️ Loops Marketplace Master Schema Fix
-- This script ensures the 'listings' table has every column required for the marketplace engine.
-- Run this in your Supabase SQL Editor.

DO $$ 
BEGIN
    -- 1. Ensure Table Exists
    CREATE TABLE IF NOT EXISTS public.listings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    -- 2. Add Missing Core Columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='title') THEN
        ALTER TABLE public.listings ADD COLUMN title TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='description') THEN
        ALTER TABLE public.listings ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='price') THEN
        ALTER TABLE public.listings ADD COLUMN price DECIMAL(12,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='type') THEN
        ALTER TABLE public.listings ADD COLUMN type TEXT DEFAULT 'product';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='category') THEN
        ALTER TABLE public.listings ADD COLUMN category TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='images') THEN
        ALTER TABLE public.listings ADD COLUMN images TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='condition') THEN
        ALTER TABLE public.listings ADD COLUMN condition TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='availability') THEN
        ALTER TABLE public.listings ADD COLUMN availability TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='pickup_location') THEN
        ALTER TABLE public.listings ADD COLUMN pickup_location TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='meetup_locations') THEN
        ALTER TABLE public.listings ADD COLUMN meetup_locations TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='campus_id') THEN
        ALTER TABLE public.listings ADD COLUMN campus_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='status') THEN
        ALTER TABLE public.listings ADD COLUMN status TEXT DEFAULT 'active';
    END IF;

    -- 3. Optimization: Add Indexes for speed
    CREATE INDEX IF NOT EXISTS idx_listings_seller ON public.listings(seller_id);
    CREATE INDEX IF NOT EXISTS idx_listings_campus ON public.listings(campus_id);
    CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);

END $$;

-- 4. Reload PostgREST Cache (Supabase does this automatically, but this ensures it)
NOTIFY pgrst, 'reload schema';
