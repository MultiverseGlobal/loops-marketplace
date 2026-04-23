const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://auoyugxdgvvgwrldgudx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b3l1Z3hkZ3Z2Z3dybGRndWR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMTMwNCwiZXhwIjoyMDgzODg3MzA0fQ.b-655KmqKg_cApFqts00KRNkLhAx_DdBvd5o0r1zrUI');

async function checkTables() {
    const tables = ['cart_items', 'wishlists', 'engagement_campaigns', 'notifications'];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) console.log(`Table ${table} error:`, error.message);
        else console.log(`Table ${table} exists. Columns:`, Object.keys(data[0] || {}).join(', '));
    }
}

checkTables();
