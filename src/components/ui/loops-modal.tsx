'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoopsModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'warning' | 'danger' | 'info';
}

export function LoopsModal({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    type = 'info'
}: LoopsModalProps) {
    if (!isOpen) return null;

    const icons = {
        warning: <AlertTriangle className="w-6 h-6 text-loops-accent" />,
        danger: <AlertTriangle className="w-6 h-6 text-red-500" />,
        info: <HelpCircle className="w-6 h-6 text-loops-primary" />,
    };

    const buttonStyles = {
        warning: "bg-loops-accent hover:bg-loops-accent/90",
        danger: "bg-red-500 hover:bg-red-600",
        info: "bg-loops-primary hover:bg-loops-primary/90",
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCancel}
                    className="absolute inset-0 bg-loops-main/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-loops-border"
                >
                    <div className="p-8 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className={cn(
                                "p-3 rounded-2xl flex-shrink-0",
                                type === 'danger' ? "bg-red-50" : type === 'warning' ? "bg-loops-accent/10" : "bg-loops-primary/10"
                            )}>
                                {icons[type]}
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold font-display text-loops-main tracking-tight">{title}</h3>
                                <p className="text-loops-muted text-sm leading-relaxed">{message}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                onClick={onCancel}
                                className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] text-loops-muted hover:bg-loops-subtle"
                            >
                                {cancelLabel}
                            </Button>
                            <Button
                                onClick={onConfirm}
                                className={cn(
                                    "flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] text-white shadow-xl transition-all",
                                    buttonStyles[type],
                                    type === 'danger' ? "shadow-red-500/20" : type === 'warning' ? "shadow-loops-accent/20" : "shadow-loops-primary/20"
                                )}
                            >
                                {confirmLabel}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
