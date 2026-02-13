import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendFoundingPlugApprovalEmail } from '@/lib/email';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { applicationId } = await request.json();

        // 1. Verify Admin Session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        // 2. Fetch Application
        const { data: app, error: fetchError } = await supabase
            .from('seller_applications')
            .select('*')
            .eq('id', applicationId)
            .single();

        if (fetchError || !app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

        // 3. Update Status and Grant Plug Access
        const { error: updateError } = await supabase
            .from('seller_applications')
            .update({
                status: 'approved',
                reviewed_at: new Date().toISOString(),
                reviewed_by: user.id
            })
            .eq('id', applicationId);

        if (updateError) throw updateError;

        // If the applicant is a registered user, grant them plug status
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
            email: { success: false, error: null as string | null },
            whatsapp: { success: false, error: null as string | null }
        };

        // a. Email
        if (app.campus_email) {
            const emailRes = await sendFoundingPlugApprovalEmail(app.full_name, app.campus_email);
            notificationResults.email.success = emailRes.success;
            if (!emailRes.success) notificationResults.email.error = JSON.stringify(emailRes.error);
        }

        // b. WhatsApp
        if (app.whatsapp_number) {
            const waMessage = `👑 CONGRATULATIONS ${app.full_name.toUpperCase()}! Your Founding Plug application for "${app.store_name}" has been APPROVED. \n\nYou are now part of the elite Founding 50. Please wait for the full launch sequence. \n\n♾️ LOOPS PLATFORMS`;
            const waRes = await sendWhatsAppMessage(app.whatsapp_number, waMessage);

            // Meta API returns error field if failed
            if (waRes?.error) {
                notificationResults.whatsapp.success = false;
                notificationResults.whatsapp.error = waRes.error.message;
            } else if (waRes?.messages) {
                notificationResults.whatsapp.success = true;
            } else {
                notificationResults.whatsapp.error = "Unknown WhatsApp error. Check credentials.";
            }
        }

        return NextResponse.json({
            success: true,
            notifications: notificationResults
        });

    } catch (error: any) {
        console.error('APPROVAL_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
