const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://auoyugxdgvvgwrldgudx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b3l1Z3hkZ3Z2Z3dybGRndWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTEzMDQsImV4cCI6MjA4Mzg4NzMwNH0.IO8RwQ0g6b5aX8hUjfWT3XxbIW74eN7UdxkMHHlpeZ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    let output = '';
    output += '--- Latest Listings ---\n';
    const { data: listings, error: lError } = await supabase
        .from('listings')
        .select('id, title, status, type, campus_id, seller_id, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

    if (lError) output += 'Listings Error: ' + JSON.stringify(lError) + '\n';
    else output += JSON.stringify(listings, null, 2) + '\n';

    output += '\n--- Profiles with Campus ID ---\n';
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, campus_id, full_name, email_verified')
        .limit(10);

    if (pError) output += 'Profiles Error: ' + JSON.stringify(pError) + '\n';
    else output += JSON.stringify(profiles, null, 2) + '\n';

    fs.writeFileSync('db_diagnostic.json', output);
    console.log('Diagnostic written to db_diagnostic.json');
}

checkData();
