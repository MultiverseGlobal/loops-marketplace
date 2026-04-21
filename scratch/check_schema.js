const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auoyugxdgvvgwrldgudx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b3l1Z3hkZ3Z2Z3dybGRndWR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMTMwNCwiZXhwIjoyMDgzODg3MzA0fQ.b-655KmqKg_cApFqts00KRNkLhAx_DdBvd5o0r1zrUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('--- Checking notifications table ---');
    const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching notifications:', error);
    } else {
        console.log('Columns in notifications:', Object.keys(notifications[0] || {}));
    }

    console.log('\n--- Checking engagement_campaigns table ---');
    const { data: campaigns, error: cError } = await supabase
        .from('engagement_campaigns')
        .select('*')
        .limit(1);

    if (cError) {
        console.error('Error fetching engagement_campaigns:', cError);
    } else {
        console.log('Columns in engagement_campaigns:', Object.keys(campaigns[0] || {}));
    }
}

checkSchema();
