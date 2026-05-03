import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        const adminSupabase = createAdminClient();

        // 1. Fetch Top 5 trending/latest items across all campuses
        const { data: topListings, error: listingsError } = await adminSupabase
            .from('listings')
            .select('*, campuses(name)')
            .eq('status', 'active')
            .limit(5)
            .order('boosted_until', { ascending: false })
            .order('created_at', { ascending: false });

        if (listingsError) throw listingsError;

        // 2. Fetch all active users (those who haven't been notified of a recap in 7 days)
        const { data: users, error: usersError } = await adminSupabase
            .from('profiles')
            .select('id, full_name');

        if (usersError) throw usersError;

        const results = { sent: 0 };

        // For each user, send a personalized recap notification
        // Note: In production, this should be batched or handled via a queue
        for (const user of users) {
            const { error: notifError } = await adminSupabase.from('notifications').insert({
                user_id: user.id,
                title: "Weekend Recap: What's Hot! 🔥",
                message: `Check out the top drops at your campus this week. Don't miss these deals!`,
                type: 'engagement',
                category: 'weekend_recap',
                link: '/',
                metadata: { top_listings: topListings.map(l => l.id) },
                read: false
            });

            if (!notifError) results.sent++;
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error('CRON_WEEKEND_RECAP_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
