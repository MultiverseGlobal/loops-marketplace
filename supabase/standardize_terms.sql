-- Standardize terminology for all campuses to 'Plug' and 'Buyer'
-- This ensures a consistent "cool student" vibe across all university networks

-- Update Public Uni Terms (Standardizing if they were different)
UPDATE campuses 
SET terms = terms || '{
    "sellerName": "Plug",
    "buyerName": "Buyer"
}'::jsonb;

-- Specifically fix the Private Uni Terms that were using Merchant/Hubber
UPDATE campuses 
SET terms = terms || '{
    "sellerName": "Plug",
    "buyerName": "Buyer",
    "listingAction": "Create a Pulse"
}'::jsonb
WHERE type = 'private';

-- Ensure Veritas and Covenant are updated
UPDATE campuses 
SET terms = terms || '{
    "sellerName": "Plug",
    "buyerName": "Buyer"
}'::jsonb
WHERE slug IN ('veritas', 'covenant');
