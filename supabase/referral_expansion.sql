-- Expand Referral System to All Users
-- This script makes the referral system a core feature for everyone.

-- 1. Add referral_code to all profiles (if not already there)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- 2. Add referred_by_code to track signups
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

-- 3. Function to generate a unique referral code
-- Uses a mix of characters and randomness for a short, memorable code
CREATE OR REPLACE FUNCTION public.generate_unique_referral_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    done BOOLEAN := FALSE;
BEGIN
    WHILE NOT done LOOP
        -- Generate a 6-character uppercase alphanumeric code
        new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        
        -- Check if it's unique in the profiles table
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code) THEN
            done := TRUE;
        END IF;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 4. Trigger to automatically generate referral code for EVERY new user
CREATE OR REPLACE FUNCTION public.handle_new_user_referral()
RETURNS TRIGGER AS $$
BEGIN
    -- Every user gets a referral code upon creation
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := public.generate_unique_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_created_referral ON public.profiles;
CREATE TRIGGER on_profile_created_referral
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_referral();

-- 5. Backfill existing users who don't have a referral code
UPDATE public.profiles
SET referral_code = public.generate_unique_referral_code()
WHERE referral_code IS NULL;

-- 6. Add a view for the referral leaderboard (any user)
DROP FUNCTION IF EXISTS public.get_community_referral_leaderboard();
CREATE OR REPLACE FUNCTION public.get_community_referral_leaderboard()
RETURNS TABLE (
    referrer_id UUID,
    referrer_name TEXT,
    referral_code TEXT,
    referral_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as referrer_id,
        p.full_name as referrer_name,
        p.referral_code,
        COUNT(referred.id) as referral_count
    FROM 
        public.profiles p
    LEFT JOIN 
        public.profiles referred ON p.referral_code = referred.referred_by_code
    GROUP BY 
        p.id, p.full_name, p.referral_code
    HAVING
        COUNT(referred.id) > 0
    ORDER BY 
        referral_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
