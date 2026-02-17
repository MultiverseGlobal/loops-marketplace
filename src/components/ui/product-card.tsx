"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { User, ShieldCheck, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/toast-context";
import { useCart } from "@/context/cart-context";
import { Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
    id: string;
    title: string;
    price: string;
    image: string;
    category: string;
    delay?: number;
    author?: any;
    boosted_until?: string | null;
}

export function ProductCard({ id, title, price, image, category, delay = 0, author, boosted_until }: ProductCardProps) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const { addToCart, refreshWishlist } = useCart();
    const supabase = createClient();
    const toast = useToast();

    useEffect(() => {
        const checkWishlistStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('wishlist_items')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('listing_id', id)
                    .single();

                if (data) setIsWishlisted(true);
            }
        };
        checkWishlistStatus();
    }, [id, supabase]);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Please login to save items.");
            return;
        }

        setWishlistLoading(true);
        if (isWishlisted) {
            const { error } = await supabase
                .from('wishlist_items')
                .delete()
                .eq('user_id', user.id)
                .eq('listing_id', id);

            if (!error) {
                setIsWishlisted(false);
                toast.success("Removed from wishlist");
            }
        } else {
            const { error } = await supabase
                .from('wishlist_items')
                .insert({ user_id: user.id, listing_id: id });

            if (!error) {
                setIsWishlisted(true);
                toast.success("Added to wishlist 💖");
                refreshWishlist();
            }
        }
        setWishlistLoading(false);
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await addToCart({ id, title, price, images: [image], profiles: author });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="group"
        >
            <Link href={`/listings/${id}`}>
                <div className="relative aspect-square overflow-hidden rounded-2xl md:rounded-3xl bg-loops-subtle border border-loops-border group-hover:border-loops-primary/30 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-loops-primary/10">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-2 items-start">
                        <span className="text-[8px] md:text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/95 text-loops-main backdrop-blur-md uppercase tracking-widest shadow-sm border border-loops-border/50">
                            {category}
                        </span>
                        {boosted_until && new Date(boosted_until) > new Date() && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-loops-primary text-loops-main rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl animate-pulse-subtle">
                                <Plus className="w-2.5 h-2.5 fill-current" />
                                <span>Loop Boost</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={toggleWishlist}
                        disabled={wishlistLoading}
                        className={cn(
                            "absolute top-2 right-2 md:top-4 md:right-4 p-2 rounded-xl backdrop-blur-md transition-all duration-300 z-10",
                            isWishlisted
                                ? "bg-white text-red-500 shadow-lg scale-110"
                                : "bg-white/70 text-loops-muted hover:bg-white hover:text-red-500"
                        )}
                    >
                        <Heart className={cn("w-4 h-4 md:w-5 h-5", isWishlisted && "fill-current")} />
                    </button>

                    {/* Add to Cart Overlay */}
                    <div className="absolute inset-0 bg-loops-main/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                        <Button
                            onClick={handleAddToCart}
                            className="bg-white text-loops-main hover:bg-loops-primary hover:text-white rounded-2xl p-4 font-bold h-auto shadow-2xl transition-all translate-y-4 group-hover:translate-y-0 duration-500 border-0"
                        >
                            <ShoppingCart className="w-5 h-5 mr-3" />
                            Add to Cart
                        </Button>
                    </div>
                </div>
                <div className="mt-3 space-y-1 px-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[13px] md:text-sm font-bold text-loops-main group-hover:text-loops-primary transition-colors truncate tracking-tight flex-1">{title}</h3>
                        {(author as any)?.is_plug && (
                            <div className="flex-shrink-0 px-1.5 py-0.5 rounded-md bg-loops-primary/10 text-loops-primary text-[8px] font-bold uppercase tracking-tighter flex items-center gap-1">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                <span>Plug</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-[12px] md:text-[13px] text-loops-primary font-black tracking-tighter">{price}</p>
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-loops-subtle border border-loops-border flex items-center justify-center overflow-hidden">
                                {((author as any)?.store_logo_url || (author as any)?.avatar_url) ? (
                                    <Image
                                        src={(author as any)?.store_logo_url || (author as any)?.avatar_url}
                                        alt={(author as any)?.store_name || "Seller"}
                                        width={16}
                                        height={16}
                                        className="object-cover"
                                    />
                                ) : (
                                    <User className="w-2 h-2 text-loops-muted" />
                                )}
                            </div>
                            <span className="text-[9px] font-bold text-loops-muted uppercase tracking-wider truncate max-w-[60px]">{(author as any)?.store_name || (author as any)?.full_name || "Campus Hub"}</span>
                            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse-subtle flex-shrink-0", (author as any)?.store_banner_color || "bg-loops-primary")} />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
