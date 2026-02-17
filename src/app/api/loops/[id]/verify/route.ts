import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id } = await params;

    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
        }

        // Call the RPC function to verify the handshake
        const { data: success, error } = await supabase.rpc('verify_handoff_handshake', {
            p_transaction_id: id,
            p_token: token
        });

        if (error) {
            console.error('Verification RPC error:', error);
            return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
        }

        if (!success) {
            return NextResponse.json({ error: 'Invalid token or transaction already completed' }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Handshake verified! Loop completed.' });
    } catch (error) {
        console.error('Handshake verification error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
