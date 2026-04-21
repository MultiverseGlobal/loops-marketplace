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
        const inAppResults = { success: 0, failed: 0 };
        const waResults = { success: 0, failed: 0, details: [] as any[] };
        
        const waRecipients = recipients.filter((r: any) => 
            r.whatsapp_number && 
            /^\+?[1-9]\d{1,14}$/.test(r.whatsapp_number.replace(/\s+/g, '')) // E.164 phone check
        );
        const inAppRecipients = recipients.filter((r: any) => r.id && r.id.length === 36);

        // a. BATCH IN-APP NOTIFICATIONS (PRIORITY)
        if (inAppRecipients.length > 0) {
            const notifications = inAppRecipients.map((r: any) => ({
                user_id: r.id,
                title: title || "New Update!",
                message: (message || "").replace(/{name}/g, r.full_name || 'there'),
                image_url: image_url || null,
                video_url: video_url || null,
                cta_link: cta_link || null,
                type: 'engagement',
                category: 'promotion',
                read: false
            }));

            const { error: insertError } = await adminSupabase.from('notifications').insert(notifications);
            if (insertError) {
                console.error('NOTIF_INSERT_ERROR:', insertError);
                inAppResults.failed = inAppRecipients.length;
            } else {
                inAppResults.success = inAppRecipients.length;
            }
        }

        // b. WHATSAPP LOOP
        for (const recipient of waRecipients) {
            try {
                let personalizedMessage = message || "";
                if (recipient.full_name) {
                    personalizedMessage = personalizedMessage.replace(/{name}/g, recipient.full_name);
                }

                const cleanNumber = recipient.whatsapp_number.replace(/\s+/g, '');
                let waResult;
                if (video_url) {
                    waResult = await sendWhatsAppMedia(cleanNumber, 'video', video_url, personalizedMessage);
                } else if (image_url) {
                    waResult = await sendWhatsAppMedia(cleanNumber, 'image', image_url, personalizedMessage);
                } else {
                    waResult = await sendWhatsAppMessage(cleanNumber, personalizedMessage);
                }
                
                if (waResult?.error) {
                    waResults.failed++;
                    waResults.details.push({ id: recipient.id, success: false, error: waResult.error.message });
                } else {
                    waResults.success++;
                    waResults.details.push({ id: recipient.id, success: true });
                }
            } catch (err: any) {
                waResults.failed++;
                waResults.details.push({ id: recipient.id, success: false, error: err.message });
            }
        }

        // 3. Log Campaign
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

        // 4. Return summary
        const totalDelivered = inAppResults.success + waResults.success;
        const totalFailed = (inAppRecipients.length + waRecipients.length) - totalDelivered;

        if (totalDelivered === 0 && recipients.length > 0) {
            return NextResponse.json({ 
                error: `Broadcast failed across all channels. In-App: ${inAppResults.failed}, WhatsApp: ${waResults.failed}`,
                whatsappDetails: waResults.details 
            }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            delivered: totalDelivered,
            inApp: inAppResults.success,
            whatsapp: waResults.success,
            failed: totalFailed,
            whatsappFailures: waResults.failed
        });

    } catch (error: any) {
        console.error('ENGAGEMENT_BROADCAST_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
