'use client';

// Force rebuild to fix syntax error
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { ShieldCheck, Star, Package, Settings, ExternalLink, Calendar, MapPin, Zap, MessageSquare, Phone, Sparkles, Award } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/context/toast-context";
import { useCampus } from "@/context/campus-context";
import { CURRENCY } from "@/lib/constants";
import { followUser, unfollowUser, getFollowStatus, getFollowCounts } from "@/lib/follows";
import { UserPlus, UserMinus, Users, User } from "lucide-react";
import { Rating } from "@/components/ui/rating";

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

    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            setUser(authUser);

            const userIdToFetch = targetUserId || authUser?.id;

            if (userIdToFetch) {
                // Fetch Profile, Listings, and Reviews
                const [profileRes, listingsRes, followRes, reviewsRes] = await Promise.all([
                    supabase.from('profiles').select('*, campuses(*)').eq('id', userIdToFetch).single(),
                    supabase.from('listings').select('*').eq('seller_id', userIdToFetch).order('created_at', { ascending: false }),
                    getFollowCounts(userIdToFetch),
                    supabase.from('reviews')
                        .select('*, reviewer:profiles(full_name, avatar_url)')
                        .eq('reviewee_id', userIdToFetch)
                        .order('created_at', { ascending: false })
                ]);

                if (profileRes.data) setProfile(profileRes.data);
                if (listingsRes.data) setListings(listingsRes.data);
                if (reviewsRes.data) setReviews(reviewsRes.data);

                setFollowersCount(followRes.followers);
                setFollowingCount(followRes.following);

                // If viewing someone else, check if we follow them
                if (targetUserId && authUser && targetUserId !== authUser.id) {
                    const status = await getFollowStatus(targetUserId);
                    setIsFollowing(status);
                }

                // Set default tab only for the owner
                if (!targetUserId && profileRes.data?.primary_role) {
                    setActiveTab(profileRes.data.primary_role as 'selling' | 'buying');
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, [supabase, targetUserId]);

    const handleFollowToggle = async () => {
        if (!user) {
            toast.error("Please login to follow plugs.");
            return;
        }
        if (!targetUserId) return;

        setFollowLoading(true);
        try {
            if (isFollowing) {
                await unfollowUser(targetUserId);
                setIsFollowing(false);
                setFollowersCount(prev => prev - 1);
                toast.success(`Unfollowed ${profile?.full_name}`);
            } else {
                await followUser(targetUserId);
                setIsFollowing(true);
                setFollowersCount(prev => prev + 1);
                toast.success(`Following ${profile?.full_name}!`);
            }
        } catch (err) {
            toast.error("Failed to update follow status.");
        } finally {
            setFollowLoading(false);
        }
    };

    const handleReviewSubmit = async () => {
        if (!user) return router.push('/login');
        setSubmittingReview(true);
        try {
            const { error } = await supabase
                .from('reviews')
                .insert({
                    reviewer_id: user.id,
                    reviewee_id: targetUserId,
                    rating: reviewRating,
                    comment: reviewComment
                });

            if (error) throw error;
            toast.success("Review submitted! The campus Pulse has been updated.");
            setReviewModalOpen(false);
            setReviewComment("");
        } catch (err: any) {
            toast.error(err.message || "Failed to submit review.");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />

            <main className="pt-24 sm:pt-32 pb-16 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-6">
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
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-loops-primary to-loops-secondary p-1 shadow-lg shadow-loops-primary/20">
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
                                        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-loops-main">{profile?.full_name || 'Student Name'}</h1>
                                        {profile?.is_verified && (
                                            <ShieldCheck className="w-6 h-6 text-loops-success" />
                                        )}
                                    </div>
                                    {profile?.store_name && (
                                        <div className={cn("flex items-center gap-2 px-3 py-1 border border-white/10 rounded-lg w-fit text-white shadow-lg", profile.store_banner_color || "bg-loops-primary")}>
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{profile.store_name} Plug</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-loops-muted font-medium">
                                        <MapPin className="w-4 h-4 text-loops-primary" />
                                        <span>{profile?.campuses?.name || 'Campus Member'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 py-1">
                                        <Rating value={profile?.rating || 0} size="sm" />
                                        <span className="text-[10px] font-bold text-loops-muted uppercase tracking-widest">
                                            {profile?.rating ? Number(profile.rating).toFixed(1) : 'No ratings'}
                                        </span>
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

                                <div className="p-4 rounded-2xl bg-white border border-loops-border text-center shadow-sm">
                                    <div className="text-2xl font-bold font-display text-loops-primary tracking-tighter">{followersCount}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-loops-muted font-bold">Followers</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-white border border-loops-border text-center shadow-sm">
                                    <div className="text-2xl font-bold font-display text-loops-success tracking-tighter">{followingCount}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-loops-muted font-bold">Following</div>
                                </div>
                            </div>

                            {/* Service Passport (New Feature) */}
                            {(profile?.verified_hours > 0 || profile?.service_tier) && (
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-loops-primary/5 to-transparent border border-loops-primary/20 space-y-4">
                                    <div className="flex items-center gap-2 text-loops-primary font-bold text-xs uppercase tracking-widest border-b border-loops-primary/10 pb-3">
                                        <Award className="w-4 h-4" />
                                        <span>Service Passport</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-[10px] font-bold text-loops-muted uppercase">Verified Hours</div>
                                            <div className="text-2xl font-display font-bold text-loops-main">{profile?.verified_hours || 0}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-loops-muted uppercase">Rank</div>
                                            <div className={cn(
                                                "text-lg font-bold font-display uppercase tracking-tight",
                                                profile?.service_tier === 'Elite' ? "text-amber-500" :
                                                    profile?.service_tier === 'Gold' ? "text-yellow-500" :
                                                        profile?.service_tier === 'Silver' ? "text-slate-400" :
                                                            "text-orange-700" // Bronze
                                            )}>{profile?.service_tier || 'Bronze'}</div>
                                        </div>
                                    </div>
                                    <div className="bg-white/50 rounded-lg p-2 text-[10px] text-loops-muted leading-snug italic text-center">
                                        "A verified record of campus impact for your CV."
                                    </div>
                                </div>
                            )}

                            {user?.id !== profile?.id && (
                                <div className="pt-6 border-t border-loops-border space-y-3">
                                    <Button
                                        onClick={handleFollowToggle}
                                        disabled={followLoading}
                                        className={cn(
                                            "w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px] transition-all",
                                            isFollowing ? "bg-loops-subtle text-loops-muted border-loops-border" : "bg-loops-primary text-white hover:bg-loops-primary/90 shadow-lg shadow-loops-primary/20"
                                        )}
                                    >
                                        {isFollowing ? (
                                            <>
                                                <UserMinus className="w-4 h-4" />
                                                Unfollow Plug
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-4 h-4" />
                                                Follow Plug
                                            </>
                                        )}
                                    </Button>

                                    <Link href={`/messages?u=${profile?.id}`} className="block">
                                        <Button variant="outline" className="w-full border-loops-border text-loops-primary hover:bg-loops-primary/5 h-12 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                                            <MessageSquare className="w-4 h-4" />
                                            Send Message
                                        </Button>
                                    </Link>

                                    {/* Show Rate this Plug only if viewing someone else's profile and they are a plug OR have listings */}
                                    {(profile?.is_plug || listings.length > 0) && (
                                        <Button
                                            onClick={() => setReviewModalOpen(true)}
                                            variant="outline"
                                            className="w-full border-loops-primary/20 text-loops-primary hover:bg-loops-primary/5 h-12 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px]"
                                        >
                                            <Star className="w-4 h-4" />
                                            Rate this Plug
                                        </Button>
                                    )}
                                </div>
                            )}

                            {reviewModalOpen && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-loops-main/40 backdrop-blur-md">
                                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-loops-border space-y-6">
                                        <div className="text-center space-y-2">
                                            <h3 className="text-xl font-bold font-display italic">Seal the Deal.</h3>
                                            <p className="text-loops-muted text-sm px-4">Rate your experience with this student plug to help the community.</p>
                                        </div>

                                        <div className="flex justify-center py-4">
                                            <Rating value={reviewRating} readonly={false} onChange={setReviewRating} size="lg" />
                                        </div>

                                        <textarea
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            placeholder="Add a quick note about the trade..."
                                            className="w-full p-4 rounded-xl bg-loops-subtle border border-loops-border focus:border-loops-primary focus:outline-none transition-all resize-none text-sm h-24"
                                        />

                                        <div className="flex gap-3">
                                            <Button variant="ghost" className="flex-1 h-12 rounded-xl text-loops-muted font-bold uppercase tracking-widest text-[10px]" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
                                            <Button
                                                disabled={submittingReview}
                                                className="flex-1 h-12 rounded-xl bg-loops-primary text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-loops-primary/20"
                                                onClick={handleReviewSubmit}
                                            >
                                                {submittingReview ? "Submitting..." : "Post Review"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {user?.id === profile?.id && (profile?.is_plug || profile?.primary_role === 'plug') && (
                                <div className="pt-6 border-t border-loops-border">
                                    <a
                                        href={`https://wa.me/${profile?.whatsapp_number?.replace(/\D/g, '') || '2348123456789'}?text=Hi%20LoopBot!%20I'm%20${encodeURIComponent(profile?.full_name || 'a student')}%20from%20${encodeURIComponent(profile?.campuses?.name || 'Veritas University')}.%20I%20want%20to%20manage%20my%20Pulse%20and%20list%20new%20items.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                    >
                                        <Button className="w-full bg-loops-success text-white hover:bg-loops-success/90 h-12 rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-loops-success/20">
                                            <Phone className="w-4 h-4" />
                                            Manage Pulse via LoopBot
                                        </Button>
                                    </a>
                                    <p className="text-[9px] text-loops-muted text-center mt-3 font-medium uppercase tracking-[0.1em]">AI Assistant Connection Active</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Archetype Tabs */}
                    {(!targetUserId || targetUserId === user?.id) ? (
                        <div className="flex flex-wrap gap-2 p-1 bg-loops-subtle border border-loops-border rounded-2xl w-full sm:w-fit">
                            <button
                                onClick={() => setActiveTab('selling')}
                                className={cn(
                                    "px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
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
                                    "px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                                    activeTab === 'buying'
                                        ? "bg-white text-loops-primary shadow-sm ring-1 ring-loops-border"
                                        : "text-loops-muted hover:text-loops-main"
                                )}
                            >
                                Buying ({getTerm('buyerName')})
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews' as any)}
                                className={cn(
                                    "px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                                    (activeTab as string) === 'reviews'
                                        ? "bg-white text-loops-primary shadow-sm ring-1 ring-loops-border"
                                        : "text-loops-muted hover:text-loops-main"
                                )}
                            >
                                Reviews ({reviews.length})
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2 p-1 bg-loops-subtle border border-loops-border rounded-2xl w-full sm:w-fit">
                            <button
                                onClick={() => setActiveTab('selling')}
                                className={cn(
                                    "px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                                    activeTab === 'selling'
                                        ? "bg-white text-loops-primary shadow-sm ring-1 ring-loops-border"
                                        : "text-loops-muted hover:text-loops-main"
                                )}
                            >
                                {getTerm('sellerName')} Pulse
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews' as any)}
                                className={cn(
                                    "px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                                    (activeTab as string) === 'reviews'
                                        ? "bg-white text-loops-primary shadow-sm ring-1 ring-loops-border"
                                        : "text-loops-muted hover:text-loops-main"
                                )}
                            >
                                Ratings
                            </button>
                        </div>
                    )}

                    {/* Tab Content */}
                    {activeTab === 'selling' ? (
                        // ... Existing Selling Content ...
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
                                                <div className="text-loops-success font-bold text-lg">{CURRENCY}{listing.price}</div>
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
                    ) : activeTab === 'buying' ? (
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
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold font-display tracking-tight text-loops-main uppercase tracking-tighter italic">Student Feedback</h2>
                                <div className="flex items-center gap-2 text-loops-primary">
                                    <Star className="w-5 h-5 fill-current" />
                                    <span className="text-xl font-bold">{Number(profile?.rating || 0).toFixed(1)}</span>
                                </div>
                            </div>

                            {reviews.length > 0 ? (
                                <div className="grid gap-6">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="p-6 rounded-3xl bg-white border border-loops-border shadow-sm space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-loops-subtle border border-loops-border flex items-center justify-center overflow-hidden">
                                                        {review.reviewer?.avatar_url ? (
                                                            <img src={review.reviewer.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-5 h-5 text-loops-muted" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-loops-main">{review.reviewer?.full_name || 'Anonymous Student'}</div>
                                                        <div className="text-[10px] text-loops-muted uppercase font-bold tracking-widest">{new Date(review.created_at).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <Rating value={review.rating} size="sm" />
                                            </div>
                                            <p className="text-sm text-loops-muted leading-relaxed italic">"{review.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24 rounded-3xl border border-loops-border bg-loops-subtle/50 italic">
                                    <Sparkles className="w-12 h-12 text-loops-muted/10 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold font-display text-loops-muted uppercase tracking-widest">No Pulse yet.</h3>
                                    <p className="text-loops-muted mt-2">Ratings from the campus community will appear here.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
        </div>
            </main >
        </div >
    );
}
