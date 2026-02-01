-- Add uni_type column to campuses
ALTER TABLE campuses ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'public';

-- Add branding and terminology columns if they don't exist
ALTER TABLE campuses 
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#1e40af',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#fbbf24',
ADD COLUMN IF NOT EXISTS terms JSONB DEFAULT '{
    "communityName": "Campus Loop",
    "listingName": "Drop",
    "listingAction": "Post a Drop",
    "sellerName": "Plug",
    "buyerName": "Buyer",
    "statusActive": "Vibing",
    "statusPending": "Locked In",
    "statusCompleted": "Deal Sealed",
    "marketplaceName": "The Feed",
    "pickupLabel": "The Spot",
    "reputationLabel": "Karma"
}'::jsonb;

-- Define Terminology Sets
-- Public Uni Terms
UPDATE campuses 
SET type = 'public',
    terms = '{
    "communityName": "The Hub",
    "listingName": "Drop",
    "listingAction": "Post a Drop",
    "sellerName": "Plug",
    "buyerName": "Buyer",
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
    "sellerName": "Plug",
    "buyerName": "Buyer",
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
