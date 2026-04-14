'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, ShoppingBag, Users, Zap, Layers, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AppEntry {
    id: string;
    name: string;
    description: string;
    icon: any;
    url: string;
    color: string;
    wing: string;
}

const APPS: AppEntry[] = [
    {
        id: 'loops',
        name: 'Loops',
        wing: 'Trade Wing',
        description: 'Campus Merchant OS & Marketplace',
        icon: ShoppingBag,
        url: '/',
        color: 'from-emerald-400 to-emerald-600'
    },
    {
        id: 'quad',
        name: 'Quad',
        wing: 'Tech Wing',
        description: 'Academic Career Network & Campus LinkedIn',
        icon: Users,
        url: 'http://localhost:3001', // Configurable for prod
        color: 'from-blue-500 to-indigo-600'
    }
];

export function EcosystemSwitcher() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            {/* Stealth Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[8px] font-bold text-loops-muted opacity-40 hover:opacity-100 uppercase tracking-[0.25em] flex items-center gap-1.5 transition-all group"
            >
                <span>Byte Tech Wing</span>
                <div className={cn(
                    "w-1 h-1 rounded-full bg-loops-primary transition-all",
                    isOpen ? "scale-150 animate-pulse" : "group-hover:scale-125"
                )} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[60] bg-black/5 backdrop-blur-[2px]"
                        />

                        {/* Switcher Card - Upward Opening */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: -20 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute bottom-6 left-0 w-[280px] md:w-[320px] z-[70] origin-bottom-left"
                        >
                            <div className="bg-white/80 backdrop-blur-3xl border border-white/40 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.2)] rounded-[2.5rem] overflow-hidden">
                                {/* MGE Header */}
                                <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-loops-main/[0.02] to-transparent">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-xl bg-loops-main flex items-center justify-center shadow-lg">
                                            <Zap className="w-4 h-4 text-white fill-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-loops-main opacity-40">Conglomerate</h3>
                                            <p className="text-xs font-black text-loops-main leading-none mt-0.5 tracking-tighter">Multiverse Global Enterprise</p>
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-display font-black tracking-tighter text-loops-main italic leading-tight">
                                        The Byte <span className="text-loops-primary">Tech Wing</span>.
                                    </h2>
                                </div>

                                {/* App List */}
                                <div className="px-4 pb-4 grid grid-cols-1 gap-2">
                                    {APPS.map((app) => (
                                        <Link 
                                            key={app.id} 
                                            href={app.url}
                                            onClick={() => setIsOpen(false)}
                                            className="group flex items-center gap-5 p-4 rounded-3xl hover:bg-white transition-all duration-500 border border-transparent hover:border-loops-border hover:shadow-xl hover:shadow-black/5"
                                        >
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 bg-gradient-to-br",
                                                app.color
                                            )}>
                                                <app.icon className="w-7 h-7 text-white" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-loops-muted opacity-60">{app.wing}</span>
                                                    <ArrowRight className="w-3 h-3 text-loops-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                </div>
                                                <h4 className="font-display text-lg font-black tracking-tighter text-loops-main leading-none mb-1">{app.name}</h4>
                                                <p className="text-[10px] text-loops-muted font-medium pr-4">{app.description}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Footer Ecosystem Credit */}
                                <div className="px-8 py-5 bg-loops-main/[0.03] border-t border-loops-border flex items-center justify-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-loops-primary rounded-full animate-pulse" />
                                    <span className="text-[9px] font-bold text-loops-muted uppercase tracking-[0.25em]">Connected @ MGE Ecosystem</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
