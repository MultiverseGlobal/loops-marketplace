'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type CampusBranding = {
    id: string;
    primary: string;
    secondary: string;
    accent: string;
    name: string;
    slug: string;
    type: 'public' | 'private';
    terms: Record<string, string>;
};

const CAMPUS_DEFAULT_TERMS = {
    communityName: 'Campus Loop',
    listingName: 'Drop',
    listingAction: 'Post a Drop',
    sellerName: 'Plug',
    buyerName: 'Buyer',
    statusActive: 'Vibing',
    statusPending: 'Locked In',
    statusCompleted: 'Deal Sealed',
    marketplaceName: 'The Feed',
    pickupLabel: 'The Spot',
    reputationLabel: 'Karma',
};

type CampusContextType = {
    campus: CampusBranding | null;
    loading: boolean;
    getTerm: (key: keyof typeof CAMPUS_DEFAULT_TERMS) => string;
    selectCampus: (campusId: string) => Promise<void>;
};

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export function CampusProvider({ children }: { children: React.ReactNode }) {
    const [campus, setCampus] = useState<CampusBranding | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchCampusDetails = async (campusId: string) => {
        const response = await supabase
            .from('campuses')
            .select('*')
            .eq('id', campusId)
            .single();

        const dbCampus = response?.data;
        const error = response?.error;

        if (dbCampus && !error) {
            return {
                id: dbCampus.id,
                primary: dbCampus.primary_color || '#1e40af',
                secondary: dbCampus.secondary_color || '#3b82f6',
                accent: dbCampus.accent_color || '#fbbf24',
                name: dbCampus.name,
                slug: dbCampus.slug,
                type: dbCampus.type || 'public',
                terms: dbCampus.terms || CAMPUS_DEFAULT_TERMS,
            } as CampusBranding;
        }
        return null;
    };

    const selectCampus = async (campusId: string) => {
        const details = await fetchCampusDetails(campusId);
        if (details) {
            setCampus(details);
            localStorage.setItem('loops_last_campus_id', campusId);
        }
    };

    useEffect(() => {
        const initializeCampus = async () => {
            setLoading(true);
            try {
                // 1. Check Auth User
                const authResponse = await supabase.auth.getUser();
                const user = authResponse?.data?.user;
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('campus_id')
                        .eq('id', user.id)
                        .single();

                    if (profile?.campus_id) {
                        const details = await fetchCampusDetails(profile.campus_id);
                        if (details) {
                            setCampus(details);
                            setLoading(false);
                            return;
                        }
                    }
                }

                // 2. Fallback to LocalStorage for guests
                const guestCampusId = localStorage.getItem('loops_last_campus_id');
                if (guestCampusId) {
                    const details = await fetchCampusDetails(guestCampusId);
                    if (details) {
                        setCampus(details);
                    }
                }
            } catch (err) {
                console.error("Campus Initialization Error:", err);
            } finally {
                setLoading(false);
            }
        };

        initializeCampus();
    }, [supabase]);

    useEffect(() => {
        if (campus) {
            document.documentElement.style.setProperty('--loops-primary', campus.primary);
            document.documentElement.style.setProperty('--loops-secondary', campus.secondary);
            document.documentElement.style.setProperty('--loops-accent', campus.accent);
        } else {
            // Reset to defaults if no campus
            document.documentElement.style.setProperty('--loops-primary', '#1e40af');
            document.documentElement.style.setProperty('--loops-secondary', '#3b82f6');
            document.documentElement.style.setProperty('--loops-accent', '#fbbf24');
        }
    }, [campus]);

    const getTerm = (key: keyof typeof CAMPUS_DEFAULT_TERMS) => {
        return campus?.terms?.[key] || CAMPUS_DEFAULT_TERMS[key];
    };

    return (
        <CampusContext.Provider value={{ campus, loading, getTerm, selectCampus }}>
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
