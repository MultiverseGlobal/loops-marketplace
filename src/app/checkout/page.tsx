'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { CURRENCY } from '@/lib/constants';
import { ShieldCheck, ArrowLeft, Lock, Info, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const { cartItems, loading } = useCart();
    const [agreed, setAgreed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-loops-subtle/30">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-loops-primary border-t-transparent animate-spin" />
                <p className="text-loops-muted font-bold text-sm uppercase tracking-widest">Preparing Checkout...</p>
            </div>
        </div>
    );

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
                <div className="w-24 h-24 bg-loops-subtle rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-12 h-12 text-loops-muted" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-black tracking-tighter">Your cart is empty.</h1>
                    <p className="text-loops-muted max-w-xs mx-auto">Add something to your cart before proceeding to the secure checkout.</p>
                </div>
                <Button onClick={() => router.push('/browse')} className="rounded-2xl bg-loops-primary">
                    Return to Shop
                </Button>
            </div>
        );
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.listing?.price || 0) * item.quantity), 0);
    const platformFee = Math.round(subtotal * 0.05);
    const total = subtotal + platformFee;

    const handleCheckout = async () => {
        if (!agreed) {
            toast.error("Please agree to the Loop Handshake Terms to continue.");
            return;
        }

        setIsProcessing(true);
        try {
            // For MVP, we initialize escrow for the first item/seller in the cart
            const firstItem = cartItems[0];
            
            const response = await fetch('/api/payments/paystack/initialize-escrow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId: firstItem.listing_id,
                    amount: subtotal, // In a real multi-item cart, this would be more complex
                    sellerId: firstItem.listing.seller_id,
                    planName: 'standard_escrow'
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            // Redirect to Paystack
            window.location.href = data.authorization_url;
        } catch (error: any) {
            toast.error(error.message || "Failed to initialize payment");
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-loops-subtle/20 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-loops-border sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/browse" className="p-2 hover:bg-loops-subtle rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-loops-main" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-green-500" />
                        <span className="font-bold text-sm uppercase tracking-widest text-loops-main">Secure Checkout</span>
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    {/* Left Column: Summary */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black tracking-tight text-loops-main">Review your Loop</h2>
                            <p className="text-loops-muted">Confirm the items you're picking up on campus.</p>
                        </div>

                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-3xl border border-loops-border flex gap-4 shadow-sm">
                                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-loops-subtle border border-loops-border flex-shrink-0">
                                        <Image 
                                            src={item.listing?.images?.[0] || ''} 
                                            alt="" fill className="object-cover" 
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h4 className="font-bold text-loops-main">{item.listing?.title}</h4>
                                        <p className="text-xs text-loops-muted uppercase font-bold tracking-widest">
                                            Qty: {item.quantity} • {CURRENCY}{item.listing?.price} each
                                        </p>
                                    </div>
                                    <div className="flex items-center font-black text-loops-primary">
                                        {CURRENCY}{Number(item.listing?.price) * item.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-loops-border space-y-4 shadow-sm">
                            <h3 className="font-bold text-loops-main flex items-center gap-2">
                                <Info className="w-4 h-4 text-loops-primary" />
                                How it works
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    "Your funds are held in escrow by Loops.",
                                    "Meet the seller in a public campus location.",
                                    "Scan the QR code ONLY after you've seen the item.",
                                    "Scanning releases the funds to the seller."
                                ].map((step, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-loops-muted">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Payment & Agreement */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[40px] border border-loops-border shadow-2xl shadow-loops-primary/5 space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between text-loops-muted font-bold uppercase tracking-widest text-xs">
                                    <span>Subtotal</span>
                                    <span>{CURRENCY}{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-loops-muted font-bold uppercase tracking-widest text-xs">
                                    <span>Handshake Fee (5%)</span>
                                    <span>{CURRENCY}{platformFee}</span>
                                </div>
                                <div className="pt-4 border-t border-loops-border flex justify-between items-center">
                                    <span className="text-xl font-black text-loops-main tracking-tighter">Total Amount</span>
                                    <span className="text-3xl font-black text-loops-primary tracking-tighter">{CURRENCY}{total}</span>
                                </div>
                            </div>

                            {/* Terms Agreement */}
                            <div className="p-5 bg-loops-subtle/50 rounded-3xl border border-loops-border space-y-4">
                                <div className="flex gap-4">
                                    <input 
                                        type="checkbox" 
                                        id="terms" 
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="w-6 h-6 mt-1 rounded-lg border-loops-border text-loops-primary focus:ring-loops-primary transition-all cursor-pointer"
                                    />
                                    <label htmlFor="terms" className="text-sm text-loops-main font-medium leading-relaxed cursor-pointer selection:bg-loops-primary/20">
                                        I agree to the <Link href="/terms" className="text-loops-primary font-bold hover:underline">Handshake Terms</Link> and understand that scanning the QR code releases funds permanently.
                                    </label>
                                </div>
                            </div>

                            <Button 
                                onClick={handleCheckout}
                                disabled={isProcessing || !agreed}
                                className="w-full h-16 rounded-[24px] bg-loops-primary hover:bg-loops-main text-white font-black text-xl shadow-2xl shadow-loops-primary/20 transition-all disabled:opacity-50 group"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Securing...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span>Complete Payment</span>
                                        <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </Button>

                            <div className="flex flex-col items-center gap-3 pt-4">
                                <div className="flex items-center gap-3 grayscale opacity-50">
                                    <Image src="https://paystack.com/assets/img/v3/logo.svg" alt="Paystack" width={100} height={20} />
                                </div>
                                <p className="text-[10px] text-loops-muted uppercase font-black tracking-widest">Secured by Paystack Escrow</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
