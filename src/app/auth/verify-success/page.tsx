'use client';

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, GraduationCap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { triggerSuccessBlast } from "@/lib/confetti";
import { InfinityLogo } from "@/components/ui/infinity-logo";

export default function VerifySuccessPage() {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Celebrate!
        triggerSuccessBlast();

        // Auto redirect timer
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.href = '/';
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-loops-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-loops-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-loops-energetic/5 rounded-full blur-[100px] animate-pulse delay-700" />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-loops-border text-center space-y-8 relative"
            >
                {/* Branding */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-loops-primary/10 rounded-2xl flex items-center justify-center text-loops-primary">
                        <InfinityLogo className="w-10 h-10" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative inline-block">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                            className="w-24 h-24 bg-loops-success/10 rounded-full flex items-center justify-center text-loops-success mx-auto"
                        >
                            <CheckCircle2 className="w-12 h-12" />
                        </motion.div>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-2 border-2 border-dashed border-loops-success/30 rounded-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-black font-display tracking-tighter text-loops-main italic">
                            Verified <span className="text-loops-primary">& Ready.</span>
                        </h1>
                        <p className="text-loops-muted text-sm font-medium leading-relaxed text-center">
                            Congratulations! Your university email has been synced with the Loop. You now have full access to trade and connect on campus.
                        </p>
                    </div>
                </div>

                {/* Features Unlocked */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="p-4 rounded-2xl bg-loops-subtle border border-loops-border flex flex-col items-center gap-2 text-center">
                        <ShieldCheck className="w-5 h-5 text-loops-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-loops-main">Secure Handshake</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-loops-subtle border border-loops-border flex flex-col items-center gap-2 text-center">
                        <GraduationCap className="w-5 h-5 text-loops-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-loops-main">Verified Badge</span>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <Link href="/">
                        <Button className="w-full h-14 bg-loops-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-loops-primary/20 hover:scale-[1.02] transition-all group">
                            Enter the Marketplace
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    
                    <p className="text-[10px] font-bold text-loops-muted uppercase tracking-[0.2em]">
                        Redirecting to campus feed in {countdown}s...
                    </p>
                </div>

                {/* Abstract Decoration */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-loops-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-loops-energetic/5 rounded-full blur-3xl pointer-events-none" />
            </motion.div>
        </div>
    );
}
