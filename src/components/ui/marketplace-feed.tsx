'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "./product-card";
import { SkeletonCard } from "./skeleton-loader";
import { CURRENCY, FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";
import { motion } from "framer-motion";

interface MarketplaceFeedProps {
    campusId?: string | null;
    limit?: number;
}

export function MarketplaceFeed({ campusId, limit = 12 }: MarketplaceFeedProps) {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('listings')
                    .select('*, profiles(full_name, store_name, store_banner_color, is_plug)')
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
                    .limit(limit);

                if (campusId) {
                    query = query.eq('campus_id', campusId);
                }

                const { data, error } = await query;

                if (error) {
                    console.error("Marketplace Feed Error:", error);
                    setListings([]);
                } else {
                    setListings(data || []);
                }
            } catch (err) {
                console.error("Marketplace Feed Unexpected Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [campusId, limit, supabase]);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-x-6 md:gap-y-10">
                {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <div className="text-center py-20 bg-white border border-dashed border-loops-border rounded-[2rem]">
                <p className="text-loops-muted font-bold">No active drops in this Loop yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-x-6 md:gap-y-8">
            {listings.map((listing, idx) => (
                <motion.div 
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
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
                </motion.div>
            ))}
        </div>
    );
}
