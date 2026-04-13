'use client';

import { Navbar } from "../../components/layout/navbar";
import { ProductCard } from "../../components/ui/product-card";
import { Button } from "../../components/ui/button";
import { VerificationBanner } from "../../components/ui/verification-banner";
import { CampusBuzz } from "../../components/ui/campus-buzz";
import * as Icons from "lucide-react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";
import { SkeletonCard } from "../../components/ui/skeleton-loader";
import { SearchBar } from "../../components/ui/search-bar";
import { cn } from "../../lib/utils";
import { useCampus } from "../../context/campus-context";
import { PRODUCT_CATEGORIES, SERVICE_CATEGORIES, FALLBACK_PRODUCT_IMAGE, CURRENCY } from "../../lib/constants";

export default function MarketplacePage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
    const [isVerified, setIsVerified] = useState(false);
    const [hasUser, setHasUser] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("newest");
    const [activeType, setActiveType] = useState<'product' | 'service'>('product');
    const supabase = createClient();
    const { campus, getTerm } = useCampus();


    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            let campusId = null;

            if (user) {
                setHasUser(true);
                setUserEmail(user.email);

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('campus_id, email_verified')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setIsVerified(!!profile.email_verified);
                    campusId = profile.campus_id;
                }
            }

            let query = supabase
                .from('listings')
                .select('*, profiles(full_name, store_name, store_banner_color, is_plug)')
                .eq('status', 'active')
                .eq('type', activeType);

            // Apply sorting
            if (sortBy === 'newest') {
                // Priority placement: Boosted items first, then Plugs, then newest
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

            // Apply filters
            if (campusId) {
                query = query.eq('campus_id', campusId);
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

            console.log("Feed Query Debug:", { campusId, activeType, sortBy });

            const { data, error } = await query;

            if (error) {
                console.error("Marketplace Fetch Error:", error);
                setListings([]);
            } else {
                console.log("Feed Data Success:", data?.length, "items found.");
                setListings(data || []);
            }

            setLoading(false);
        };

        // Debounce effect is handled by SearchBar, but we need to re-fetch when state changes
        fetchListings();
    }, [supabase, searchQuery, selectedCategory, sortBy, activeType, minPrice, maxPrice]);

    // Check if user just verified their email or wants a specific view
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const viewParam = params.get('view');
        if (viewParam === 'product' || viewParam === 'service') {
            setActiveType(viewParam as 'product' | 'service');
        }

        if (params.get('verified') === 'true') {
            // Remove the parameter from URL
            window.history.replaceState({}, '', '/browse');
            // Force a data refresh
            window.location.reload();
        }
    }, []);

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />

            {hasUser && userEmail && (
                <div className="pt-4 md:pt-20">
                    <VerificationBanner email={userEmail} isVerified={isVerified} />
                </div>
            )}

            {/* Pulse Header Section */}
            <header className="relative pt-24 md:pt-36 pb-8 md:pb-16 px-6 overflow-hidden">
                {/* Mesh Gradient Background */}
                <div className="absolute inset-0 -z-10 bg-white">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-loops-primary/10 rounded-full blur-[120px] animate-[pulse-subtle_8s_ease-in-out_infinite]" />
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-loops-energetic/5 rounded-full blur-[100px] animate-[pulse-subtle_12s_ease-in-out_infinite_reverse]" />
                </div>

                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12">
                        <div className="space-y-4 max-w-2xl">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-loops-primary/10 text-loops-primary text-[10px] font-bold uppercase tracking-[0.2em] border border-loops-primary/20 backdrop-blur-md"
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
                                    {getTerm('marketplaceName')}
                                </span>
                                <span className="text-loops-primary/30">.</span>
                            </motion.h1>
                            
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-loops-muted text-sm md:text-lg font-medium max-w-md opacity-70 leading-relaxed"
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
                                    placeholder={`Search the Loop...`}
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Integrated CampusBuzz */}
                    <div className="mt-8 md:mt-12">
                        <div className="inline-block px-4 py-2 bg-white/40 backdrop-blur-md rounded-2xl border border-loops-border/50">
                            <CampusBuzz />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8">
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

                    {/* Category Quick Filter Chips */}
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-4 px-1">
                        {(activeType === 'product' ? PRODUCT_CATEGORIES : SERVICE_CATEGORIES).map((cat) => {
                            const Icon = (Icons as any)[cat.icon] || Icons.HelpCircle;
                            const isActive = (selectedCategory === cat.id) || (cat.id === 'all' && !selectedCategory);

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id === selectedCategory ? 'all' : cat.id)}
                                    className={cn(
                                        "group flex flex-col items-center gap-2 min-w-[70px] transition-all",
                                        isActive ? "scale-105" : "opacity-60 hover:opacity-100"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all border",
                                        isActive 
                                            ? "bg-loops-primary text-white border-loops-primary shadow-lg shadow-loops-primary/20" 
                                            : "bg-white border-loops-border hover:border-loops-primary/30"
                                    )}>
                                        <Icon className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <span className={cn(
                                        "text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-center",
                                        isActive ? "text-loops-main" : "text-loops-muted"
                                    )}>
                                        {cat.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Sorting & Price Filters */}
                    <div className="flex flex-wrap items-center gap-3 ml-auto sm:ml-0">
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

                {/* Hybrid Grid (Masonry + Symmetric Blend) */}
                <div className="py-2">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-x-6 md:gap-y-10">
                            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : listings.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-x-6 md:gap-y-8">
                            {listings.map((listing) => (
                                <div 
                                    key={listing.id}
                                    className="col-span-1"
                                >
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
                        <div className="text-center py-32 bg-white border-2 border-dashed border-loops-border rounded-[3rem] px-8 relative overflow-hidden group">
                            {/* Abstract Background Decoration */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-loops-primary/5 rounded-full blur-3xl -mt-32 transition-all group-hover:bg-loops-primary/10" />
                            
                            <div className="relative z-10 space-y-6">
                                <div className="w-24 h-24 bg-loops-primary/5 rounded-[2rem] flex items-center justify-center mx-auto text-loops-primary/20 group-hover:text-loops-primary/40 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                    <Icons.Inbox className="w-12 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-bold font-display italic tracking-tighter text-loops-main">This Loop is quiet. Too quiet.</h3>
                                    <p className="text-loops-muted text-sm max-w-sm mx-auto leading-relaxed">
                                        Be the first student to drop a {getTerm('listingName')?.toLowerCase()} at <span className="text-loops-primary font-bold">{campus?.name || 'this campus'}</span> and claim your status as a Founding Plug. 🔌✨
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <Link href="/listings/create">
                                        <Button className="h-16 px-10 bg-loops-primary text-white font-bold rounded-2xl shadow-2xl shadow-loops-primary/20 hover:scale-105 active:scale-95 transition-all text-lg group">
                                            <Icons.PlusCircle className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-500" />
                                            {getTerm('listingAction')}
                                        </Button>
                                    </Link>
                                </div>
                                <div className="flex items-center justify-center gap-6 pt-8 opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                                    <Icons.ShoppingBag className="w-5 h-5 text-loops-primary" />
                                    <Icons.Zap className="w-5 h-5 text-loops-energetic" />
                                    <Icons.Sparkles className="w-5 h-5 text-loops-accent" />
                                    <Icons.ShieldCheck className="w-5 h-5 text-loops-success" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Seller CTA Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-loops-primary/5 to-loops-energetic/5 border border-loops-primary/10 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-loops-primary/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-loops-primary/20 transition-all" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-3 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-loops-border text-loops-primary text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                <Icons.Zap className="w-3 h-3" />
                                Join as Seller
                            </div>
                            <h3 className="font-display text-2xl md:text-3xl font-bold text-loops-main">Got something to sell or offer?</h3>
                            <p className="text-loops-muted text-sm md:text-base max-w-lg leading-relaxed">
                                Join as a <span className="font-bold text-loops-primary">Verified Plug</span> and get priority placement, a trust badge, and access to thousands of students.
                            </p>
                        </div>
                        <Link href="/founding-plugs">
                            <Button className="h-14 px-8 bg-loops-primary text-white font-bold shadow-xl shadow-loops-primary/20 hover:scale-105 transition-all whitespace-nowrap group">
                                Apply Now
                                <Icons.ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>


                {/* Cross-Visibility Link */}
                <div className="mt-20 pt-10 border-t border-loops-border text-center">
                    <p className="text-loops-muted text-xs font-bold uppercase tracking-widest mb-4 opacity-50">
                        Looking for {activeType === 'product' ? 'Campus Services' : 'Marketplace Items'}?
                    </p>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setActiveType(activeType === 'product' ? 'service' : 'product');
                            setSelectedCategory('all');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-loops-primary hover:bg-loops-primary/5 font-bold uppercase tracking-[0.2em] text-[10px]"
                    >
                        Switch to {activeType === 'product' ? 'Services Hub' : 'Product Marketplace'} <Icons.ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </Button>
                </div>
            </main>
        </div>
    );
}
