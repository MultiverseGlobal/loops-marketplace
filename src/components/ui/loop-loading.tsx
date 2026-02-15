'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Infinity, Zap, Package, Sparkles } from 'lucide-react';

interface LoopLoadingProps {
    type: 'product' | 'service';
    onComplete?: () => void;
}

const PRODUCT_MESSAGES = [
    "Weaving commerce threads...",
    "Summoning exchange energies...",
    "Connecting buyer & seller nodes...",
    "Initializing marketplace coordinates...",
    "Opening trade portal...",
    "Synchronizing transaction vibes...",
];

const SERVICE_MESSAGES = [
    "Forging service loop...",
    "Channeling skill exchange...",
    "Binding collaboration circles...",
    "Unlocking partnership frequencies...",
    "Activating talent bridge...",
    "Tuning service wavelength...",
];

export function LoopLoading({ type, onComplete }: LoopLoadingProps) {
    const [messageIndex, setMessageIndex] = useState(0);
    const messages = type === 'product' ? PRODUCT_MESSAGES : SERVICE_MESSAGES;

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => {
                if (prev >= messages.length - 1) {
                    clearInterval(interval);
                    setTimeout(() => onComplete?.(), 300);
                    return prev;
                }
                return prev + 1;
            });
        }, 600);

        return () => clearInterval(interval);
    }, [messages.length, onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
            <div className="text-center space-y-8 px-6">
                {/* Animated Icon */}
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1, repeat: Infinity }
                    }}
                    className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-loops-primary to-loops-secondary flex items-center justify-center shadow-2xl shadow-loops-primary/50"
                >
                    {type === 'product' ? (
                        <Package className="w-10 h-10 text-white" />
                    ) : (
                        <Zap className="w-10 h-10 text-white" />
                    )}
                </motion.div>

                {/* Message Carousel */}
                <div className="h-16 relative">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={messageIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="text-2xl font-bold font-display text-white italic tracking-tight"
                        >
                            {messages[messageIndex]}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Infinity Symbol */}
                <div className="flex items-center justify-center gap-2">
                    <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <Infinity className="w-8 h-8 text-loops-primary" />
                    </motion.div>
                    <Sparkles className="w-4 h-4 text-loops-secondary animate-pulse" />
                </div>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2">
                    {messages.map((_, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ scale: 0.8, opacity: 0.3 }}
                            animate={{
                                scale: idx === messageIndex ? 1.2 : 0.8,
                                opacity: idx <= messageIndex ? 1 : 0.3,
                            }}
                            className={`w-2 h-2 rounded-full ${idx <= messageIndex ? 'bg-loops-primary' : 'bg-white/20'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
