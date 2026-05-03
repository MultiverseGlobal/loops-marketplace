'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Users, ShieldCheck, Zap, Store, Copy, Check, Package, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { InfinityLogo } from '@/components/ui/infinity-logo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://loops-stores.vercel.app';
const POPULATE_URL = `${SITE_URL}/founding-plugs/populate`;
const APPLY_URL = `${SITE_URL}/founding-plugs`;

export default function CampaignPage() {
    const [copied, setCopied] = useState(false);
    const [joinedCount, setJoinedCount] = useState(12);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const supabase = createClient();
                const { count } = await supabase
                    .from('seller_applications')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'approved');
                if (count !== null) setJoinedCount(count + 12);
            } catch (_) {}
        };
        fetchCount();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(POPULATE_URL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const stats = [
        { label: 'Spots Left', value: `${Math.max(0, 50 - joinedCount)}`, icon: Users },
        { label: 'Zero Fees', value: '100 Sales', icon: ShieldCheck },
        { label: 'Items to Start', value: '3 Items', icon: Package },
    ];

    const steps = [
        { num: '01', title: 'Apply as a Founding Plug', desc: 'Takes 2 minutes. Get your store name and badge secured.' },
        { num: '02', title: 'Populate Your Loop', desc: 'List at least 3 items — products or services — to become Verified.' },
        { num: '03', title: 'Launch & Get Paid', desc: 'Go live on campus. First 100 sales are 0% commission.' },
    ];

    return (
        <div className="min-h-screen bg-loops-main text-white overflow-hidden relative">

            {/* Background glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <motion.div
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-loops-primary/20 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, -45, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-loops-energetic/20 blur-[150px] rounded-full"
                />
            </div>

            <main className="relative z-10 max-w-2xl mx-auto px-5 py-12 flex flex-col gap-12">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <InfinityLogo className="w-8 h-8" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-white/60">Loops Marketplace</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-loops-primary/20 border border-loops-primary/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-loops-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-loops-primary">{joinedCount}/50 Plugs</span>
                    </div>
                </motion.div>

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-loops-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-loops-primary">Founding Plug Season — Open Now</span>
                    </div>

                    <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.85] italic">
                        Populate <br />
                        <span className="bg-gradient-to-r from-loops-primary via-loops-accent to-loops-energetic bg-clip-text text-transparent">
                            the Loop.
                        </span>
                    </h1>

                    <p className="text-white/60 text-base sm:text-lg max-w-md mx-auto leading-relaxed font-medium">
                        Be one of the first 50 student vendors on your campus. List your products, unlock your <strong className="text-white">Verified Plug badge</strong>, and earn with zero commission.
                    </p>
                </motion.div>

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-3 gap-3"
                >
                    {stats.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <Icon className="w-4 h-4 text-loops-primary" />
                            <span className="text-xl font-black text-white">{value}</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 text-center">{label}</span>
                        </div>
                    ))}
                </motion.div>

                {/* How it works */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-center">How it works</p>
                    <div className="space-y-3">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.num}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.35 + i * 0.07 }}
                                className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-loops-primary/20 transition-all group"
                            >
                                <span className="text-2xl font-black text-loops-primary/40 group-hover:text-loops-primary transition-colors font-display leading-none mt-0.5">
                                    {step.num}
                                </span>
                                <div>
                                    <h3 className="font-bold text-sm text-white">{step.title}</h3>
                                    <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col gap-3"
                >
                    {/* Primary: Populate link (for existing approved plugs) */}
                    <Link href="/founding-plugs/populate" id="populate-cta">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-16 rounded-2xl bg-loops-primary flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-sm shadow-[0_20px_50px_-10px_rgba(16,185,129,0.5)] cursor-pointer"
                        >
                            <Store className="w-5 h-5" />
                            Populate My Loop
                            <ArrowRight className="w-5 h-5" />
                        </motion.div>
                    </Link>

                    {/* Secondary: Apply link (for new plugs) */}
                    <Link href="/founding-plugs" id="apply-cta">
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-14 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer"
                        >
                            <Sparkles className="w-4 h-4" />
                            Apply as Founding Plug First
                        </motion.div>
                    </Link>
                </motion.div>

                {/* Share Link Box */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Share this page</p>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-xs font-mono text-white/50 truncate">
                            {POPULATE_URL}
                        </div>
                        <button
                            id="copy-link-btn"
                            onClick={handleCopy}
                            className="h-10 px-4 rounded-xl bg-loops-primary/20 border border-loops-primary/30 text-loops-primary font-bold text-xs uppercase tracking-widest hover:bg-loops-primary hover:text-white transition-all flex items-center gap-2 shrink-0"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">
                        Send this to your friends on campus — they'll need to apply as a Founding Plug first
                    </p>
                </motion.div>

                {/* Social proof */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center justify-center gap-3 text-center"
                >
                    <div className="flex -space-x-2">
                        {['🎓', '📦', '👕', '💄', '📱'].map((emoji, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-loops-primary/20 border-2 border-loops-main flex items-center justify-center text-sm">
                                {emoji}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-white/40 font-bold">
                        <span className="text-white">{joinedCount} plugs</span> already claimed their spot
                    </p>
                </motion.div>

                {/* Footer */}
                <div className="text-center text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 pb-4">
                    Loops Marketplace · Campus Commerce · Nigeria
                </div>
            </main>
        </div>
    );
}
