'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/toast-context';
import { InfinityLogo } from '@/components/ui/infinity-logo';
import {
    Plus, Upload, CheckCircle, Rocket, Package,
    Tag, DollarSign, ImageIcon, ArrowRight, Sparkles,
    ShieldCheck, Store, Loader2, X, Copy, Check, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const VERIFIED_PLUG_THRESHOLD = 3;
const CURRENCY = '₦';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://loops-stores.vercel.app';
const CAMPAIGN_URL = `${SITE_URL}/campaign`;

const CATEGORIES = [
    'Fashion & Wears', 'Food & Snacks', 'Electronics', 'Books & Stationery',
    'Beauty & Skincare', 'Services', 'Accessories', 'Home & Hostel', 'Other'
];

interface ProductDraft {
    id: string;
    title: string;
    price: string;
    category: string;
    images: string[];
    description: string;
    status: 'idle' | 'uploading' | 'saving' | 'saved' | 'error';
    uploadProgress: number;
}

const createDraft = (): ProductDraft => ({
    id: crypto.randomUUID(),
    title: '',
    price: '',
    category: '',
    images: [],
    description: '',
    status: 'idle',
    uploadProgress: 0,
});

export default function PopulateTheLooPage() {
    const supabase = createClient();
    const router = useRouter();
    const toast = useToast();

    const [profile, setProfile] = useState<any>(null);
    const [campus, setCampus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [drafts, setDrafts] = useState<ProductDraft[]>([createDraft(), createDraft(), createDraft()]);
    const [savedCount, setSavedCount] = useState(0);
    const [launching, setLaunching] = useState(false);
    const [launched, setLaunched] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const handleShareCopy = () => {
        navigator.clipboard.writeText(CAMPAIGN_URL);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const handleWhatsAppShare = () => {
        const msg = encodeURIComponent(`🔥 I just went live on Loops — the campus marketplace! Come check my store and join as a Founding Plug before spots run out 👇\n${CAMPAIGN_URL}`);
        window.open(`https://wa.me/?text=${msg}`, '_blank');
    };

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }

            const { data: prof } = await supabase
                .from('profiles')
                .select('*, campuses(*)')
                .eq('id', user.id)
                .single();

            if (!prof?.is_plug) {
                toast.error('Access denied. Approved Plugs only.');
                router.push('/');
                return;
            }

            // Count already-existing listings
            const { count } = await supabase
                .from('listings')
                .select('*', { count: 'exact', head: true })
                .eq('seller_id', user.id);

            setSavedCount(count || 0);
            setProfile(prof);
            setCampus(prof.campuses);
            setLoading(false);
        };
        init();
    }, []);

    const updateDraft = (id: string, updates: Partial<ProductDraft>) => {
        setDrafts(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    };

    const handleImageUpload = async (id: string, file: File) => {
        if (!file) return;

        updateDraft(id, { status: 'uploading', uploadProgress: 0 });

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${id}-${Math.random()}.${fileExt}`;
            const filePath = `${profile.id}/${fileName}`;

            const { data, error: uploadError } = await supabase.storage
                .from('listing-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('listing-images')
                .getPublicUrl(filePath);

            updateDraft(id, { 
                images: [publicUrl], 
                status: 'idle', 
                uploadProgress: 100 
            });
            toast.success('Image uploaded!');
        } catch (err: any) {
            updateDraft(id, { status: 'error' });
            toast.error(err.message || 'Image upload failed');
        }
    };

    const addDraft = () => {
        setDrafts(prev => [...prev, createDraft()]);
    };

    const removeDraft = (id: string) => {
        setDrafts(prev => prev.filter(d => d.id !== id));
    };

    const saveDraft = async (draft: ProductDraft) => {
        if (!draft.title || !draft.price || !draft.category) {
            toast.error('Title, price, and category are required.');
            return;
        }

        if (draft.images.length === 0) {
            toast.warning('Adding a photo helps items sell 5x faster!');
        }

        updateDraft(draft.id, { status: 'saving' });

        try {
            const { error } = await supabase.from('listings').insert({
                seller_id: profile.id,
                campus_id: campus?.id,
                title: draft.title,
                price: parseFloat(draft.price),
                category: draft.category,
                description: draft.description || null,
                images: draft.images,
                status: 'active',
                type: 'product',
            });

            if (error) throw error;

            updateDraft(draft.id, { status: 'saved' });
            setSavedCount(prev => prev + 1);
            toast.success(`"${draft.title}" added to your Loop!`);
        } catch (err: any) {
            updateDraft(draft.id, { status: 'error' });
            toast.error(err.message || 'Failed to save item.');
        }
    };

    const handleLaunch = async () => {
        if (savedCount < VERIFIED_PLUG_THRESHOLD) {
            toast.error(`Add at least ${VERIFIED_PLUG_THRESHOLD} items to launch your store.`);
            return;
        }
        setLaunching(true);
        try {
            await supabase.from('profiles').update({ is_founding_member: true }).eq('id', profile.id);
            setLaunched(true);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLaunching(false);
        }
    };

    const progressPct = Math.min(100, (savedCount / VERIFIED_PLUG_THRESHOLD) * 100);
    const isVerified = savedCount >= VERIFIED_PLUG_THRESHOLD;

    if (loading) {
        return (
            <div className="fixed inset-0 bg-loops-bg flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-loops-primary animate-spin" />
            </div>
        );
    }
    if (launched) {
        return (
            <div className="fixed inset-0 bg-loops-bg flex flex-col items-center justify-center text-center p-8 gap-6">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                    transition={{ duration: 0.6, ease: 'backOut' }}
                    className="w-28 h-28 rounded-full bg-loops-primary/10 border border-loops-primary/30 flex items-center justify-center"
                >
                    <Rocket className="w-14 h-14 text-loops-primary" />
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-3">
                    <h1 className="font-display text-5xl font-black italic tracking-tighter">
                        Your Loop is <span className="text-loops-primary">Live.</span>
                    </h1>
                    <p className="text-loops-muted max-w-sm mx-auto">
                        Students on your campus can now discover and buy from you. Welcome to the Founding 50.
                    </p>
                </motion.div>

                {/* Share block */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55 }}
                    className="w-full max-w-sm p-4 rounded-2xl bg-loops-subtle border border-loops-border space-y-3"
                >
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-loops-muted">Share your campaign link</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 rounded-xl bg-white border border-loops-border text-[10px] font-mono text-loops-muted truncate">
                            {CAMPAIGN_URL}
                        </div>
                        <button
                            onClick={handleShareCopy}
                            className="h-9 px-3 rounded-xl bg-loops-primary/10 border border-loops-primary/20 text-loops-primary font-bold text-[10px] uppercase tracking-widest hover:bg-loops-primary hover:text-white transition-all flex items-center gap-1.5 shrink-0"
                        >
                            {linkCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {linkCopied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <button
                        onClick={handleWhatsAppShare}
                        className="w-full h-10 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] font-bold text-xs uppercase tracking-widest hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <Share2 className="w-3.5 h-3.5" />
                        Share on WhatsApp
                    </button>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="flex gap-3">
                    <Button onClick={() => router.push('/listings/create')} className="h-12 px-8 rounded-2xl bg-loops-primary text-white font-bold uppercase tracking-widest text-xs">
                        Add More Products <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button onClick={() => router.push('/')} variant="ghost" className="h-12 px-6 rounded-2xl font-bold uppercase tracking-widest text-xs text-loops-muted">
                        Go to Feed
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main pb-32">
            {/* Fixed glow blobs */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-loops-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-loops-energetic/10 blur-[150px] rounded-full" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/10 bg-loops-bg/80 backdrop-blur-xl sticky top-0">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <InfinityLogo className="w-8 h-8" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-loops-muted">Founding Plug</p>
                            <h1 className="font-display font-black text-lg italic tracking-tight leading-none">Populate the Loop</h1>
                        </div>
                    </div>
                    {profile?.store_name && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                            <Store className="w-3.5 h-3.5 text-loops-primary" />
                            <span className="text-xs font-bold text-loops-muted">{profile.store_name}</span>
                        </div>
                    )}
                </div>
            </header>

            <main className="relative z-10 max-w-3xl mx-auto px-4 pt-8 space-y-8">
                {/* Progress Block */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-6 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="font-bold text-base">Verified Plug Status</h2>
                            <p className="text-xs text-loops-muted mt-0.5">
                                Add <strong>{Math.max(0, VERIFIED_PLUG_THRESHOLD - savedCount)}</strong> more item{savedCount === VERIFIED_PLUG_THRESHOLD - 1 ? '' : 's'} to unlock your badge
                            </p>
                        </div>
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest transition-all",
                            isVerified
                                ? "bg-loops-primary/10 border-loops-primary/30 text-loops-primary"
                                : "bg-white/10 border-white/20 text-loops-muted"
                        )}>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {isVerified ? 'Verified!' : `${savedCount}/${VERIFIED_PLUG_THRESHOLD}`}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2.5 bg-loops-border rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-loops-primary to-loops-energetic rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                    </div>

                    <div className="flex items-center justify-between mt-3">
                        <span className="text-[10px] text-loops-muted font-bold uppercase tracking-widest">{savedCount} saved</span>
                        <span className="text-[10px] text-loops-muted font-bold uppercase tracking-widest">Goal: {VERIFIED_PLUG_THRESHOLD}</span>
                    </div>

                    {/* Campaign share link */}
                    <div className="mt-4 pt-4 border-t border-loops-border/50 flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 rounded-xl bg-white/50 border border-loops-border text-[9px] font-mono text-loops-muted truncate">
                            {CAMPAIGN_URL}
                        </div>
                        <button
                            id="copy-campaign-link"
                            onClick={() => { navigator.clipboard.writeText(CAMPAIGN_URL); toast.success('Campaign link copied!'); }}
                            className="h-8 px-3 rounded-xl bg-loops-primary/10 border border-loops-primary/20 text-loops-primary font-bold text-[9px] uppercase tracking-widest hover:bg-loops-primary hover:text-white transition-all flex items-center gap-1 shrink-0"
                        >
                            <Copy className="w-2.5 h-2.5" />
                            Copy
                        </button>
                    </div>
                    <p className="text-[8px] text-loops-muted font-bold uppercase tracking-widest">Share this link so others can populate their loop too</p>
                </motion.div>

                {/* Product Drafts */}
                <div className="space-y-5">
                    <AnimatePresence>
                        {drafts.map((draft, i) => (
                            <DraftCard
                                key={draft.id}
                                draft={draft}
                                index={i}
                                onChange={(id, updates) => updateDraft(id, updates)}
                                onUploadImage={(id, file) => handleImageUpload(id, file)}
                                onRemove={() => removeDraft(draft.id)}
                                onSave={() => saveDraft(draft)}
                                canRemove={drafts.length > 1}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Add More Button */}
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addDraft}
                    className="w-full h-14 rounded-2xl border-2 border-dashed border-loops-border hover:border-loops-primary/50 bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center gap-2 text-loops-muted hover:text-loops-primary font-bold uppercase tracking-widest text-xs"
                >
                    <Plus className="w-4 h-4" />
                    Add Another Item
                </motion.button>
            </main>

            {/* Sticky Launch Bar */}
            <div className="fixed bottom-0 inset-x-0 z-50 p-4 bg-loops-bg/80 backdrop-blur-xl border-t border-white/10">
                <div className="max-w-3xl mx-auto">
                    <Button
                        onClick={handleLaunch}
                        disabled={!isVerified || launching}
                        className={cn(
                            "w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all",
                            isVerified
                                ? "bg-loops-primary text-white shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] hover:scale-[1.02]"
                                : "bg-white/10 text-loops-muted border border-white/10 cursor-not-allowed"
                        )}
                    >
                        {launching ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Launching...</>
                        ) : isVerified ? (
                            <><Rocket className="w-4 h-4 mr-2" /> Launch My Store</>
                        ) : (
                            `Add ${Math.max(0, VERIFIED_PLUG_THRESHOLD - savedCount)} more to unlock launch`
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Draft Card ───────────────────────────────────────────────────────────────

function DraftCard({
    draft, index, onChange, onUploadImage, onRemove, onSave, canRemove
}: {
    draft: ProductDraft;
    index: number;
    onChange: (id: string, updates: Partial<ProductDraft>) => void;
    onUploadImage: (id: string, file: File) => void;
    onRemove: () => void;
    onSave: () => void;
    canRemove: boolean;
}) {
    const isSaved = draft.status === 'saved';
    const isSaving = draft.status === 'saving';
    const isUploading = draft.status === 'uploading';
    const isError = draft.status === 'error';
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
                "rounded-3xl border backdrop-blur-xl overflow-hidden transition-all duration-300",
                isSaved
                    ? "bg-loops-primary/5 border-loops-primary/30 shadow-lg shadow-loops-primary/10"
                    : "bg-white/40 border-white/30 shadow-xl"
            )}
        >
            {/* Card Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black",
                        isSaved ? "bg-loops-primary text-white" : "bg-loops-primary/10 text-loops-primary"
                    )}>
                        {isSaved ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-loops-muted">
                        {isSaved ? 'Saved!' : `Item ${index + 1}`}
                    </span>
                </div>
                {canRemove && !isSaved && (
                    <button onClick={onRemove} className="w-7 h-7 rounded-xl bg-white/20 hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center text-loops-muted transition-all">
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Fields */}
            <div className={cn("px-5 pb-5 space-y-4 transition-all", isSaved && "opacity-60 pointer-events-none")}>
                
                {/* Image Upload Area */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-loops-muted flex items-center gap-1.5">
                        <ImageIcon className="w-3 h-3" /> Product Photo
                    </label>
                    <input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef} 
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onUploadImage(draft.id, file);
                        }}
                    />
                    
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "relative aspect-[16/9] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer group overflow-hidden transition-all",
                            draft.images.length > 0 
                                ? "border-loops-primary/30 bg-loops-primary/5" 
                                : "border-white/40 bg-white/20 hover:bg-white/30"
                        )}
                    >
                        {draft.images.length > 0 ? (
                            <>
                                <img src={draft.images[0]} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="px-3 py-1.5 bg-white rounded-lg text-[9px] font-black uppercase tracking-widest text-loops-main">Change Photo</div>
                                </div>
                            </>
                        ) : isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-5 h-5 text-loops-primary animate-spin" />
                                <span className="text-[10px] font-bold text-loops-primary uppercase tracking-widest">Uploading...</span>
                            </div>
                        ) : (
                            <>
                                <div className="w-10 h-10 rounded-full bg-loops-primary/10 flex items-center justify-center text-loops-primary group-hover:scale-110 transition-transform">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-loops-main">Upload Photo</p>
                                    <p className="text-[8px] text-loops-muted uppercase font-bold mt-0.5">JPG, PNG or WEBP</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Title */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-loops-muted flex items-center gap-1.5">
                        <Package className="w-3 h-3" /> Product Title *
                    </label>
                    <input
                        id={`title-${draft.id}`}
                        type="text"
                        value={draft.title}
                        onChange={e => onChange(draft.id, { title: e.target.value })}
                        placeholder="e.g. Custom Hooded Sweatshirt"
                        className="w-full px-4 py-3 text-sm font-bold bg-white/50 border border-white/40 rounded-xl focus:border-loops-primary focus:bg-white/70 outline-none transition-all placeholder:text-loops-muted/40"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Price */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-loops-muted flex items-center gap-1.5">
                            <DollarSign className="w-3 h-3" /> Price (₦) *
                        </label>
                        <input
                            id={`price-${draft.id}`}
                            type="number"
                            value={draft.price}
                            onChange={e => onChange(draft.id, { price: e.target.value })}
                            placeholder="3500"
                            className="w-full px-4 py-3 text-sm font-bold bg-white/50 border border-white/40 rounded-xl focus:border-loops-primary focus:bg-white/70 outline-none transition-all placeholder:text-loops-muted/40"
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-loops-muted flex items-center gap-1.5">
                            <Tag className="w-3 h-3" /> Category *
                        </label>
                        <select
                            id={`category-${draft.id}`}
                            value={draft.category}
                            onChange={e => onChange(draft.id, { category: e.target.value })}
                            className="w-full px-4 py-3 text-sm font-bold bg-white/50 border border-white/40 rounded-xl focus:border-loops-primary focus:bg-white/70 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Select...</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-loops-muted">Description (optional)</label>
                    <textarea
                        id={`desc-${draft.id}`}
                        value={draft.description}
                        onChange={e => onChange(draft.id, { description: e.target.value })}
                        placeholder="Briefly describe your item..."
                        rows={2}
                        className="w-full px-4 py-3 text-sm font-bold bg-white/50 border border-white/40 rounded-xl focus:border-loops-primary focus:bg-white/70 outline-none transition-all resize-none placeholder:text-loops-muted/40"
                    />
                </div>

                {/* Save Button */}
                <Button
                    onClick={onSave}
                    disabled={isSaving || isUploading || !draft.title || !draft.price || !draft.category}
                    className={cn(
                        "w-full h-11 rounded-xl font-black uppercase tracking-widest text-xs transition-all",
                        isSaving ? "bg-loops-primary/50 text-white" : "bg-loops-primary text-white hover:scale-[1.01]"
                    )}
                >
                    {isSaving ? (
                        <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Saving...</>
                    ) : (
                        <><CheckCircle className="w-3.5 h-3.5 mr-2" /> Save Item</>
                    )}
                </Button>

                {isError && (
                    <p className="text-xs text-red-400 text-center font-bold">Failed to save. Please try again.</p>
                )}
            </div>
        </motion.div>
    );
}
