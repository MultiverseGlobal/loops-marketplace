'use client';

import { Navbar } from "../components/layout/navbar";
import { ProductCard } from "../components/ui/product-card";
import { Button } from "../components/ui/button";
import { CampusBuzz } from "../components/ui/campus-buzz";
import * as Icons from "lucide-react";
import { Sparkles, ArrowRight, Store, Rocket, ShieldCheck, Filter, LayoutGrid, Search } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "../lib/supabase/client";
import { SkeletonCard } from "../components/ui/skeleton-loader";
import { SearchBar } from "../components/ui/search-bar";
import { cn } from "../lib/utils";
import { useCampus } from "../context/campus-context";
import { CampusSelector } from "../components/ui/campus-selector";
import { PRODUCT_CATEGORIES, SERVICE_CATEGORIES, FALLBACK_PRODUCT_IMAGE, CURRENCY } from "../lib/constants";

export default function Home() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [activeType, setActiveType] = useState<'product' | 'service'>('product');
    const supabase = createClient();
    const { campus, loading: campusLoading } = useCampus();

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            const campusId = campus?.id;

            let query = supabase
                .from('listings')
                .select('*, profiles(full_name, store_name, store_banner_color, is_plug, avatar_url, store_logo_url)')
                .eq('status', 'active')
                .eq('type', activeType);

            if (campusId) {
                query = query.eq('campus_id', campusId);
            } else if (!campusLoading) {
                setListings([]);
                setLoading(false);
                return;
            }

            query = query
                .order('boosted_until', { ascending: false })
                .order('is_plug', { ascending: false, referencedTable: 'profiles' })
                .order('created_at', { ascending: false });

            if (searchQuery) {
                query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
            }

            if (selectedCategory && selectedCategory !== 'all') {
                query = query.eq('category', selectedCategory);
            }

            const { data, error } = await query;
            if (error) console.error(error);
            else setListings(data || []);
            setLoading(false);
        };

        fetchListings();
    }, [supabase, searchQuery, selectedCategory, activeType, campus, campusLoading]);

    // Sync URL params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const catParam = params.get('category');
        const typeParam = params.get('view') || params.get('type');
        if (catParam) setSelectedCategory(catParam);
        if (typeParam === 'product' || typeParam === 'service') setActiveType(typeParam as 'product' | 'service');
    }, []);

    return (
        <div className="min-h-screen bg-white text-loops-main">
            <Navbar />
            <CampusSelector />
            <CampusBuzz />

            {/* Mobile-First App Header */}
            <header className="pt-20 pb-2 px-4 sticky top-0 bg-white/80 backdrop-blur-xl z-40 border-b border-loops-border/40">
                <div className="max-w-7xl mx-auto space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-0 bg-loops-primary/5 blur-lg rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            <div className="relative flex items-center bg-loops-subtle/50 border border-loops-border rounded-xl px-3 h-10 transition-all group-focus-within:bg-white group-focus-within:border-loops-primary/50">
                                <Search className="w-3.5 h-3.5 text-loops-muted" />
                                <input 
                                    type="text" 
                                    placeholder="Search the Loop..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none px-2 text-[11px] font-bold text-loops-main placeholder:text-loops-muted/40"
                                />
                            </div>
                        </div>

                        <div className="flex p-0.5 bg-loops-subtle rounded-lg border border-loops-border">
                            <button
                                onClick={() => setActiveType('product')}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                                    activeType === 'product' ? "bg-white text-loops-primary shadow-sm" : "text-loops-muted"
                                )}
                            >
                                Shop
                            </button>
                            <button
                                onClick={() => setActiveType('service')}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                                    activeType === 'service' ? "bg-white text-loops-primary shadow-sm" : "text-loops-muted"
                                )}
                            >
                                Pro
                            </button>
                        </div>
                    </div>

                    {/* Category Scroller */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        {(activeType === 'product' ? PRODUCT_CATEGORIES : SERVICE_CATEGORIES).map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id === selectedCategory ? 'all' : cat.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap text-[9px] font-black uppercase tracking-widest",
                                    selectedCategory === cat.id
                                        ? "bg-loops-primary text-white border-loops-primary shadow-md shadow-loops-primary/10"
                                        : "bg-white border-loops-border text-loops-muted hover:text-loops-main"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Real-Time Pulse Feed */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-loops-primary animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-loops-main italic">Live Feed</span>
                    </div>
                    <span className="text-[9px] font-bold text-loops-muted uppercase tracking-widest opacity-40">
                        {campus?.name || 'Local'} Loop
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : listings.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
                        {listings.map((listing) => (
                            <ProductCard
                                key={listing.id}
                                id={listing.id}
                                title={listing.title}
                                price={`${CURRENCY}${listing.price}`}
                                category={listing.category}
                                image={listing.images?.[0] || listing.image_url || FALLBACK_PRODUCT_IMAGE}
                                author={listing.profiles}
                                boosted_until={listing.boosted_until}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center space-y-6">
                        <div className="w-16 h-16 bg-loops-subtle rounded-3xl flex items-center justify-center mx-auto text-loops-muted/40">
                            <LayoutGrid className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black italic tracking-tighter text-loops-main">No drops yet.</h3>
                            <p className="text-[9px] font-bold text-loops-muted uppercase tracking-widest opacity-60">Be the first to drop.</p>
                        </div>
                    </div>
                )}
                
                {/* Bottom Padding for PWA bar */}
                <div className="h-24" />
            </main>
        </div>
    );
}
