
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin insert

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials in .env.local")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addCampus() {
    console.log("Adding MOUAU...")
    const { data, error } = await supabase
        .from('campuses')
        .insert([
            {
                name: "Michael Okpara University of Agriculture, Umudike",
                slug: "mouau",
                domain: "mouau.edu.ng",
                location: "Umudike, Abia State",
                primary_color: "#006400", // Dark Green
                secondary_color: "#FFD700", // Gold/Yellow
                accent_color: "#FFFFFF"
            }
        ])
        .select()

    if (error) {
        console.error("Error adding campus:", error)
    } else {
        console.log("Campus added successfully:", data)
    }
}

addCampus()
