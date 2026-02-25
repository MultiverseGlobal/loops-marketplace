-- RUN THIS IN SUPABASE SQL EDITOR
-- Enhances the referral system with tracking and leaderboards

-- 1. Create a function to get referral counts (used for leaderboard)
CREATE OR REPLACE FUNCTION get_referral_leaderboard()
RETURNS TABLE (
    referrer_id UUID,
    referrer_name TEXT,
    referral_code TEXT,
    successful_referrals BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as referrer_id,
        p.full_name as referrer_name,
        p.referral_code,
        COUNT(sa.id) as successful_referrals
    FROM 
        public.profiles p
    INNER JOIN 
        public.seller_applications sa ON p.referral_code = sa.referred_by_code
    WHERE 
        sa.status = 'approved'
    GROUP BY 
        p.id, p.full_name, p.referral_code
    ORDER BY 
        successful_referrals DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add branding_tier if not exists (founding, basic, premium)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branding_tier TEXT DEFAULT 'basic';

-- 3. Add verified_hours if not exists (for service passport)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified_hours INTEGER DEFAULT 0;

-- 4. Add service_tier if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS service_tier TEXT DEFAULT 'Bronze';
