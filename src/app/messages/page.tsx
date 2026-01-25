'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ArrowRight, User, Package, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCampus } from "@/context/campus-context";

export default function MessagesPage() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const { campus, getTerm } = useCampus();

    useEffect(() => {
        const fetchConversations = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch messages with related data
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    listings (id, title, type, price, images, seller_id),
                    sender:sender_id (id, full_name, avatar_url),
                    receiver:receiver_id (id, full_name, avatar_url)
                `)
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false });


            if (data) {
                // Determine unique threads: (listing_id + buyer_id)
                const threadsMap = new Map();

                data.forEach(msg => {
                    const listing = msg.listings;
                    if (!listing) {
                        return;
                    }

                    const isMeSeller = user.id === listing.seller_id;
                    const partner = msg.sender_id === user.id ? msg.receiver : msg.sender;

                    if (!partner) {
                        return;
                    }

                    const buyerId = isMeSeller ? partner.id : user.id;
                    const threadKey = `${listing.id}-${buyerId}`;

                    if (!threadsMap.has(threadKey)) {
                        threadsMap.set(threadKey, {
                            ...msg,
                            partner,
                            buyerId
                        });
                    }
                });

                setConversations(Array.from(threadsMap.values()));
            }
            setLoading(false);
        };

        fetchConversations();
    }, [supabase]);

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-loops-primary/5 via-transparent to-transparent pointer-events-none" />
            <Navbar />

            <main className="pt-32 pb-20 max-w-4xl mx-auto px-6 relative z-10">
                <div className="flex items-end justify-between mb-12">
                    <div className="space-y-4">
                        <p className="text-sm font-bold text-loops-primary uppercase tracking-widest leading-none">Your {getTerm('communityName')}</p>
                        <h1 className="text-5xl md:text-6xl font-bold font-display tracking-tighter text-loops-main">Inbox.</h1>
                        <p className="text-loops-muted text-lg font-light leading-relaxed">Active vibes and community plugs for Nigerian Students.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-24 bg-loops-subtle rounded-3xl border border-loops-border">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-loops-primary" />
                    </div>
                ) : conversations.length > 0 ? (
                    <div className="grid gap-4">
                        {conversations.map((conv) => (
                            <Link
                                key={conv.id}
                                href={`/messages/${conv.listing_id}?u=${conv.buyerId}`}
                                className="group p-6 rounded-3xl bg-white border border-loops-border hover:border-loops-primary/30 transition-all flex items-center gap-6 shadow-sm hover:shadow-xl hover:shadow-loops-primary/5"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-loops-subtle border border-loops-border overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                                    {conv.listings?.type === 'product' ? <Package className="w-8 h-8 text-loops-primary opacity-20" /> : <Zap className="w-8 h-8 text-loops-primary opacity-20" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-loops-primary/5 text-loops-primary uppercase tracking-widest">
                                            {conv.listings?.type}
                                        </span>
                                        <span className="text-[10px] text-loops-muted font-bold uppercase tracking-widest opacity-60">With {conv.partner?.full_name}</span>
                                    </div>
                                    <h3 className="font-bold text-xl truncate group-hover:text-loops-primary transition-colors text-loops-main tracking-tight">
                                        {conv.listings?.title}
                                    </h3>
                                    <p className="text-loops-muted text-sm truncate opacity-80 italic">
                                        "{conv.content}"
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-loops-success font-bold text-lg mb-1 tracking-tighter">${conv.listings?.price}</div>
                                    <ArrowRight className="w-5 h-5 ml-auto text-loops-muted group-hover:text-loops-primary transition-colors group-hover:translate-x-1" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 rounded-3xl border border-loops-border bg-loops-subtle/50 italic">
                        <MessageSquare className="w-12 h-12 text-loops-muted/10 mx-auto mb-4" />
                        <h3 className="text-xl font-bold font-display text-loops-muted uppercase tracking-widest">The Loop is silent.</h3>
                        <p className="text-loops-muted mt-2">Start an interaction on any drop to open a channel.</p>
                        <Link href="/browse">
                            <Button variant="ghost" className="text-loops-primary mt-6 font-bold uppercase tracking-widest text-xs hover:bg-loops-primary/10">Explore {getTerm('marketplaceName')}</Button>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
