import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { recipients, message } = await request.json();

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json({ error: 'No recipients provided' }, { status: 400 });
        }

        if (!message) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
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

        // 2. Broadcast loop
        const results = [];
        for (const recipient of recipients) {
            try {
                // recipient can be an object with { whatsapp_number, full_name }
                const phone = recipient.whatsapp_number;
                if (!phone) {
                    results.push({ id: recipient.id, success: false, error: 'No phone number' });
                    continue;
                }

                // Replace placeholders if any (minimal support)
                let personalizedMessage = message;
                if (recipient.full_name) {
                    personalizedMessage = personalizedMessage.replace(/{name}/g, recipient.full_name);
                }

                const waRes = await sendWhatsAppMessage(phone, personalizedMessage);
                results.push({
                    id: recipient.id || phone,
                    success: !!waRes?.messages,
                    error: waRes?.error || null
                });
            } catch (err: any) {
                results.push({ id: recipient.id, success: false, error: err.message });
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error('BROADCAST_ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
