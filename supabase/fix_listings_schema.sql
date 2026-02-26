-- 🛡️ Fix Listings Schema Mismatch
-- Adds missing columns used by the 'Post a Drop' (listing creation) flow

DO $$ 
BEGIN
    -- Add 'type' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='type') THEN
        ALTER TABLE public.listings ADD COLUMN type TEXT;
    END IF;

    -- Add 'pickup_location' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='pickup_location') THEN
        ALTER TABLE public.listings ADD COLUMN pickup_location TEXT;
    END IF;

    -- Add 'availability' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='availability') THEN
        ALTER TABLE public.listings ADD COLUMN availability TEXT;
    END IF;

    -- Add 'meetup_locations' column (JSONB or TEXT ARRAY)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='meetup_locations') THEN
        ALTER TABLE public.listings ADD COLUMN meetup_locations TEXT[] DEFAULT '{}';
    END IF;

    -- Set default type for existing listings if necessary
    UPDATE public.listings SET type = 'product' WHERE type IS NULL;

END $$;
