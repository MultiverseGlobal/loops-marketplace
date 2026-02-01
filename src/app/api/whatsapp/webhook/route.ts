import { NextRequest, NextResponse } from 'next/server';
import { processIntent, handleBotAction } from '@/lib/ai-agent';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WHATSAPP_WEBHOOK_VERIFIED');
            return new NextResponse(challenge, { status: 200 });
        } else {
            return new NextResponse(null, { status: 403 });
        }
    }
    return new NextResponse(null, { status: 400 });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Check if this is a WhatsApp message
        if (body.object === 'whatsapp_business_account' && body.entry) {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    const value = change.value;
                    if (value.messages) {
                        for (const message of value.messages) {
                            const from = message.from; // User's phone number
                            const text = message.text?.body;

                            if (text) {
                                console.log(`Received WhatsApp message from ${from}: ${text}`);

                                // 1. Process intent with AI
                                const intentData = await processIntent(text);

                                // 2. Handle Action (Database Sync)
                                const replyText = await handleBotAction(from, intentData);

                                // 3. Send reply
                                await sendWhatsAppMessage(from, replyText);
                            }
                        }
                    }
                }
            }
            return NextResponse.json({ status: 'success' });
        }

        return new NextResponse(null, { status: 404 });
    } catch (error) {
        console.error('WHATSAPP_WEBHOOK_ERROR:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
