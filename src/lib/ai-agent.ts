import { createClient } from '@/lib/supabase/server';

interface BotIntent {
    intent: 'sell' | 'search' | 'help' | 'unknown';
    title?: string;
    price?: number;
    category?: string;
    query?: string;
}

export async function processIntent(text: string): Promise<BotIntent> {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
        console.warn('OPENAI_API_KEY not found. Using simple keyword parsing.');
        return fallbackParsing(text);
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `You are the Loops Campus Bot. Analyze student messages to extract intents.
                        Extracted categories: Electronics, Housing, Books, Fashion, Services, Other.
                        Intents: sell, search, help.
                        
                        Return JSON only:
                        { "intent": "sell" | "search" | "help", "title": "string", "price": number, "category": "string", "query": "string" }`
                    },
                    { role: 'user', content: text }
                ],
                response_format: { type: 'json_object' }
            })
        });

        const data = await response.json();
        const intentResult = JSON.parse(data.choices[0].message.content) as BotIntent;

        // If it's a 'sell' intent, we'll return the data to the webhook to handle saving
        return intentResult;
    } catch (error) {
        console.error('AI_AGENT_ERROR:', error);
        return fallbackParsing(text);
    }
}

export async function handleBotAction(from: string, intentData: BotIntent) {
    const supabase = await createClient();

    // 1. Find profile by whatsapp_number
    // Note: Meta 'from' is usually '15551234567' (international format without +)
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, campus_id')
        .eq('whatsapp_number', from)
        .single();

    if (!profile) {
        return "Hey! I don't recognize this number. Please link your WhatsApp in your Loops profile settings first!";
    }

    if (intentData.intent === 'sell' && intentData.title) {
        const { error } = await supabase
            .from('listings')
            .insert({
                seller_id: profile.id,
                campus_id: profile.campus_id,
                title: intentData.title,
                price: intentData.price || 0,
                category: intentData.category || 'Other',
                description: `Posted via WhatsApp: ${intentData.title}`,
                status: 'active',
                type: 'product'
            });

        if (error) {
            console.error('BOT_INSERT_ERROR:', error);
            return "My circuits jammed trying to save that listing. Try again in a sec?";
        }

        return `Bet! I've posted your "${intentData.title}" for $${intentData.price || 0} to the feed. Students at your campus can see it now!`;
    }

    if (intentData.intent === 'search') {
        const query = intentData.query || intentData.title || '';
        return `Searching the Node for "${query}"... Check the live results here: https://loops-marketplace.vercel.app/browse?q=${encodeURIComponent(query)}`;
    }

    return "I'm standing by. Tell me what you want to sell or find on campus!";
}

function fallbackParsing(text: string): BotIntent {
    const lowText = text.toLowerCase();
    if (lowText.includes('sell') || lowText.includes('listing')) {
        return { intent: 'sell', title: text.replace(/sell|listing/gi, '').trim() };
    }
    if (lowText.includes('search') || lowText.includes('find') || lowText.includes('buy')) {
        return { intent: 'search', query: text.replace(/search|find|buy/gi, '').trim() };
    }
    return { intent: 'help' };
}
