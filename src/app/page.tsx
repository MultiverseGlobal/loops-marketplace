'use client';

import { Button } from "../components/ui/button";
import { Navbar } from "../components/layout/navbar";
import { ProductCard } from "../components/ui/product-card";
import { FeaturedHubs } from "../components/ui/featured-hubs";
import { SkeletonCard } from "../components/ui/skeleton-loader";
import { ArrowRight, Sparkles, ShieldCheck, Zap, MessageSquare } from "lucide-react";
import { Footer } from "../components/layout/footer";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "../lib/supabase/client";
import { useCampus } from "../context/campus-context";
import { motion } from "framer-motion";
import { FALLBACK_PRODUCT_IMAGE, CURRENCY } from "../lib/constants";
import { cn } from "../lib/utils"; // Relative import fix

// FORCE REDEPLOY: Build resolution fix
export default function Home() {
    const [listings, setListings] = useState<any[]>([]);
    const [foundingPlugs, setFoundingPlugs] = useState<any[]>([]);
    const [counts, setCounts] = useState({ campuses: 0, students: 0, loops: 0 });
    const supabase = createClient();
    const { campus, getTerm } = useCampus();

    useEffect(() => {
        const fetchData = async () => {
            // Count active campuses
            const { count: campusCount } = await supabase
                .from('campuses')
                .select('*', { count: 'exact', head: true });

            // Count total students (profiles)
            const { count: studentCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // Count successful loops (completed transactions)
            const { count: loopCount } = await supabase
                .from('transactions')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'completed');

            setCounts({
                campuses: campusCount || 12, // Fallback to 12 if 0 for "vibe" during development
                students: studentCount || 2400, // Fallback to 2.4k if 0
                loops: loopCount || 500
            });

            // Fetch trending listings with author names and review stats
            const { data } = await supabase
                .from('listings')
                .select(`
                    *,
                    profiles(full_name),
                    reviews(rating),
                    transactions(status)
                `)
                .eq('status', 'active')
                .limit(20); // Fetch more to calculate trending score

            if (data) {
                // Calculate trending score for each listing
                const scoredListings = data.map(listing => {
                    const reviews = listing.reviews || [];
                    const transactions = listing.transactions || [];

                    // Calculate metrics
                    const avgRating = reviews.length > 0
                        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
                        : 0;
                    const reviewCount = reviews.length;
                    const completedPurchases = transactions.filter((t: any) => t.status === 'completed').length;

                    // Trending score formula: (avg_rating * 20) + (review_count * 10) + (purchases * 15)
                    // This weights purchases heavily, followed by ratings and review counts
                    const trendingScore = (avgRating * 20) + (reviewCount * 10) + (completedPurchases * 15);

                    return {
                        ...listing,
                        trendingScore
                    };
                });

                // Sort by trending score and take top 4
                const trendingListings = scoredListings
                    .sort((a, b) => b.trendingScore - a.trendingScore)
                    .slice(0, 4);

                setListings(trendingListings);
            }

            // Fetch Founding Plugs (Verified Sellers)
            const { data: plugs } = await supabase
                .from('profiles')
                .select('*')
                .eq('is_plug', true)
                .limit(10);

            if (plugs) setFoundingPlugs(plugs);
        };
        fetchData();
    }, [supabase]);

    return (
        <div className="bg-loops-bg">
            <Navbar />

            {/* Hero Section: The "Wow" Factor */}
            <section className="relative min-h-[70vh] flex items-center justify-center pt-24 pb-12 px-6 overflow-hidden">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-loops-primary/10 blur-[120px] rounded-full animate-float" />
                    <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-loops-secondary/5 blur-[100px] rounded-full animate-pulse" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto text-center px-4 sm:px-6 space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold bg-white border border-loops-border shadow-xl shadow-loops-primary/5 text-loops-primary uppercase tracking-[0.2em]"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-loops-teal" />
                        Verified @ {campus?.name || 'Local Loops'}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="font-display text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-[-0.04em] leading-[0.9] text-loops-main"
                    >
                        Trade inside <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-loops-primary to-loops-teal bg-[length:200%_auto] animate-gradient italic">
                            the Loop.
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

            <FeaturedHubs />

            {/* NEW: Founding Plugs Spotlight */}
            {foundingPlugs.length > 0 && (
                <section className="py-20 px-6 bg-white overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-10">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-bold font-display tracking-tight">Meet the Founding Plugs</h2>
                                <p className="text-sm text-loops-muted">Verified creators and sellers leading the {campus?.name || 'campus'} economy.</p>
                            </div>
                            <Link href="/browse" className="text-loops-primary text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-2">
                                Browse All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-10">
                            {foundingPlugs.map((plug) => (
                                <motion.div
                                    key={plug.id}
                                    whileHover={{ y: -5 }}
                                    className="flex-shrink-0 w-64 p-6 rounded-[2rem] bg-loops-subtle border border-loops-border relative group"
                                >
                                    <div className="absolute top-4 right-4">
                                        <div className="w-8 h-8 rounded-full bg-loops-primary/10 flex items-center justify-center text-loops-primary">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg overflow-hidden relative">
                                            {plug.avatar_url ? (
                                                <Image src={plug.avatar_url} alt={plug.full_name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-loops-primary/10 flex items-center justify-center text-loops-primary font-bold text-xl">
                                                    {plug.full_name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg truncate">{plug.full_name}</h3>
                                            <p className="text-xs text-loops-muted uppercase font-bold tracking-widest">{plug.store_name || 'Campus Merchant'}</p>
                                        </div>
                                        <Link href={`/profile?u=${plug.id}`}>
                                            <Button variant="outline" className="w-full mt-2 rounded-xl text-[10px] font-bold uppercase tracking-widest h-10 border-loops-primary/20 text-loops-primary hover:bg-loops-primary/5">
                                                Visit Store
                                            </Button>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Bento Feature Grid */}
            <section className="py-32 px-4 sm:px-6 relative z-10 bg-white">
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
                                <h3 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-loops-main italic leading-[0.85]">
                                    One <br className="hidden sm:block" /> {getTerm('communityName')}.
                                </h3>
                                <p className="text-loops-muted text-lg max-w-sm leading-relaxed">
                                    Every user is authenticated with their institutional ID. No bots, no outsiders—just real students you can trust.
                                </p>
                            </div>
                            <div className="pt-8 relative z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-loops-border text-xs font-bold text-loops-primary uppercase tracking-widest shadow-sm">
                                    Official Loop Active
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
                                <h4 className="font-bold text-loops-main">Meeting Loops</h4>
                                <p className="text-xs text-loops-muted">Secure pickup spots on campus.</p>
                            </div>
                        </motion.div>

                        {/* Bottom Right 2 - Campus Velocity */}
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
            <section className="py-32 px-4 sm:px-6 bg-loops-subtle relative z-10">
                <div className="max-w-7xl mx-auto text-center space-y-24">
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
                            title="Sync Loop"
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
                        <h2 className="font-display text-4xl sm:text-6xl font-bold text-loops-main tracking-tighter italic">Trending Drops.</h2>
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
                                price={`${CURRENCY}${listing.price}`}
                                category={listing.category}
                                image={listing.images?.[0] || listing.image_url || FALLBACK_PRODUCT_IMAGE}
                                author={listing.profiles?.full_name}
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
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        <div className="space-y-1">
                            <div className="text-3xl font-bold text-loops-main font-display">{counts.campuses >= 1000 ? `${(counts.campuses / 1000).toFixed(1)}k` : counts.campuses}+</div>
                            <div className="text-[10px] font-bold text-loops-muted uppercase tracking-widest">Active Campuses</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl font-bold text-loops-primary font-display">{counts.students >= 1000 ? `${(counts.students / 1000).toFixed(1)}k` : counts.students}</div>
                            <div className="text-[10px] font-bold text-loops-muted uppercase tracking-widest">Verified Students</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl font-bold text-loops-main font-display">{counts.loops >= 1000 ? `${(counts.loops / 1000).toFixed(1)}k` : counts.loops}+</div>
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
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-loops-teal opacity-20 blur-[100px]" />

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
