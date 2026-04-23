'use client';

const HEADLINES = ["Join", "Trust", "Enter"];

import { Button } from "../../components/ui/button";
import { Navbar } from "../../components/layout/navbar";
import { ProductCard } from "../../components/ui/product-card";
import { FeaturedHubs } from "../../components/ui/featured-hubs";
import { SkeletonCard } from "../../components/ui/skeleton-loader";
import { ArrowRight, Sparkles, ShieldCheck, Zap, MessageSquare } from "lucide-react";
import { Footer } from "../../components/layout/footer";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";
import { useCampus } from "../../context/campus-context";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FALLBACK_PRODUCT_IMAGE, CURRENCY } from "../../lib/constants";
import { cn } from "../../lib/utils";

export default function WelcomePage() {
    const [listings, setListings] = useState<any[]>([]);
    const [foundingPlugs, setFoundingPlugs] = useState<any[]>([]);
    const [counts, setCounts] = useState({ campuses: 0, students: 0, loops: 0 });
    const [headlineIndex, setHeadlineIndex] = useState(0);

    const supabase = createClient();
    const router = useRouter();
    const { campus, getTerm } = useCampus();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { count: campusCount } = await supabase.from('campuses').select('*', { count: 'exact', head: true }).eq('is_active', true);
                const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                const { count: loopCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'completed');

                setCounts({
                    campuses: campusCount || 10,
                    students: studentCount || 500,
                    loops: loopCount || 50
                });

                const { data } = await supabase
                    .from('listings')
                    .select('*, profiles(full_name), reviews(rating), transactions(status)')
                    .eq('status', 'active')
                    .limit(8);

                if (data) setListings(data);

                const { data: plugs } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('is_founding_member', true)
                    .limit(6);
                if (plugs) setFoundingPlugs(plugs);
            } catch (error) {
                console.error("Error fetching welcome data:", error);
            }
        };

        fetchData();
    }, [supabase]);

    useEffect(() => {
        const interval = setInterval(() => {
            setHeadlineIndex((prev) => (prev + 1) % HEADLINES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-loops-bg">
            <Navbar />

            <section className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center pt-24 sm:pt-64 pb-12 px-4 sm:px-6 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-loops-primary/10 blur-[120px] rounded-full animate-float" />
                    <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-loops-secondary/5 blur-[100px] rounded-full animate-pulse" />
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
                        className="font-display text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-[-0.04em] leading-[0.85] sm:leading-[0.9] text-loops-main"
                    >
                        <div className="relative h-[1.1em] overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={HEADLINES[headlineIndex]}
                                    initial={{ y: 40, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -40, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "circOut" }}
                                    className="block"
                                >
                                    {HEADLINES[headlineIndex]}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-loops-primary to-loops-teal bg-[length:200%_auto] animate-gradient italic">
                            {getTerm('communityName') || 'the Loop'}.
                        </span>
                    </motion.h1>

                    <p className="text-base sm:text-lg md:text-xl text-loops-muted max-w-2xl mx-auto font-medium leading-relaxed opacity-80">
                        The economic nervous system of student life. Buy, sell, and offer skills safely within your verified university network.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                        <Link href="/login?view=signup">
                            <Button size="lg" className="h-16 px-10 text-lg font-bold bg-loops-primary text-white hover:bg-loops-primary/90 transition-all rounded-2xl group w-full sm:w-auto">
                                Join the Loop
                                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-bold border-loops-border bg-white text-loops-main rounded-2xl hover:bg-loops-subtle w-full sm:w-auto">
                                Browse Feed
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <FeaturedHubs />

            {foundingPlugs && foundingPlugs.length > 0 && (
                <section className="py-20 px-6 bg-white overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-10">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-bold font-display tracking-tight">Meet the Founding Plugs</h2>
                                <p className="text-sm text-loops-muted">Verified creators and sellers leading the {campus?.name || 'campus'} economy.</p>
                            </div>
                        </div>

                        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-10">
                            {foundingPlugs.map((plug) => (
                                <div key={plug.id} className="flex-shrink-0 w-64 p-6 rounded-[2rem] bg-loops-subtle border border-loops-border relative">
                                    <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg overflow-hidden relative mb-4">
                                        {plug.avatar_url ? (
                                            <Image src={plug.avatar_url} alt={plug.full_name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-loops-primary/10 flex items-center justify-center text-loops-primary font-bold text-xl">
                                                {plug.full_name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg truncate">{plug.full_name}</h3>
                                    <p className="text-xs text-loops-muted uppercase font-bold tracking-widest">{plug.store_name || 'Campus Merchant'}</p>
                                    <Link href={`/profile?u=${plug.id}`}>
                                        <Button variant="outline" className="w-full mt-4 rounded-xl text-[10px] font-bold uppercase tracking-widest h-10 border-loops-primary/20 text-loops-primary hover:bg-loops-primary/5">
                                            Visit Store
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Feature Bento Grid & Footer... */}
            <Footer />
        </div>
    );
}
