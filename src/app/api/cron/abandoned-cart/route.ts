import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // 1. Verify Cron Secret (Optional but recommended for security)
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        const adminSupabase = createAdminClient();

        // 2. Find cart items older than 6 hours but newer than 48 hours
        // We only want to notify once, so we'll check created_at
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

        const { data: abandonedItems, error } = await adminSupabase
            .from('cart_items')
            .select(`
                *,
                profiles:user_id (id, full_name, email, whatsapp_number),
                listings:listing_id (id, title, price, images)
            `)
            .lt('created_at', sixHoursAgo)
            .gt('created_at', fortyEightHoursAgo);

        if (error) throw error;

        if (!abandonedItems || abandonedItems.length === 0) {
            return NextResponse.json({ message: 'No abandoned carts found.' });
        }

        // 3. Filter out items already notified (we could add a last_notified_at column later)
        // For now, we'll use a simple approach: if it's in this window, we notify.
        // To prevent double notification, we should really track this.
        // Let's check if there's an existing notification for this listing/user recently.
        
        const results = { sent: 0, skipped: 0 };

        for (const item of abandonedItems) {
            const user = item.profiles;
            const listing = item.listings;

            if (!user || !listing) continue;

            // Check if we already sent an 'abandoned_cart' notification for this listing to this user in the last 48h
            const { data: existingNotif } = await adminSupabase
                .from('notifications')
                .select('id')
                .eq('user_id', user.id)
                .eq('category', 'abandoned_cart')
                .eq('metadata->listing_id', listing.id)
                .single();

            if (existingNotif) {
                results.skipped++;
                continue;
            }

            // 4. Send Notification
            const { error: notifError } = await adminSupabase.from('notifications').insert({
                user_id: user.id,
                title: "Your Drop is waiting! 📦",
                message: `Hey ${user.full_name?.split(' ')[0] || 'there'}, the "${listing.title}" is still in your cart at ${listing.campuses?.name || 'the Loop'}. Secure it now before another student grabs it!`,
                type: 'engagement',
                category: 'abandoned_cart',
                link: `/listings/${listing.id}`,
                metadata: { listing_id: listing.id },
                read: false
            });

            if (!notifError) {
                results.sent++;
                // In the future, we could also trigger a WhatsApp message here
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error('CRON_ABANDONED_CART_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
