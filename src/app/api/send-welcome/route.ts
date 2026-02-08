import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { user_id, email, name } = await request.json();

        if (!user_id || !email || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Send welcome email
        const result = await sendWelcomeEmail(name, email, user_id);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Failed to send email', details: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Welcome email sent successfully',
            data: result.data
        });

    } catch (error: any) {
        console.error('Send welcome error:', error);
        return NextResponse.json(
            { error: 'Failed to send welcome email', details: error.message },
            { status: 500 }
        );
    }
}
