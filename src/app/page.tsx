'use client';

import { Button } from "../components/ui/button";
import { Navbar } from "../components/layout/navbar";
import { ProductCard } from "../components/ui/product-card";
import { SkeletonCard } from "../components/ui/skeleton-loader";
import { ArrowRight, Sparkles, ShieldCheck, Zap, MessageSquare } from "lucide-react";
import { Footer } from "../components/layout/footer";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "../lib/supabase/client";
import { useCampus } from "../context/campus-context";
import { motion } from "framer-motion";
import { FALLBACK_PRODUCT_IMAGE } from "../lib/constants";
import { cn } from "../lib/utils"; // Relative import fix

// FORCE REDEPLOY: Build resolution fix
export default function Home() {
    const [listings, setListings] = useState<any[]>([]);
    const supabase = createClient();
    const { campus, getTerm } = useCampus();

    useEffect(() => {
        const fetchTrending = async () => {
            const { data } = await supabase
                .from('listings')
                .select('*')
                .eq('status', 'active')
                .limit(4)
                .order('created_at', { ascending: false });

            if (data) setListings(data);
        };
        fetchTrending();
    }, [supabase]);

    return (
        <div className="bg-loops-bg">
            <Navbar />

            {/* Hero Section: The "Wow" Factor */}
            <section className="relative min-h-[85vh] flex items-center justify-center pt-28 pb-16 px-6 overflow-hidden">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-loops-primary/10 blur-[120px] rounded-full animate-float" />
                    <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-loops-secondary/5 blur-[100px] rounded-full animate-pulse" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto text-center space-y-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold bg-white border border-loops-border shadow-xl shadow-loops-primary/5 text-loops-primary uppercase tracking-[0.2em]"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-loops-accent" />
                        Verified @ {campus?.name || 'Local Nodes'}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="font-display text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-[-0.04em] leading-[0.9] text-loops-main"
                    >
                        Trade inside <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-loops-primary via-loops-accent to-loops-secondary bg-[length:200%_auto] animate-gradient italic">
                            the Pulse.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-base sm:text-lg md:text-xl text-loops-muted max-w-2xl mx-auto font-medium leading-relaxed opacity-80"
                    >
                        The economic nervous system of student life. Buy, sell, and offer skills safely within your verified university network.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
                    >
                        <Link href="/browse">
                            <Button size="lg" className="h-14 px-10 text-lg font-bold bg-loops-primary text-white hover:bg-loops-primary/90 transition-all shadow-2xl shadow-loops-primary/25 rounded-2xl group">
                                Start Trading
                                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/onboarding">
                            <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold border-loops-border bg-white text-loops-main rounded-2xl hover:bg-loops-subtle transition-all">
                                Join the Hub
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Bento Feature Grid */}
            <section className="py-24 px-6 relative z-10 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
                        {/* Big Card - Peer Privacy */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="md:col-span-2 md:row-span-2 p-8 md:p-12 rounded-[2.5rem] bg-loops-subtle border border-loops-border flex flex-col justify-between group overflow-hidden relative shadow-sm hover:shadow-xl transition-all"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-loops-primary/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-loops-primary/10 transition-colors" />
                            <div className="space-y-6 relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-loops-border flex items-center justify-center text-loops-primary shadow-sm">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <h3 className="font-display text-4xl font-bold text-loops-main tracking-tight leading-none">
                                    Verified <br />Peer Privacy.
                                </h3>
                                <p className="text-loops-muted text-lg max-w-sm leading-relaxed">
                                    Every user is authenticated with their institutional ID. No bots, no outsiders—just real students you can trust.
                                </p>
                            </div>
                            <div className="pt-8 relative z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-loops-border text-xs font-bold text-loops-primary uppercase tracking-widest shadow-sm">
                                    Official Node Active
                                </div>
                            </div>
                        </motion.div>

                        {/* Middle Top - Skill Swap */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="md:col-span-2 p-8 md:p-12 rounded-[2.5rem] bg-loops-main text-white flex flex-col justify-center gap-6 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all"
                        >
                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-loops-primary/20 rounded-full blur-3xl -mb-10 -mr-10" />
                            <div className="flex items-center justify-between relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-loops-primary">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50">Skill Exchange</span>
                            </div>
                            <div className="space-y-3 relative z-10">
                                <h3 className="font-display text-3xl font-bold tracking-tight">Trade Talent.</h3>
                                <p className="text-white/60 text-base max-w-xs">Swap graphic design for tutoring, or coding for photography. No cash needed.</p>
                            </div>
                        </motion.div>

                        {/* Bottom Right 1 - Instant Nodes */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-[2.5rem] bg-loops-accent/5 border border-loops-accent/10 flex flex-col items-center justify-center text-center gap-4 group shadow-sm hover:shadow-xl transition-all"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white border border-loops-accent/20 flex items-center justify-center text-loops-accent shadow-sm group-hover:scale-110 transition-transform">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-loops-main">Meeting Nodes</h4>
                                <p className="text-xs text-loops-muted">Secure pickup spots on campus.</p>
                            </div>
                        </motion.div>

                        {/* Bottom Right 2 - Campus Pulse */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-[2.5rem] bg-loops-secondary/5 border border-loops-secondary/10 flex flex-col items-center justify-center text-center gap-4 group shadow-sm hover:shadow-xl transition-all"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white border border-loops-secondary/20 flex items-center justify-center text-loops-secondary shadow-sm group-hover:scale-110 transition-transform">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-loops-main">Karma Stats</h4>
                                <p className="text-xs text-loops-muted">Build campus reputation points.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* How it Works: Step by Step */}
            <section className="py-32 px-6 bg-loops-subtle relative z-10">
                <div className="max-w-7xl mx-auto text-center space-y-20">
                    <div className="space-y-4">
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-loops-main tracking-tight italic">How the Loop flows.</h2>
                        <p className="text-loops-muted text-lg max-w-xl mx-auto">Standard trading is broken. Loops makes it as fast as a heartbeat.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Progress Line */}
                        <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-px border-t border-dashed border-loops-border" />

                        <StepItem
                            num="01"
                            title="Drop it"
                            desc="Post your item or service in 10 seconds. We verify your campus instantly."
                        />
                        <StepItem
                            num="02"
                            title="Sync Pulse"
                            desc="Chat securely within the platform. No personal phone numbers required."
                        />
                        <StepItem
                            num="03"
                            title="Complete Loop"
                            desc="Meet at a verified campus hotspot and swap. Build your Karma."
                        />
                    </div>
                </div>
            </section>

            {/* Active Feed Showcase */}
            <section className="py-32 px-6 max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                    <div className="space-y-4">
                        <div className="text-[10px] font-bold text-loops-primary uppercase tracking-[0.3em]">Live on campus</div>
                        <h2 className="font-display text-5xl md:text-6xl font-bold text-loops-main tracking-tighter italic">Trending Drops.</h2>
                        <p className="text-loops-muted text-lg max-w-xl">Fresh items and services moving right now at {campus?.name || 'Veritas University'}.</p>
                    </div>
                    <Link href="/browse" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-loops-subtle text-loops-main font-bold hover:bg-loops-border transition-all">
                        View The Feed <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                    {listings.length > 0 ? (
                        listings.map((listing, idx) => (
                            <ProductCard
                                key={listing.id}
                                id={listing.id}
                                title={listing.title}
                                price={`$${listing.price}`}
                                category={listing.category}
                                image={listing.images?.[0] || listing.image_url || FALLBACK_PRODUCT_IMAGE}
                                delay={idx * 0.1}
                            />
                        ))
                    ) : (
                        [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                    )}
                </div>
            </section>

            {/* Social Proof: Campus Stats */}
            <section className="py-20 border-y border-loops-border bg-white relative z-10 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        <div className="space-y-1">
                            <div className="text-3xl font-bold text-loops-main font-display">12+</div>
                            <div className="text-[10px] font-bold text-loops-muted uppercase tracking-widest">Active Campuses</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl font-bold text-loops-primary font-display">2.4k</div>
                            <div className="text-[10px] font-bold text-loops-muted uppercase tracking-widest">Verified Students</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl font-bold text-loops-main font-display">500+</div>
                            <div className="text-[10px] font-bold text-loops-muted uppercase tracking-widest">Successful Loops</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl font-bold text-loops-accent font-display">0%</div>
                            <div className="text-[10px] font-bold text-loops-muted uppercase tracking-widest">Outside Access</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action: The FOMO Block */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto rounded-[3.5rem] bg-loops-main p-12 md:p-24 text-center relative overflow-hidden shadow-3xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-loops-primary opacity-20 blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-loops-secondary opacity-20 blur-[100px]" />

                    <div className="relative z-10 space-y-10">
                        <h2 className="font-display text-4xl md:text-7xl font-bold text-white tracking-tighter leading-none text-balance">
                            Don't stay on the sidelines. <br />
                            <span className="italic opacity-60">Join the movement.</span>
                        </h2>
                        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                            Join the movement on {campus?.name || 'your campus'}. Your verified institutional identity is your key to the safest marketplace in Nigeria.
                        </p>
                        <div className="pt-6">
                            <Link href="/onboarding">
                                <Button size="lg" className="h-16 px-16 text-xl font-bold bg-white text-loops-main hover:bg-loops-subtle hover:scale-105 transition-all rounded-2xl shadow-xl">
                                    Enter the {getTerm('communityName')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}

function StepItem({ num, title, desc }: { num: string, title: string, desc: string }) {
    return (
        <div className="space-y-6 relative z-10 group">
            <div className="w-14 h-14 rounded-2xl bg-white border border-loops-border flex items-center justify-center text-xl font-display font-bold text-loops-primary shadow-sm group-hover:scale-110 group-hover:bg-loops-primary group-hover:text-white transition-all duration-300 mx-auto">
                {num}
            </div>
            <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold text-loops-main tracking-tight">{title}</h3>
                <p className="text-loops-muted text-sm leading-relaxed max-w-[240px] mx-auto">{desc}</p>
            </div>
        </div>
    );
}

function PropItem({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
    return (
        <div className="space-y-6 group">
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-inner", color)}>
                {icon}
            </div>
            <div className="space-y-3">
                <h3 className="font-display text-3xl font-bold text-loops-main tracking-tighter">{title}</h3>
                <p className="text-loops-muted text-lg leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function StatItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="space-y-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-loops-primary/5 flex items-center justify-center text-loops-primary border border-loops-primary/10">
                {icon}
            </div>
            <h3 className="font-display text-lg font-bold text-loops-main uppercase tracking-tighter">{title}</h3>
            <p className="text-sm text-loops-muted">{desc}</p>
        </div>
    );
}
