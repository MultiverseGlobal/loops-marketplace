import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    try {
        const { proofUrl } = await request.json();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch the transaction
        const { data: transaction, error: fetchError } = await supabase
            .from('transactions')
            .select('id, seller_id, buyer_id, listing_id, status')
            .eq('id', id)
            .single();

        if (fetchError || !transaction) {
            return NextResponse.json({ error: 'Loop not found' }, { status: 404 });
        }

        // Verify user is the seller
        if (transaction.seller_id !== user.id) {
            return NextResponse.json({ error: 'Only the vendor can confirm fulfillment' }, { status: 403 });
        }

        // Verify transaction is in pending state
        if (transaction.status !== 'pending') {
            return NextResponse.json({ error: 'Loop is not in pending state' }, { status: 400 });
        }

        // Update transaction to vendor_confirmed
        const { error: updateError } = await supabase
            .from('transactions')
            .update({
                status: 'vendor_confirmed',
                vendor_confirmed_at: new Date().toISOString(),
                vendor_proof_url: proofUrl || null
            })
            .eq('id', id);

        if (updateError) {
            console.error('Vendor confirmation error:', updateError);
            return NextResponse.json({ error: 'Failed to confirm fulfillment' }, { status: 500 });
        }

        // TODO: Send notification to buyer (Phase 2)

        return NextResponse.json({
            success: true,
            message: 'Fulfillment confirmed! Waiting for buyer confirmation. ✅'
        });

    } catch (error) {
        console.error('Vendor confirm error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
