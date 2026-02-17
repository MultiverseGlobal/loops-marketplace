import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('activity_buzz')
            .select('*')
            .limit(10);

        if (error) {
            console.error('Error fetching activity buzz:', error);
            return NextResponse.json({ error: 'Failed to fetch activity buzz' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Buzz error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
