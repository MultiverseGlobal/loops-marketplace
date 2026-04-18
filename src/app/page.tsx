'use client';

import { Navbar } from "../components/layout/navbar";
import { PulseFeed } from "../components/ui/pulse-feed";
import { Footer } from "../components/layout/footer";
import { useCampus } from "../context/campus-context";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../components/ui/button";

export default function Home() {
    const { campus } = useCampus();

    return (
        <div className="bg-loops-bg min-h-screen">
            <Navbar />
            
            {/* Minimal Header for the Feed */}
            <header className="pt-24 md:pt-32 pb-6 px-6 relative overflow-hidden">
                <div className="max-w-xl mx-auto text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-loops-primary/10 text-loops-primary text-[10px] font-black uppercase tracking-[0.2em] border border-loops-primary/20"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Live on {campus?.name || 'the Loop'}
                    </motion.div>
                    
                    <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tighter text-loops-main italic leading-tight">
                        Discovery Hub.
                    </h1>
                </div>
            </header>

            <main>
                <PulseFeed campusId={campus?.id} />
            </main>

            {/* Sticky Floating CTA for Guests (Secondary reinforcement) */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md hidden sm:block">
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="bg-loops-main text-white p-4 rounded-[1.5rem] shadow-2xl flex items-center justify-between gap-4 border border-white/10 backdrop-blur-xl"
                >
                    <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-loops-primary">New to Loops?</p>
                        <p className="text-xs font-medium opacity-80">Join the student economy today.</p>
                    </div>
                    <Link href="/login?view=signup">
                        <Button size="sm" className="bg-loops-primary text-white font-bold rounded-xl h-10 px-6">
                            Join Now
                        </Button>
                    </Link>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
}
