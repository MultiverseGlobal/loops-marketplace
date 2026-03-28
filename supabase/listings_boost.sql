-- Add Boost Support to Listings
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS boosted_until TIMESTAMPTZ;

-- Index for performance when sorting by boost
CREATE INDEX IF NOT EXISTS idx_listings_boosted_until ON public.listings (boosted_until DESC NULLS LAST);

-- Update RLS if necessary (usually public can select, only owner/admin can update)
-- Existing policies should cover this, but ensure boosted_until is not editable by the user directly via API unless they are system/service role.
-- However, for simplicity in this MVP, we assume the Paystack webhook handles the update.
