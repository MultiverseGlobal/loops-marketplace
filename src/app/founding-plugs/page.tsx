'use client';

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Award, Users, CheckCircle, Star, ArrowRight, Shield, Zap, ArrowLeft, Smartphone, Globe, Rocket, MessageSquare, Heart, ShieldCheck, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/toast-context";
import { cn } from "@/lib/utils";
import { InfinityLogo } from "@/components/ui/infinity-logo";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const CAMPUS_DATA: Record<string, { name: string, floor: number }> = {
    'veritas': { name: 'Veritas University', floor: 12 },
    'bingham': { name: 'Bingham University', floor: 10 },
    'nile': { name: 'Nile University of Nigeria', floor: 15 },
    'uniabuja': { name: 'University @ Abuja', floor: 18 },
    'atbu': { name: 'ATBU Bauchi', floor: 8 },
    'unijos': { name: 'University @ Jos', floor: 14 },
    'mouau': { name: 'MOUAU Umudike', floor: 9 },
    'unilag': { name: 'Unilag Lagos', floor: 22 },
    'abu': { name: 'ABU Zaria', floor: 20 },
    'unn': { name: 'UNN Nsukka', floor: 25 }
};

const CURRENCY = "₦";

const BackgroundShapes = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
            animate={{
                x: [100, 200, 100],
                y: [100, 50, 100],
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-loops-primary/20 blur-[120px] rounded-full"
        />
        <motion.div
            animate={{
                x: [-100, -200, -100],
                y: [200, 300, 200],
                scale: [1, 1.3, 1],
                rotate: [0, -45, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-loops-energetic/20 blur-[150px] rounded-full"
        />
        <motion.div
            animate={{
                scale: [1, 1.5, 1],
                opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-loops-vibrant/10 blur-[180px] rounded-full"
        />
    </div>
);

export default function FoundingPlugsCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [joinedCount, setJoinedCount] = useState<number>(0);
    const searchParams = useSearchParams();
    const campusSlug = searchParams.get('campus') || 'veritas';
    const activeCampus = CAMPUS_DATA[campusSlug] || CAMPUS_DATA['veritas'];


    // Form State
    const [formData, setFormData] = useState({
        name: "",
        whatsapp: "",
        email: "",
        offeringType: "" as 'product' | 'service' | '',
        description: "",
        intent: 'build' as 'build' | 'reserve',
        storeName: "",
        storeBannerColor: "bg-loops-primary",
        storeCategory: "",
        storeLogoUrl: "",
        brandingTier: 'founding' as 'basic' | 'founding' | 'premium',
        estimatedItemCount: "",
        referralCode: searchParams.get('ref') || ""
    });


    const supabase = createClient();
    const toast = useToast();

    const nextSlide = () => {
        setDirection(1);
        setCurrentSlide(prev => prev + 1);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentSlide(prev => prev - 1);
    };

    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        const fetchJoinedCount = async () => {
            const { count, error } = await supabase
                .from('seller_applications')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'approved');

            if (!error && count !== null) {
                setJoinedCount(count + activeCampus.floor);
            } else {
                setJoinedCount(activeCampus.floor);
            }
        };

        fetchJoinedCount();

        // Subscribe to real-time updates
        const channel = supabase
            .channel('joined-plugs-count')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'seller_applications'
                },
                () => {
                    fetchJoinedCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);


    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('seller_applications')
                .insert({
                    full_name: formData.name,
                    whatsapp_number: formData.whatsapp,
                    campus_email: formData.email,
                    offering_type: formData.offeringType,
                    offering_description: formData.description,
                    estimated_item_count: formData.estimatedItemCount || "Not Specified",
                    status: 'pending',
                    store_name: formData.storeName,
                    store_banner_color: formData.storeBannerColor,
                    store_category: formData.storeCategory || (formData.offeringType === 'product' ? 'General Goods' : 'Campus Services'),
                    store_logo_url: formData.storeLogoUrl,
                    motivation: `Intent: ${formData.intent} | Tier: ${formData.brandingTier}`,
                    referred_by_code: formData.referralCode || null,
                    user_id: (await supabase.auth.getUser()).data.user?.id || null
                });


            if (error) throw error;

            toast.success("Founding Plug Application Received! ♾️");
            setIsComplete(true);
            nextSlide();
        } catch (error: any) {
            toast.error(error.message || "Failed to submit application.");
        } finally {
            setSubmitting(false);
        }
    };

    const slides = [
        {
            id: 'vision',
            content: (
                <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-12 min-h-full px-6 py-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 blur-3xl bg-loops-primary/20 animate-pulse" />
                        <InfinityLogo className="w-32 h-32 sm:w-48 sm:h-48 relative z-10" />
                    </motion.div>

                    <div className="space-y-4">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="font-display text-5xl sm:text-8xl font-black tracking-tighter"
                        >
                            The <span className="italic bg-gradient-to-r from-loops-primary to-loops-energetic bg-clip-text text-transparent">Founding</span> Loop.
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-base sm:text-lg text-loops-muted max-w-lg mx-auto leading-relaxed"
                        >
                            {activeCampus.name} is about to change. We're looking for the first 50 students to shape the future of campus commerce.
                        </motion.p>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-loops-primary/10 border border-loops-primary/20 rounded-full mt-4"
                        >
                            <Users className="w-4 h-4 text-loops-primary" />
                            <span className="text-sm font-black italic uppercase tracking-widest text-loops-primary">
                                {joinedCount}/50 Plugs Joined
                            </span>
                        </motion.div>

                        {/* Launch Countdown */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="pt-6"
                        >
                            <div className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-br from-loops-primary/10 via-loops-primary/5 to-transparent border border-loops-primary/20 backdrop-blur-sm shadow-xl shadow-loops-primary/5">
                                <div className="flex items-baseline gap-2">
                                    <Zap className="w-4 h-4 text-loops-primary animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-loops-primary">
                                        Launching in
                                    </span>
                                </div>
                                <motion.span
                                    key={Math.ceil((new Date('2026-03-01').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                                    initial={{ scale: 1.2, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-3xl font-black font-display text-loops-primary tracking-tight"
                                >
                                    {Math.ceil((new Date('2026-03-01').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                                </motion.span>
                                <span className="text-xs font-bold text-loops-muted uppercase">
                                    Days
                                </span>
                            </div>
                            <p className="text-[8px] text-loops-muted uppercase tracking-[0.3em] font-black mt-3 opacity-50">
                                March 1, 2026 • Second Semester
                            </p>
                        </motion.div>
                    </div>

                    <Button
                        onClick={nextSlide}
                        className="h-16 sm:h-20 px-12 sm:px-16 rounded-3xl bg-loops-primary text-white text-lg sm:text-xl font-black shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] group uppercase tracking-[0.2em] hover:scale-105 transition-all"
                    >
                        Start Your Journey
                        <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                    </Button>
                </div>
            )
        },
        {
            id: 'benefits',
            content: (
                <div className="flex flex-col items-center justify-center space-y-8 sm:space-y-12 min-h-full px-6 py-10 max-w-4xl mx-auto">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-bold font-display italic uppercase tracking-tighter">Ultimate VIP Access</h2>
                        <p className="text-sm sm:text-base text-loops-muted">Founding Plugs get benefits that will NEVER be offered again.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                        <BenefitCard icon={Award} title="Verified Founding Badge" desc="Permanent status on your profile" />
                        <BenefitCard icon={TrendingUp} title="Priority Listing" desc="First page visibility for 3 months" />
                        <BenefitCard icon={Globe} title="Founding 50 Showcase" desc="Featured on the landing page" />
                        <BenefitCard icon={ShieldCheck} title="Zero Fees" desc="No commissions on your first 100 sales" />
                    </div>

                    <div className="flex gap-4 w-full sm:w-auto pt-4 sm:pt-0">
                        <Button variant="ghost" onClick={prevSlide} className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs">Back</Button>
                        <Button onClick={nextSlide} className="flex-2 h-14 px-8 rounded-2xl bg-loops-primary text-white font-bold uppercase tracking-widest text-xs">Continue</Button>
                    </div>
                </div>
            )
        },
        {
            id: 'intent',
            content: (
                <div className="flex flex-col items-center justify-center space-y-8 sm:space-y-12 min-h-full px-6 py-10 max-w-4xl mx-auto">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-bold font-display italic uppercase tracking-tighter">Choose Your Path</h2>
                        <p className="text-sm sm:text-base text-loops-muted">How do you want to start your campus legacy?</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 w-full">
                        <IntentCard
                            active={formData.intent === 'build'}
                            onClick={() => { handleFormChange('intent', 'build'); nextSlide(); }}
                            icon={Rocket}
                            title="Build Store Now"
                            desc="Configure your storefront and prepare for launch immediately."
                        />
                        <IntentCard
                            active={formData.intent === 'reserve'}
                            onClick={() => { handleFormChange('intent', 'reserve'); nextSlide(); }}
                            icon={Heart}
                            title="Reserve Spot"
                            desc="Secure your Founding badge and finish setup later."
                        />
                    </div>
                </div>
            )
        },
        {
            id: 'identity',
            content: (
                <div className="flex flex-col items-center justify-center space-y-8 sm:space-y-12 min-h-full px-6 py-10 max-w-xl mx-auto w-full">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-bold font-display italic uppercase tracking-tighter">Who are you?</h2>
                        <p className="text-sm sm:text-base text-loops-muted">Verification is the core of the Loop trust.</p>
                    </div>

                    <div className="space-y-4 sm:space-y-6 w-full">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-loops-muted uppercase tracking-widest pl-2">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleFormChange('name', e.target.value)}
                                placeholder="John Doe"
                                className="w-full p-4 sm:p-6 text-xl sm:text-2xl font-black bg-white/30 backdrop-blur-sm border border-white/40 rounded-2xl sm:rounded-[2rem] focus:border-loops-primary focus:bg-white/50 outline-none transition-all placeholder:text-loops-muted/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-loops-muted uppercase tracking-widest pl-2">WhatsApp Number</label>
                            <input
                                type="tel"
                                value={formData.whatsapp}
                                onChange={(e) => handleFormChange('whatsapp', e.target.value)}
                                placeholder="+234..."
                                className="w-full p-4 sm:p-6 text-xl sm:text-2xl font-black bg-white/30 backdrop-blur-sm border border-white/40 rounded-2xl sm:rounded-[2rem] focus:border-loops-primary focus:bg-white/50 outline-none transition-all placeholder:text-loops-muted/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-loops-muted uppercase tracking-widest pl-2">Campus Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleFormChange('email', e.target.value)}
                                placeholder="student@university.edu"
                                className="w-full p-4 sm:p-6 text-xl sm:text-2xl font-black bg-white/30 backdrop-blur-sm border border-white/40 rounded-2xl sm:rounded-[2rem] focus:border-loops-primary focus:bg-white/50 outline-none transition-all placeholder:text-loops-muted/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-loops-muted uppercase tracking-widest pl-2">Referral Code (Optional)</label>
                            <input
                                type="text"
                                value={formData.referralCode}
                                onChange={(e) => handleFormChange('referralCode', e.target.value)}
                                placeholder="Enter Referral Code"
                                className="w-full p-4 sm:p-6 text-xl sm:text-2xl font-black bg-white/30 backdrop-blur-sm border border-white/40 rounded-2xl sm:rounded-[2rem] focus:border-loops-primary focus:bg-white/50 outline-none transition-all placeholder:text-loops-muted/50"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 w-full">
                        <Button variant="ghost" onClick={prevSlide} className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs">Back</Button>
                        <Button
                            disabled={!formData.name || !formData.whatsapp || !formData.email}
                            onClick={nextSlide}
                            className="flex-2 h-14 px-8 rounded-2xl bg-loops-primary text-white font-bold uppercase tracking-widest text-xs"
                        >
                            Next Step
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: 'category',
            content: (
                <div className="flex flex-col items-center justify-center space-y-8 sm:space-y-12 min-h-full px-6 py-10 max-w-xl mx-auto w-full">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-bold font-display italic uppercase tracking-tighter">Your Business</h2>
                        <p className="text-sm sm:text-base text-loops-muted">What will you be offering to the community?</p>
                    </div>

                    <div className="space-y-6 sm:space-y-8 w-full">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleFormChange('offeringType', 'product')}
                                className={cn(
                                    "p-6 sm:p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group",
                                    formData.offeringType === 'product' ? "border-loops-primary bg-loops-primary/10 shadow-lg shadow-loops-primary/20" : "border-white/40 bg-white/20 hover:border-loops-primary/30"
                                )}
                            >
                                <Package className={cn("w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform", formData.offeringType === 'product' ? "text-loops-primary" : "text-loops-muted")} />
                                <span className={cn("font-black text-xs sm:text-sm uppercase tracking-[0.2em]", formData.offeringType === 'product' ? "text-loops-primary" : "text-loops-muted")}>Products</span>
                            </button>
                            <button
                                onClick={() => handleFormChange('offeringType', 'service')}
                                className={cn(
                                    "p-6 sm:p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group",
                                    formData.offeringType === 'service' ? "border-loops-primary bg-loops-primary/10 shadow-lg shadow-loops-primary/20" : "border-white/40 bg-white/20 hover:border-loops-primary/30"
                                )}
                            >
                                <Zap className={cn("w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform", formData.offeringType === 'service' ? "text-loops-primary" : "text-loops-muted")} />
                                <span className={cn("font-black text-xs sm:text-sm uppercase tracking-[0.2em]", formData.offeringType === 'service' ? "text-loops-primary" : "text-loops-muted")}>Services</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-loops-muted uppercase tracking-widest pl-2">Est. Inventory</label>
                            <select
                                value={formData.estimatedItemCount}
                                onChange={(e) => handleFormChange('estimatedItemCount', e.target.value)}
                                className="w-full p-4 sm:p-6 text-sm sm:text-lg font-black bg-white/30 backdrop-blur-sm border border-white/40 rounded-2xl sm:rounded-[2rem] focus:border-loops-primary focus:bg-white/50 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Select Inventory Size</option>
                                <option value="1-5 Items">1-5 Items (Just Starting)</option>
                                <option value="5-20 Items">5-20 Items (Growing)</option>
                                <option value="20+ Items">20+ Items (Established)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-loops-muted uppercase tracking-widest pl-2">Quick Pitch</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleFormChange('description', e.target.value)}
                                placeholder="e.g. I sell high-quality campus fashion components..."
                                rows={3}
                                className="w-full p-4 sm:p-6 text-sm sm:text-lg font-black bg-white/30 backdrop-blur-sm border border-white/40 rounded-2xl sm:rounded-[2rem] focus:border-loops-primary focus:bg-white/50 outline-none transition-all resize-none placeholder:text-loops-muted/50"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 w-full">
                        <Button variant="ghost" onClick={prevSlide} className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs">Back</Button>
                        <Button
                            disabled={!formData.offeringType || !formData.description || !formData.estimatedItemCount}
                            onClick={formData.intent === 'build' ? nextSlide : handleSubmit}
                            className="flex-2 h-14 px-8 rounded-2xl bg-loops-primary text-white font-bold uppercase tracking-widest text-xs"
                        >
                            {formData.intent === 'build' ? 'Configure Brand' : (submitting ? 'Applying...' : 'Apply Now')}
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: 'brand',
            content: (
                <div className="flex flex-col items-center justify-center space-y-8 sm:space-y-12 min-h-full px-6 py-10 max-w-xl mx-auto w-full">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-bold font-display italic uppercase tracking-tighter">Brand Your Vision</h2>
                        <p className="text-sm sm:text-base text-loops-muted">Reserve your unique store identity.</p>
                    </div>

                    <div className="space-y-4 sm:space-y-6 w-full">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-loops-muted uppercase tracking-widest pl-2">Storefront Name</label>
                            <input
                                type="text"
                                value={formData.storeName}
                                onChange={(e) => handleFormChange('storeName', e.target.value)}
                                placeholder="Veritas Fashion Lab"
                                className="w-full p-4 sm:p-6 text-xl sm:text-3xl font-black bg-white/30 backdrop-blur-sm border border-white/40 rounded-2xl sm:rounded-[2rem] focus:border-loops-primary focus:bg-white/50 outline-none transition-all placeholder:text-loops-muted/50 italic text-loops-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-loops-muted uppercase tracking-widest pl-2">Primary Brand Color</label>
                            <div className="flex gap-4">
                                {['bg-loops-primary', 'bg-loops-energetic', 'bg-loops-accent', 'bg-black'].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => handleFormChange('storeBannerColor', color)}
                                        className={cn(
                                            "w-12 h-12 rounded-2xl border-4 transition-all hover:scale-110",
                                            color,
                                            formData.storeBannerColor === color ? "border-white shadow-[0_0_20px_rgba(255,255,255,0.5)] scale-125" : "border-transparent opacity-40 hover:opacity-100"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full">
                        <Button variant="ghost" onClick={prevSlide} className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs">Back</Button>
                        <Button
                            disabled={submitting}
                            onClick={handleSubmit}
                            className="flex-2 h-14 px-8 rounded-2xl bg-loops-primary text-white font-bold uppercase tracking-widest text-xs"
                        >
                            {submitting ? 'Finalizing...' : 'Launch My Application'}
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: 'brand-visuals',
            content: (
                <div className="flex flex-col items-center justify-center space-y-8 sm:space-y-12 min-h-full px-6 py-10 max-w-xl mx-auto w-full">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-bold font-display italic uppercase tracking-tighter">Visual Identity</h2>
                        <p className="text-sm sm:text-base text-loops-muted">Upload your brand logo or a sharp headshot. This is what students see first.</p>
                    </div>

                    <div className="space-y-6 w-full">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white border-2 border-dashed border-loops-border flex items-center justify-center overflow-hidden relative group hover:border-loops-primary/50 transition-colors">
                                {formData.storeLogoUrl ? (
                                    <Image
                                        src={formData.storeLogoUrl}
                                        alt="Logo Preview"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="text-center p-4">
                                        <div className="p-3 bg-loops-subtle rounded-2xl inline-block mb-2">
                                            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-loops-muted" />
                                        </div>
                                        <div className="text-[8px] font-bold uppercase tracking-widest text-loops-muted">Paste Image URL</div>
                                    </div>
                                )}
                            </div>

                            <input
                                type="url"
                                value={formData.storeLogoUrl}
                                onChange={(e) => handleFormChange('storeLogoUrl', e.target.value)}
                                placeholder="https://image-url.com/logo.jpg"
                                className="w-full p-4 sm:p-6 text-xs sm:text-sm font-black bg-white/30 backdrop-blur-sm border border-white/40 rounded-2xl focus:border-loops-primary focus:bg-white/50 outline-none transition-all text-center placeholder:text-loops-muted/50"
                            />
                            <p className="text-[10px] text-loops-muted text-center max-w-xs">
                                <span className="text-loops-primary font-bold">Pro Tip:</span> High-contrast, clean logos work best for the mobile experience.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full">
                        <Button variant="ghost" onClick={prevSlide} className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs">Back</Button>
                        <Button
                            onClick={nextSlide}
                            className="flex-2 h-14 px-8 rounded-2xl bg-loops-primary text-white font-bold uppercase tracking-widest text-xs"
                        >
                            Review Final Brand
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: 'success',
            content: (
                <div className="flex flex-col items-center justify-center text-center space-y-8 sm:space-y-12 min-h-full px-6 py-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                        className="w-20 h-20 sm:w-24 sm:h-24 bg-loops-success/10 rounded-full flex items-center justify-center text-loops-success border border-loops-success/20"
                    >
                        <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12" />
                    </motion.div>

                    <div className="space-y-4">
                        <h2 className="font-display text-3xl sm:text-4xl font-bold italic uppercase tracking-tighter">You're in the Loop.</h2>
                        <p className="text-sm sm:text-base text-loops-muted max-w-sm mx-auto leading-relaxed">
                            Your "Founding Plug" application is being reviewed. Keep an eye on your WhatsApp for an exclusive onboarding link.
                        </p>
                    </div>

                    {formData.storeName && (
                        <div className={cn("p-8 sm:p-10 rounded-[2.5rem] text-white w-full max-w-sm shadow-2xl relative overflow-hidden group", formData.storeBannerColor)}>
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                                <InfinityLogo className="w-24 h-24" />
                            </div>
                            <div className="relative z-10 flex items-center gap-6 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 overflow-hidden flex items-center justify-center shadow-inner">
                                    {formData.storeLogoUrl ? (
                                        <Image src={formData.storeLogoUrl} alt="Logo" width={64} height={64} className="object-cover h-full w-full" />
                                    ) : (
                                        <User className="w-8 h-8" />
                                    )}
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">Founding Node</div>
                                    <div className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase border border-white/20 w-fit">Verified ID</div>
                                </div>
                            </div>
                            <div className="text-3xl font-black italic tracking-tighter relative z-10">{formData.storeName}</div>
                            <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-3 relative z-10">
                                <ShieldCheck className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Founding 50 Candidate</span>
                            </div>
                        </div>
                    )}

                    <Link href="/">
                        <Button variant="ghost" className="h-14 font-bold uppercase tracking-widest text-xs text-loops-muted">
                            Return to Homepage
                        </Button>
                    </Link>
                </div>
            )
        }
    ];

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    return (
        <div className="fixed inset-0 bg-loops-bg text-loops-main overflow-y-auto overflow-x-hidden selection:bg-loops-primary/20">
            <BackgroundShapes />
            
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
                <div className="flex gap-2">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1 rounded-full transition-all duration-500",
                                i === currentSlide ? "w-8 bg-loops-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]" : (i < currentSlide ? "w-4 bg-loops-primary/30" : "w-4 bg-loops-border")
                            )}
                        />
                    ))}
                </div>
                {currentSlide < slides.length - 1 && (
                    <button onClick={() => window.location.href = '/'} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-loops-muted hover:text-loops-primary transition-all">
                        Skip
                    </button>
                )}
            </div>

            <main className="relative min-h-full w-full flex flex-col justify-center py-20 z-10 px-4">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentSlide}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 200, damping: 25 },
                            opacity: { duration: 0.3 }
                        }}
                        className="absolute inset-0 w-full h-full flex items-center justify-center p-4 sm:p-8"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full max-w-5xl bg-white/40 backdrop-blur-3xl border border-white/20 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden relative"
                        >
                            <div className="h-full max-h-[85vh] overflow-y-auto overflow-x-hidden custom-scrollbar py-6 sm:py-12 p-2 sm:p-8">
                                {slides[currentSlide].content}
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

function BenefitCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="p-6 rounded-3xl bg-white/40 backdrop-blur-md border border-white/40 flex items-center gap-4 group hover:bg-white/60 hover:border-loops-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-loops-primary/10 flex items-center justify-center text-loops-primary group-hover:scale-110 group-hover:bg-loops-primary group-hover:text-white transition-all duration-300">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-bold text-sm text-loops-main">{title}</h4>
                <p className="text-[10px] text-loops-muted font-black uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-opacity">{desc}</p>
            </div>
        </div>
    );
}

function IntentCard({ active, onClick, icon: Icon, title, desc }: { active: boolean, onClick: () => void, icon: any, title: string, desc: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center text-center gap-6 group relative overflow-hidden",
                active 
                    ? "border-loops-primary bg-loops-primary/10 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)]" 
                    : "border-white/40 bg-white/20 hover:bg-white/40 hover:border-loops-primary/30"
            )}
        >
            {active && (
                <motion.div 
                    layoutId="active-glow"
                    className="absolute inset-0 bg-gradient-to-tr from-loops-primary/10 via-transparent to-loops-energetic/5 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />
            )}
            <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-all duration-500 group-hover:scale-110",
                active 
                    ? "bg-loops-primary text-white border-loops-primary shadow-lg shadow-loops-primary/30" 
                    : "bg-white/30 text-loops-muted border-white/50"
            )}>
                <Icon className="w-10 h-10" />
            </div>
            <div className="space-y-2 relative z-10">
                <h3 className="text-xl font-bold font-display italic uppercase tracking-tighter">{title}</h3>
                <p className="text-xs text-loops-muted leading-relaxed font-medium">{desc}</p>
            </div>
        </button>
    );
}

function Package(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16.5 9.4 7.5 4.21" />
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.29 7 12 12 20.71 7" />
            <line x1="12" y1="22" x2="12" y2="12" />
        </svg>
    )
}
