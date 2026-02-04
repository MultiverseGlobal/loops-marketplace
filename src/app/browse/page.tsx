'use client';

import { Navbar } from "../../components/layout/navbar";
import { ProductCard } from "../../components/ui/product-card";
import { Button } from "../../components/ui/button";
import { VerificationBanner } from "../../components/ui/verification-banner";
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
                // Priority placement: Plugs first, then newest
                query = query.order('is_plug_priority', { ascending: false, foreignTable: 'profiles' })
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

            const { data } = await query;

            if (data) setListings(data);
            setLoading(false);
        };

        // Debounce effect is handled by SearchBar, but we need to re-fetch when state changes
        fetchListings();
    }, [supabase, searchQuery, selectedCategory, sortBy, activeType]);

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

            {hasUser && (
                <div className="pt-20">
                    <VerificationBanner email={userEmail} isVerified={isVerified} />
                </div>
            )}

            {/* App Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-loops-border pt-20 md:pt-32 pb-4 md:pb-8 px-4 sm:px-6 relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
                    <div className="space-y-1 sm:space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-loops-primary/10 text-loops-primary text-[9px] md:text-[10px] font-bold uppercase tracking-widest border border-loops-primary/20">
                            <Sparkles className="w-3 h-3 text-loops-accent animate-[pulse-subtle_2s_ease-in-out_infinite]" /> Live Loop
                        </div>
                        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter text-loops-main">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-loops-primary to-loops-energetic italic">{getTerm('marketplaceName')}</span>.
                        </h1>
                        <p className="text-loops-muted text-[12px] md:text-sm font-medium max-w-sm opacity-80">
                            Real-time student economy across {campus?.name || 'the Loop'}.
                        </p>
                    </div>
                    <div className="flex-1 max-w-xl">
                        <SearchBar
                            onSearch={setSearchQuery}
                            placeholder={`Search ${getTerm('communityName')}...`}
                        />
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
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2">
                        {(activeType === 'product' ? PRODUCT_CATEGORIES : SERVICE_CATEGORIES).map((cat) => {
                            const Icon = (Icons as any)[cat.icon] || Icons.HelpCircle;
                            const isActive = (selectedCategory === cat.id) || (cat.id === 'all' && !selectedCategory);

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id === selectedCategory ? 'all' : cat.id)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] border transition-all whitespace-nowrap flex items-center gap-2",
                                        isActive
                                            ? "bg-loops-main text-white border-loops-main shadow-lg"
                                            : "bg-white text-loops-muted border-loops-border hover:border-loops-primary"
                                    )}
                                    style={isActive ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                                >
                                    <Icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "opacity-50")} style={!isActive ? { color: cat.color } : {}} />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Sorting Dropdown */}
                    <div className="flex items-center gap-3 ml-auto sm:ml-0">
                        <span className="text-[10px] font-bold text-loops-muted uppercase tracking-widest opacity-60">Sort</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white border border-loops-border rounded-lg px-3 py-1.5 text-xs font-bold text-loops-main focus:outline-none focus:ring-2 focus:ring-loops-primary/10 transition-all cursor-pointer"
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="price_low">Price ↑</option>
                            <option value="price_high">Price ↓</option>
                        </select>
                    </div>
                </div>

                {/* Grid */}
                <div className="py-2">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-x-6 md:gap-y-10">
                            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : listings.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-x-6 md:gap-y-10">
                            {listings.map((listing, idx) => (
                                <ProductCard
                                    key={listing.id}
                                    id={listing.id}
                                    title={listing.title}
                                    price={`${CURRENCY}${listing.price}`}
                                    category={listing.category}
                                    image={listing.images?.[0] || listing.image_url || FALLBACK_PRODUCT_IMAGE}
                                    author={listing.profiles}
                                    delay={idx * 0.05}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-loops-subtle border border-loops-border rounded-3xl">
                            <div className="text-loops-muted font-bold uppercase tracking-widest text-xs mb-2 italic">The {getTerm('communityName')} is quiet.</div>
                            <p className="text-loops-muted mb-8">Be the first to post something from your {campus?.name || 'campus'}!</p>
                            <Link href="/listings/create">
                                <Button className="bg-loops-primary text-white shadow-xl shadow-loops-primary/20">{getTerm('listingAction')}</Button>
                            </Link>
                        </div>
                    )}
                </div>

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
