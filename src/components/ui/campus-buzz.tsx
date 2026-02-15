'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Package, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CampusBuzz() {
    const [activities, setActivities] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        const fetchBuzz = async () => {
            const { data } = await supabase
                .from('activity_buzz')
                .select('*')
                .limit(5);

            if (data && data.length > 0) {
                setActivities(data);
            }
        };

        fetchBuzz();

        // Optional: Realtime subscription for future buzz
        const channel = supabase
            .channel('buzz')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, () => {
                fetchBuzz();
            })
            .subscribe();

        return () => { channel.unsubscribe(); };
    }, [supabase]);

    useEffect(() => {
        if (activities.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activities.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [activities]);

    if (activities.length === 0) return null;

    const activity = activities[currentIndex];

    return (
        <div className="w-full bg-loops-primary/5 border-y border-loops-primary/10 py-3 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-widest text-loops-primary"
                    >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="opacity-60">Just Now:</span>
                        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-loops-primary/10 shadow-sm">
                            <span className="text-loops-main">{activity.buyer_name}</span>
                            <span className="opacity-40 lowercase">grabbed a</span>
                            <span className="text-loops-main italic">"{activity.listing_title}"</span>
                            <span className="opacity-40 lowercase">at</span>
                            <span className="text-loops-primary">{activity.campus_name}</span>
                            <Sparkles className="w-3 h-3 text-amber-400 fill-current" />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
