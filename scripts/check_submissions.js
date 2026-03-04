const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local if dotenv is missing
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            process.env[key.trim()] = value;
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSubmissions() {
    console.log("--- Diagnosing Seller Applications ---");

    const { data, error, count } = await supabase
        .from('seller_applications')
        .select('*', { count: 'exact' });

    if (error) {
        console.error("Error fetching applications:", error.message);
        return;
    }

    console.log(`Total Applications Found: ${count}`);

    if (data && data.length > 0) {
        console.log("\nRecent Applications:");
        data.slice(0, 5).forEach(app => {
            console.log(`- [${app.status}] ${app.full_name} (${app.whatsapp_number}) - ${app.created_at}`);
        });

        const pending = data.filter(a => a.status === 'pending');
        console.log(`\nPending Applications: ${pending.length}`);
    } else {
        console.log("No applications found in the 'seller_applications' table.");
    }

    // Also check student_verifications just in case
    const { count: verifyCount } = await supabase
        .from('student_verifications')
        .select('*', { count: 'exact', head: true });

    console.log(`\nTotal Student Verifications: ${verifyCount}`);
}

checkSubmissions();
