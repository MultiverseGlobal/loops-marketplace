'use client';

import { Navbar } from "../components/layout/navbar";
import { ProductCard } from "../components/ui/product-card";
import { Button } from "../components/ui/button";
import { CampusBuzz } from "../components/ui/campus-buzz";
import * as Icons from "lucide-react";
import { Sparkles, ArrowRight, Store, Rocket, ShieldCheck } from "lucide-react";
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
import { Footer } from "../components/layout/footer";
import { InfinityLogo } from "../components/ui/infinity-logo";

export default function Home() {
    const [listings, setListings] = useState<any[]>([]);
    const [trendingListings, setTrendingListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("newest");
    const [activeType, setActiveType] = useState<'product' | 'service'>('product');
    const supabase = createClient();
    const { campus, loading: campusLoading, getTerm } = useCampus();

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            const campusId = campus?.id;

            let query = supabase
                .from('listings')
                .select('*, profiles(full_name, store_name, store_banner_color, is_plug)')
                .eq('status', 'active')
                .eq('type', activeType);

            if (campusId) {
                query = query.eq('campus_id', campusId);
            } else if (!campusLoading) {
                setListings([]);
                setLoading(false);
                return;
            }

            if (sortBy === 'newest') {
                query = query
                    .order('boosted_until', { ascending: false })
                    .order('is_plug', { ascending: false, referencedTable: 'profiles' })
                    .order('created_at', { ascending: false });
            } else if (sortBy === 'oldest') {
                query = query.order('created_at', { ascending: true });
            } else if (sortBy === 'price_low') {
                query = query.order('price', { ascending: true });
            } else if (sortBy === 'price_high') {
                query = query.order('price', { ascending: false });
            }

            if (searchQuery) {
                query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
            }

            if (selectedCategory && selectedCategory !== 'all') {
                query = query.eq('category', selectedCategory);
            }

            if (minPrice && !isNaN(parseFloat(minPrice))) {
                query = query.gte('price', parseFloat(minPrice));
            }

            if (maxPrice && !isNaN(parseFloat(maxPrice))) {
                query = query.lte('price', parseFloat(maxPrice));
            }

            const { data, error } = await query;

            if (error) {
                console.error("Marketplace Fetch Error:", error);
                setListings([]);
            } else {
                setListings(data || []);
                if (data && data.length === 0) {
                    const { data: trending } = await supabase
                        .from('listings')
                        .select('*, campuses(name)')
                        .eq('status', 'active')
                        .limit(8)
                        .order('created_at', { ascending: false });
                    setTrendingListings(trending || []);
                } else {
                    setTrendingListings([]);
                }
            }
            setLoading(false);
        };

        fetchListings();
    }, [supabase, searchQuery, selectedCategory, sortBy, activeType, minPrice, maxPrice, campus, campusLoading]);

    // Sync state with URL params on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const catParam = params.get('category');
        const typeParam = params.get('view') || params.get('type');
        const qParam = params.get('q');

        if (catParam) setSelectedCategory(catParam);
        if (typeParam === 'product' || typeParam === 'service') setActiveType(typeParam as 'product' | 'service');
        if (qParam) setSearchQuery(qParam);
    }, []);

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />
            <CampusSelector />
            <CampusBuzz />

            {/* Pulse Header Section */}
            <header className="relative pt-24 sm:pt-32 md:pt-48 pb-8 md:pb-16 px-6 overflow-hidden">
                {/* Mesh Gradient Background */}
                <div className="absolute inset-0 -z-10 bg-white">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-loops-primary/10 rounded-full blur-[120px] animate-[pulse-subtle_8s_ease-in-out_infinite]" />
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-loops-energetic/5 rounded-full blur-[100px] animate-[pulse-subtle_12s_ease-in-out_infinite_reverse]" />
                </div>

                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12">
                        <div className="space-y-4 max-w-2xl text-center md:text-left">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-loops-primary/10 text-loops-primary text-[10px] font-bold uppercase tracking-[0.2em] border border-loops-primary/20 backdrop-blur-md mx-auto md:mx-0"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-loops-accent sm:animate-pulse" />
                                <span className="opacity-80">The Campus Pulse</span>
                                <div className="w-1 h-1 bg-loops-primary rounded-full animate-ping" />
                            </motion.div>
                            
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-loops-main leading-[0.9]"
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-br from-loops-main via-loops-primary to-loops-secondary italic">
                                    {getTerm('marketplaceName') || 'Loops Marketplace'}
                                </span>
                                <span className="text-loops-primary/30">.</span>
                            </motion.h1>
                            
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-loops-muted text-sm md:text-lg font-medium max-w-md opacity-70 leading-relaxed mx-auto md:mx-0"
                            >
                                Real-time student economy across <span className="text-loops-main font-bold">{campus?.name || 'the Loop'}</span>. Connect, trade, and scale.
                            </motion.p>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="w-full md:max-w-md"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-loops-primary/20 to-loops-accent/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500" />
                                <SearchBar
                                    onSearch={setSearchQuery}
                                    placeholder={`Search in ${campus?.name || 'the Loop'}...`}
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-6 md:py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-12 border-b border-loops-border/50">
                    {/* Main Type Toggle */}
                    <div className="flex p-1 bg-loops-subtle border border-loops-border rounded-2xl w-fit">
                        <button
                            onClick={() => { setActiveType('product'); setSelectedCategory('all'); }}
                            className={cn(
                                "px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                                activeType === 'product'
                                    ? "bg-white text-loops-primary shadow-sm ring-1 ring-loops-border"
                                    : "text-loops-muted hover:text-loops-main"
                            )}
                        >
                            Products
                        </button>
                        <button
                            onClick={() => { setActiveType('service'); setSelectedCategory('all'); }}
                            className={cn(
                                "px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                                activeType === 'service'
                                    ? "bg-white text-loops-primary shadow-sm ring-1 ring-loops-border"
                                    : "text-loops-muted hover:text-loops-main"
                            )}
                        >
                            Services
                        </button>
                    </div>

                    {/* Sorting & Price Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-white border border-loops-border rounded-xl px-3 py-1.5 shadow-sm">
                            <span className="text-[10px] font-bold text-loops-muted uppercase tracking-widest opacity-60">{CURRENCY}</span>
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-16 bg-transparent text-xs font-bold focus:outline-none"
                            />
                            <div className="w-px h-3 bg-loops-border mx-1" />
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-16 bg-transparent text-xs font-bold focus:outline-none"
                            />
                        </div>

                        <div className="h-8 w-px bg-loops-border hidden sm:block" />

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-loops-muted uppercase tracking-widest opacity-60">Sort</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-white border border-loops-border rounded-xl px-3 py-1.5 text-xs font-bold text-loops-main focus:outline-none focus:ring-2 focus:ring-loops-primary/10 transition-all cursor-pointer shadow-sm"
                            >
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                                <option value="price_low">Price ↑</option>
                                <option value="price_high">Price ↓</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Category Quick-Bar */}
                <div className="flex items-center gap-4 py-8 overflow-x-auto no-scrollbar scroll-smooth">
                    {(activeType === 'product' ? PRODUCT_CATEGORIES : SERVICE_CATEGORIES).map((cat) => {
                        const Icon = (Icons as any)[cat.icon] || Icons.HelpCircle;
                        const isActive = (selectedCategory === cat.id) || (cat.id === 'all' && !selectedCategory);

                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id === selectedCategory ? 'all' : cat.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border whitespace-nowrap",
                                    isActive 
                                        ? "bg-loops-primary text-white border-loops-primary shadow-lg shadow-loops-primary/20" 
                                        : "bg-white border-loops-border text-loops-muted hover:border-loops-primary/30 hover:text-loops-main"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{cat.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Main Feed Grid */}
                <div className="py-2">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-x-6 md:gap-y-10">
                            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : listings.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-x-6 md:gap-y-8">
                            {listings.map((listing) => (
                                <div key={listing.id} className="col-span-1">
                                    <ProductCard
                                        id={listing.id}
                                        title={listing.title}
                                        price={`${CURRENCY}${listing.price}`}
                                        category={listing.category}
                                        image={listing.images?.[0] || listing.image_url || FALLBACK_PRODUCT_IMAGE}
                                        author={listing.profiles}
                                        boosted_until={listing.boosted_until}
                                        featured={false}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white border-2 border-dashed border-loops-border rounded-[3rem] px-8 relative overflow-hidden group">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-loops-primary/5 rounded-full blur-3xl -mt-32 transition-all group-hover:bg-loops-primary/10" />
                            <div className="relative z-10 space-y-6">
                                <div className="w-20 h-20 bg-loops-primary/5 rounded-3xl flex items-center justify-center mx-auto text-loops-primary/20 group-hover:scale-110 transition-all duration-500">
                                    <Icons.Inbox className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold italic tracking-tighter text-loops-main">No {activeType}s found here.</h3>
                                    <p className="text-loops-muted text-xs max-w-xs mx-auto leading-relaxed">
                                        Be the first to drop a {activeType} at <span className="text-loops-primary font-bold">{campus?.name || 'this campus'}</span>.
                                    </p>
                                </div>
                                <Link href="/listings/create">
                                    <Button className="h-14 px-8 bg-loops-primary text-white font-bold rounded-2xl shadow-xl shadow-loops-primary/20 hover:scale-105 transition-all text-sm">
                                        Post a Drop
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Founding Plug Campaign Section (The section I added previously) */}
                <section className="mt-32 mb-16">
                    <div className="relative rounded-[3rem] overflow-hidden bg-loops-main p-8 md:p-16 border border-white/5 shadow-2xl group">
                        <div className="absolute inset-0 bg-gradient-to-br from-loops-primary/20 via-transparent to-loops-energetic/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        
                        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-loops-primary/20 text-loops-primary border border-loops-primary/20 backdrop-blur-md text-[9px] font-black uppercase tracking-[0.25em]">
                                    <Sparkles className="w-3 h-3" />
                                    Limited Opportunity
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter leading-none">
                                    Become a <br />
                                    <span className="text-loops-primary">Founding Plug.</span>
                                </h2>
                                <p className="text-white/60 text-base font-medium max-w-sm leading-relaxed">
                                    Be one of the first 50 verified vendors on your campus. Get exclusive badges, priority listings, and 0% commission.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Link href="/campaign">
                                        <Button className="h-14 px-8 bg-loops-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-loops-primary/20 hover:scale-105 active:scale-95 transition-all">
                                            Learn More <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                    <Link href="/founding-plugs">
                                        <Button variant="outline" className="h-14 px-8 border-white/20 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-white/10 backdrop-blur-md transition-all active:scale-95">
                                            Apply Now
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="relative hidden md:block">
                                <div className="absolute -inset-10 bg-loops-primary/10 blur-[100px] rounded-full animate-pulse" />
                                <div className="relative grid grid-cols-2 gap-4">
                                    <div className="space-y-4 pt-12">
                                        <div className="p-6 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
                                            <Store className="w-8 h-8 text-loops-primary mb-4" />
                                            <div className="text-[8px] font-black uppercase tracking-widest text-loops-primary">Step 01</div>
                                            <div className="text-sm font-bold text-white mt-1">Claim Shop Name</div>
                                        </div>
                                        <div className="p-6 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl rotate-[3deg] hover:rotate-0 transition-transform duration-500">
                                            <Rocket className="w-8 h-8 text-loops-energetic mb-4" />
                                            <div className="text-[8px] font-black uppercase tracking-widest text-loops-energetic">Step 02</div>
                                            <div className="text-sm font-bold text-white mt-1">Populate Loop</div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-6 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl rotate-[5deg] hover:rotate-0 transition-transform duration-500">
                                            <ShieldCheck className="w-8 h-8 text-loops-accent mb-4" />
                                            <div className="text-[8px] font-black uppercase tracking-widest text-loops-accent">Step 03</div>
                                            <div className="text-sm font-bold text-white mt-1">Get Verified</div>
                                        </div>
                                        <div className="aspect-square rounded-[2.5rem] bg-gradient-to-br from-loops-primary/40 to-loops-energetic/40 border border-white/10 backdrop-blur-xl flex items-center justify-center">
                                            <InfinityLogo className="w-16 h-16 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
