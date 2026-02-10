import { createEdgeClient as createClient } from './supabase/edge';

interface BotIntent {
    intent: 'sell' | 'search' | 'help' | 'request' | 'karma' | 'unknown';
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
                        content: `You are the LoopBot, the AI heart of the Loops Campus Marketplace. 
                        Your vibe is helpful, energetic, and student-focused.
                        
                        Analyze student messages to extract intents:
                        - "sell": Posting an item (e.g., "Selling my laptop for 50k")
                        - "search": Looking for something (e.g., "Who has textbooks?", "Find me a designer")
                        - "request": A specific need or want that isn't a search (e.g., "I need a tutor," "Looking for a roommate," "Who can fix my screen?")
                        - "karma": Checking their own profile status or reputation (e.g., "What's my karma?", "How do I look?")
                        - "help": General questions about how Loops works.

                        Categories: Electronics, Housing, Books, Fashion, Services, Other.
                        
                        Return JSON only:
                        { 
                          "intent": "sell" | "search" | "request" | "karma" | "help", 
                          "title": "Short title for listing/request", 
                          "price": number, 
                          "category": "string", 
                          "query": "search query" 
                        }`
                    },
                    { role: 'user', content: text }
                ],
                response_format: { type: 'json_object' }
            })
        });

        const data = await response.json();
        const intentResult = JSON.parse(data.choices[0].message.content) as BotIntent;

        return intentResult;
    } catch (error) {
        console.error('AI_AGENT_ERROR:', error);
        return fallbackParsing(text);
    }
}

export async function handleBotAction(from: string, intentData: BotIntent) {
    const supabase = await createClient();

    // 1. Find profile by whatsapp_number
    // Note: Meta 'from' is usually '234...' (international format without +)
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, campus_id, reputation, rating')
        .eq('whatsapp_number', from)
        .single();

    if (!profile) {
        return "Yo! I don't recognize this number. Please head to your Profile Settings on Loops and link your WhatsApp number so I can help you loop in!";
    }

    // Handle 'sell' and 'request' (both create listings)
    if ((intentData.intent === 'sell' || intentData.intent === 'request') && intentData.title) {
        const type = intentData.intent === 'sell' ? 'product' : 'request';
        const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://loops-marketplace.vercel.app';

        const { data: newListing, error } = await supabase
            .from('listings')
            .insert({
                seller_id: profile.id,
                campus_id: profile.campus_id,
                title: intentData.title,
                price: intentData.price || 0,
                category: intentData.category || 'Other',
                description: `Posted via WhatsApp: ${intentData.title}`,
                status: 'active',
                type: type
            })
            .select()
            .single();

        if (error) {
            console.error('BOT_INSERT_ERROR:', error);
            return "My circuits jammed trying to save that. Mind trying again in a bit?";
        }

        const listingUrl = `${APP_URL}/listings/${newListing.id}`;

        if (type === 'product') {
            return `Bet! I've dropped your "${intentData.title}" for $${intentData.price || 0} to the campus feed. 🕸️\n\nView it live: ${listingUrl}`;
        } else {
            return `Got it! I've posted your request for "${intentData.title}" to the Loop. Someone will hit you up soon! ⚡\n\nTrack your request: ${listingUrl}`;
        }
    }

    if (intentData.intent === 'karma') {
        const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://loops-marketplace.vercel.app';
        return `Yo ${profile.full_name}! Your current Karma is ${profile.reputation || 0} with a rating of ${profile.rating || 0} stars. Keep looping! 🕸️🔥\n\nView your profile: ${APP_URL}/profile?u=${profile.id}`;
    }

    if (intentData.intent === 'search') {
        const query = intentData.query || intentData.title || '';
        return `Scanning the Loop for "${query}"... Check the live results here: https://loops-marketplace.vercel.app/browse?q=${encodeURIComponent(query)}`;
    }

    if (intentData.intent === 'help') {
        return "I'm LoopBot! You can tell me to sell something (e.g., 'Sell my phone for 20k'), find something ('Find me a laptop'), or drop a request ('I need a tutor'). You can also ask for your 'Karma' to see your reputation!";
    }

    return "I'm standing by. Tell me what you want to sell, find, or request on campus!";
}

function fallbackParsing(text: string): BotIntent {
    const lowText = text.toLowerCase();
    if (lowText.includes('sell')) {
        return { intent: 'sell', title: text.replace(/sell/gi, '').trim() };
    }
    if (lowText.includes('need') || lowText.includes('looking for') || lowText.includes('request')) {
        return { intent: 'request', title: text.replace(/need|looking for|request/gi, '').trim() };
    }
    if (lowText.includes('search') || lowText.includes('find') || lowText.includes('buy')) {
        return { intent: 'search', query: text.replace(/search|find|buy/gi, '').trim() };
    }
    if (lowText.includes('karma') || lowText.includes('reputation') || lowText.includes('rating')) {
        return { intent: 'karma' };
    }
    return { intent: 'help' };
}
