'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Camera, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { useToast } from '@/context/toast-context';
import confetti from 'canvas-confetti';

interface QRHandshakeProps {
    mode: 'generate' | 'scan';
    transactionId?: string;
    token?: string; // Only needed for generate mode
    onSuccess?: () => void;
    onClose?: () => void;
}

export function QRHandshake({ mode, transactionId, token, onSuccess, onClose }: QRHandshakeProps) {
    const [status, setStatus] = useState<'idle' | 'scanning' | 'verifying' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const toast = useToast();

    // Mode: Generate (Seller)
    const qrData = JSON.stringify({
        tid: transactionId,
        tok: token
    });

    // Mode: Scan (Buyer)
    useEffect(() => {
        if (mode === 'scan' && status === 'idle') {
            startScanner();
        }
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, [mode, status]);

    const startScanner = () => {
        setStatus('scanning');
        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;
    };

    const onScanSuccess = async (decodedText: string) => {
        if (scannerRef.current) {
            await scannerRef.current.clear();
        }
        
        try {
            const data = JSON.parse(decodedText);
            if (data.tid && data.tok) {
                verifyHandshake(data.tid, data.tok);
            } else {
                throw new Error("Invalid Handshake QR Code");
            }
        } catch (e) {
            setStatus('error');
            setErrorMessage("Invalid QR Code format. Please scan a valid Loops Handshake.");
        }
    };

    const onScanFailure = (error: any) => {
        // Just log, don't stop scanning
        // console.warn(`QR error = ${error}`);
    };

    const verifyHandshake = async (tid: string, tok: string) => {
        setStatus('verifying');
        try {
            const res = await fetch('/api/transactions/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transaction_id: tid, token: tok })
            });

            const result = await res.json();

            if (res.ok && result.success) {
                setStatus('success');
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#10b981', '#34d399', '#ffffff']
                });
                toast.success("Handshake Verified! Loop Synced. 🤝");
                if (onSuccess) setTimeout(onSuccess, 2000);
            } else {
                setStatus('error');
                setErrorMessage(result.error || "Verification failed");
            }
        } catch (error) {
            setStatus('error');
            setErrorMessage("Network error during verification");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-loops-main/40 backdrop-blur-xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-[3rem] p-8 relative overflow-hidden shadow-2xl"
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-loops-subtle text-loops-muted transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className={cn(
                            "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg",
                            mode === 'generate' ? "bg-loops-primary text-white" : "bg-loops-accent/10 text-loops-accent"
                        )}>
                            {mode === 'generate' ? <ShieldCheck className="w-8 h-8" /> : <Camera className="w-8 h-8" />}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black italic tracking-tighter text-loops-main">
                            {mode === 'generate' ? "Secure Handshake" : "Verify Pickup"}
                        </h2>
                        <p className="text-sm text-loops-muted leading-relaxed max-w-[280px] mx-auto">
                            {mode === 'generate' 
                                ? "Let the buyer scan this code to confirm physical receipt of the item." 
                                : "Scan the seller's Handshake QR to verify the pickup and release funds."}
                        </p>
                    </div>

                    <div className="relative">
                        <AnimatePresence mode="wait">
                            {mode === 'generate' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-8 bg-loops-subtle rounded-[2rem] border-2 border-loops-primary/20 flex items-center justify-center mx-auto w-fit"
                                >
                                    <QRCodeSVG 
                                        value={qrData} 
                                        size={200}
                                        fgColor="#000000"
                                        level="H"
                                        includeMargin={true}
                                    />
                                </motion.div>
                            )}

                            {mode === 'scan' && status === 'scanning' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="overflow-hidden rounded-[2rem] border-2 border-loops-accent/20 bg-loops-main/5 min-h-[300px]"
                                >
                                    <div id="qr-reader" className="w-full"></div>
                                </motion.div>
                            )}

                            {status === 'verifying' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-20 flex flex-col items-center gap-4"
                                >
                                    <RefreshCw className="w-12 h-12 text-loops-primary animate-spin" />
                                    <p className="font-bold text-loops-primary uppercase tracking-widest text-[10px]">Syncing Loop...</p>
                                </motion.div>
                            )}

                            {status === 'success' && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-16 flex flex-col items-center gap-4 text-loops-primary"
                                >
                                    <CheckCircle2 className="w-20 h-20" />
                                    <p className="font-black italic text-xl">Loop Synced!</p>
                                </motion.div>
                            )}

                            {status === 'error' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-12 flex flex-col items-center gap-6"
                                >
                                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                                        <AlertCircle className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-bold text-red-500">Verification Error</p>
                                        <p className="text-xs text-loops-muted px-6">{errorMessage}</p>
                                    </div>
                                    <Button 
                                        variant="outline"
                                        onClick={() => { setStatus('idle'); setTimeout(startScanner, 100); }}
                                    >
                                        Try Again
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="pt-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-loops-muted opacity-40">
                            Verified Peer-to-Peer Protocol
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
