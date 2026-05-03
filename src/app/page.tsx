'use client';

import { Navbar } from "../components/layout/navbar";
import { ProductCard } from "../components/ui/product-card";
import { Button } from "../components/ui/button";
import { CampusBuzz } from "../components/ui/campus-buzz";
import { Sparkles, LayoutGrid, Search } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "../lib/supabase/client";
import { SkeletonCard } from "../components/ui/skeleton-loader";
import { cn } from "../lib/utils";
import { useCampus } from "../context/campus-context";
import { CampusSelector } from "../components/ui/campus-selector";
import { PRODUCT_CATEGORIES, SERVICE_CATEGORIES, FALLBACK_PRODUCT_IMAGE, CURRENCY } from "../lib/constants";
import { BottomNav } from "../components/layout/bottom-nav";

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
        const syncParams = () => {
            const params = new URLSearchParams(window.location.search);
            const catParam = params.get('category');
            const typeParam = params.get('view') || params.get('type');
            const qParam = params.get('q');
            
            if (catParam) setSelectedCategory(catParam);
            if (typeParam === 'product' || typeParam === 'service') setActiveType(typeParam as 'product' | 'service');
            if (qParam) setSearchQuery(qParam);
        };

        syncParams();
        window.addEventListener('popstate', syncParams);
        return () => window.removeEventListener('popstate', syncParams);
    }, []);

    return (
        <div className="min-h-screen bg-white text-loops-main">
            <Navbar />
            <CampusSelector />
            <CampusBuzz />

            {/* Adjusted pt to match the ultra-slim navbar */}
            <main className="max-w-7xl mx-auto px-4 pt-[74px] pb-24">
                {/* Integrated Category Scroller */}
                <div className="py-2.5 border-b border-loops-border/50 -mx-4 px-4 mb-6">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {(activeType === 'product' ? PRODUCT_CATEGORIES : SERVICE_CATEGORIES).map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id === selectedCategory ? 'all' : cat.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap text-[10px] font-black uppercase tracking-widest",
                                    selectedCategory === cat.id
                                        ? "bg-loops-primary text-white border-loops-primary shadow-lg shadow-loops-primary/10"
                                        : "bg-loops-subtle/50 border-loops-border text-loops-muted hover:text-loops-main"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
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
            </main>

            <BottomNav />
        </div>
    );
}
