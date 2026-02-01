-- Add store_name to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS store_name TEXT;

-- Update profile comment
COMMENT ON COLUMN public.profiles.store_name IS 'The brand name of the student seller digital storefront.';
