'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Package, Book, Coffee, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuzzItem {
    id: string;
    listing_title: string;
    listing_type: 'product' | 'service' | 'request';
    campus_name: string;
    buyer_name: string;
    seller_name: string;
    created_at: string;
}

export function ActivityBuzz() {
    const [buzz, setBuzz] = useState<BuzzItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchBuzz = async () => {
            try {
                const res = await fetch('/api/buzz');
                if (res.ok) {
                    const data = await res.json();
                    setBuzz(data);
                }
            } catch (error) {
                console.error('Failed to fetch buzz:', error);
            }
        };

        fetchBuzz();
        // Refresh every 30 seconds
        const interval = setInterval(fetchBuzz, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (buzz.length > 0) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % buzz.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [buzz.length]);

    if (buzz.length === 0) return null;

    const current = buzz[currentIndex];

    return (
        <div className="w-full bg-loops-primary/5 border-y border-loops-primary/10 overflow-hidden py-1.5 relative group">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-loops-primary">
                    <div className="relative">
                        <div className="absolute inset-0 bg-loops-primary/20 blur-sm rounded-full animate-pulse" />
                        <ShieldCheck className="w-4 h-4 relative z-10" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Live Activity Buzz</span>
                </div>

                <div className="h-4 w-px bg-loops-primary/20 hidden sm:block" />

                <div className="overflow-hidden relative flex-1 max-w-lg">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                            className="flex items-center gap-3 text-xs font-medium text-loops-main line-clamp-1"
                        >
                            <span className="text-loops-muted font-bold opacity-60">
                                {current.campus_name}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-loops-primary">
                                    {current.buyer_name?.split(' ')[0]}
                                </span>
                                <span className="text-loops-muted italic">secured</span>
                                <span className="font-bold underline decoration-loops-primary/30 decoration-2 underline-offset-2">
                                    {current.listing_title}
                                </span>
                                <span className="text-loops-muted italic">from</span>
                                <span className="font-bold">
                                    {current.seller_name?.split(' ')[0]}
                                </span>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="hidden md:flex items-center gap-1 text-[9px] font-black text-loops-primary/40 uppercase tracking-widest pl-4">
                    Handshakes Only <ArrowRight className="w-3 h-3" />
                </div>
            </div>

            {/* Ambient Progress Line */}
            <motion.div
                key={currentIndex}
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="absolute bottom-0 left-0 h-[1px] bg-loops-primary w-full opacity-20"
            />
        </div>
    );
}
