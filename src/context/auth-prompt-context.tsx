'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AuthPromptModal } from '@/components/ui/auth-prompt-modal';

type AuthPromptType = 'buy' | 'message' | 'sell' | 'interact';

interface AuthPromptContextType {
    promptAuth: (type?: AuthPromptType, message?: string, title?: string) => void;
}

const AuthPromptContext = createContext<AuthPromptContextType | undefined>(undefined);

export function AuthPromptProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<{
        type: AuthPromptType;
        message?: string;
        title?: string;
    }>({ type: 'interact' });

    const promptAuth = useCallback((type: AuthPromptType = 'interact', message?: string, title?: string) => {
        setConfig({ type, message, title });
        setIsOpen(true);
    }, []);

    const closePrompt = () => setIsOpen(false);

    return (
        <AuthPromptContext.Provider value={{ promptAuth }}>
            {children}
            <AuthPromptModal 
                isOpen={isOpen} 
                onClose={closePrompt} 
                actionType={config.type}
                message={config.message}
                title={config.title}
            />
        </AuthPromptContext.Provider>
    );
}

export function useAuthPrompt() {
    const context = useContext(AuthPromptContext);
    if (context === undefined) {
        throw new Error('useAuthPrompt must be used within an AuthPromptProvider');
    }
    return context;
}
