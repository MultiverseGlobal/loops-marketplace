'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LoopsToast, ToastType } from '@/components/ui/loops-toast';
import { LoopsModal } from '@/components/ui/loops-modal';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ModalState {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'warning' | 'danger' | 'info';
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
}

interface UIContextType {
    toast: (message: string, type?: ToastType) => void;
    confirm: (options: Partial<ModalState>) => Promise<boolean>;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [modal, setModal] = useState<ModalState>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        onConfirm: () => { },
    });
    const [modalResolver, setModalResolver] = useState<((value: boolean) => void) | null>(null);

    const toast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const confirm = useCallback((options: Partial<ModalState>) => {
        return new Promise<boolean>((resolve) => {
            setModal({
                isOpen: true,
                title: options.title || 'Are you sure?',
                message: options.message || 'This action cannot be undone.',
                type: options.type || 'info',
                confirmLabel: options.confirmLabel || 'Confirm',
                cancelLabel: options.cancelLabel || 'Cancel',
                onConfirm: () => {
                    setModal((prev) => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
            });
            setModalResolver(() => resolve);
        });
    }, []);

    const closeHighlight = () => {
        setModal((prev) => ({ ...prev, isOpen: false }));
        if (modalResolver) modalResolver(false);
    };

    return (
        <UIContext.Provider value={{ toast, confirm }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <LoopsToast
                            key={t.id}
                            id={t.id}
                            message={t.message}
                            type={t.type}
                            onClose={removeToast}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Global Modal */}
            <LoopsModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                confirmLabel={modal.confirmLabel}
                cancelLabel={modal.cancelLabel}
                onConfirm={modal.onConfirm}
                onCancel={closeHighlight}
            />
        </UIContext.Provider>
    );
}

export function useLoopsUI() {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useLoopsUI must be used within a UIProvider');
    }
    return context;
}
