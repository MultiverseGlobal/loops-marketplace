'use client';

import { Navbar } from "../../../components/layout/navbar";
import { Button } from "../../../components/ui/button";
import { ChevronDown, Star, ShieldCheck, Truck, ArrowLeft, MessageSquare, Sparkles, Edit3, Trash2, CheckCircle, Zap, MapPin, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "../../../lib/utils";
import { createClient } from "../../../lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "../../../context/toast-context";
import { useCampus } from "../../../context/campus-context";
import { useModal } from "../../../context/modal-context";
import { FALLBACK_PRODUCT_IMAGE, CURRENCY } from "../../../lib/constants";
import { followUser, unfollowUser, getFollowStatus } from "../../../lib/follows";
import { UserPlus, UserMinus } from "lucide-react";

export default function ListingDetailPage() {
    const { id } = useParams();
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeAccordion, setActiveAccordion] = useState<string | null>("details");
    const [isInteracting, setIsInteracting] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const supabase = createClient();
    const router = useRouter();
    const toast = useToast();
    const { campus, getTerm } = useCampus();
    const modal = useModal();

    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const { data, error } = await supabase
                    .from('listings')
                    .select(`
                        *,
                        profiles:seller_id (
                            id,
                            full_name,
                            store_name,
                            store_banner_color,
                            reputation,
                            email_verified
                        )
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (data) {
                    setListing(data);
                    // Check follow status
                    const following = await getFollowStatus(data.seller_id);
                    setIsFollowing(following);
                }
            } catch (err) {
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id, supabase]);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*, email_verified')
                    .eq('id', user.id)
                    .single();
                setCurrentUser(profile || user);
            }
        }
        fetchUser();
    }, [supabase]);

    if (loading) return null;
    if (!listing) return <div className="min-h-screen bg-loops-bg text-loops-main p-10 flex items-center justify-center font-bold uppercase tracking-widest text-xs">Listing not found.</div>;

    const handleInteraction = async () => {
        setIsInteracting(true);
        if (!currentUser) {
            router.push('/login');
            return;
        }

        if (!currentUser.email_verified) {
            toast.warning("Verification Required: You must verify your university email to contact sellers.");
            setIsInteracting(false);
            return;
        }

        // Check if a message already exists for this listing from this user
        const { data: existing } = await supabase
            .from('messages')
            .select('id')
            .eq('listing_id', id)
            .eq('sender_id', currentUser.id)
            .limit(1);

        if (!existing || existing.length === 0) {
            await supabase
                .from('messages')
                .insert({
                    listing_id: id,
                    sender_id: currentUser.id,
                    receiver_id: listing.seller_id,
                    content: "I'm interested in this listing! Is it still available?"
                });
        }

        router.push(`/messages/${id}?u=${currentUser.id}`);
        setIsInteracting(false);
    };

    const handleMarkSold = async () => {
        const confirmed = await modal.confirm({
            title: "Mark as Sold?",
            message: "This item will be hidden from the Loop feed. Make sure the trade is complete!",
            confirmLabel: "Mark as Sold",
            cancelLabel: "Not Yet",
            type: 'warning'
        });

        if (confirmed) {
            setIsInteracting(true);
            const { error } = await supabase
                .from('listings')
                .update({ status: 'sold' })
                .eq('id', id);

            if (!error) {
                setListing({ ...listing, status: 'sold' });
                toast.success("Listing marked as sold!");
            } else {
                toast.error("Failed to update status.");
            }
            setIsInteracting(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await modal.confirm({
            title: "Delete Listing?",
            message: "Are you sure? This action is permanent and will remove your Pulse from the campus records.",
            confirmLabel: "Permanent Delete",
            cancelLabel: "Keep Listing",
            type: 'danger'
        });

        if (confirmed) {
            setIsInteracting(true);
            const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', id);

            if (!error) {
                toast.success("Listing deleted from the Loop.");
                router.push('/profile');
            } else {
                toast.error("Failed to delete listing.");
                setIsInteracting(false);
            }
        }
    };

    const handleReport = async () => {
        if (!currentUser) {
            router.push('/login');
            return;
        }

        const reason = await modal.confirm({
            title: "Report Listing?",
            message: "What is the issue with this listing? Be specific to help the campus moderators.",
            confirmLabel: "Submit Report",
            cancelLabel: "Cancel",
            type: 'danger'
        });

        if (reason) {
            const { error } = await supabase
                .from('reports')
                .insert({
                    listing_id: id,
                    reporter_id: currentUser.id,
                    reason: "User reported via detail page." // In a real app, you'd collect the reason text
                });

            if (!error) {
                toast.success("Pulse reported. Safety moderators will review it.");
            } else {
                toast.error("Failed to submit report.");
            }
        }
    };

    const handleFollow = async () => {
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await unfollowUser(listing.seller_id);
                setIsFollowing(false);
                toast.success(`Unfollowed ${listing.profiles?.full_name}`);
            } else {
                await followUser(listing.seller_id);
                setIsFollowing(true);
                toast.success(`Following ${listing.profiles?.full_name}!`);
            }
        } catch (err) {
            toast.error("Failed to update follow status.");
        } finally {
            setFollowLoading(false);
        }
    };

    const isOwner = currentUser?.id === listing.seller_id;

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />

            <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/browse" className="inline-flex items-center gap-2 text-loops-muted hover:text-loops-primary mb-8 transition-colors font-bold uppercase tracking-widest text-xs">
                    <ArrowLeft className="w-4 h-4" />
                    Back to {getTerm('marketplaceName')}
                </Link>

                <div className="lg:grid lg:grid-cols-2 lg:gap-x-16">
                    {/* Gallery (Sticky) */}
                    <div className="space-y-4 lg:sticky lg:top-32 lg:h-fit">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative aspect-square overflow-hidden rounded-3xl bg-loops-subtle border border-loops-border shadow-2xl shadow-loops-primary/5"
                        >
                            <Image
                                src={listing.images?.[0] || listing.image_url || FALLBACK_PRODUCT_IMAGE}
                                alt={listing.title}
                                fill
                                className="object-cover"
                            />
                        </motion.div>
                    </div>

                    {/* Listing Info */}
                    <div className="mt-10 lg:mt-0 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-1.5 text-loops-success text-[10px] font-bold uppercase tracking-widest">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Verified {campus?.name || 'Campus'} Plug</span>
                            </div>
                            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-loops-main leading-tight sm:leading-none">{listing.title}</h1>
                            <div className="flex items-center gap-6">
                                <p className="text-3xl sm:text-4xl font-bold text-loops-primary tracking-tighter">{CURRENCY}{listing.price}</p>
                                <div className="h-8 w-px bg-loops-border" />
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-loops-primary/5 rounded-full border border-loops-primary/10">
                                    <span className="text-[10px] text-loops-primary uppercase font-bold tracking-widest leading-none">Type: {listing.type}</span>
                                </div>
                                {listing.pickup_location && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-loops-accent/5 rounded-full border border-loops-accent/10">
                                        <MapPin className="w-4 h-4 text-loops-accent" />
                                        <span className="text-[10px] text-loops-accent uppercase font-bold tracking-widest leading-none">@ {listing.pickup_location}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="h-px bg-loops-border" />

                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-loops-subtle border border-loops-border flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-loops-primary/5 flex items-center justify-center text-loops-primary font-bold border border-loops-primary/20 shadow-sm">
                                        {listing.profiles?.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="font-bold text-loops-main">{listing.profiles?.full_name}</div>
                                            {listing.profiles?.store_name && (
                                                <div className={cn("px-2 py-0.5 rounded-lg text-[8px] font-black text-white uppercase tracking-[0.2em]", listing.profiles.store_banner_color || 'bg-loops-primary')}>
                                                    {listing.profiles.store_name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-loops-muted uppercase tracking-widest font-bold">Plug Reputation: {listing.profiles?.reputation || 0}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!isOwner && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleFollow}
                                            disabled={followLoading}
                                            className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest h-9 rounded-lg transition-all",
                                                isFollowing ? "bg-loops-subtle text-loops-muted border-loops-border" : "border-loops-primary text-loops-primary hover:bg-loops-primary/5"
                                            )}
                                        >
                                            {isFollowing ? (
                                                <>
                                                    <UserMinus className="w-3.5 h-3.5 mr-1.5" />
                                                    Unfollow
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                                                    Follow
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    <Link href={`/profile?u=${listing.seller_id}`}>
                                        <Button variant="ghost" className="text-loops-primary text-xs font-bold uppercase tracking-widest hover:bg-loops-primary/10 transition-all">View Profile</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {isOwner ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-loops-primary/5 border border-loops-primary/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-loops-primary font-bold text-xs uppercase tracking-widest">
                                        <Zap className="w-4 h-4" />
                                        Listing Management
                                    </div>
                                    <div className="text-[10px] font-bold text-loops-muted uppercase">Status: {listing.status}</div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Link href={`/listings/${id}/edit`} className="flex-1">
                                        <Button className="w-full h-16 text-lg font-bold bg-white border border-loops-border hover:bg-loops-subtle text-loops-main shadow-sm transition-all">
                                            <Edit3 className="w-5 h-5 mr-3 text-loops-primary" />
                                            Edit Listing
                                        </Button>
                                    </Link>
                                    <Button
                                        onClick={handleMarkSold}
                                        disabled={isInteracting || listing.status === 'sold'}
                                        className="h-16 text-lg font-bold bg-loops-success hover:bg-loops-success/90 text-white shadow-xl shadow-loops-success/20 transition-all font-display"
                                    >
                                        <CheckCircle className="w-5 h-5 mr-3" />
                                        {listing.status === 'sold' ? "Marked as Sold" : "Mark as Sold"}
                                    </Button>
                                    <Button
                                        onClick={handleDelete}
                                        disabled={isInteracting}
                                        variant="ghost"
                                        className="md:col-span-2 h-14 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold uppercase tracking-widest text-xs"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Permanent Delete from Loop
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <Button
                                        onClick={handleInteraction}
                                        disabled={isInteracting}
                                        className="h-14 sm:h-16 text-base sm:text-xl font-bold bg-white border border-loops-border hover:bg-loops-subtle text-loops-main shadow-sm transition-all"
                                    >
                                        <MessageSquare className="w-5 h-5 mr-2 sm:mr-3 text-loops-primary flex-shrink-0" />
                                        <span className="truncate">{isInteracting ? "..." : `Chat with ${getTerm('sellerName')}`}</span>
                                    </Button>
                                    <Button
                                        onClick={handleInteraction}
                                        disabled={isInteracting}
                                        className="h-14 sm:h-16 text-base sm:text-xl font-bold bg-loops-primary hover:bg-loops-primary/90 text-white shadow-xl shadow-loops-primary/20 transition-all font-display"
                                    >
                                        <Sparkles className="w-5 h-5 mr-2 sm:mr-3 text-loops-accent flex-shrink-0" />
                                        {isInteracting ? "..." : "Make Offer"}
                                    </Button>
                                </div>
                                <p className="text-center text-[10px] uppercase tracking-widest font-bold text-loops-muted bg-loops-subtle py-2 rounded-lg italic">
                                    Interaction unlocks 1:1 messaging directly in the Loop.
                                </p>
                            </>
                        )}

                        <div className="flex justify-center pt-4">
                            <Button
                                onClick={handleReport}
                                variant="ghost"
                                className="text-[10px] text-red-400 hover:text-red-500 hover:bg-red-50 font-bold uppercase tracking-widest flex items-center gap-2 opacity-50 hover:opacity-100 transition-all"
                            >
                                <AlertTriangle className="w-3 h-3" />
                                Report Suspicious Pulse
                            </Button>
                        </div>

                        <div className="space-y-4 pt-8 border-t border-loops-border">
                            <AccordionItem
                                title="Description"
                                isOpen={activeAccordion === "details"}
                                onClick={() => setActiveAccordion(activeAccordion === "details" ? null : "details")}
                            >
                                <p className="text-loops-muted leading-relaxed font-light italic text-lg px-2">
                                    "{listing.description}"
                                </p>
                            </AccordionItem>
                            <AccordionItem
                                title="Campus Safety"
                                isOpen={activeAccordion === "safety"}
                                onClick={() => setActiveAccordion(activeAccordion === "safety" ? null : "safety")}
                            >
                                <ul className="space-y-4 text-sm text-loops-muted px-2">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-loops-primary mt-1.5" />
                                        <span>Trade in public university spaces only.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-loops-primary mt-1.5" />
                                        <span>Verify item condition before finalize.</span>
                                    </li>
                                </ul>
                            </AccordionItem>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function AccordionItem({ title, isOpen, onClick, children }: { title: string, isOpen: boolean, onClick: () => void, children: React.ReactNode }) {
    return (
        <div className="border-t border-loops-border">
            <button
                onClick={onClick}
                className="flex w-full items-center justify-between py-6 text-left hover:text-loops-primary transition-colors group"
            >
                <span className="font-bold uppercase tracking-widest text-xs group-hover:tracking-[0.15em] transition-all">{title}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-8">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
