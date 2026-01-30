'use client';

import { Navbar } from "@/components/layout/navbar";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SkeletonCard } from "@/components/ui/skeleton-loader";
import { SearchBar } from "@/components/ui/search-bar";
import { useCampus } from "@/context/campus-context";
import { Zap, Sparkles } from "lucide-react";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";

export default function ServicesPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const supabase = createClient();
    const { campus, getTerm } = useCampus();

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            let query = supabase
                .from('listings')
                .select('*')
                .eq('status', 'active')
                .eq('category', 'services')
                .order('created_at', { ascending: false });

            if (searchQuery) {
                query = query.ilike('title', `%${searchQuery}%`);
            }

            const { data } = await query;
            if (data) setListings(data);
            setLoading(false);
        };
        fetchServices();
    }, [supabase, searchQuery]);

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />

            {/* App Header */}
            <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-loops-border pt-20 pb-4 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="font-display text-4xl font-bold tracking-tighter text-loops-main">
                            Services.
                        </h1>
                        <p className="text-loops-muted text-sm font-medium">
                            Student plugs at {campus?.name || 'your campus'}.
                        </p>
                    </div>
                    <div className="flex-1 max-w-xl">
                        <SearchBar
                            onSearch={setSearchQuery}
                            placeholder="Find a student plug..."
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
                                price={`$${listing.price}`}
                                category={listing.category}
                                image={listing.images?.[0] || listing.image_url || FALLBACK_PRODUCT_IMAGE}
                                delay={idx * 0.05}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-loops-subtle border border-loops-border rounded-3xl">
                        <Sparkles className="w-12 h-12 text-loops-muted/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold font-display text-loops-muted uppercase tracking-widest italic opacity-50">No service plugs yet.</h3>
                        <p className="text-loops-muted mb-8 max-w-xs mx-auto text-sm">Have a skill? Be the first to offer it and build your campus reputation.</p>
                        <Link href="/listings/create">
                            <Button className="bg-loops-primary text-white shadow-xl shadow-loops-primary/20 rounded-xl px-10">Offer a Skill</Button>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
