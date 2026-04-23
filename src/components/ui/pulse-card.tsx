'use client';

import { motion } from "framer-motion";
import { Sparkles, ShoppingBag, Zap, ShieldCheck, ArrowRight, Play, ExternalLink, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./button";
import { CURRENCY, FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";
import { Rating } from "./rating";

interface PulseCardProps {
    item: any;
    delay?: number;
}

export function PulseCard({ item, delay = 0 }: PulseCardProps) {
    if (item.feed_type === 'listing') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay }}
                className="group relative bg-white border border-loops-border rounded-[2rem] p-4 md:p-5 shadow-sm hover:shadow-xl transition-all duration-500 col-span-1"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-loops-primary/10 flex items-center justify-center text-loops-primary">
                            <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-loops-primary">Verified Drop</p>
                            <p className="text-[9px] font-bold text-loops-muted">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                    {item.profiles?.is_plug && (
                        <div className="px-2 py-1 bg-loops-primary/10 text-loops-primary border border-loops-primary/20 rounded-lg text-[8px] font-black uppercase tracking-widest">
                            Campus Choice
                        </div>
                    )}
                </div>

                <Link href={`/listings/${item.id}`}>
                    <div className="aspect-square rounded-2xl overflow-hidden relative mb-4 bg-loops-subtle border border-loops-border">
                        <Image
                            src={item.images?.[0] || item.image_url || FALLBACK_PRODUCT_IMAGE}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {item.boosted_until && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-loops-energetic text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg">
                                Sponsored
                            </div>
                        )}
                    </div>
                </Link>

                <div className="space-y-2 mb-4">
                    <Link href={`/listings/${item.id}`}>
                        <h3 className="text-sm font-bold text-loops-main line-clamp-2 leading-tight hover:text-loops-primary transition-colors">{item.title}</h3>
                    </Link>
                    
                    <div className="flex items-center gap-2">
                        <Rating value={4.5} size="sm" />
                        <span className="text-[10px] font-bold text-loops-primary">12+</span>
                    </div>

                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-loops-main tracking-tighter">{CURRENCY}{item.price}</span>
                        <span className="text-[10px] text-loops-muted line-through opacity-50">{CURRENCY}{(parseFloat(item.price) * 1.2).toFixed(0)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-loops-success">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Ready for Handshake Pickup</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Link href={`/listings/${item.id}`} className="w-full">
                        <Button className="w-full h-10 rounded-xl bg-loops-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-loops-primary/10 hover:scale-[1.02] transition-all">
                            Secure Buy Now
                        </Button>
                    </Link>
                    <div className="flex items-center justify-between pt-2 border-t border-loops-border">
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-loops-subtle overflow-hidden relative border border-loops-border">
                                {item.profiles?.avatar_url ? (
                                    <Image src={item.profiles.avatar_url} alt="" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-loops-muted">
                                        {item.profiles?.full_name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <span className="text-[9px] font-bold text-loops-muted truncate max-w-[80px]">
                                {item.profiles?.store_name || item.profiles?.full_name}
                            </span>
                        </div>
                        <Heart className="w-3.5 h-3.5 text-loops-muted hover:text-red-500 cursor-pointer transition-colors" />
                    </div>
                </div>
            </motion.div>
        );
    }

    if (item.feed_type === 'activity') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay }}
                className="bg-loops-main text-white rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden group shadow-lg shadow-loops-main/10 col-span-2 md:col-span-2"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-loops-primary/20 rounded-full blur-[80px] -mr-10 -mt-10" />
                
                <div className="relative z-10 flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-loops-primary">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Verified Loop Synced</span>
                </div>

                <div className="space-y-4 relative z-10">
                    <h3 className="text-xl md:text-2xl font-black italic tracking-tighter leading-none">
                        {item.buyer?.full_name?.split(' ')[0]} <span className="opacity-40">just secured</span><br />
                        <span className="text-loops-primary underline decoration-2 underline-offset-4">{item.listing?.title}</span>
                    </h3>
                    
                    <div className="flex items-center gap-4 text-white/60">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-loops-primary rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{item.seller?.campus?.name}</span>
                        </div>
                        <div className="w-1 h-1 bg-white/20 rounded-full" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Handshake Verified</span>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (item.feed_type === 'campaign') {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay }}
                className="relative bg-loops-accent/5 border border-loops-accent/10 rounded-[2.5rem] p-6 md:p-8 overflow-hidden group col-span-2 md:col-span-2"
            >
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-loops-accent/10 rounded-full blur-[100px] group-hover:bg-loops-accent/20 transition-colors" />
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-loops-accent/20 flex items-center justify-center text-loops-accent shadow-sm">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-loops-accent">Featured Pulse</p>
                        <p className="text-xs font-bold text-loops-main">Admin Campaign</p>
                    </div>
                </div>

                <div className="space-y-4 relative z-10 mb-6">
                    <h2 className="text-3xl font-black tracking-tighter italic text-loops-main leading-none">
                        {item.title}
                    </h2>
                    <p className="text-sm text-loops-muted font-medium leading-relaxed line-clamp-2">
                        {item.message}
                    </p>
                </div>

                {item.image_url && (
                    <div className="relative aspect-[16/9] rounded-[2rem] overflow-hidden border border-loops-accent/20 mb-6">
                        <Image src={item.image_url} alt="" fill className="object-cover" />
                        {item.video_url && (
                            <div className="absolute inset-0 flex items-center justify-center bg-loops-main/20 backdrop-blur-[1px] group-hover:bg-loops-main/10 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-loops-accent shadow-xl scale-90 group-hover:scale-100 transition-transform">
                                    <Play className="w-5 h-5 fill-current" />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {item.cta_link && (
                    <Link href={item.cta_link}>
                        <Button className="w-full h-14 rounded-2xl bg-loops-accent text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-loops-accent/20 hover:scale-105 transition-all">
                            Explore Campaign <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                )}
            </motion.div>
        );
    }

    return null;
}
