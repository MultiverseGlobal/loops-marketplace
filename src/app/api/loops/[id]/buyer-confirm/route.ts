import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    try {
        const { proofUrl, rating, review } = await request.json();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch the transaction
        const { data: transaction, error: fetchError } = await supabase
            .from('transactions')
            .select('id, seller_id, buyer_id, listing_id, status, amount')
            .eq('id', id)
            .single();

        if (fetchError || !transaction) {
            return NextResponse.json({ error: 'Loop not found' }, { status: 404 });
        }

        // Verify user is the buyer
        if (transaction.buyer_id !== user.id) {
            return NextResponse.json({ error: 'Only the buyer can confirm receipt' }, { status: 403 });
        }

        // Verify transaction is vendor_confirmed
        if (transaction.status !== 'vendor_confirmed') {
            return NextResponse.json({ error: 'Vendor must confirm fulfillment first' }, { status: 400 });
        }

        // Update transaction to completed
        const { error: updateError } = await supabase
            .from('transactions')
            .update({
                status: 'completed',
                buyer_confirmed_at: new Date().toISOString(),
                buyer_proof_url: proofUrl || null
            })
            .eq('id', id);

        if (updateError) {
            console.error('Buyer confirmation error:', updateError);
            return NextResponse.json({ error: 'Failed to confirm receipt' }, { status: 500 });
        }

        // Award reputation points
        const { data: sellerProfile } = await supabase.from('profiles').select('reputation').eq('id', transaction.seller_id).single();
        const { data: buyerProfile } = await supabase.from('profiles').select('reputation').eq('id', transaction.buyer_id).single();

        const reputationUpdates = [
            supabase.from('profiles').update({
                reputation: (sellerProfile?.reputation || 0) + 10
            }).eq('id', transaction.seller_id),
            supabase.from('profiles').update({
                reputation: (buyerProfile?.reputation || 0) + 5
            }).eq('id', transaction.buyer_id)
        ];

        await Promise.all(reputationUpdates);

        // Archive the listing
        await supabase
            .from('listings')
            .update({ status: 'sold' })
            .eq('id', transaction.listing_id);

        // Create review if provided
        if (rating && rating >= 1 && rating <= 5) {
            await supabase.from('reviews').insert({
                transaction_id: transaction.id,
                reviewer_id: user.id,
                reviewee_id: transaction.seller_id,
                rating,
                comment: review || null
            });

            // Extra +5 reputation bonus for leaving a review
            const { data: latestBuyerProfile } = await supabase.from('profiles').select('reputation').eq('id', user.id).single();
            await supabase.from('profiles').update({
                reputation: (latestBuyerProfile?.reputation || 0) + 5
            }).eq('id', user.id);
        }

        return NextResponse.json({
            success: true,
            message: 'Loop closed successfully! 🎉 Reputation awarded.'
        });

    } catch (error) {
        console.error('Buyer confirm error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
