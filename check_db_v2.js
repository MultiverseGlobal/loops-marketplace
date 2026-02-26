const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auoyugxdgvvgwrldgudx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b3l1Z3hkZ3Z2Z3dybGRndWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTEzMDQsImV4cCI6MjA4Mzg4NzMwNH0.IO8RwQ0g6b5aX8hUjfWT3XxbIW74eN7UdxkMHHlpeZ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('--- Latest Listings ---');
    const { data: listings, error: lError } = await supabase
        .from('listings')
        .select('id, title, status, type, campus_id, seller_id, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

    if (lError) console.error('Listings Error:', lError);
    else console.log(JSON.stringify(listings, null, 2));

    console.log('\n--- Profiles with Campus ID ---');
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, campus_id, full_name, email_verified')
        .limit(10);

    if (pError) console.error('Profiles Error:', pError);
    else console.log(JSON.stringify(profiles, null, 2));
}

checkData();
