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
import { CURRENCY } from "@/lib/constants";
import { Rating } from "./rating";
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
                    "relative bg-white border border-loops-border rounded-[2rem] p-3 md:p-4 transition-all duration-500 group-hover:border-loops-primary/50 group-hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.2)]",
                    featured ? "h-full" : ""
                )}>
                    <div className={cn(
                        "relative overflow-hidden rounded-2xl bg-loops-subtle mb-4 border border-loops-border",
                        featured ? "aspect-[4/5] sm:aspect-auto sm:h-full" : "aspect-square"
                    )}>
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        
                        {boosted_until && new Date(boosted_until) > new Date() && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-loops-energetic text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg">
                                Sponsored
                            </div>
                        )}

                        <button
                            onClick={toggleWishlist}
                            disabled={wishlistLoading}
                            className={cn(
                                "absolute top-2 right-2 p-2 rounded-xl backdrop-blur-xl transition-all duration-500 z-30",
                                isWishlisted
                                    ? "bg-loops-primary text-white shadow-lg scale-110"
                                    : "bg-white/40 text-loops-main border border-white/20 hover:bg-loops-primary hover:text-white"
                            )}
                        >
                            <Heart className={cn("w-3.5 h-3.5", isWishlisted && "fill-current")} />
                        </button>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-loops-muted opacity-60">
                                {category}
                            </span>
                            {featured && (
                                <span className="px-2 py-0.5 bg-loops-primary/10 text-loops-primary rounded-lg text-[8px] font-black uppercase tracking-widest">
                                    Campus Choice
                                </span>
                            )}
                        </div>

                        <h3 className="font-display font-bold text-loops-main tracking-tight group-hover:text-loops-primary transition-colors truncate text-sm md:text-base">
                            {title}
                        </h3>

                        <div className="flex items-center gap-2">
                            <Rating value={4.2} size="sm" />
                            <span className="text-[9px] font-bold text-loops-muted">(8)</span>
                        </div>

                        <div className="flex items-baseline gap-1">
                            <p className="text-lg md:text-xl font-black text-loops-main tracking-tighter">
                                {price}
                            </p>
                            <p className="text-[10px] text-loops-muted line-through opacity-40">
                                {CURRENCY}{(parseFloat(price.replace(/[^0-9.]/g, '')) * 1.2).toFixed(0)}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-loops-border">
                            <div className="w-5 h-5 rounded-full overflow-hidden border border-loops-border bg-white">
                                {((author as any)?.store_logo_url || (author as any)?.avatar_url) ? (
                                    <Image
                                        src={(author as any)?.store_logo_url || (author as any)?.avatar_url}
                                        alt=""
                                        width={20}
                                        height={20}
                                        className="object-cover"
                                    />
                                ) : (
                                    <User className="w-2.5 h-2.5 text-loops-muted m-auto" />
                                )}
                            </div>
                            <span className="text-[9px] font-bold text-loops-muted uppercase tracking-wider truncate">
                                {(author as any)?.store_name || (author as any)?.full_name || "Campus"}
                            </span>
                        </div>
                    </div>

                    <Button className="w-full h-10 rounded-xl bg-loops-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-loops-primary/10 hover:scale-[1.02] transition-all">
                        Secure Buy
                    </Button>
                </div>
            </Link>
        </div>
    );
}
