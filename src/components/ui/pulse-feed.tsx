'use client';

import { useState, useEffect } from 'react';
import { PulseCard } from './pulse-card';
import { SkeletonCard } from './skeleton-loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bell, ArrowRight, UserPlus, Info } from 'lucide-react';
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
        <div className="max-w-xl mx-auto px-4 py-10 space-y-8">
            {/* Guest Welcome / Call to Action */}
            {!authenticated && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border-2 border-loops-primary border-dashed rounded-[2.5rem] p-8 text-center space-y-4"
                >
                    <div className="w-16 h-16 bg-loops-primary/10 rounded-full flex items-center justify-center mx-auto text-loops-primary">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-display font-black tracking-tighter text-loops-main">Browse now. Buy later.</h3>
                        <p className="text-sm text-loops-muted leading-relaxed">
                            You're currently browsing the Campus Pulse. Join to start loops, message vendors, and earn Carmen points.
                        </p>
                    </div>
                    <Link href="/login?view=signup">
                        <Button className="w-full h-14 bg-loops-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-loops-primary/20">
                            Join the Loop <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </motion.div>
            )}

            {/* Feed Header */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-loops-primary text-white flex items-center justify-center shadow-lg shadow-loops-primary/20">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tighter text-loops-main leading-none">Fresh Drops</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-loops-primary mt-1">Real-time Campus Pulse</p>
                    </div>
                </div>
                {!authenticated && (
                    <Link href="/welcome">
                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-white border border-loops-border text-loops-muted hover:text-loops-primary" title="What is Loops?">
                            <Info className="w-5 h-5" />
                        </Button>
                    </Link>
                )}
            </div>

            {/* The Feed */}
            <div className="space-y-6">
                {loading ? (
                    <div className="space-y-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-white border border-loops-border rounded-[2.5rem] h-[400px]" />
                        ))}
                    </div>
                ) : items.length > 0 ? (
                    <AnimatePresence>
                        {items.map((item, idx) => (
                            <PulseCard key={item.id} item={item} delay={idx * 0.1} />
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="py-20 text-center space-y-4 opacity-30 grayscale">
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
