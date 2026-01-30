'use client';

import { Navbar } from "../../components/layout/navbar";
import { ProductCard } from "../../components/ui/product-card";
import { Button } from "../../components/ui/button";
import { VerificationBanner } from "../../components/ui/verification-banner";
import { Filter, LayoutGrid, List } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";
import { SkeletonCard } from "../../components/ui/skeleton-loader";
import { SearchBar } from "../../components/ui/search-bar";
import { cn } from "../../lib/utils";
import { useCampus } from "../../context/campus-context";
import { CATEGORIES, FALLBACK_PRODUCT_IMAGE } from "../../lib/constants";

export default function MarketplacePage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
    const [isVerified, setIsVerified] = useState(false);
    const [hasUser, setHasUser] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string>("newest");
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
                .select('*')
                .eq('status', 'active');

            // Apply sorting
            if (sortBy === 'newest') {
                query = query.order('created_at', { ascending: false });
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
    }, [supabase, searchQuery, selectedCategory, sortBy]);

    // Check if user just verified their email
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
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

            {/* App-like Header */}
            <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-loops-border pt-20 pb-4 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="font-display text-4xl font-bold tracking-tighter text-loops-main">
                            {getTerm('marketplaceName')}
                        </h1>
                        <p className="text-loops-muted text-sm font-medium">
                            Discover drops from {getTerm('communityName')}.
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
                    {/* Category Quick Filter Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id === selectedCategory ? 'all' : cat.id)}
                                className={cn(
                                    "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all whitespace-nowrap",
                                    (selectedCategory === cat.id) || (cat.id === 'all' && !selectedCategory)
                                        ? "bg-loops-main text-white border-loops-main shadow-lg shadow-loops-main/20 rotate-1 scale-105"
                                        : "bg-white text-loops-muted border-loops-border hover:border-loops-primary"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Sorting Dropdown */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-loops-muted uppercase tracking-widest">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white border border-loops-border rounded-xl px-4 py-2 text-sm font-bold text-loops-main focus:outline-none focus:ring-2 focus:ring-loops-primary/20 transition-all"
                        >
                            <option value="newest">Newest Drops</option>
                            <option value="oldest">Oldest Drops</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Grid */}
                <div className="py-2">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : listings.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                            {listings.map((listing, idx) => (
                                <ProductCard
                                    key={listing.id}
                                    id={listing.id}
                                    title={listing.title}
                                    price={`$${listing.price}`}
                                    category={listing.category}
                                    image={listing.images?.[0] || listing.image_url || FALLBACK_PRODUCT_IMAGE}
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
            </main>
        </div>
    );
}
