'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type CampusBranding = {
    primary: string;
    secondary: string;
    accent: string;
    name: string;
    slug: string;
    terms: Record<string, string>;
};

const CAMPUS_DEFAULT_TERMS = {
    communityName: 'Campus Loop',
    listingName: 'Drop',
    listingAction: 'Post a Drop',
    sellerName: 'Plug',
    buyerName: 'Hubber',
    statusActive: 'Vibing',
    statusPending: 'Locked In',
    statusCompleted: 'Deal Sealed',
    marketplaceName: 'The Feed',
    pickupLabel: 'The Spot',
};

type CampusContextType = {
    campus: CampusBranding | null;
    loading: boolean;
    getTerm: (key: keyof typeof CAMPUS_DEFAULT_TERMS) => string;
};

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export function CampusProvider({ children }: { children: React.ReactNode }) {
    const [campus, setCampus] = useState<CampusBranding | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchCampus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*, campuses(*)')
                    .eq('id', user.id)
                    .single();

                if (profile?.campuses) {
                    const dbCampus = profile.campuses;
                    setCampus({
                        primary: dbCampus.primary_color || '#1e40af',
                        secondary: dbCampus.secondary_color || '#3b82f6',
                        accent: dbCampus.accent_color || '#fbbf24',
                        name: dbCampus.name,
                        slug: dbCampus.slug,
                        terms: dbCampus.terms || CAMPUS_DEFAULT_TERMS,
                    } as CampusBranding);
                }
            }
            setLoading(false);
        };

        fetchCampus();
    }, [supabase]);

    useEffect(() => {
        if (campus) {
            document.documentElement.style.setProperty('--loops-primary', campus.primary);
            document.documentElement.style.setProperty('--loops-secondary', campus.secondary);
            document.documentElement.style.setProperty('--loops-accent', campus.accent);
        }
    }, [campus]);

    const getTerm = (key: keyof typeof CAMPUS_DEFAULT_TERMS) => {
        return campus?.terms?.[key] || CAMPUS_DEFAULT_TERMS[key];
    };

    return (
        <CampusContext.Provider value={{ campus, loading, getTerm }}>
            {children}
        </CampusContext.Provider>
    );
}

export function useCampus() {
    const context = useContext(CampusContext);
    if (context === undefined) {
        throw new Error('useCampus must be used within a CampusProvider');
    }
    return context;
}
