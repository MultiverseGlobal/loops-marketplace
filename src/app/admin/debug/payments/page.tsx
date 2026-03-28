'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Zap, ShieldCheck, Smartphone, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/context/toast-context";
import { cn } from "@/lib/utils";

export default function PaymentDebugPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const supabase = createClient();
    const toast = useToast();

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        const { data } = await supabase
            .from('transactions')
            .select('*, listing:listings(title), buyer:profiles!transactions_buyer_id_fkey(full_name), seller:profiles!transactions_seller_id_fkey(full_name)')
            .order('created_at', { ascending: false })
            .limit(10);
        setTransactions(data || []);
        setLoading(false);
    };

    const simulateWebhook = async (txId: string, reference: string, type: 'escrow' | 'listing_boost') => {
        setActionLoading(txId + 'webhook');
        try {
            // In a real debug tool, we call our own API route with a mock payload
            const { data: tx } = await supabase.from('transactions').select('*').eq('id', txId).single();
            
            const res = await fetch('/api/payments/paystack/webhook', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-paystack-signature': 'MOCK_SIGNATURE' // We would need to bypass signature check in webhook for this to work
                },
                body: JSON.stringify({
                    event: 'charge.success',
                    data: {
                        reference: reference,
                        metadata: {
                            type: type,
                            listingId: tx.listing_id,
                            buyerId: tx.buyer_id,
                            sellerId: tx.seller_id,
                            userId: tx.buyer_id // for boosts
                        }
                    }
                })
            });
            
            toast.success("Webhook simulation sent! (Note: Bypass signature check in code for this to work)");
            fetchTransactions();
        } catch (err) {
            toast.error("Failed to simulate webhook");
        } finally {
            setActionLoading(null);
        }
    };

    const simulateHandoff = async (tx: any) => {
        setActionLoading(tx.id + 'handoff');
        try {
            const res = await fetch(`/api/loops/${tx.id}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: tx.verification_token })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Handshake Verified! Loop Completed. ✅");
                fetchTransactions();
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to verify handshake");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />
            <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-display italic">Payment Sandbox 🛠️</h1>
                        <p className="text-loops-muted text-sm">Debug and test financial flows without real money.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchTransactions} className="gap-2">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </Button>
                </div>

                <div className="space-y-6">
                    {transactions.map(tx => (
                        <div key={tx.id} className="p-6 rounded-3xl bg-white border border-loops-border shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="font-bold text-lg">{tx.listing?.title}</div>
                                    <div className="text-[10px] text-loops-muted uppercase font-bold tracking-widest">
                                        ID: {tx.id.substring(0, 8)} | Ref: {tx.payment_id || 'N/A'}
                                    </div>
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                    tx.status === 'completed' ? "bg-loops-success/10 text-loops-success border-loops-success/20" : "bg-loops-primary/10 text-loops-primary border-loops-primary/20"
                                )}>
                                    {tx.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="p-3 rounded-xl bg-loops-subtle border border-loops-border">
                                    <div className="text-[10px] text-loops-muted uppercase font-bold mb-1">Buyer</div>
                                    <div className="font-bold">{tx.buyer?.full_name}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-loops-subtle border border-loops-border">
                                    <div className="text-[10px] text-loops-muted uppercase font-bold mb-1">Seller</div>
                                    <div className="font-bold">{tx.seller?.full_name}</div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2 border-t border-loops-border mt-4 pt-4">
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => simulateWebhook(tx.id, tx.payment_id, 'escrow')}
                                    disabled={actionLoading === tx.id + 'webhook' || tx.payment_status === 'paid'}
                                    className="text-[10px] font-bold uppercase tracking-widest border-loops-primary text-loops-primary"
                                >
                                    <Zap className="w-3.5 h-3.5 mr-2" />
                                    Simulate Webhook (Paid)
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => simulateHandoff(tx)}
                                    disabled={actionLoading === tx.id + 'handoff' || tx.status === 'completed' || tx.payment_status !== 'paid'}
                                    className="text-[10px] font-bold uppercase tracking-widest border-loops-success text-loops-success"
                                >
                                    <CheckCircle className="w-3.5 h-3.5 mr-2" />
                                    Simulate Handoff
                                </Button>
                            </div>
                        </div>
                    ))}

                    {transactions.length === 0 && (
                        <div className="text-center py-20 bg-loops-subtle rounded-3xl border border-dashed border-loops-border">
                            <AlertTriangle className="w-12 h-12 text-loops-muted/20 mx-auto mb-4" />
                            <p className="text-loops-muted italic">No transactions found to debug.</p>
                        </div>
                    )}
                </div>

                <div className="mt-12 p-6 rounded-3xl bg-loops-primary/5 border border-loops-primary/20">
                    <h4 className="flex items-center gap-2 text-loops-primary font-bold text-xs uppercase tracking-widest mb-3">
                        <ShieldCheck className="w-4 h-4" /> Development Tip
                    </h4>
                    <p className="text-xs text-loops-muted leading-relaxed italic">
                        To use these simulations, temporarily comment out the signature check in `src/app/api/payments/paystack/webhook/route.ts` while in development mode.
                    </p>
                </div>
            </main>
        </div>
    );
}
