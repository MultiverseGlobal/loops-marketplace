-- Loops Grand Launch Sequence: The "Founding 10" Node Seeding
-- This script initializes the 10 strategic nodes with standardized terms and locations

INSERT INTO campuses (name, slug, domain, type, location, terms) VALUES
('Veritas University', 'veritas', 'veritas.edu.ng', 'private', 'Abuja', '{"sellerName": "Plug", "buyerName": "Buyer", "listingName": "Drop", "communityName": "Campus Loop"}'::jsonb),
('Bingham University', 'bingham', 'binghamuni.edu.ng', 'private', 'Karu', '{"sellerName": "Plug", "buyerName": "Buyer", "listingName": "Drop", "communityName": "Bingham Loop"}'::jsonb),
('Nile University of Nigeria', 'nile', 'nileuniversity.edu.ng', 'private', 'Abuja', '{"sellerName": "Plug", "buyerName": "Buyer", "listingName": "Listing", "communityName": "Nile Loop"}'::jsonb),
('University of Abuja', 'uniabuja', 'uniabuja.edu.ng', 'public', 'Abuja', '{"sellerName": "Plug", "buyerName": "Buyer", "listingName": "Listing", "communityName": "UniAbuja Loop"}'::jsonb),
('Abubakar Tafawa Balewa University', 'atbu', 'atbu.edu.ng', 'public', 'Bauchi', '{"sellerName": "Plug", "buyerName": "Buyer", "listingName": "Drop", "communityName": "ATBU Loop"}'::jsonb),
('University of Jos', 'unijos', 'unijos.edu.ng', 'public', 'Jos', '{"sellerName": "Plug", "buyerName": "Buyer", "listingName": "Drop", "communityName": "UniJos Loop"}'::jsonb),
('Michael Okpara University of Agriculture', 'mouau', 'mouau.edu.ng', 'public', 'Umudike', '{"sellerName": "Plug", "buyerName": "Buyer", "listingName": "Listing", "communityName": "MOUAU Loop"}'::jsonb),
('University of Lagos', 'unilag', 'unilag.edu.ng', 'public', 'Lagos', '{"sellerName": "Plug", "buyerName": "Buyer", "listingName": "Drop", "communityName": "The Hub"}'::jsonb),
('Ahmadu Bello University', 'abu', 'abu.edu.ng', 'public', 'Zaria', '{"sellerName": "Plug", "buyerName": "Buyer", "listingName": "Listing", "communityName": "ABU Loop"}'::jsonb),
('University of Nigeria, Nsukka', 'unn', 'unn.edu.ng', 'public', 'Nsukka', '{"sellerName": "Plug", "buyerName": "Buyer", "listingName": "Drop", "communityName": "UNN Loop"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET 
    domain = EXCLUDED.domain,
    type = EXCLUDED.type,
    location = EXCLUDED.location,
    terms = EXCLUDED.terms;
