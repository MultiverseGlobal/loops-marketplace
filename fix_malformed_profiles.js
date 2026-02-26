const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://auoyugxdgvvgwrldgudx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b3l1Z3hkZ3Z2Z3dybGRndWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTEzMDQsImV4cCI6MjA4Mzg4NzMwNH0.IO8RwQ0g6b5aX8hUjfWT3XxbIW74eN7UdxkMHHlpeZ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findMalformed() {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, campus_id')
        .not('campus_id', 'is', null);

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    const malformed = data.filter(p => p.campus_id && p.campus_id.length < 30);
    console.log('Malformed profiles:', JSON.stringify(malformed, null, 2));

    if (malformed.length > 0) {
        console.log('Fixing malformed IDs...');
        for (const p of malformed) {
            if (p.campus_id === '0000-000000000001') {
                const { error: uError } = await supabase
                    .from('profiles')
                    .update({ campus_id: '00000000-0000-0000-0000-000000000001' })
                    .eq('id', p.id);
                if (uError) console.error('Update Error:', uError);
                else console.log(`Fixed profile ${p.id}`);
            }
        }
    } else {
        console.log('No malformed IDs found in profiles table.');
    }
}

findMalformed();
