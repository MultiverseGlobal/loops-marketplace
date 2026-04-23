'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ShieldCheck, Zap, ArrowRight, ShoppingBag, MessageSquare, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AuthPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    actionType?: 'buy' | 'message' | 'sell' | 'interact';
}

export function AuthPromptModal({ 
    isOpen, 
    onClose, 
    title = "Join the Loop.", 
    message = "You're just one step away from the full campus experience. Join your peers today.",
    actionType = 'interact'
}: AuthPromptModalProps) {
    if (!isOpen) return null;

    const actionMeta = {
        buy: {
            icon: <ShoppingBag className="w-8 h-8" />,
            label: "Join to Secure this Deal",
            benefit: "Safe Handshakes & Escrow Protection"
        },
        message: {
            icon: <MessageSquare className="w-8 h-8" />,
            label: "Connect with the Seller",
            benefit: "Verified Direct student-to-student chat"
        },
        sell: {
            icon: <Zap className="w-8 h-8 text-loops-vibrant" />,
            label: "Start your own Loop",
            benefit: "Reach thousands of students instantly"
        },
        interact: {
            icon: <Sparkles className="w-8 h-8" />,
            label: "Unlock Full Access",
            benefit: "The economic nervous system of campus"
        }
    }[actionType];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-loops-main/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
                >
                    {/* Top Decorative Banner */}
                    <div className="h-32 bg-loops-main relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-loops-primary/20 via-transparent to-loops-vibrant/10" />
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-loops-primary/10 rounded-full blur-[60px]" />
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="relative z-10"
                        >
                            <Infinity className="w-16 h-16 text-white/10" />
                        </motion.div>
                    </div>

                    <div className="p-8 sm:p-10 -mt-12 relative z-20">
                        <div className="flex flex-col items-center text-center space-y-6">
                            {/* Action Icon */}
                            <motion.div 
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl border border-loops-border flex items-center justify-center text-loops-primary"
                            >
                                {actionMeta.icon}
                            </motion.div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-black font-display tracking-tighter italic text-loops-main leading-none">
                                    {actionMeta.label}
                                </h2>
                                <p className="text-loops-muted text-sm font-medium">
                                    {message}
                                </p>
                            </div>

                            {/* Benefits Grid */}
                            <div className="grid grid-cols-1 gap-3 w-full py-2">
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-loops-subtle border border-loops-border text-left">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-loops-success border border-loops-border">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-loops-main">{actionMeta.benefit}</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-loops-subtle border border-loops-border text-left">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-loops-primary border border-loops-border">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-loops-main">Real-time campus network alerts</span>
                                </div>
                            </div>

                            {/* Primary Actions */}
                            <div className="flex flex-col gap-3 w-full pt-4">
                                <Link href="/login?view=signup" className="w-full">
                                    <Button className="w-full h-14 bg-loops-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-loops-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                        Join the Loop now <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link href="/login" className="w-full">
                                    <Button variant="ghost" className="w-full h-14 font-bold text-loops-muted hover:text-loops-primary rounded-2xl">
                                        Sign In to your Account
                                    </Button>
                                </Link>
                            </div>

                            <button 
                                onClick={onClose}
                                className="text-[10px] uppercase font-black tracking-[0.2em] text-loops-muted/40 hover:text-loops-muted transition-colors pt-2"
                            >
                                Continue Browsing as Guest
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatePresence>
    );
}
