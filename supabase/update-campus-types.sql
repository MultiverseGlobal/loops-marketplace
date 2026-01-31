-- Create ENUM for university types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'uni_type') THEN
        CREATE TYPE uni_type AS ENUM ('public', 'private');
    END IF;
END $$;

-- Add uni_type column to campuses
ALTER TABLE campuses ADD COLUMN IF NOT EXISTS type uni_type DEFAULT 'public';

-- Define Terminology Sets
-- Public Uni Terms
UPDATE campuses 
SET type = 'public',
    terms = '{
    "communityName": "The Hub",
    "listingName": "Drop",
    "listingAction": "Post a Drop",
    "sellerName": "Plug",
    "buyerName": "Customer",
    "statusActive": "Vibing",
    "statusPending": "Locked In",
    "statusCompleted": "Deal Sealed",
    "marketplaceName": "The Feed",
    "pickupLabel": "The Spot",
    "reputationLabel": "Steeze"
}'::jsonb
WHERE slug IN ('unilag', 'ui');

-- Private Uni Terms
UPDATE campuses 
SET type = 'private',
    terms = '{
    "communityName": "Campus Loop",
    "listingName": "Listing",
    "listingAction": "Create Listing",
    "sellerName": "Merchant",
    "buyerName": "Hubber",
    "statusActive": "Available",
    "statusPending": "Reserved",
    "statusCompleted": "Transaction Done",
    "marketplaceName": "Marketplace",
    "pickupLabel": "Meeting Point",
    "reputationLabel": "Karma"
}'::jsonb
WHERE slug IN ('veritas', 'covenant');

-- Default for others (Private by default as it's safer for starting out)
UPDATE campuses 
SET type = 'private' 
WHERE type IS NULL;
