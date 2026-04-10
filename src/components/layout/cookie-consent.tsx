'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("loops-cookie-consent");
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("loops-cookie-consent", "true");
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-[100]"
                >
                    <div className="bg-white rounded-[2rem] border border-loops-border shadow-2xl p-6 md:p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-loops-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-loops-primary/10 transition-colors" />
                        
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-loops-primary/10 flex items-center justify-center text-loops-primary">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h3 className="font-black italic text-lg uppercase tracking-tight">Privacy Check</h3>
                            </div>
                            
                            <p className="text-loops-muted text-xs leading-relaxed font-medium">
                                We use cookies and institutional data to keep the Loop safe for students. By staying, you agree to our 
                                <Link href="/privacy" className="text-loops-primary font-bold hover:underline mx-1">Privacy Policy</Link> 
                                and 
                                <Link href="/terms" className="text-loops-primary font-bold hover:underline ml-1">Terms</Link>.
                            </p>

                            <div className="flex gap-3 pt-2">
                                <Button 
                                    onClick={handleAccept}
                                    className="flex-1 rounded-xl bg-loops-main text-white font-bold h-11 hover:scale-[1.02] transition-transform"
                                >
                                    Accept & Sync
                                </Button>
                                <Button 
                                    variant="ghost"
                                    onClick={() => setIsVisible(false)}
                                    className="rounded-xl text-loops-muted hover:text-loops-main h-11"
                                >
                                    Dismiss
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
