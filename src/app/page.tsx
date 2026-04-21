'use client';

import { Navbar } from "../components/layout/navbar";
import { PulseFeed } from "../components/ui/pulse-feed";
import { Footer } from "../components/layout/footer";
import { CampusSelector } from "../components/ui/campus-selector";
import { useCampus } from "../context/campus-context";
import { motion } from "framer-motion";

export default function Home() {
    const { campus, loading } = useCampus();
    const router = useRouter();

    if (loading) return (
        <div className="min-h-screen bg-loops-bg flex items-center justify-center">
            <div className="text-loops-primary font-black italic animate-[pulse-subtle_2s_ease-in-out_infinite]">
                BOOTING THE FEED...
            </div>
        </div>
    );

    return (
        <div className="bg-loops-bg min-h-screen">
            <Navbar />
            <CampusSelector />
            
            {/* Header for The Feed */}
            <header className="pt-24 md:pt-32 pb-10 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4 max-w-xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-loops-primary/10 text-loops-primary text-[10px] font-black uppercase tracking-[0.2em] border border-loops-primary/20"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            {campus?.name || 'The Loop'} Pulse
                        </motion.div>
                        
                        <h1 className="font-display text-6xl sm:text-8xl font-black tracking-tighter text-loops-primary italic leading-[0.8]">
                            The Feed<span className="text-loops-main">.</span>
                        </h1>
                        
                        <p className="text-lg text-loops-muted font-medium leading-relaxed max-w-md">
                            Real-time student economy across <span className="text-loops-main font-bold">the Loop</span>. Connect, trade, and scale.
                        </p>
                    </div>

                    {/* Integrated Search Bar */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-md relative group"
                    >
                        <div className="absolute inset-0 bg-loops-primary/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center bg-white border border-loops-border rounded-[2rem] px-6 h-16 shadow-sm group-hover:shadow-xl group-hover:border-loops-primary/50 transition-all duration-500">
                            <Search className="w-5 h-5 text-loops-muted group-hover:text-loops-primary transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search the Loop..."
                                className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-medium text-loops-main placeholder:text-loops-muted/60"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        router.push(`/browse?q=${(e.target as HTMLInputElement).value}`);
                                    }
                                }}
                            />
                            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-loops-subtle rounded-lg border border-loops-border">
                                <span className="text-[10px] font-bold text-loops-muted">⌘</span>
                                <span className="text-[10px] font-bold text-loops-muted">K</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            <main className="pb-24">
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
