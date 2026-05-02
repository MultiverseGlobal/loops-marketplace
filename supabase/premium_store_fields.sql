-- Shopify-style Premium Store Fields Update
-- RUN THIS IN SUPABASE SQL EDITOR

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS delivery_mode TEXT DEFAULT 'Campus Meetup',
ADD COLUMN IF NOT EXISTS refund_policy TEXT DEFAULT 'No Refunds',
ADD COLUMN IF NOT EXISTS business_stage TEXT DEFAULT 'Just Starting';

-- Optional: Add comments to describe these fields
COMMENT ON COLUMN public.profiles.delivery_mode IS 'How the plug delivers products (e.g., Campus Meetup, Hostel Delivery)';
COMMENT ON COLUMN public.profiles.refund_policy IS 'The return or refund policy for the plug store';
COMMENT ON COLUMN public.profiles.business_stage IS 'Indicates if they are just starting or already an established business';

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
