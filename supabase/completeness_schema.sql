-- Completeness Phase: Foundation Schema
-- Formalizing Offers, Activity Buzz, and Trust Milestone infrastructure

-- 0. Profile Enhancements for Storefronts & Branding
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_description TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_logo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_banner_color TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branding_tier TEXT DEFAULT 'none';

-- 0.1 Transaction & Offers Table Fix (Ensuring seller_id exists)
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES public.profiles(id);

-- 1. Offers Table
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure seller_id exists on offers in case it was created without it previously
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES public.listings(id);

-- RLS for Offers
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view offers they are involved in." ON public.offers;
CREATE POLICY "Users can view offers they are involved in." 
    ON public.offers FOR SELECT 
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Buyers can create offers." ON public.offers;
CREATE POLICY "Buyers can create offers." 
    ON public.offers FOR INSERT 
    WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Users can update their own involved offers." ON public.offers;
CREATE POLICY "Users can update their own involved offers." 
    ON public.offers FOR UPDATE 
    USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 2. Trust Milestones Table
CREATE TABLE IF NOT EXISTS public.trust_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    tier TEXT DEFAULT 'none' CHECK (tier IN ('none', 'bronze', 'silver', 'gold')),
    loops_completed INTEGER DEFAULT 0,
    next_milestone_at INTEGER,
    achieved_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Activity Buzz View (Social Proof)
-- Shows recent successful completions to make the app feel alive
CREATE OR REPLACE VIEW public.activity_buzz AS
SELECT 
    t.id,
    t.status,
    t.created_at,
    l.title as listing_title,
    l.type as listing_type,
    c.name as campus_name,
    p_buyer.full_name as buyer_name,
    p_seller.full_name as seller_name
FROM public.transactions t
JOIN public.listings l ON t.listing_id = l.id
JOIN public.campuses c ON l.campus_id = c.id
JOIN public.profiles p_buyer ON t.buyer_id = p_buyer.id
JOIN public.profiles p_seller ON l.seller_id = p_seller.id
WHERE t.status = 'completed'
ORDER BY t.created_at DESC
LIMIT 50;

-- 4. Enable Realtime for key tables
ALTER TABLE public.offers REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
