-- RUN THIS IN SUPABASE SQL EDITOR
-- This ensures EVERY user who verifies their email is automatically updated in the profiles table

-- 1. Create the function that handles the sync
CREATE OR REPLACE FUNCTION public.handle_auth_user_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the profile when email or phone is confirmed
  IF (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL) OR
     (NEW.phone_confirmed_at IS NOT NULL AND OLD.phone_confirmed_at IS NULL) THEN
    UPDATE public.profiles
    SET email_verified = true
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_verification ON auth.users;
CREATE TRIGGER on_auth_user_verification
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_verification();

-- 3. Initial sync for any existing users
UPDATE public.profiles p
SET email_verified = true
FROM auth.users u
WHERE p.id = u.id
AND (u.email_confirmed_at IS NOT NULL OR u.phone_confirmed_at IS NOT NULL);
