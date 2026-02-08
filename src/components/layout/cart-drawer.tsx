'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { CURRENCY } from '@/lib/constants';
import Link from 'next/link';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { cartItems, removeFromCart, updateQuantity, loading } = useCart();

    const totalPrice = cartItems.reduce((sum, item) =>
        sum + (Number(item.listing.price) * item.quantity), 0
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-loops-main/60 backdrop-blur-md z-[60]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white/95 backdrop-blur-2xl shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.3)] z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-loops-border flex items-center justify-between bg-white/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-loops-primary text-white rounded-xl shadow-lg shadow-loops-primary/20">
                                    <ShoppingCart className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold font-display tracking-tight uppercase tracking-[0.05em]">Your Cart</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-loops-subtle rounded-full transition-colors group">
                                <X className="w-5 h-5 text-loops-muted group-hover:text-loops-primary transition-colors" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cartItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-loops-subtle rounded-full flex items-center justify-center text-loops-muted">
                                        <ShoppingCart className="w-10 h-10" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg">Your cart is empty</h3>
                                        <p className="text-sm text-loops-muted">Found something cool? Add it to your cart to keep track.</p>
                                    </div>
                                    <Button onClick={onClose} variant="outline" className="mt-4 rounded-xl border-loops-primary text-loops-primary">
                                        Start Browsing
                                    </Button>
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-loops-subtle flex-shrink-0 border border-loops-border">
                                            <Image
                                                src={item.listing.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000'}
                                                alt={item.listing.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-bold text-sm text-loops-main line-clamp-1">{item.listing.title}</h4>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-loops-muted hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-loops-muted font-bold uppercase tracking-widest">
                                                    <Package className="w-3 h-3" />
                                                    <span>{item.listing.profiles?.store_name || item.listing.profiles?.full_name}</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center gap-3 bg-loops-subtle rounded-lg px-2 py-1 border border-loops-border">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 hover:text-loops-primary transition-colors disabled:opacity-30"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 hover:text-loops-primary transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <div className="text-lg font-black text-loops-primary tracking-tighter">
                                                    {CURRENCY}{Number(item.listing.price) * item.quantity}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="p-6 border-t border-loops-border bg-loops-subtle/30 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-loops-muted font-bold uppercase tracking-widest text-xs">Total Estimated</span>
                                    <span className="text-2xl font-black text-loops-main tracking-tighter">{CURRENCY}{totalPrice}</span>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] text-loops-muted text-center italic">Final price and meeting details will be confirmed with the Plug.</p>
                                    <Link href="/browse" onClick={onClose}>
                                        <Button className="w-full h-14 rounded-2xl bg-loops-primary text-white font-bold text-lg shadow-xl shadow-loops-primary/20 group">
                                            Continue to Checkout
                                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
