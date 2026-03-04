const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auoyugxdgvvgwrldgudx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b3l1Z3hkZ3Z2Z3dybGRndWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTEzMDQsImV4cCI6MjA4Mzg4NzMwNH0.IO8RwQ0g6b5aX8hUjfWT3XxbIW74eN7UdxkMHHlpeZ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFullInsert() {
    const { data, error } = await supabase
        .from('seller_applications')
        .insert({
            full_name: 'Debug Test User',
            whatsapp_number: '+1234567890',
            campus_email: 'debug@test.edu',
            offering_type: 'product',
            offering_description: 'Debug Description',
            estimated_item_count: '1-5 Items',
            status: 'pending',
            store_name: 'Debug Store',
            store_banner_color: 'bg-loops-primary',
            store_category: 'General Goods',
            store_logo_url: '',
            motivation: 'Debug Motivation',
            referred_by_code: null,
            user_id: null
        })
        .select();

    if (error) {
        console.error('Full Insert Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('Full Insert Success:', JSON.stringify(data, null, 2));
    }
}

testFullInsert();
