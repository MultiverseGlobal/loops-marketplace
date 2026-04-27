'use client';

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, ShieldCheck, Sparkles, User, Package, Zap } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/toast-context";
import { useCampus } from "@/context/campus-context";
import { useModal } from "@/context/modal-context";

import { ReviewForm } from "@/components/reviews/review-form";
import { QRCodeSVG } from "qrcode.react";
import { Clock, CheckCircle2, QrCode, Shield } from "lucide-react";

export default function ChatPage() {
    const { id: listingId } = useParams();
    const searchParams = useSearchParams();
    const threadUserId = searchParams.get('u'); // The buyer's ID
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [listing, setListing] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [otherUser, setOtherUser] = useState<any>(null);
    const [transaction, setTransaction] = useState<any>(null);
    const [showReview, setShowReview] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();
    const toast = useToast();
    const { campus, getTerm } = useCampus();
    const modal = useModal();

    useEffect(() => {
        const setup = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get detailed profile (needed for verification check)
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setCurrentUser(userProfile || user);

            // Fetch Listing & Partner Info
            const { data: listingData } = await supabase
                .from('listings')
                .select('*, profiles:seller_id(id, full_name, email_verified, reputation)')
                .eq('id', listingId)
                .single();

            if (listingData) {
                setListing(listingData);


                // Determine who the "other" person is in this specific thread
                const targetThreadPartnerId = user.id === listingData.seller_id
                    ? threadUserId
                    : listingData.seller_id;


                if (targetThreadPartnerId) {
                    const { data: partnerProfile } = await supabase
                        .from('profiles')
                        .select('id, full_name, email_verified, reputation')
                        .eq('id', targetThreadPartnerId)
                        .single();
                    setOtherUser(partnerProfile);

                    // Fetch initial messages for this specific triangle (Listing + Partner + Me)
                    const { data: msgs, error: msgError } = await supabase
                        .from('messages')
                        .select('*, profiles:sender_id(full_name)')
                        .eq('listing_id', listingId)
                        .or(`sender_id.eq.${targetThreadPartnerId},receiver_id.eq.${targetThreadPartnerId}`)
                        .order('created_at', { ascending: true });


                    if (msgs) {
                        const filtered = msgs.filter((m: any) =>
                            (m.sender_id === user.id && m.receiver_id === targetThreadPartnerId) ||
                            (m.sender_id === targetThreadPartnerId && m.receiver_id === user.id)
                        );
                        setMessages(filtered);
                    }

                    // Fetch associated transaction
                    const buyerId = user.id === listingData.seller_id ? targetThreadPartnerId : user.id;
                    const { data: txData } = await supabase
                        .from('transactions')
                        .select('*')
                        .eq('listing_id', listingId)
                        .eq('buyer_id', buyerId)
                        .maybeSingle();

                    if (txData) setTransaction(txData);

                    // Realtime subscription
                    const channel = supabase
                        .channel(`listing-${listingId}-${user.id}`)
                        .on(
                            'postgres_changes',
                            { event: 'INSERT', schema: 'public', table: 'messages', filter: `listing_id=eq.${listingId}` },
                            (payload: any) => {
                                const m = payload.new;
                                if ((m.sender_id === user.id && m.receiver_id === targetThreadPartnerId) ||
                                    (m.sender_id === targetThreadPartnerId && m.receiver_id === user.id)) {
                                    setMessages((prev) => [...prev, m]);
                                }
                            }
                        )
                        .on(
                            'postgres_changes',
                            {
                                event: '*',
                                schema: 'public',
                                table: 'transactions',
                                filter: `listing_id=eq.${listingId}`
                            },
                            (payload) => {
                                const newTx = payload.new as any;
                                if (newTx && newTx.buyer_id === buyerId) {
                                    setTransaction(newTx);
                                }
                            }
                        )
                        .subscribe();

                    return () => {
                        supabase.removeChannel(channel);
                    };
                }
            }
            setLoading(false);
        };

        setup();
    }, [listingId, threadUserId, supabase]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || !listing || !otherUser) return;

        if (!currentUser.email_verified) {
            toast.warning("Verified Email Required: Please verify your university email to send messages.");
            return;
        }



        const { data: msgData, error } = await supabase
            .from('messages')
            .insert({
                listing_id: listingId,
                sender_id: currentUser.id,
                receiver_id: otherUser.id,
                content: newMessage.trim()
            })
            .select()
            .single();


        if (!error) {
            setNewMessage("");
            // Optimistic update fallback if subscription is slow
            if (msgData) {
                setMessages((prev) => {
                    if (prev.some((m: any) => m.id === msgData.id)) return prev;
                    return [...prev, msgData];
                });

                // Trigger Notification for Receiver
                await supabase.from('notifications').insert({
                    user_id: otherUser.id,
                    title: `New Message from ${currentUser.full_name || 'Anonymous'}`,
                    message: newMessage.trim().substring(0, 50) + (newMessage.trim().length > 50 ? '...' : ''),
                    type: 'message',
                    link: `/messages/${listingId}?u=${currentUser.id === listing.seller_id ? otherUser.id : currentUser.id}`
                });
            }
        } else {
            toast.error(`Send failed: ${error.message}`);
        }
    };

    const updateListingStatus = async (status: string) => {
        const confirmed = await modal.confirm({
            title: status === 'pending' ? 'Accept Offer?' : 'Complete Loop?',
            message: status === 'pending'
                ? `Are you sure you want to accept ${otherUser?.full_name}'s offer for this listing?`
                : "Confirming this will finalize the Loop and record it in the campus ledger. This cannot be undone.",
            type: status === 'pending' ? 'info' : 'warning',
            confirmLabel: status === 'pending' ? 'Accept Offer' : 'Complete Loop',
            cancelLabel: 'Not yet'
        });

        if (!confirmed) return;

        const { error } = await supabase
            .from('listings')
            .update({ status })
            .eq('id', listingId);

        if (!error) {
            setListing({ ...listing, status });

            if (status === 'completed') {
                // Record the transaction
                await supabase.from('transactions').insert({
                    listing_id: listingId,
                    buyer_id: otherUser.id, // In this context, the other user is the one we are chatting with
                    seller_id: currentUser.id,
                    amount: listing.price,
                    status: 'completed'
                });
                setShowReview(true);
                toast.success("Loop recorded successfully! Loop complete.");
            } else {
                toast.success("Offer accepted. Coordinate for completion.");
            }

            await supabase.from('messages').insert({
                listing_id: listingId,
                sender_id: currentUser.id,
                receiver_id: otherUser.id,
                content: `LOOPS: The price is ${status === 'pending' ? 'Locked In! 🔒' : 'Deal Sealed! ✅'}`
            });
        } else {
            toast.error("Failed to update status.");
        }
    };

    return (
        <div className="h-screen bg-loops-bg text-loops-main flex flex-col overflow-hidden">
            <Navbar />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-loops-border px-4 py-3 pb-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between mt-12 sm:mt-0">
                    <div className="flex items-center gap-3">
                        <Link href="/messages" className="p-2 -ml-2 text-loops-main hover:bg-loops-subtle rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>

                        {/* Avatar from screenshot */}
                        <div className="w-12 h-12 rounded-2xl bg-white border border-loops-border flex items-center justify-center shadow-sm relative">
                            <span className="text-xl font-bold text-loops-primary">
                                {otherUser?.full_name?.charAt(0) || 'U'}
                            </span>
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <h1 className="font-display text-lg font-bold tracking-tight text-loops-main leading-none">
                                    {otherUser?.full_name}
                                </h1>
                                {otherUser?.email_verified && <ShieldCheck className="w-4 h-4 text-loops-primary" />}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-2 h-2 rounded-full bg-loops-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-bold text-loops-primary uppercase tracking-[0.1em]">
                                    VIBING: {listing?.category?.toUpperCase() || 'CHAT'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {currentUser?.id === listing?.seller_id && listing?.status === 'active' && (
                            <Button
                                onClick={() => updateListingStatus('pending')}
                                className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-loops-primary text-white shadow-lg shadow-loops-primary/20"
                            >
                                Accept Offer
                            </Button>
                        )}
                        {listing?.status === 'pending' && (
                            <Button
                                onClick={() => updateListingStatus('completed')}
                                className="h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-loops-accent text-white shadow-lg shadow-loops-accent/20"
                            >
                                Complete Loop
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-44 pb-32 bg-loops-bg">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Loop Sequence Progress Bar */}
                    {transaction && (
                        <div className="bg-white/50 backdrop-blur-sm border border-loops-border rounded-3xl p-6 mb-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-loops-primary flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" />
                                    Loop Sequence
                                </h3>
                                <div className="text-[10px] font-bold text-loops-muted uppercase">
                                    Status: <span className="text-loops-main">{transaction.status.replace('_', ' ')}</span>
                                </div>
                            </div>

                            <div className="relative">
                                {/* Connection Line */}
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-loops-border -translate-y-1/2" />
                                <div
                                    className="absolute top-1/2 left-0 h-0.5 bg-loops-primary -translate-y-1/2 transition-all duration-1000"
                                    style={{
                                        width: transaction.status === 'pending' ? '0%' :
                                            transaction.status === 'vendor_confirmed' ? '50%' : '100%'
                                    }}
                                />

                                <div className="relative flex justify-between items-center">
                                    {[
                                        { key: 'pending', label: 'Requested', icon: Clock },
                                        { key: 'vendor_confirmed', label: 'Handoff', icon: QrCode },
                                        { key: 'completed', label: 'Verified', icon: CheckCircle2 }
                                    ].map((step, idx) => {
                                        const isActive = transaction.status === step.key ||
                                            (step.key === 'pending' && transaction.status !== 'cancelled') ||
                                            (step.key === 'vendor_confirmed' && transaction.status === 'completed');
                                        const isCurrent = transaction.status === step.key;

                                        return (
                                            <div key={step.key} className="flex flex-col items-center gap-2">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10",
                                                    isCurrent ? "bg-white border-loops-primary text-loops-primary scale-110 shadow-lg shadow-loops-primary/20" :
                                                        isActive ? "bg-loops-primary border-loops-primary text-white" :
                                                            "bg-white border-loops-border text-loops-muted"
                                                )}>
                                                    <step.icon className="w-5 h-5" />
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest",
                                                    isCurrent ? "text-loops-primary" : isActive ? "text-loops-main" : "text-loops-muted"
                                                )}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* QR Handshake Area */}
                            {transaction.status === 'vendor_confirmed' && (
                                <div className="mt-8 p-6 bg-loops-primary/5 rounded-2xl border border-loops-primary/20 animate-in fade-in slide-in-from-top-4">
                                    {currentUser?.id === listing?.seller_id ? (
                                        <div className="flex flex-col items-center text-center gap-4">
                                            <div className="bg-white p-4 rounded-3xl shadow-xl border border-loops-primary/20">
                                                <QRCodeSVG
                                                    value={transaction.verification_token}
                                                    size={160}
                                                    fgColor="#1E1E1E"
                                                    level="H"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-loops-main">Show this to the buyer</h4>
                                                <p className="text-xs text-loops-muted mt-1">They will scan this to verify the physical handoff.</p>
                                                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-loops-border font-mono font-bold text-loops-primary">
                                                    {transaction.verification_token}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-loops-primary shadow-sm border border-loops-border">
                                                <QrCode className="w-8 h-8 animate-pulse" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-loops-main">Scan Seller's QR Code</h4>
                                                <p className="text-xs text-loops-muted mt-1">Once you have the item, scan their code or enter the token below to finalize.</p>
                                                <div className="mt-4 flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter Token"
                                                        className="w-32 h-10 px-4 rounded-xl border border-loops-border text-center font-mono font-bold uppercase focus:border-loops-primary outline-none"
                                                        maxLength={8}
                                                        onChange={async (e) => {
                                                            if (e.target.value.length === 8) {
                                                                const res = await fetch(`/api/loops/${transaction.id}/verify`, {
                                                                    method: 'POST',
                                                                    body: JSON.stringify({ token: e.target.value.toLowerCase() })
                                                                });
                                                                if (res.ok) {
                                                                    toast.success("Handshake verified! Loop complete.");
                                                                } else {
                                                                    toast.error("Invalid verification token.");
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {transaction.status === 'completed' && (
                                <div className="mt-8 p-4 bg-loops-success/5 rounded-2xl border border-loops-success/20 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-loops-success shadow-sm border border-loops-border">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-loops-success">Verified Secure</div>
                                        <div className="text-xs font-bold text-loops-main">Handshake completed successfully at {new Date(transaction.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="text-center py-16 opacity-50">
                        <div className="w-20 h-20 rounded-3xl bg-loops-subtle border border-loops-border mx-auto mb-6 flex items-center justify-center text-loops-primary/20 shadow-inner">
                            {listing?.type === 'product' ? <Package className="w-10 h-10" /> : <Zap className="w-10 h-10" />}
                        </div>
                        <h2 className="text-2xl font-bold font-display italic tracking-tighter text-loops-main">The Loop is Open.</h2>
                        <p className="text-[10px] text-loops-muted uppercase tracking-[0.3em] mt-3 font-bold">
                            Secure • {campus?.name || 'Campus'} • Verified
                        </p>
                    </div>

                    {messages.map((m: any, i: number) => {
                        const isMe = m.sender_id === currentUser?.id;
                        const isSystem = m.content.startsWith('SYSTEM:') || m.content.startsWith('LOOPS:');

                        if (isSystem) {
                            return (
                                <div key={m.id || i} className="flex justify-center my-6">
                                    <div className="px-5 py-2 rounded-full bg-loops-subtle border border-loops-border text-[9px] font-bold uppercase tracking-[0.2em] text-loops-muted shadow-sm italic">
                                        {m.content.replace('SYSTEM: ', '').replace('LOOPS: ', '')}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <motion.div
                                key={m.id || i}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className={cn(
                                    "flex flex-col group",
                                    isMe ? "items-end" : "items-start"
                                )}
                            >
                                <div className={cn(
                                    "px-5 py-3.5 text-[15px] font-medium leading-relaxed shadow-sm max-w-[85%] sm:max-w-[70%]",
                                    isMe
                                        ? "bg-loops-primary text-white rounded-[1.25rem] rounded-tr-none shadow-loops-primary/20"
                                        : "bg-loops-subtle border border-loops-border text-loops-main rounded-[1.25rem] rounded-tl-none"
                                )}>
                                    {m.content}
                                </div>
                                <span className={cn(
                                    "text-[9px] text-loops-muted font-bold uppercase tracking-widest mt-1.5 px-1",
                                    isMe ? "mr-1" : "ml-1"
                                )}>
                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </motion.div>
                        );
                    })}

                    <AnimatePresence>
                        {showReview && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="max-w-md mx-auto pt-12"
                            >
                                <ReviewForm
                                    listingId={listingId as string}
                                    revieweeId={otherUser?.id}
                                    onSuccess={() => setShowReview(false)}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="h-12" /> {/* Spacer */}
                </div>
            </main>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-2xl border-t border-loops-border z-40">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 h-14 pl-6 pr-16 bg-loops-subtle border border-loops-border rounded-2xl focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/5 transition-all font-medium text-loops-main placeholder:text-loops-muted/50 shadow-sm"
                        />
                        <Button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="absolute right-2 h-10 w-10 rounded-xl bg-loops-primary hover:bg-loops-primary/90 p-0 shadow-lg shadow-loops-primary/20 text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </form>
                    <p className="text-[8px] text-loops-muted font-bold uppercase tracking-widest text-center mt-3 opacity-40">
                        Encrypted • Campus Network • Verified
                    </p>
                </div>
            </div>
        </div>
    );
}
