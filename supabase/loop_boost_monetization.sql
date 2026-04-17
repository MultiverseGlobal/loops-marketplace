-- 💎 Loop Boosts: Monetization Schema
-- This script adds support for paid prioritization of listings.

-- 1. Add boosted_until to listings
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS boosted_until TIMESTAMPTZ DEFAULT NULL;

-- 2. Index for performance on the Feed / Buzz
CREATE INDEX IF NOT EXISTS idx_listings_boosted_until ON public.listings (boosted_until);

-- 2b. Add email and identity fields to profiles if missing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS is_founding_member BOOLEAN DEFAULT FALSE;

-- 2c. Sync existing emails from auth.users to public.profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 2d. Index for Admin Directory filtering
CREATE INDEX IF NOT EXISTS idx_profiles_is_founding_member ON public.profiles (is_founding_member);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- 3. Update the Activity Buzz View to prioritize boosted items
-- We'll recreate the view to include the boost priority
DROP VIEW IF EXISTS public.activity_buzz;
CREATE VIEW public.activity_buzz AS
SELECT 
    l.id as listing_id,
    l.title,
    l.price,
    l.images,
    l.type,
    l.boosted_until,
    p_seller.full_name as seller_name,
    p_seller.avatar_url as seller_avatar,
    c.name as campus_name,
    c.slug as campus_slug,
    (l.boosted_until > now()) as is_boosted,
    p_seller.is_founding_member as is_founding_seller,
    l.created_at
FROM public.listings l
JOIN public.profiles p_seller ON l.seller_id = p_seller.id
JOIN public.campuses c ON l.campus_id = c.id
WHERE l.status = 'active'
ORDER BY 
    (l.boosted_until > now()) DESC, 
    l.created_at DESC;

COMMENT ON COLUMN public.listings.boosted_until IS 'Timestamp until which this listing is prioritized as a Loop Boost.';
