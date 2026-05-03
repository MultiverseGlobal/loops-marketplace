'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { School, MapPin, Sparkles, ArrowRight, Zap, Globe, ShieldCheck, X, Search, Infinity } from "lucide-react";
import { Button } from "./button";
import { useCampus } from "@/context/campus-context";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";


export function CampusSelector() {
    const [campuses, setCampuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const { selectCampus, campus: activeCampus } = useCampus();
    const supabase = createClient();
    const pathname = usePathname();

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
        
        // Show by default if no campus selected and not on excluded routes
        const isExcluded = pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/onboarding') || pathname.startsWith('/welcome');
        
        if (!activeCampus && !isExcluded) {
            const hasSeen = localStorage.getItem('loops_dismissed_selector');
            if (!hasSeen) {
                setIsOpen(true);
            }
        }
    }, [supabase, activeCampus, pathname]);


    const handleDismiss = () => {
        setIsOpen(false);
        localStorage.setItem('loops_dismissed_selector', 'true');
    };

    const handleSelect = (id: string) => {
        selectCampus(id);
        setIsOpen(false);
    };

    const filteredCampuses = campuses.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isExcluded = pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/onboarding') || pathname.startsWith('/welcome');
    if (isExcluded) return null;
    if (activeCampus && !isOpen) return null;


    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    {/* Background Overlay */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleDismiss}
                        className="absolute inset-0 bg-loops-main/60 backdrop-blur-xl"
                    />

                    {/* Gradient Orbs */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-loops-primary/20 rounded-full blur-[120px] animate-[pulse-subtle_10s_ease-in-out_infinite]" />
                        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-loops-energetic/10 rounded-full blur-[100px] animate-[pulse-subtle_15s_ease-in-out_infinite_reverse]" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-4xl h-[80vh] md:h-[75vh] bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-loops-border flex flex-col overflow-hidden mx-4"
                    >
                        {/* Header Section */}
                        <div className="p-6 md:p-10 space-y-4 bg-gradient-to-b from-loops-subtle/50 to-white border-b border-loops-border">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-loops-border shadow-sm">
                                    <Infinity className="w-6 h-6 text-loops-primary" />
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={handleDismiss}
                                    className="rounded-full w-10 h-10 hover:bg-loops-subtle text-loops-muted"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="space-y-2">
                                    <h1 className="text-3xl md:text-5xl font-black font-display tracking-tighter text-loops-main italic leading-none">
                                        Choose Your <span className="text-loops-primary">Loop.</span>
                                    </h1>
                                    <p className="text-[10px] md:text-xs font-bold text-loops-muted uppercase tracking-widest opacity-60">Select your university node to enter</p>
                                </div>

                                <div className="relative group flex-1 md:max-w-xs">
                                    <div className="absolute inset-0 bg-loops-primary/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                    <div className="relative flex items-center bg-white border border-loops-border rounded-xl md:rounded-2xl px-4 h-12 md:h-14 shadow-sm group-focus-within:border-loops-primary/50 group-focus-within:shadow-lg transition-all duration-500">
                                        <Search className="w-4 h-4 text-loops-muted group-focus-within:text-loops-primary transition-colors" />
                                        <input 
                                            type="text"
                                            placeholder="Search university..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="flex-1 bg-transparent border-none outline-none px-3 text-xs font-bold text-loops-main placeholder:text-loops-muted/40"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scrolling Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                                {loading ? (
                                    [...Array(6)].map((_, i) => (
                                        <div key={i} className="h-40 bg-loops-subtle rounded-[2rem] animate-pulse border border-loops-border" />
                                    ))
                                ) : filteredCampuses.length > 0 ? (
                                    filteredCampuses.map((c, idx) => (
                                        <motion.button
                                            key={c.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            onClick={() => handleSelect(c.id)}
                                            className="group relative flex flex-col p-6 rounded-[2rem] bg-white border border-loops-border hover:border-loops-primary hover:shadow-xl hover:shadow-loops-primary/5 transition-all text-left"
                                        >
                                            <div className="flex items-start gap-4 mb-6">
                                                <div className="w-12 h-12 rounded-xl bg-loops-subtle flex items-center justify-center text-loops-primary group-hover:bg-loops-primary group-hover:text-white transition-all duration-500 overflow-hidden">
                                                    {c.slug === 'veritas' ? (
                                                        <img src="/logos/veritas.png" alt="" className="w-full h-full object-contain p-2" />
                                                    ) : c.slug === 'mouau' ? (
                                                        <img src="/logos/mouau.png" alt="" className="w-full h-full object-contain p-2" />
                                                    ) : c.slug === 'unilag' ? (
                                                        <img src="/logos/unilag.png" alt="" className="w-full h-full object-contain p-2" />
                                                    ) : c.slug === 'uniabuja' ? (
                                                        <img src="/logos/uniabuja.png" alt="" className="w-full h-full object-contain p-2" />
                                                    ) : c.slug === 'nile' ? (
                                                        <img src="/logos/nile.png" alt="" className="w-full h-full object-contain p-2" />
                                                    ) : (
                                                        <School className="w-6 h-6" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-display font-black text-lg text-loops-main leading-tight group-hover:text-loops-primary transition-colors">
                                                        {c.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-loops-muted uppercase tracking-widest mt-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {c.location || 'Nigeria'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex gap-2">
                                                    <div className="px-2 py-1 bg-loops-success/10 text-loops-success text-[8px] font-black uppercase rounded-lg border border-loops-success/10">
                                                        Active
                                                    </div>
                                                    <div className="px-2 py-1 bg-loops-primary/5 text-loops-primary text-[8px] font-black uppercase rounded-lg border border-loops-primary/10">
                                                        Verified
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full border border-loops-border flex items-center justify-center text-loops-muted group-hover:bg-loops-primary group-hover:text-white group-hover:border-loops-primary transition-all shadow-sm">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center space-y-4">
                                        <div className="w-16 h-16 bg-loops-subtle rounded-full flex items-center justify-center mx-auto text-loops-muted opacity-40">
                                            <Search className="w-8 h-8" />
                                        </div>
                                        <p className="text-loops-muted font-bold tracking-tight">" {searchTerm} " hasn't joined the Loop yet.</p>
                                        <Button variant="outline" className="rounded-xl border-dashed border-loops-primary/40 text-loops-primary font-bold">
                                            Nominate University
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

