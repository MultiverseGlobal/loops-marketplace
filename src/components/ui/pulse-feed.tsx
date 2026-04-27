'use client';

import { useState, useEffect } from 'react';
import { PulseCard } from './pulse-card';
import { HybridGrid } from './hybrid-grid';
import { SkeletonCard } from './skeleton-loader';
import { Bell, ArrowRight, UserPlus, Info } from 'lucide-react';
import { Button } from './button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export function PulseFeed({ campusId }: { campusId?: string | null }) {

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setAuthenticated(!!session);
        };
        checkAuth();

        const fetchFeed = async () => {
            setLoading(true);
            try {
                const url = campusId ? `/api/pulse?campus_id=${campusId}` : '/api/pulse';
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setItems(data);
                }
            } catch (error) {
                console.error("Failed to fetch pulse feed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, [campusId, supabase]);

            <HybridGrid items={items} loading={loading} />

            {/* Bottom Spacer/Padding */}
            <div className="h-20" />
        </div>
    );
}
