'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onClose: (id: string) => void;
}

export function LoopsToast({ id, message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-loops-success" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-loops-primary" />,
        warning: <Bell className="w-5 h-5 text-loops-accent" />,
    };

    const colors = {
        success: "border-loops-success/20 bg-loops-success/5",
        error: "border-red-500/20 bg-red-50",
        info: "border-loops-primary/20 bg-loops-primary/5",
        warning: "border-loops-accent/20 bg-loops-accent/5",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[300px] max-w-md",
                colors[type]
            )}
        >
            <div className="flex-shrink-0">
                {icons[type]}
            </div>
            <div className="flex-1 text-sm font-bold text-loops-main leading-tight">
                {message}
            </div>
            <button
                onClick={() => onClose(id)}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
                <X className="w-4 h-4 text-loops-muted" />
            </button>
        </motion.div>
    );
}
