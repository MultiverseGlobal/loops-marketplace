"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Send, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationBannerProps {
    email?: string;
    isVerified?: boolean;
}

export function VerificationBanner({ email, isVerified = false }: VerificationBannerProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const supabase = createClient();

    if (isVerified || !isVisible) return null;

    const handleSendVerification = async () => {
        if (!email) {
            alert('Email address not found. Please log out and log in again.');
            return;
        }

        setIsLoading(true);
        try {
            // Use signInWithOtp to send verification email
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    shouldCreateUser: false
                }
            });

            if (error) {
                console.error('Verification email error:', error);
                throw new Error(error.message || 'Failed to send verification email');
            }

            setIsSent(true);
            setTimeout(() => setIsSent(false), 10000); // Reset after 10 seconds
        } catch (error: any) {
            console.error("Error sending verification email:", error);
            alert(error.message || 'Failed to send verification email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="w-full bg-amber-50 border-b border-amber-200 shadow-sm"
            >
                <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-amber-900">
                        <div className="p-2 bg-amber-100 rounded-full shrink-0">
                            {isSent ? (
                                <CheckCircle2 className="w-5 h-5 text-amber-600" />
                            ) : (
                                <ShieldAlert className="w-5 h-5 text-amber-600" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-sm font-bold uppercase tracking-wide">
                                {isSent ? "Check Your Inbox" : "Verification Required"}
                            </h3>
                            <p className="text-xs sm:text-sm font-medium opacity-90">
                                {isSent
                                    ? `We sent a magic link to ${email}. Click it to unlock selling & messaging.`
                                    : "Verify your .edu email to start selling items and messaging verified peers."
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {!isSent && (
                            <Button
                                onClick={handleSendVerification}
                                disabled={isLoading}
                                className="flex-1 sm:flex-none text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20"
                                size="sm"
                            >
                                {isLoading ? "Sending..." : "Verify Email"}
                                {!isLoading && <Send className="w-3 h-3 ml-2" />}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsVisible(false)}
                            className="h-8 w-8 text-amber-800 hover:bg-amber-100 rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
