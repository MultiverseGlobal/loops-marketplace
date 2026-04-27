'use client';

import React from 'react';
import { PulseCard } from './pulse-card';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { Button } from './button';
import Link from 'next/link';

interface HybridGridProps {
    items: any[];
    loading?: boolean;
}

export function HybridGrid({ items, loading }: HybridGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white border border-loops-border rounded-[2rem] aspect-[4/5]" />
                ))}
            </div>
        );
    }

    // Function to render items with hybrid blocks at specific intervals
    const renderHybridItems = () => {
        const elements = [];
        
        items.forEach((item, index) => {
            elements.push(<PulseCard key={item.id} item={item} />);

            // Insert Hybrid Banner 1 after index 1 (between row 1 and 2 on mobile, or middle of row 1 on desktop)
            // Actually, let's do it every 4-6 items
            if (index === 3) {
                elements.push(
                    <div key="hybrid-banner-1" className="col-span-full my-4">
                        <div className="rounded-[2.5rem] bg-gradient-to-r from-loops-primary to-loops-secondary p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                            <div className="space-y-2 relative z-10 text-center md:text-left">
                                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter italic">Secure Handshake Protected.</h3>
                                <p className="text-white/80 text-xs font-bold uppercase tracking-[0.2em]">Escrow protection for every campus trade</p>
                            </div>
                            <Button className="bg-white text-loops-primary hover:bg-white/90 h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl relative z-10">
                                Learn More
                            </Button>
                        </div>
                    </div>
                );
            }

            if (index === 7) {
                elements.push(
                    <div key="hybrid-banner-2" className="col-span-full my-4">
                        <div className="rounded-[2.5rem] bg-loops-main p-8 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                             <div className="absolute left-0 bottom-0 w-64 h-64 bg-loops-primary/10 rounded-full blur-3xl -ml-20 -mb-20 group-hover:scale-110 transition-transform duration-700" />
                            <div className="space-y-2 relative z-10 text-center md:text-left">
                                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter">Become a Verified <span className="text-loops-primary italic">Plug.</span></h3>
                                <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Join the network of top student sellers</p>
                            </div>
                            <Link href="/founding-plugs">
                                <Button className="bg-loops-primary text-white hover:bg-loops-primary/90 h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl relative z-10">
                                    Apply Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                );
            }
        });

        return elements;
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {renderHybridItems()}
        </div>
    );
}
