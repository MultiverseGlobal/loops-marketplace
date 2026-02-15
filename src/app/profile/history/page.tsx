'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, Receipt, ArrowUpRight, ArrowDownLeft, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCampus } from "@/context/campus-context";
import { CURRENCY } from "@/lib/constants";

export default function ActivityLedgerPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const supabase = createClient();
    const { campus, getTerm } = useCampus();

    useEffect(() => {
        const fetchHistory = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
                const { data } = await supabase
                    .from('transactions')
                    .select('*, listings(title, images), buyer:buyer_id(full_name), seller:seller_id(full_name)')
                    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
                    .order('created_at', { ascending: false });

                if (data) setTransactions(data);
            }
            setLoading(false);
        };
        fetchHistory();
    }, [supabase]);

    if (loading) return null;

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />
            <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                <Link href="/profile" className="inline-flex items-center gap-2 text-loops-muted hover:text-loops-primary mb-8 transition-colors font-bold uppercase tracking-widest text-xs">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Profile
                </Link>

                <div className="space-y-12">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold font-display tracking-tight text-loops-main italic">Activity Ledger.</h1>
                        <p className="text-loops-muted text-lg">Your historical footprint in the {getTerm('communityName')}.</p>
                    </div>

                    <div className="space-y-4">
                        {transactions.length > 0 ? (
                            transactions.map((tx) => {
                                const isBuyer = tx.buyer_id === currentUserId;
                                return (
                                    <div key={tx.id} className="p-6 rounded-2xl bg-white border border-loops-border shadow-sm flex items-center gap-6 group hover:shadow-lg transition-all">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center border",
                                            isBuyer ? "bg-red-50 border-red-100 text-red-500" : "bg-loops-success/5 border-loops-success/20 text-loops-success"
                                        )}>
                                            {isBuyer ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={cn(
                                                    "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest",
                                                    isBuyer ? "bg-red-50 text-red-500" : "bg-loops-success/5 text-loops-success"
                                                )}>
                                                    {isBuyer ? "Purchase" : "Sale"}
                                                </span>
                                                <span className="text-[10px] text-loops-muted font-bold uppercase tracking-widest flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(tx.created_at).toLocaleDateString()}
                                                </span>
                                                <span className={cn(
                                                    "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ring-1 ring-inset",
                                                    tx.status === 'completed' ? "bg-loops-success/10 text-loops-success ring-loops-success/20" :
                                                        tx.status === 'vendor_confirmed' ? "bg-amber-50 text-amber-600 ring-amber-200" :
                                                            "bg-loops-primary/10 text-loops-primary ring-loops-primary/20"
                                                )}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg text-loops-main tracking-tight truncate group-hover:text-loops-primary transition-colors">{tx.listings?.title}</h3>
                                            <p className="text-xs text-loops-muted font-bold uppercase tracking-widest opacity-60">
                                                {isBuyer ? `Seller: ${tx.seller?.full_name}` : `Buyer: ${tx.buyer?.full_name}`}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden sm:block">
                                                <div className={cn(
                                                    "text-xl font-bold font-display tracking-tighter",
                                                    isBuyer ? "text-red-500" : "text-loops-success"
                                                )}>
                                                    {isBuyer ? "-" : "+"}{isBuyer ? "" : CURRENCY}{tx.amount}{isBuyer ? CURRENCY : ""}
                                                </div>
                                            </div>

                                            {/* Action Buttons Based on Status */}
                                            {tx.status !== 'completed' && (
                                                <div className="flex gap-2">
                                                    {!isBuyer && tx.status === 'pending' && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-loops-primary text-white text-[9px] font-black uppercase tracking-widest px-4 h-9 shadow-lg shadow-loops-primary/20"
                                                            onClick={async () => {
                                                                const res = await fetch(`/api/loops/${tx.id}/vendor-confirm`, { method: 'POST' });
                                                                if (res.ok) window.location.reload();
                                                            }}
                                                        >
                                                            Mark Fulfilled
                                                        </Button>
                                                    )}
                                                    {isBuyer && tx.status === 'vendor_confirmed' && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-loops-success text-white text-[9px] font-black uppercase tracking-widest px-4 h-9 shadow-lg shadow-loops-success/20"
                                                            onClick={async () => {
                                                                // This would ideally open a review modal, but for now direct confirm
                                                                const res = await fetch(`/api/loops/${tx.id}/buyer-confirm`, {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ rating: 5, review: "Great exchange!" })
                                                                });
                                                                if (res.ok) window.location.reload();
                                                            }}
                                                        >
                                                            Confirm Receipt
                                                        </Button>
                                                    )}
                                                </div>
                                            )}

                                            {tx.status === 'completed' && (
                                                <ShieldCheck className="w-6 h-6 text-loops-success" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-24 rounded-3xl border border-loops-border bg-loops-subtle/50 italic space-y-4">
                                <Receipt className="w-12 h-12 text-loops-muted/10 mx-auto" />
                                <h3 className="text-xl font-bold font-display text-loops-muted uppercase tracking-widest">No Activity found.</h3>
                                <p className="text-loops-muted max-w-xs mx-auto text-sm">You haven't completed any Loops in the {getTerm('communityName')} yet. Start by exploring the marketplace!</p>
                                <Link href="/browse" className="inline-block pt-4">
                                    <Button className="font-bold uppercase tracking-widest text-[10px]">Browse Marketplace</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
