'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/layout/navbar';
import { ProductCard } from '@/components/ui/product-card';
import { Button } from '@/components/ui/button';
import { Rating } from '@/components/ui/rating';
import { Package, Zap, MapPin, Sparkles, ShieldCheck, Share2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CURRENCY, FALLBACK_PRODUCT_IMAGE } from '@/lib/constants';
import Link from 'next/link';

export default function PublicStorefront() {
    const { username } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchStore = async () => {
            if (!username) return;

            // Fetch profile by username
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*, campuses(*)')
                .eq('username', username)
                .single();

            if (profileError || !profileData) {
                setLoading(false);
                return;
            }

            setProfile(profileData);

            // Fetch active listings for this user
            const { data: listingsData } = await supabase
                .from('listings')
                .select('*')
                .eq('seller_id', profileData.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (listingsData) setListings(listingsData);
            setLoading(false);
        };

        fetchStore();
    }, [username, supabase]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${profile?.store_name || profile?.full_name}'s Store`,
                text: `Check out ${profile?.full_name}'s listings on Loops!`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard! 🚀");
        }
    };

    if (loading) return null;

    if (!profile) {
        return (
            <div className="min-h-screen bg-loops-bg flex items-center justify-center p-6 text-center">
                <div className="space-y-6">
                    <div className="text-6xl font-display font-bold text-loops-primary opacity-20 italic">404.</div>
                    <h1 className="text-2xl font-bold font-display text-loops-main">This Loop is empty.</h1>
                    <p className="text-loops-muted max-w-xs">We couldn't find a student plug with the username "@{username}".</p>
                    <Link href="/browse">
                        <Button className="bg-loops-primary text-white font-bold uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl shadow-xl shadow-loops-primary/20">Back to Marketplace</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />

            <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "w-full h-48 md:h-80 rounded-[2.5rem] relative overflow-hidden group shadow-2xl mb-12",
                        profile.store_banner_color || "bg-loops-primary"
                    )}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-sm font-black text-white uppercase tracking-[0.3em]">Verified Merchant</span>
                            </div>
                            <h1 className="text-4xl md:text-7xl font-display font-bold text-white tracking-tighter italic leading-tight">
                                {profile.store_name || profile.full_name}
                            </h1>
                        </div>
                        <Button
                            onClick={handleShare}
                            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 h-14 px-8 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 group transition-all"
                        >
                            <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            Share Store
                        </Button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Sidebar Information */}
                    <div className="space-y-8">
                        <div className="p-8 rounded-3xl bg-white border border-loops-border shadow-xl shadow-loops-primary/5 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-2xl bg-loops-primary/5 border border-loops-primary/10 flex items-center justify-center overflow-hidden">
                                    {profile.store_logo_url ? (
                                        <img src={profile.store_logo_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-3xl font-bold font-display text-loops-primary">{profile.full_name?.charAt(0)}</div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold font-display">{profile.full_name}</h2>
                                        {profile.is_verified && <ShieldCheck className="w-5 h-5 text-loops-success" />}
                                    </div>
                                    <div className="flex items-center gap-2 text-loops-muted font-bold text-[10px] uppercase tracking-widest">
                                        <MapPin className="w-3.5 h-3.5 text-loops-primary" />
                                        {profile.campuses?.name}
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-loops-muted leading-relaxed italic">
                                "{profile.store_description || profile.bio || "Welcome to my corner of the Loop! Browse my items below."}"
                            </p>

                            <div className="h-px bg-loops-border" />

                            <div className="flex items-center justify-between">
                                <div className="text-center flex-1">
                                    <div className="text-2xl font-bold font-display text-loops-primary tracking-tighter">{profile.reputation || 0}</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-loops-muted">Reputation</div>
                                </div>
                                <div className="w-px h-8 bg-loops-border" />
                                <div className="text-center flex-1">
                                    <div className="text-2xl font-bold font-display text-loops-main tracking-tighter">{listings.length}</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-loops-muted">Listings</div>
                                </div>
                                <div className="w-px h-8 bg-loops-border" />
                                <div className="text-center flex-1">
                                    <div className="text-2xl font-bold font-display text-loops-success tracking-tighter">{Number(profile.rating || 0).toFixed(1)}</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-loops-muted">Rating</div>
                                </div>
                            </div>

                            <Link href={`https://wa.me/${profile.whatsapp_number}`}>
                                <Button className="w-full h-14 bg-loops-success text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-loops-success/20 hover:scale-[1.02] transition-all">
                                    Contact on WhatsApp
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Listings Grid */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold font-display tracking-tight text-loops-main uppercase tracking-tighter italic">
                                Active Collection.
                            </h2>
                        </div>

                        {listings.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {listings.map((listing, idx) => (
                                    <ProductCard
                                        key={listing.id}
                                        id={listing.id}
                                        title={listing.title}
                                        price={`${CURRENCY}${listing.price}`}
                                        category={listing.category}
                                        image={listing.images?.[0] || FALLBACK_PRODUCT_IMAGE}
                                        author={profile}
                                        delay={idx * 0.05}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 rounded-[2.5rem] border-2 border-dashed border-loops-border bg-loops-subtle/50 italic">
                                <Package className="w-16 h-16 text-loops-muted/10 mx-auto mb-4" />
                                <h3 className="text-xl font-bold font-display text-loops-muted uppercase tracking-widest tracking-tighter">Inventory Empty.</h3>
                                <p className="text-loops-muted mt-2">This Plug has no active listings at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
