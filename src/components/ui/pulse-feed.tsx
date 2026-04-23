'use client';

import { useState, useEffect } from 'react';
import { PulseCard } from './pulse-card';
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

    return (
        <div className="w-full space-y-8">
            {/* Feed Header */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-loops-main leading-none uppercase italic">Campus Feed<span className="text-loops-primary">.</span></h2>
                        <p className="text-[10px] font-bold text-loops-muted uppercase tracking-widest mt-1">Real-time marketplace pulse</p>
                    </div>
                </div>
                <Link href="/browse">
                    <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-loops-primary hover:bg-loops-primary/5">
                        View All <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                </Link>
            </div>

            {/* The Feed - Now a Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {loading ? (
                    <>
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-white border border-loops-border rounded-[2rem] aspect-[4/5]" />
                        ))}
                    </>
                ) : items.length > 0 ? (
                    items.map((item, idx) => (
                        <PulseCard key={item.id} item={item} />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center space-y-4 opacity-30 grayscale">
                        <Bell className="w-20 h-20 mx-auto" />
                        <p className="text-sm font-black uppercase tracking-widest">Feed is quiet...</p>
                    </div>
                )}
            </div>

            {/* Bottom Spacer/Padding */}
            <div className="h-20" />
        </div>
    );
}
