-- Referral System Infrastructure

-- 1. Add referral_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- 2. Add referred_by_code to seller_applications
ALTER TABLE public.seller_applications ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

-- 3. Function to generate a unique referral code
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
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

-- 4. Trigger to automatically generate referral code for new Plugs
CREATE OR REPLACE FUNCTION handle_plug_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    -- If the user becomes a plug and doesn't have a referral code yet, generate one
    IF NEW.is_plug = TRUE AND (OLD.is_plug = FALSE OR OLD.is_plug IS NULL) AND NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_unique_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_plug_status_change ON public.profiles;
CREATE TRIGGER on_plug_status_change
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_plug_referral_code();

-- 5. Backfill existing Plugs with referral codes
UPDATE public.profiles
SET referral_code = generate_unique_referral_code()
WHERE is_plug = TRUE AND referral_code IS NULL;
