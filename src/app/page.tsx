'use client';

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { ProductCard } from "@/components/ui/product-card";
import { SkeletonCard } from "@/components/ui/skeleton-loader";
import { ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { Footer } from "@/components/layout/footer";
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
            <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-loops-primary/10 blur-[120px] rounded-full animate-float" />
                    <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-loops-secondary/5 blur-[100px] rounded-full animate-pulse" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto text-center space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold bg-white border border-loops-border shadow-xl shadow-loops-primary/5 text-loops-primary uppercase tracking-[0.2em]"
                    >
                        <Sparkles className="w-4 h-4 text-loops-accent" />
                        Verified @ {campus?.name || 'Local Nodes'}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="font-display text-6xl sm:text-8xl md:text-[10rem] font-bold tracking-[ -0.05em] leading-[0.85] text-loops-main"
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
                        className="text-lg md:text-2xl text-loops-muted max-w-3xl mx-auto font-medium leading-relaxed opacity-80"
                    >
                        The economic nervous system of student life. Buy, sell, and offer skills safely within your verified university network.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
                    >
                        <Link href="/browse">
                            <Button size="lg" className="h-16 px-12 text-xl font-bold bg-loops-primary text-white hover:bg-loops-primary/90 transition-all shadow-2xl shadow-loops-primary/25 rounded-2xl group">
                                Start Trading
                                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/onboarding">
                            <Button size="lg" variant="outline" className="h-16 px-12 text-xl font-bold border-loops-border bg-white/50 backdrop-blur-md hover:bg-white text-loops-main rounded-2xl">
                                Join the Hub
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Value Propositions: Why Loops? */}
            <section className="py-32 px-6 border-y border-loops-border bg-white relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        <PropItem
                            icon={<ShieldCheck className="w-8 h-8" />}
                            title="Zero Scams"
                            desc="Every user is locked to their university email. No bots. No ghosting. Just real students."
                            color="bg-loops-primary/10 text-loops-primary"
                        />
                        <PropItem
                            icon={<Zap className="w-8 h-8" />}
                            title="Instant Liquidity"
                            desc="Turn your old textbooks or skills into cash in minutes. Meetup at 'The Spot' between classes."
                            color="bg-loops-accent/10 text-loops-accent"
                        />
                        <PropItem
                            icon={<Sparkles className="w-8 h-8" />}
                            title="Pulse Reputation"
                            desc="Build your campus credit. Every successful trade increases your rank as a trusted campus plug."
                            color="bg-loops-secondary/10 text-loops-secondary"
                        />
                    </div>
                </div>
            </section>

            {/* Active Feed Showcase */}
            <section className="py-32 px-6 max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                    <div className="space-y-4">
                        <div className="text-[10px] font-bold text-loops-primary uppercase tracking-[0.3em]">Live on campus</div>
                        <h2 className="font-display text-5xl md:text-6xl font-bold text-loops-main tracking-tighter">Trending Drops.</h2>
                        <p className="text-loops-muted text-lg max-w-xl">Fresh items and services moving right now at {campus?.name || 'Veritas University'}.</p>
                    </div>
                    <Link href="/browse" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-loops-subtle text-loops-main font-bold hover:bg-loops-border transition-all">
                        View The Feed <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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

            {/* Call to Action: The FOMO Block */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto rounded-[3rem] bg-loops-main p-12 md:p-24 text-center relative overflow-hidden shadow-3xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-loops-primary opacity-20 blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-loops-secondary opacity-20 blur-[100px]" />

                    <div className="relative z-10 space-y-10">
                        <h2 className="font-display text-4xl md:text-7xl font-bold text-white tracking-tighter leading-none text-balance">
                            Don't stay on the sidelines. <br />
                            <span className="italic opacity-60">Join the movement.</span>
                        </h2>
                        <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                            Join the movement on {campus?.name || 'your campus'}. Your verified institutional identity is your key.
                        </p>
                        <div className="pt-6">
                            <Link href="/onboarding">
                                <Button size="lg" className="h-16 px-16 text-xl font-bold bg-white text-loops-main hover:bg-loops-subtle transition-all rounded-2xl shadow-xl">
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
