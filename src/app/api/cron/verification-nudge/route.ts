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

        // 1. Find users created > 24h ago but not verified
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data: unverifiedUsers, error } = await adminSupabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('email_verified', false)
            .lt('created_at', twentyFourHoursAgo);

        if (error) throw error;

        if (!unverifiedUsers || unverifiedUsers.length === 0) {
            return NextResponse.json({ message: 'No unverified users to nudge.' });
        }

        const results = { sent: 0, skipped: 0 };

        for (const user of unverifiedUsers) {
            // Check if already nudged in the last 7 days
            const { data: existingNotif } = await adminSupabase
                .from('notifications')
                .select('id')
                .eq('user_id', user.id)
                .eq('category', 'verification_nudge')
                .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
                .single();

            if (existingNotif) {
                results.skipped++;
                continue;
            }

            // Send Nudge
            await adminSupabase.from('notifications').insert({
                user_id: user.id,
                title: "Unlock your Campus Loop! 🛡️",
                message: `Hey ${user.full_name?.split(' ')[0] || 'there'}, you're missing out on trading! Verify your student email now to start selling and messaging other students.`,
                type: 'info',
                category: 'verification_nudge',
                link: '/profile',
                read: false
            });

            results.sent++;
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error('CRON_VERIFICATION_NUDGE_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
