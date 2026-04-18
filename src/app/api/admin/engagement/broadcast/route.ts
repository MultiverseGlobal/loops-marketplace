import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { sendWhatsAppMessage, sendWhatsAppMedia } from '@/lib/whatsapp';

export async function POST(request: Request) {
    try {
        // User session client — for auth verification only
        const supabase = await createClient();
        // Admin client — bypasses RLS for cross-user notification inserts
        const adminSupabase = createAdminClient();
        const { 
            title, 
            message, 
            image_url, 
            video_url, 
            cta_link, 
            recipients,
            segment 
        } = await request.json();

        // 1. Verify Admin Session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        // 2. Broadcast loop
        const results = [];
        const waRecipients = recipients.filter((r: any) => r.whatsapp_number);
        const inAppRecipients = recipients.filter((r: any) => r.id); // Profiles

        // Batch In-App Notifications — use admin client to bypass RLS
        if (inAppRecipients.length > 0) {
            const notifications = inAppRecipients.map((r: any) => ({
                user_id: r.id,
                title: title || "New Update!",
                message: message.replace(/{name}/g, r.full_name || 'there'),
                image_url: image_url || null,
                video_url: video_url || null,
                cta_link: cta_link || null,
                type: 'engagement',
                category: 'promotion',
                read: false
            }));

            const { error: insertError } = await adminSupabase.from('notifications').insert(notifications);
            if (insertError) console.error('NOTIF_INSERT_ERROR:', insertError);
        }

        // WhatsApp Loop
        for (const recipient of waRecipients) {
            try {
                let personalizedMessage = message;
                if (recipient.full_name) {
                    personalizedMessage = personalizedMessage.replace(/{name}/g, recipient.full_name);
                }

                if (video_url) {
                    await sendWhatsAppMedia(recipient.whatsapp_number, 'video', video_url, personalizedMessage);
                } else if (image_url) {
                    await sendWhatsAppMedia(recipient.whatsapp_number, 'image', image_url, personalizedMessage);
                } else {
                    await sendWhatsAppMessage(recipient.whatsapp_number, personalizedMessage);
                }
                
                results.push({ id: recipient.id, success: true });
            } catch (err: any) {
                results.push({ id: recipient.id, success: false, error: err.message });
            }
        }

        // 3. Log Campaign — use admin client
        const { error: campaignError } = await adminSupabase.from('engagement_campaigns').insert({
            title,
            message,
            image_url: image_url || null,
            video_url: video_url || null,
            cta_link: cta_link || null,
            segment: segment || 'custom',
            recipients_count: recipients.length,
            created_by: user.id
        });
        if (campaignError) console.error('CAMPAIGN_LOG_ERROR:', campaignError);

        return NextResponse.json({ success: true, count: results.length });

    } catch (error: any) {
        console.error('ENGAGEMENT_BROADCAST_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
