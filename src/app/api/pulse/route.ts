import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const campusId = searchParams.get('campus_id');
        const limit = parseInt(searchParams.get('limit') || '20');

        // 1. Fetch Listings (New Drops)
        let listingsQuery = supabase
            .from('listings')
            .select('*, profiles(full_name, avatar_url, store_name, is_plug)')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(10);

        if (campusId) {
            listingsQuery = listingsQuery.eq('campus_id', campusId);
        }

        const { data: listings } = await listingsQuery;

        // 2. Fetch Recent Transactions (Social Proof) - Enforce Campus Restriction
        let transactionsQuery = supabase
            .from('transactions')
            .select(`
                id,
                created_at,
                listing:listings!inner(title, type, campus_id),
                buyer:profiles!transactions_buyer_id_fkey(full_name),
                seller:profiles!transactions_seller_id_fkey(full_name, campus:campuses(name))
            `)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(5);

        if (campusId) {
            transactionsQuery = transactionsQuery.eq('listing.campus_id', campusId);
        }

        const { data: transactions } = await transactionsQuery;

        // 3. Fetch Engagement Campaigns (Marketing Media) - Filter by Campus if possible
        let campaignsQuery = supabase
            .from('engagement_campaigns')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);

        // If campusId is provided, we can either filter by it (if column exists) 
        // or just show global ones. For now, let's check if we can add campus_id.
        // Assuming we might have a campus_id column or global campaigns (null campus_id).
        if (campusId) {
            campaignsQuery = campaignsQuery.or(`campus_id.eq.${campusId},campus_id.is.null`);
        }

        const { data: campaigns } = await campaignsQuery;

        // 4. Combine and Sort
        const feed = [
            ...(listings || []).map(l => ({ ...l, feed_type: 'listing' })),
            ...(transactions || []).map(t => ({ ...t, feed_type: 'activity' })),
            ...(campaigns || []).map(c => ({ ...c, feed_type: 'campaign' }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return NextResponse.json(feed.slice(0, limit));

    } catch (error: any) {
        console.error('PULSE_FEED_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
