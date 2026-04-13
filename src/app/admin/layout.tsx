'use client';

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LoopLoading } from "@/components/ui/loop-loading";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                router.push('/login?next=/admin');
                return;
            }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (error || !profile?.is_admin) {
                console.error("Unauthorized admin access attempt:", user.id);
                router.push('/');
                return;
            }

            setIsAuthorized(true);
            setLoading(false);
        };

        checkAdmin();
    }, [supabase, router]);

    if (loading) {
        return <LoopLoading type="admin" />;
    }

    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
