-- RUN THIS IN SUPABASE SQL EDITOR
-- AUTO-ACTIVATE PLUGS: Synchronizes approved applications with profiles upon registration
-- FIXED: Corrected join to handle missing email column in profiles table

-- 1. Create the sync function
CREATE OR REPLACE FUNCTION public.handle_plug_activation_on_signup()
RETURNS TRIGGER AS $$
DECLARE
    app_record RECORD;
    user_email TEXT;
BEGIN
    -- Get the user's email from auth.users (since it's not in public.profiles)
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;

    -- Look for an approved application matching the user's email
    SELECT * INTO app_record 
    FROM public.seller_applications 
    WHERE campus_email = user_email 
      AND status = 'approved'
    LIMIT 1;

    -- If found, activate the plug status immediately
    IF app_record.id IS NOT NULL THEN
        NEW.is_plug := TRUE;
        NEW.primary_role := 'plug';
        NEW.store_name := app_record.store_name;
        NEW.reputation := 100;
        
        -- Also link the user_id back to the application for history
        UPDATE public.seller_applications 
        SET user_id = NEW.id 
        WHERE id = app_record.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on public.profiles (BEFORE INSERT to modify the row being created)
DROP TRIGGER IF EXISTS on_profile_created_activate_plug ON public.profiles;
CREATE TRIGGER on_profile_created_activate_plug
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_plug_activation_on_signup();

-- 3. One-time sync for any existing gaps (joining with auth.users for email)
UPDATE public.profiles p
SET 
    is_plug = TRUE,
    primary_role = 'plug',
    store_name = sa.store_name,
    reputation = 100
FROM public.seller_applications sa
JOIN auth.users u ON sa.campus_email = u.email
WHERE u.id = p.id
  AND sa.status = 'approved'
  AND (p.is_plug = FALSE OR p.is_plug IS NULL);
