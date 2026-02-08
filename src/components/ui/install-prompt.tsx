'use client';

import { useState, useEffect } from 'react';
import { Button } from './button';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { InfinityLogo } from './infinity-logo';

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if it's iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt after a short delay or based on logic
            setTimeout(() => setIsVisible(true), 3000);
        };

        const handleShowPrompt = () => {
            if (deferredPrompt || isIOS) {
                setIsVisible(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('show-pwa-install', handleShowPrompt);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsVisible(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('show-pwa-install', handleShowPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="fixed bottom-24 left-4 right-4 z-[100] sm:left-auto sm:right-6 sm:bottom-6 sm:w-96"
                >
                    <div className="bg-white rounded-3xl border border-loops-border shadow-2xl p-6 relative overflow-hidden group">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-loops-primary/5 rounded-full blur-3xl group-hover:bg-loops-primary/10 transition-colors" />

                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-4 right-4 text-loops-muted hover:text-loops-main transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex gap-4 items-start relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-loops-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-loops-primary/20">
                                <InfinityLogo className="w-8 h-8 text-white fill-current" />
                            </div>

                            <div className="space-y-1 pr-6">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-loops-main">Install Loops App</h3>
                                    <Sparkles className="w-3 h-3 text-loops-primary animate-pulse" />
                                </div>
                                <p className="text-sm text-loops-muted leading-relaxed">
                                    {isIOS
                                        ? "Tap the share icon and then 'Add to Home Screen' for easy campus access."
                                        : "Add Loops to your home screen for the fastest campus trading experience."}
                                </p>
                            </div>
                        </div>

                        {!isIOS && (
                            <div className="mt-6 flex gap-3">
                                <Button
                                    className="flex-1 h-12 bg-loops-primary text-white font-bold rounded-xl shadow-lg shadow-loops-primary/10"
                                    onClick={handleInstall}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Install Now
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 px-6 border-loops-border text-loops-muted hover:bg-loops-subtle rounded-xl"
                                    onClick={() => setIsVisible(false)}
                                >
                                    Maybe Later
                                </Button>
                            </div>
                        )}

                        {isIOS && (
                            <div className="mt-4 pt-4 border-t border-loops-border flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-loops-muted opacity-60">
                                <Smartphone className="w-3 h-3" />
                                Optimized for iOS
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
