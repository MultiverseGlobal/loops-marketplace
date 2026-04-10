-- 🛡️ Loops Security Layer: Column-Level Protection
-- Prevents users from updating sensitive flags (is_admin, balances) through the public API.

-- 1. Function to protect sensitive columns
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- Only Allow a superuser or specific service_role to update these sensitive columns.
    -- (auth.uid() is null for service_role actions in some contexts, but we check if the user is changing it)
    
    -- Check if is_admin is being changed
    IF NEW.is_admin IS DISTINCT FROM OLD.is_admin AND (current_setting('role') != 'service_role') THEN
        RAISE EXCEPTION 'UNAUTHORIZED: Only the Supreme Loop Admin can modify privilege flags.';
    END IF;

    -- Check if balances or earnings are being changed 
    -- (These should only be updated via verified RPCs or Paystack webhooks)
    IF (NEW.available_balance IS DISTINCT FROM OLD.available_balance OR 
        NEW.lifetime_earnings IS DISTINCT FROM OLD.lifetime_earnings OR 
        NEW.reputation IS DISTINCT FROM OLD.reputation) AND (current_setting('role') != 'service_role') THEN
        -- We allow the update IF it's coming from an internal system call (SECURITY DEFINER functions)
        -- but simple client-side 'supabase.from("profiles").update({available_balance: 9999})' will fail.
        RAISE EXCEPTION 'UNAUTHORIZED: Financial and Reputation data must be updated via verified Loop Protocols.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach the trigger to the profiles table
DROP TRIGGER IF EXISTS tr_protect_profile_sensitive_columns ON public.profiles;
CREATE TRIGGER tr_protect_profile_sensitive_columns
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_sensitive_columns();

-- 3. Profiles Data Leak Fix: Column-Level RLS (Standard via Views/RLS)
-- We will restrict 'SELECT' access to sensitive fields using a View or by modifying the Profiles policy.
-- Note: Supabase RLS works on ROWS, not COLUMNS. To hide columns, we use a VIEW.

-- Create a PUBLIC view that hides sensitive data
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public AS
SELECT 
    id, 
    full_name, 
    avatar_url, 
    campus_id, 
    is_plug, 
    email_verified, 
    reputation, 
    created_at,
    store_name,
    store_banner_color,
    store_logo_url
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- Hardening the original profiles table RLS:
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Users can only view their own full profile." ON public.profiles
FOR SELECT USING (auth.uid() = id OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Now: 
-- 1. Use 'profiles_public' for general UI (Member directories, etc.)
-- 2. The main 'profiles' table is only readable by the owner or admins.
