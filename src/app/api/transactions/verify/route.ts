import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const adminSupabase = createAdminClient();
        
        const { transaction_id, token } = await request.json();

        if (!transaction_id || !token) {
            return NextResponse.json({ error: 'Missing transaction_id or token' }, { status: 400 });
        }

        // Verify the handshake using the RPC function we defined in SQL
        const { data, error } = await adminSupabase.rpc('verify_handoff_handshake', {
            p_transaction_id: transaction_id,
            p_token: token
        });

        if (error) {
            console.error('HANDSHAKE_VERIFY_ERROR:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (data === true) {
            return NextResponse.json({ success: true, message: 'Handshake completed! Loop synced. 🤝' });
        } else {
            return NextResponse.json({ error: 'Invalid handshake token or transaction already completed.' }, { status: 400 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
