import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendFoundingPlugApprovalEmail } from '@/lib/email';
import { sendWhatsAppMessage, sendWhatsAppTemplate } from '@/lib/whatsapp';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { applicationIds, generalMessage } = await request.json();

        if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
            return NextResponse.json({ error: 'No application IDs provided' }, { status: 400 });
        }

        // 1. Verify Admin Session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        // 2. Fetch Applications
        const { data: apps, error: fetchError } = await supabase
            .from('seller_applications')
            .select('*')
            .in('id', applicationIds);

        if (fetchError || !apps) return NextResponse.json({ error: 'Applications not found' }, { status: 404 });

        const results = [];

        for (const app of apps) {
            try {
                // 3. Update Status and Grant Plug Access
                const { error: updateError } = await supabase
                    .from('seller_applications')
                    .update({
                        status: 'approved',
                        reviewed_at: new Date().toISOString(),
                        reviewed_by: user.id
                    })
                    .eq('id', app.id);

                if (updateError) throw updateError;

                // Grant plug status if registered
                if (app.user_id) {
                    await supabase.from('profiles').update({
                        is_plug: true,
                        reputation: 100,
                        store_name: app.store_name,
                        store_banner_color: app.store_banner_color,
                        store_logo_url: app.store_logo_url,
                        primary_role: 'plug'
                    }).eq('id', app.user_id);
                }

                // 4. Trigger Notifications
                const notificationResults = {
                    email: false,
                    whatsapp: false
                };

                // a. Email
                if (app.campus_email) {
                    const emailRes = await sendFoundingPlugApprovalEmail(app.full_name, app.campus_email);
                    notificationResults.email = emailRes.success;
                }

                // b. WhatsApp
                if (app.whatsapp_number) {
                    const message = generalMessage || `👑 CONGRATULATIONS ${app.full_name.toUpperCase()}! Your Founding Plug application for "${app.store_name}" has been APPROVED. \n\nYou are now part of the elite Founding 50. Please wait for the full launch sequence. \n\n♾️ LOOPS PLATFORMS`;

                    // Try template first if no custom message provided
                    if (!generalMessage) {
                        const templateRes = await sendWhatsAppTemplate(
                            app.whatsapp_number,
                            'founding_plug_approval',
                            'en_US',
                            [{
                                type: 'body',
                                parameters: [
                                    { type: 'text', text: app.full_name },
                                    { type: 'text', text: app.store_name }
                                ]
                            }]
                        );
                        if (templateRes?.messages) {
                            notificationResults.whatsapp = true;
                        }
                    }

                    // Fallback or Custom Message
                    if (!notificationResults.whatsapp) {
                        const waRes = await sendWhatsAppMessage(app.whatsapp_number, message);
                        notificationResults.whatsapp = !!waRes?.messages;
                    }
                }

                results.push({ id: app.id, success: true, notifications: notificationResults });
            } catch (err: any) {
                results.push({ id: app.id, success: false, error: err.message });
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error('BATCH_APPROVAL_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
