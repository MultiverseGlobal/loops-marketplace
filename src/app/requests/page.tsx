'use client';

import { Navbar } from "../../components/layout/navbar";
import { ProductCard } from "../../components/ui/product-card";
import { Button } from "../../components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";
import { SkeletonCard } from "../../components/ui/skeleton-loader";
import { SearchBar } from "../../components/ui/search-bar";
import { useCampus } from "../../context/campus-context";
import { HelpCircle, PackageSearch } from "lucide-react";
import { FALLBACK_PRODUCT_IMAGE } from "../../lib/constants";

export default function RequestsPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const supabase = createClient();
    const { campus, getTerm } = useCampus();

    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            let query = supabase
                .from('listings')
                .select('*, profiles(full_name)')
                .eq('status', 'active')
                .eq('type', 'request')
                .order('created_at', { ascending: false });

            if (searchQuery) {
                query = query.ilike('title', `%${searchQuery}%`);
            }

            const { data } = await query;
            if (data) setListings(data);
            setLoading(false);
        };
        fetchRequests();
    }, [supabase, searchQuery]);

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />

            {/* App Header */}
            <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-loops-border pt-20 pb-4 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tighter text-loops-main">
                            Requests.
                        </h1>
                        <p className="text-loops-muted text-sm font-medium">
                            What {getTerm('communityName')} needs right now.
                        </p>
                    </div>
                    <div className="flex-1 max-w-xl">
                        <SearchBar
                            onSearch={setSearchQuery}
                            placeholder="Search requests..."
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : listings.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {listings.map((listing, idx) => (
                            <ProductCard
                                key={listing.id}
                                id={listing.id}
                                title={listing.title}
                                price={`${CURRENCY}${listing.price}`}
                                category={listing.category}
                                image={listing.images?.[0] || listing.image_url || FALLBACK_PRODUCT_IMAGE}
                                author={listing.profiles?.full_name}
                                delay={idx * 0.05}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-loops-subtle border border-loops-border rounded-3xl">
                        <PackageSearch className="w-12 h-12 text-loops-muted/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold font-display text-loops-muted uppercase tracking-widest italic opacity-50">Zero active requests.</h3>
                        <p className="text-loops-muted mb-8 max-w-xs mx-auto text-sm">Need a book, a laptop, or even just a ride home? Post it here.</p>
                        <Link href="/listings/create">
                            <Button className="bg-loops-accent text-white shadow-xl shadow-loops-accent/20 rounded-xl px-10">Post a Request</Button>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
