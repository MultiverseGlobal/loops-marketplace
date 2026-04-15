"use client";
import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import { User, ShieldCheck, Heart, Award } from "lucide-react";
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
    featured?: boolean;
}

export function ProductCard({ id, title, price, image, category, delay = 0, author, boosted_until, featured = false }: ProductCardProps) {
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
        <div 
            className={cn(
                "group",
                featured ? "h-full" : ""
            )}
        >
            <Link href={`/listings/${id}`}>
                <div className={cn(
                    "relative overflow-hidden rounded-[2.5rem] bg-white border border-loops-border transition-all duration-500 group-hover:border-loops-primary/50 group-hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)]",
                    featured ? "aspect-[4/5] sm:aspect-auto sm:h-full" : "aspect-square"
                )}>

                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    
                    {/* Glass Overlay for data */}
                    <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-gradient-to-t from-loops-main/90 via-loops-main/40 to-transparent backdrop-blur-[2px] z-10">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-2">
                                <span className={cn(
                                    "font-bold uppercase tracking-[0.2em] text-white/60",
                                    featured ? "text-[10px]" : "text-[8px] md:text-[9px]"
                                )}>
                                    {category}
                                </span>
                                {boosted_until && new Date(boosted_until) > new Date() && (
                                    <div className="px-2 py-0.5 bg-loops-primary text-white rounded-lg text-[8px] font-black uppercase tracking-widest animate-pulse">
                                        Boosted
                                    </div>
                                )}
                            </div>
                            <h3 className={cn(
                                "font-display font-bold text-white tracking-tight group-hover:text-loops-accent transition-colors truncate",
                                featured ? "text-xl md:text-3xl" : "text-sm md:text-base"
                            )}>
                                {title}
                            </h3>
                            <div className="flex items-center justify-between mt-1">
                                <p className={cn(
                                    "text-loops-accent font-black tracking-tighter",
                                    featured ? "text-2xl" : "text-base"
                                )}>
                                    {price}
                                </p>
                                <div className="flex items-center gap-2 px-2 py-1 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                                    <div className="w-3.5 h-3.5 rounded-full overflow-hidden border border-white/20">
                                        {((author as any)?.store_logo_url || (author as any)?.avatar_url) ? (
                                            <Image
                                                src={(author as any)?.store_logo_url || (author as any)?.avatar_url}
                                                alt=""
                                                width={14}
                                                height={14}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <User className="w-2 h-2 text-white" />
                                        )}
                                    </div>
                                    <span className="text-[8px] font-bold text-white uppercase tracking-wider truncate max-w-[50px]">
                                        {(author as any)?.store_name || (author as any)?.full_name || "Campus"}
                                    </span>
                                    {(author as any)?.is_founding_member && (
                                        <div className="flex items-center justify-center p-0.5 bg-loops-primary rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                                            <Award className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action - Desktop */}
                    <button
                        onClick={toggleWishlist}
                        disabled={wishlistLoading}
                        className={cn(
                            "absolute top-4 right-4 p-3 rounded-2xl backdrop-blur-xl transition-all duration-500 z-30",
                            isWishlisted
                                ? "bg-loops-primary text-white shadow-lg scale-110"
                                : "bg-white/10 text-white border border-white/20 hover:bg-loops-primary hover:border-loops-primary"
                        )}
                    >
                        <Heart className={cn("w-4 h-4 md:w-5 h-5", isWishlisted && "fill-current")} />
                    </button>
                </div>
            </Link>
        </div>
    );
}
