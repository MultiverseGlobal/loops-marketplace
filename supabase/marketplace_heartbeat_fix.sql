-- 🛡️ Marketplace Heartbeat: Final Schema Alignment
-- This script ensures all tables are perfectly linked for the Feed to work.

DO $$ 
BEGIN
    -- 1. FIX LISTINGS FOREIGN KEY
    -- PostgREST (Supabase API) needs a direct FK to 'profiles' to perform the join in the feed.
    -- If it currently points to 'auth.users', we must update it.
    ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_seller_id_fkey;
    ALTER TABLE public.listings ADD CONSTRAINT listings_seller_id_fkey 
        FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    -- 2. ENSURE ALL PROFILES COLUMNS EXIST FOR THE FEED
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='store_name') THEN
        ALTER TABLE public.profiles ADD COLUMN store_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='store_banner_color') THEN
        ALTER TABLE public.profiles ADD COLUMN store_banner_color TEXT DEFAULT 'bg-loops-primary';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_plug') THEN
        ALTER TABLE public.profiles ADD COLUMN is_plug BOOLEAN DEFAULT FALSE;
    END IF;

    -- 3. ENSURE LISTINGS COLUMNS EXIST
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='boosted_until') THEN
        ALTER TABLE public.listings ADD COLUMN boosted_until TIMESTAMPTZ DEFAULT NULL;
    END IF;

    -- 4. FIX ANY DATA GAP
    -- Ensure every existing listing has the seller's campus_id if missing
    UPDATE public.listings l
    SET campus_id = p.campus_id
    FROM public.profiles p
    WHERE l.seller_id = p.id AND l.campus_id IS NULL;

    -- 5. REFRESH CACHE
    NOTIFY pgrst, 'reload schema';

END $$;
