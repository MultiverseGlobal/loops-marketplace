export async function sendWhatsAppMessage(to: string, text: string) {
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
        console.warn('WHATSAPP_CREDENTIALS_MISSING');
        return { error: { message: "WhatsApp credentials missing in environment." } };
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to,
                type: 'text',
                text: { body: text }
            })
        });

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error('SEND_WHATSAPP_ERROR:', error);
        return { error: { message: error.message } };
    }
}

export async function sendWhatsAppTemplate(to: string, templateName: string, languageCode: string = 'en_US', components: any[] = []) {
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) return { error: { message: "WhatsApp credentials missing." } };

    try {
        const response = await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: to,
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: languageCode },
                    components: components
                }
            })
        });

        return await response.json();
    } catch (error: any) {
        return { error: { message: error.message } };
    }
}
