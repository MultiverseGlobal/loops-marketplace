'use client';

import { Navbar } from "../components/layout/navbar";
import { PulseFeed } from "../components/ui/pulse-feed";
import { Footer } from "../components/layout/footer";
import { CampusSelector } from "../components/ui/campus-selector";
import { FeaturedHubs } from "../components/ui/featured-hubs";
import { Button } from "../components/ui/button";
import { useCampus } from "../context/campus-context";
import { useRouter } from "next/navigation";
import { Sparkles, Search, ShoppingBag, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
    const { campus, loading } = useCampus();
    const router = useRouter();

    if (loading) return null;


    return (
        <div className="bg-loops-bg min-h-screen">
            <Navbar />
            
            <main className="pt-20 md:pt-36 pb-24">
                {/* Compact Hybrid Hero Section */}
                <section className="max-w-7xl mx-auto px-4 md:px-6 mb-8">
                    <div className="relative min-h-[300px] md:h-[350px] rounded-[2.5rem] overflow-hidden bg-loops-main flex flex-col justify-center border border-white/5 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-loops-main via-loops-main/40 to-transparent z-10" />
                        <Image 
                            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
                            alt="Campus Life" 
                            fill 
                            priority
                            className="object-cover opacity-30 scale-105"
                        />
                        
                        <div className="relative z-20 p-8 md:p-12 flex flex-col justify-center max-w-3xl space-y-4">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="w-fit flex items-center gap-2 px-3 py-1 rounded-full bg-loops-primary/20 text-loops-primary border border-loops-primary/20 backdrop-blur-md text-[9px] font-black uppercase tracking-[0.2em]"
                            >
                                <Sparkles className="w-3 h-3" />
                                <span>Founding Plug Season</span>
                            </motion.div>
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-[0.85] tracking-tighter"
                            >
                                Enter the <span className="text-loops-primary italic">Loop.</span>
                            </motion.h1>
                            <p className="text-white/60 text-sm font-bold uppercase tracking-widest max-w-md leading-relaxed">
                                The economic nervous system of Nigerian student life.
                            </p>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex gap-4 pt-2"
                            >
                                <Link href="/browse">
                                    <Button className="h-12 px-6 bg-loops-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-loops-primary/20 hover:scale-105 active:scale-95 transition-all">
                                        Shop All <ArrowRight className="w-3 h-3 ml-2" />
                                    </Button>
                                </Link>
                                <Link href="/listings/create">
                                    <Button variant="outline" className="h-12 px-6 border-white/20 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/10 backdrop-blur-md transition-all active:scale-95">
                                        Sell
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Quick Category Bar (Hybrid Element) */}
                <section className="max-w-7xl mx-auto px-4 md:px-6 mb-12">
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                        {["all", "electronics", "fashion", "books", "others"].map((cat) => (
                            <Link key={cat} href={`/browse?category=${cat}`}>
                                <Button variant="ghost" className="h-10 px-6 rounded-xl border border-loops-border bg-white text-[10px] font-black uppercase tracking-widest text-loops-main hover:border-loops-primary hover:text-loops-primary whitespace-nowrap transition-all">
                                    {cat}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Main Hybrid Feed Section */}
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 px-2">
                        <div className="space-y-1">
                            <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-loops-main leading-none uppercase italic">Campus Feed<span className="text-loops-primary">.</span></h2>
                            <p className="text-[10px] font-bold text-loops-muted uppercase tracking-widest">Real-time marketplace pulse in {campus?.name || 'the Loop'}</p>
                        </div>
                        <Link href="/browse">
                            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-loops-primary hover:bg-loops-primary/5">
                                View Full Archive <ArrowRight className="w-3 h-3 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    {/* Continuous Pulse Feed */}
                    <PulseFeed campusId={campus?.id} />
                </div>
            </main>

            <Footer />
        </div>
    );
}
