const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://auoyugxdgvvgwrldgudx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b3l1Z3hkZ3Z2Z3dybGRndWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTEzMDQsImV4cCI6MjA4Mzg4NzMwNH0.IO8RwQ0g6b5aX8hUjfWT3XxbIW74eN7UdxkMHHlpeZ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCampuses() {
    const { data: campuses, error } = await supabase
        .from('campuses')
        .select('*');

    if (error) fs.writeFileSync('campuses_diagnostic.json', JSON.stringify(error, null, 2));
    else fs.writeFileSync('campuses_diagnostic.json', JSON.stringify(campuses, null, 2));
}

checkCampuses();
