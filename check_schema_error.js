const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auoyugxdgvvgwrldgudx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b3l1Z3hkZ3Z2Z3dybGRndWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTEzMDQsImV4cCI6MjA4Mzg4NzMwNH0.IO8RwQ0g6b5aX8hUjfWT3XxbIW74eN7UdxkMHHlpeZ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase.rpc('get_table_info', { table_name: 'seller_applications' });
    if (error) {
        // Fallback: Just try to insert a minimal row and see the error
        const { error: insertError } = await supabase.from('seller_applications').insert([{}]);
        console.log('Insert Error (to reveal missing fields):', insertError);
    } else {
        console.log('Table Info:', data);
    }
}

checkSchema();
