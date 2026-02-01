-- Add branding and terminology columns to campuses table
alter table campuses 
add column if not exists primary_color text default '#1e40af', -- Default Blue
add column if not exists secondary_color text default '#3b82f6',
add column if not exists accent_color text default '#fbbf24',
add column if not exists terms jsonb default '{
    "communityName": "Campus Loop",
    "listingName": "Drop",
    "listingAction": "Post a Drop",
    "sellerName": "Plug",
    "buyerName": "Buyer",
    "statusActive": "Vibing",
    "statusPending": "Locked In",
    "statusCompleted": "Deal Sealed",
    "marketplaceName": "The Feed",
    "pickupLabel": "The Spot"
}'::jsonb;

-- Ensure existing campuses have the default terms if null
update campuses set terms = '{
    "communityName": "Campus Loop",
    "listingName": "Drop",
    "listingAction": "Post a Drop",
    "sellerName": "Plug",
    "buyerName": "Buyer",
    "statusActive": "Vibing",
    "statusPending": "Locked In",
    "statusCompleted": "Deal Sealed",
    "marketplaceName": "The Feed",
    "pickupLabel": "The Spot"
}'::jsonb where terms is null;
