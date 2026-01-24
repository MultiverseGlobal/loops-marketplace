'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { LoopsModal } from '@/components/ui/loops-modal';

type ModalOptions = {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'warning' | 'danger' | 'info';
};

type ModalContextType = {
    confirm: (options: ModalOptions) => Promise<boolean>;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [modal, setModal] = useState<(ModalOptions & { isOpen: boolean }) | null>(null);
    const resolverRef = useRef<(value: boolean) => void>(() => {});

    const confirm = useCallback((options: ModalOptions) => {
        setModal({ ...options, isOpen: true });
        return new Promise<boolean>((resolve) => {
            resolverRef.current = resolve;
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setModal(null);
        resolverRef.current(true);
    }, []);

    const handleCancel = useCallback(() => {
        setModal(null);
        resolverRef.current(false);
    }, []);

    return (
        <ModalContext.Provider value={{ confirm }}>
            {children}
            {modal && (
                <LoopsModal
                    isOpen={modal.isOpen}
                    title={modal.title}
                    message={modal.message}
                    confirmLabel={modal.confirmLabel}
                    cancelLabel={modal.cancelLabel}
                    type={modal.type}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}
