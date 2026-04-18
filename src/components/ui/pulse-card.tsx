'use client';

import { motion } from "framer-motion";
import { Sparkles, ShoppingBag, Zap, ShieldCheck, ArrowRight, Play, ExternalLink, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./button";
import { CURRENCY, FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";

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
                className="group relative bg-white border border-loops-border rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-loops-primary/10 flex items-center justify-center text-loops-primary">
                        <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-loops-primary">New Drop</p>
                        <p className="text-[9px] font-bold text-loops-muted">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>

                <Link href={`/listings/${item.id}`}>
                    <div className="aspect-[4/5] rounded-[2rem] overflow-hidden relative mb-4 border border-loops-border">
                        <Image
                            src={item.images?.[0] || item.image_url || FALLBACK_PRODUCT_IMAGE}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/20">
                            <h3 className="text-lg font-black text-loops-main truncate">{item.title}</h3>
                            <p className="text-loops-primary font-black text-xl tracking-tighter">{CURRENCY}{item.price}</p>
                        </div>
                    </div>
                </Link>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-loops-subtle overflow-hidden relative">
                            {item.profiles?.avatar_url ? (
                                <Image src={item.profiles.avatar_url} alt="" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-loops-muted uppercase">
                                    {item.profiles?.full_name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] font-bold text-loops-muted truncate max-w-[100px]">
                            {item.profiles?.store_name || item.profiles?.full_name}
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-loops-primary hover:bg-loops-primary/5">
                        View Item <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
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
                className="bg-loops-main text-white rounded-[2.5rem] p-8 relative overflow-hidden group shadow-lg shadow-loops-main/10"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-loops-primary/20 rounded-full blur-[80px] -mr-10 -mt-10" />
                
                <div className="relative z-10 flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-loops-primary">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Verified Loop Synced</span>
                </div>

                <div className="space-y-4 relative z-10">
                    <h3 className="text-2xl font-black italic tracking-tighter leading-none">
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
                className="relative bg-loops-accent/5 border border-loops-accent/10 rounded-[3rem] p-8 overflow-hidden group"
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
