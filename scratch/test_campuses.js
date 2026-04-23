const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://auoyugxdgvvgwrldgudx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b3l1Z3hkZ3Z2Z3dybGRndWR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMTMwNCwiZXhwIjoyMDgzODg3MzA0fQ.b-655KmqKg_cApFqts00KRNkLhAx_DdBvd5o0r1zrUI');

async function test() {
    const { data, error } = await supabase.from('campuses').select('*');
    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
}

test();
