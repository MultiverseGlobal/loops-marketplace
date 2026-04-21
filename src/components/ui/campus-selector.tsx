'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { School, MapPin, Sparkles, ArrowRight, Zap, Globe, ShieldCheck } from "lucide-react";
import { Button } from "./button";
import { useCampus } from "@/context/campus-context";
import { cn } from "@/lib/utils";

export function CampusSelector() {
    const [campuses, setCampuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const { selectCampus, campus: activeCampus } = useCampus();
    const supabase = createClient();

    useEffect(() => {
        const fetchCampuses = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('campuses')
                .select('*')
                .order('name');
            setCampuses(data || []);
            setLoading(false);
        };

        fetchCampuses();
    }, [supabase]);

    if (activeCampus) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-loops-bg overflow-y-auto">
            {/* Background Decoration */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-loops-primary/10 rounded-full blur-[120px] animate-[pulse-subtle_10s_ease-in-out_infinite]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-loops-energetic/5 rounded-full blur-[100px] animate-[pulse-subtle_15s_ease-in-out_infinite_reverse]" />
            </div>

            <div className="max-w-4xl w-full py-12 md:py-20 space-y-12">
                <header className="text-center space-y-4 max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-loops-primary/10 text-loops-primary text-[10px] font-black uppercase tracking-[0.3em] border border-loops-primary/20"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Expansion in Progress
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black font-display tracking-tighter text-loops-main italic leading-[0.9]"
                    >
                        Choose Your <span className="text-loops-primary">Loop.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-loops-muted font-medium max-w-md mx-auto"
                    >
                        Select your university nodes to access the real-time student economy on your campus.
                    </motion.p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-12">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="h-48 bg-white border border-loops-border rounded-[2.5rem] animate-pulse" />
                        ))
                    ) : campuses.map((c, idx) => (
                        <motion.button
                            key={c.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 + 0.3 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onMouseEnter={() => setHoveredId(c.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => selectCampus(c.id)}
                            className="group relative flex flex-col items-start p-8 bg-white border border-loops-border rounded-[2.5rem] text-left transition-all hover:border-loops-primary hover:shadow-2xl hover:shadow-loops-primary/10"
                        >
                            <div className="absolute top-6 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="w-6 h-6 text-loops-primary" />
                            </div>

                            <div className="flex items-start gap-4 h-full w-full">
                                <div className="w-16 h-16 rounded-3xl bg-loops-subtle flex items-center justify-center text-loops-primary group-hover:bg-loops-primary group-hover:text-white transition-all duration-500">
                                    <School className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black font-display tracking-tight text-loops-main">
                                        {c.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-loops-muted text-xs font-bold uppercase tracking-widest opacity-60">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {c.location || 'Active Node'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center gap-3">
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-loops-success/10 text-loops-success text-[10px] font-black uppercase tracking-widest">
                                    <Zap className="w-3 h-3" />
                                    Live Now
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-loops-primary/5 text-loops-primary text-[10px] font-black uppercase tracking-widest">
                                    <ShieldCheck className="w-3 h-3" />
                                    Verified
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                <footer className="text-center space-y-6 pt-12 border-t border-loops-border">
                    <p className="text-sm font-bold text-loops-muted uppercase tracking-[0.2em] opacity-40">
                        Can't find your university?
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button variant="ghost" className="rounded-2xl h-14 px-8 border border-loops-border bg-white font-bold text-loops-main hover:bg-loops-subtle">
                            Request Node Launch <Globe className="w-4 h-4 ml-2" />
                        </Button>
                        <Button className="rounded-2xl h-14 px-10 bg-loops-main text-white font-bold shadow-xl">
                            Join General Waitlist
                        </Button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
