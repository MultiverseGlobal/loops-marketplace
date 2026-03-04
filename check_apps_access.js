const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auoyugxdgvvgwrldgudx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b3l1Z3hkZ3Z2Z3dybGRndWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTEzMDQsImV4cCI6MjA4Mzg4NzMwNH0.IO8RwQ0g6b5aX8hUjfWT3XxbIW74eN7UdxkMHHlpeZ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    const { data: apps, error } = await supabase
        .from('seller_applications')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching data:', error);
    } else {
        console.log('Success (even if empty)');
    }
}

checkColumns();
