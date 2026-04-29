import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Simple in-memory rate limiting (Note: This is reset on function cold starts on Vercel)
const rateLimitMap = new Map<string, number>();

export async function proxy(request: NextRequest) {
    const ip = (request as any).ip || request.headers.get('x-forwarded-for') || 'anonymous';
    const path = request.nextUrl.pathname;

    // 1. Rate Limiting for sensitive API routes
    if (path.startsWith('/api/payments/') || path.startsWith('/api/transactions/dispute/') || path.startsWith('/api/referrals/withdraw')) {
        const now = Date.now();
        const lastRequest = rateLimitMap.get(ip) || 0;
        
        // Limit: 1 request per 2 seconds for sensitive transactions
        if (now - lastRequest < 2000) {
            return new NextResponse(
                JSON.stringify({ error: 'Too many requests. Please wait a moment.' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
        rateLimitMap.set(ip, now);
    }

    // 2. Refresh Supabase Session
    return await updateSession(request)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
