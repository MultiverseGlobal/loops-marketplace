import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { oldPrice, newPrice } = await request.json();
        const { id: listingId } = await params;

        if (!newPrice || !oldPrice || newPrice >= oldPrice) {
            return NextResponse.json({ message: 'No price drop detected.' });
        }

        const adminSupabase = createAdminClient();

        // 1. Get the listing title
        const { data: listing } = await adminSupabase
            .from('listings')
            .select('title, campus_id, campuses(name)')
            .eq('id', listingId)
            .single();

        if (!listing) throw new Error('Listing not found');

        // 2. Find all users who have this item in their cart
        const { data: usersInCart, error } = await adminSupabase
            .from('cart_items')
            .select('user_id')
            .eq('listing_id', listingId);

        if (error) throw error;

        if (!usersInCart || usersInCart.length === 0) {
            return NextResponse.json({ message: 'No users have this item in cart.' });
        }

        // 3. Send Notifications
        const notifications = usersInCart.map((u: any) => ({
            user_id: u.user_id,
            title: "Price Drop! 💸",
            message: `The "${listing.title}" in your cart just got a campus discount! It's now only $${newPrice}. Grab it before someone else does!`,
            type: 'engagement',
            category: 'price_drop',
            link: `/listings/${listingId}`,
            metadata: { listing_id: listingId, old_price: oldPrice, new_price: newPrice },
            read: false
        }));

        const { error: insertError } = await adminSupabase.from('notifications').insert(notifications);
        if (insertError) throw insertError;

        return NextResponse.json({ 
            success: true, 
            notifications_sent: usersInCart.length 
        });

    } catch (error: any) {
        console.error('PRICE_DROP_WEBHOOK_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
