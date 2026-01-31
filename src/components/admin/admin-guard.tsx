'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function checkAdmin() {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.replace('/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (profile?.is_admin) {
                setIsAdmin(true);
            } else {
                router.replace('/');
            }
        }

        checkAdmin();
    }, [router, supabase]);

    if (isAdmin === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-loops-bg">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-loops-primary animate-spin" />
                    <p className="text-xs font-bold text-loops-muted uppercase tracking-widest">Verifying Authority...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
