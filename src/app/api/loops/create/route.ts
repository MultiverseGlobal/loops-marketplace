import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const { listingId, pickupLocation } = await request.json();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch the listing to get seller info and price
        const { data: listing, error: listingError } = await supabase
            .from('listings')
            .select('id, seller_id, price, status, title, type')
            .eq('id', listingId)
            .single();

        if (listingError || !listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        // Validate listing is active
        if (listing.status !== 'active') {
            return NextResponse.json({ error: 'Listing is no longer available' }, { status: 400 });
        }

        // Prevent buying your own items
        if (listing.seller_id === user.id) {
            return NextResponse.json({ error: 'You cannot buy your own items' }, { status: 400 });
        }

        // Check if user already has a pending loop for this item
        const { data: existingLoop } = await supabase
            .from('transactions')
            .select('id, status')
            .eq('listing_id', listingId)
            .eq('buyer_id', user.id)
            .in('status', ['pending', 'vendor_confirmed'])
            .maybeSingle();

        if (existingLoop) {
            return NextResponse.json({
                error: 'You already have an active loop for this item',
                loopId: existingLoop.id
            }, { status: 400 });
        }

        // Create the transaction/loop
        const { data: transaction, error: transactionError } = await supabase
            .from('transactions')
            .insert({
                listing_id: listingId,
                buyer_id: user.id,
                seller_id: listing.seller_id,
                amount: listing.price,
                status: 'pending',
                pickup_location: pickupLocation || null
            })
            .select('id')
            .single();

        if (transactionError) {
            console.error('Transaction creation error:', transactionError);
            return NextResponse.json({ error: 'Failed to create loop' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            loopId: transaction.id,
            listingType: listing.type,
            listingTitle: listing.title,
            message: listing.type === 'product'
                ? 'Purchase loop initiated! 🛍️'
                : 'Service loop started! ⚡'
        });

    } catch (error) {
        console.error('Loop creation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
