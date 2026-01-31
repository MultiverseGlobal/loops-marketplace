'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { ShieldCheck, Star, Package, Settings, ExternalLink, Calendar, MapPin, Zap, MessageSquare, Phone } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/context/toast-context";
import { useCampus } from "@/context/campus-context";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'selling' | 'buying'>('selling');
    const searchParams = useSearchParams();
    const targetUserId = searchParams.get('u');
    const supabase = createClient();
    const toast = useToast();
    const { campus, getTerm } = useCampus();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            setUser(authUser);

            const userIdToFetch = targetUserId || authUser?.id;

            if (userIdToFetch) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*, campuses(*)')
                    .eq('id', userIdToFetch)
                    .single();

                if (profileData) {
                    setProfile(profileData);
                    // Set default tab only for the owner
                    if (!targetUserId && profileData.primary_role) {
                        setActiveTab(profileData.primary_role as 'selling' | 'buying');
                    }
                }

                const { data: listingsData } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('seller_id', userIdToFetch)
                    .order('created_at', { ascending: false });

                if (listingsData) setListings(listingsData);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [supabase, targetUserId]);

    if (loading) return null;

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />

            <main className="pt-32 pb-20 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Sidebar / Info */}
                    <div className="space-y-8">
                        <div className="relative p-6 md:p-8 rounded-3xl bg-loops-subtle border border-loops-border shadow-2xl shadow-loops-primary/5 overflow-hidden group">
                            {(!targetUserId || targetUserId === user?.id) && (
                                <div className="absolute top-0 right-0 p-4">
                                    <Link href="/profile/settings">
                                        <Button variant="ghost" size="icon" className="text-loops-muted hover:text-loops-primary">
                                            <Settings className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            <div className="relative z-10 space-y-6">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-loops-primary to-loops-secondary p-1 shadow-lg shadow-loops-primary/20">
                                    <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden relative">
                                        {profile?.avatar_url ? (
                                            <Image
                                                src={profile.avatar_url}
                                                alt={profile.full_name || 'Profile'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="text-4xl font-bold font-display text-loops-primary">
                                                {profile?.full_name?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-3xl font-bold font-display tracking-tight text-loops-main">{profile?.full_name || 'Student Name'}</h1>
                                        {profile?.is_verified && (
                                            <ShieldCheck className="w-6 h-6 text-loops-success" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-loops-muted font-medium">
                                        <MapPin className="w-4 h-4 text-loops-primary" />
                                        <span>{profile?.campuses?.name || 'Campus Member'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-loops-muted text-[10px] font-bold uppercase tracking-widest">
                                        <Calendar className="w-4 h-4" />
                                        <span>Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Today'}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-loops-muted leading-relaxed">
                                    {profile?.bio || "No bio yet. This student is busy building their campus legacy."}
                                </p>

                                <div className="h-px bg-loops-border" />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-white border border-loops-border text-center shadow-sm">
                                        <div className="text-2xl font-bold font-display text-loops-primary tracking-tighter">{profile?.reputation || 0}</div>
                                        <div className="text-[10px] uppercase tracking-widest text-loops-muted font-bold">{getTerm('reputationLabel')}</div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white border border-loops-border text-center shadow-sm">
                                        <div className="text-2xl font-bold font-display text-loops-success tracking-tighter">{Number(profile?.rating || 0).toFixed(1)}</div>
                                        <div className="text-[10px] uppercase tracking-widest text-loops-muted font-bold">User Rating</div>
                                    </div>
                                </div>

                                {user?.id !== profile?.id && (
                                    <div className="pt-6 border-t border-loops-border space-y-3">
                                        <Link href={`/messages?u=${profile?.id}`}>
                                            <Button className="w-full bg-loops-primary text-white hover:bg-loops-primary/90 h-12 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                                                <MessageSquare className="w-4 h-4" />
                                                Send {getTerm('communityName')} Message
                                            </Button>
                                        </Link>

                                        {profile?.whatsapp_number && (
                                            <a
                                                href={`https://wa.me/${profile.whatsapp_number.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block"
                                            >
                                                <Button variant="outline" className="w-full border-green-500/20 text-green-600 hover:bg-green-50 h-12 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                                                    <Phone className="w-4 h-4" />
                                                    Chat on WhatsApp
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Archetype Tabs */}
                        {(!targetUserId || targetUserId === user?.id) && (
                            <div className="flex gap-2 p-1 bg-loops-subtle border border-loops-border rounded-2xl w-full sm:w-fit">
                                <button
                                    onClick={() => setActiveTab('selling')}
                                    className={cn(
                                        "flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                                        activeTab === 'selling'
                                            ? "bg-white text-loops-primary shadow-sm ring-1 ring-loops-border"
                                            : "text-loops-muted hover:text-loops-main"
                                    )}
                                >
                                    Selling ({getTerm('sellerName')})
                                </button>
                                <button
                                    onClick={() => setActiveTab('buying')}
                                    className={cn(
                                        "flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                                        activeTab === 'buying'
                                            ? "bg-white text-loops-primary shadow-sm ring-1 ring-loops-border"
                                            : "text-loops-muted hover:text-loops-main"
                                    )}
                                >
                                    Buying ({getTerm('buyerName')})
                                </button>
                            </div>
                        )}

                        {/* Tab Content */}
                        {activeTab === 'selling' ? (
                            <div className="space-y-6">
                                <div className="flex items-end justify-between">
                                    <h2 className="text-2xl font-bold font-display tracking-tight text-loops-main uppercase tracking-tighter italic">
                                        {(!targetUserId || targetUserId === user?.id) ? `Your Active ${getTerm('listingName')}` : `${profile?.full_name}'s ${getTerm('listingName')}`}
                                    </h2>
                                    {(!targetUserId || targetUserId === user?.id) && (
                                        <Link href="/listings/create">
                                            <Button variant="link" className="text-loops-primary p-0 h-auto font-bold uppercase tracking-widest text-xs h-10">Post Something New</Button>
                                        </Link>
                                    )}
                                </div>

                                {listings.length > 0 ? (
                                    <div className="grid gap-4">
                                        {listings.map((listing) => (
                                            <Link
                                                key={listing.id}
                                                href={`/listings/${listing.id}`}
                                                className="group p-6 rounded-2xl bg-loops-subtle border border-loops-border hover:bg-white hover:border-loops-primary/30 transition-all flex items-center gap-6 shadow-sm hover:shadow-lg hover:shadow-loops-primary/5"
                                            >
                                                <div className="w-16 h-16 rounded-xl bg-white border border-loops-border overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                                                    {listing.type === 'product' ? <Package className="w-8 h-8 text-loops-primary opacity-20" /> : <Zap className="w-8 h-8 text-loops-primary opacity-20" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-loops-primary/5 text-loops-primary uppercase tracking-widest">
                                                            {listing.type}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-loops-muted uppercase tracking-tighter italic">
                                                            Status: {listing.status}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-xl truncate group-hover:text-loops-primary transition-colors text-loops-main tracking-tight">
                                                        {listing.title}
                                                    </h3>
                                                    <div className="text-loops-success font-bold text-lg">${listing.price}</div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-loops-muted group-hover:text-loops-primary transition-colors">
                                                    <ExternalLink className="w-5 h-5" />
                                                </Button>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-24 rounded-3xl border border-loops-border bg-loops-subtle/50 italic">
                                        <Package className="w-12 h-12 text-loops-muted/10 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold font-display text-loops-muted uppercase tracking-widest">Your {getTerm('listingName')} is silent.</h3>
                                        <p className="text-loops-muted mt-2">You haven't posted any listings in the {getTerm('communityName')} yet.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-end justify-between">
                                    <h2 className="text-2xl font-bold font-display tracking-tight text-loops-main uppercase tracking-tighter italic">
                                        Purchase Tracking
                                    </h2>
                                </div>
                                <div className="text-center py-24 rounded-3xl border border-loops-border bg-loops-subtle/50 italic">
                                    <MessageSquare className="w-12 h-12 text-loops-muted/10 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold font-display text-loops-muted uppercase tracking-widest">{getTerm('buyerName')} History</h3>
                                    <p className="text-loops-muted mt-2">When you message sellers or buy items, they will appear here for tracking.</p>
                                    <Link href="/browse" className="inline-block mt-4">
                                        <Button className="bg-loops-primary text-white uppercase tracking-widest text-[10px] font-bold h-10 px-6 rounded-xl">Explore Marketplace</Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
