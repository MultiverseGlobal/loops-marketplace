-- 🛡️ Final Loops Branding Sanitization
-- Goal: Officially retire "Pulse" and unify "Drop" / "Loop" nomenclature across all campuses.

update public.campuses 
set terms = '{
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

-- Ensure no orphaned "Pulse" strings exist in common labels
-- This script replaces any residual "Pulse" with "Drop" in the terms JSON if someone manually edited it.
update public.campuses
set terms = jsonb_set(
    jsonb_set(terms, '{listingAction}', '"Post a Drop"'),
    '{listingName}', '"Drop"'
)
where terms->>'listingAction' ilike '%Pulse%' or terms->>'listingName' ilike '%Pulse%';

comment on table public.campuses is 'University nodes for the Loops network. Terminology follows the "Drop" nomenclature.';
