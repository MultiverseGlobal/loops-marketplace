import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const { offerId, action } = await request.json();

        if (!['accepted', 'rejected'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch offer
        const { data: offer, error: fetchError } = await supabase
            .from('offers')
            .select('*, listings(seller_id)')
            .eq('id', offerId)
            .single();

        if (fetchError || !offer) {
            return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
        }

        // Verify user is the seller
        if (offer.seller_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (offer.status !== 'pending') {
            return NextResponse.json({ error: 'Offer is no longer pending' }, { status: 400 });
        }

        // Update offer status
        const { error: updateError } = await supabase
            .from('offers')
            .update({ status: action, updated_at: new Date().toISOString() })
            .eq('id', offerId);

        if (updateError) throw updateError;

        // If accepted, automatically create a loop (transaction)
        if (action === 'accepted') {
            const { data: transaction, error: loopError } = await supabase
                .from('transactions')
                .insert({
                    listing_id: offer.listing_id,
                    buyer_id: offer.buyer_id,
                    seller_id: offer.seller_id,
                    amount: offer.amount,
                    status: 'pending'
                })
                .select()
                .single();

            if (loopError) throw loopError;

            return NextResponse.json({
                success: true,
                message: 'Offer accepted and Loop opened! 🔄',
                transactionId: transaction.id
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Offer rejected.'
        });

    } catch (error: any) {
        console.error('Handle offer error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
