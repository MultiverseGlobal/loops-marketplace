
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addCampus() {
    console.log("Attempting to add MOUAU...");
    const { data, error } = await supabase
        .from('campuses')
        .upsert([
            {
                name: "Michael Okpara University of Agriculture, Umudike",
                slug: "mouau",
                domain: "mouau.edu.ng",
                location: "Umudike, Abia State",
                primary_color: "#006400",
                secondary_color: "#FFD700",
                accent_color: "#FFFFFF",
                terms: {
                    sellerName: "Plug",
                    buyerName: "Buyer",
                    listingName: "Drop",
                    communityName: "MOUAU Loop"
                }
            }
        ], { onConflict: 'slug' })
        .select();

    if (error) {
        console.error("Error adding campus:", error);
        console.log("\nIf this is an RLS error, please run the following SQL in the Supabase Dashboard:");
        console.log(`
INSERT INTO campuses (name, slug, domain, location, primary_color, secondary_color, accent_color, terms)
VALUES ('Michael Okpara University of Agriculture, Umudike', 'mouau', 'mouau.edu.ng', 'Umudike, Abia State', '#006400', '#FFD700', '#FFFFFF', '{"sellerName": "Plug", "buyerName": "Buyer", "listingName": "Drop", "communityName": "MOUAU Loop"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET 
    domain = EXCLUDED.domain,
    location = EXCLUDED.location;
        `);
    } else {
        console.log("Success! MOUAU node launched:", data);
    }
}

addCampus();
