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

const CURRENCY = "₦";

export default function FoundingPlugsCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

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
        storeCategory: ""
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
                    status: 'pending',
                    store_name: formData.storeName,
                    store_banner_color: formData.storeBannerColor,
                    store_category: formData.storeCategory || (formData.offeringType === 'product' ? 'General Goods' : 'Campus Services'),
                    motivation: `Intent: ${formData.intent}`
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
                <div className="flex flex-col items-center justify-center text-center space-y-12 h-full px-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 blur-3xl bg-loops-primary/20 animate-pulse" />
                        <InfinityLogo className="w-48 h-48 relative z-10" />
                    </motion.div>

                    <div className="space-y-4">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="font-display text-5xl sm:text-7xl font-bold tracking-tighter"
                        >
                            The <span className="italic text-loops-primary">Founding</span> Loop.
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg text-loops-muted max-w-lg mx-auto leading-relaxed"
                        >
                            Veritas University is about to change. We're looking for the first 50 students to shape the future of campus commerce.
                        </motion.p>
                    </div>

                    <Button
                        onClick={nextSlide}
                        className="h-16 px-12 rounded-full bg-loops-primary text-white text-lg font-bold shadow-2xl shadow-loops-primary/20 group uppercase tracking-widest"
                    >
                        Start Your Journey
                        <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            )
        },
        {
            id: 'benefits',
            content: (
                <div className="flex flex-col items-center justify-center space-y-12 h-full px-6 max-w-4xl mx-auto">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold font-display italic uppercase tracking-tighter">Ultimate VIP Access</h2>
                        <p className="text-loops-muted">Founding Plugs get benefits that will NEVER be offered again.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <BenefitCard icon={Award} title="Verified Founding Badge" desc="Permanent status on your profile" />
                        <BenefitCard icon={TrendingUp} title="Priority Listing" desc="First page visibility for 3 months" />
                        <BenefitCard icon={Globe} title="Founding 50 Showcase" desc="Featured on the landing page" />
                        <BenefitCard icon={ShieldCheck} title="Zero Fees" desc="No commissions on your first 100 sales" />
                    </div>

                    <div className="flex gap-4 w-full sm:w-auto">
                        <Button variant="ghost" onClick={prevSlide} className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs">Back</Button>
                        <Button onClick={nextSlide} className="flex-2 h-14 px-8 rounded-2xl bg-loops-primary text-white font-bold uppercase tracking-widest text-xs">Continue</Button>
                    </div>
                </div>
            )
        },
        {
            id: 'intent',
            content: (
                <div className="flex flex-col items-center justify-center space-y-12 h-full px-6 max-w-4xl mx-auto">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold font-display italic uppercase tracking-tighter">Choose Your Path</h2>
                        <p className="text-loops-muted">How do you want to start your campus legacy?</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 w-full">
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
                <div className="flex flex-col items-center justify-center space-y-12 h-full px-6 max-w-xl mx-auto w-full">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold font-display italic uppercase tracking-tighter">Who are you?</h2>
                        <p className="text-loops-muted">Verification is the core of the Loop trust.</p>
                    </div>

                    <div className="space-y-6 w-full">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-loops-muted uppercase tracking-widest pl-2">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleFormChange('name', e.target.value)}
                                placeholder="John Doe"
                                className="w-full p-6 text-xl font-bold bg-white border border-loops-border rounded-3xl focus:border-loops-primary outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-loops-muted uppercase tracking-widest pl-2">WhatsApp Number</label>
                            <input
                                type="tel"
                                value={formData.whatsapp}
                                onChange={(e) => handleFormChange('whatsapp', e.target.value)}
                                placeholder="+234..."
                                className="w-full p-6 text-xl font-bold bg-white border border-loops-border rounded-3xl focus:border-loops-primary outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-loops-muted uppercase tracking-widest pl-2">Campus Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleFormChange('email', e.target.value)}
                                placeholder="student@university.edu"
                                className="w-full p-6 text-xl font-bold bg-white border border-loops-border rounded-3xl focus:border-loops-primary outline-none transition-all"
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
                <div className="flex flex-col items-center justify-center space-y-12 h-full px-6 max-w-xl mx-auto w-full">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold font-display italic uppercase tracking-tighter">Your Business</h2>
                        <p className="text-loops-muted">What will you be offering to the community?</p>
                    </div>

                    <div className="space-y-8 w-full">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleFormChange('offeringType', 'product')}
                                className={cn(
                                    "p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4",
                                    formData.offeringType === 'product' ? "border-loops-primary bg-loops-primary/5" : "border-loops-border hover:border-loops-primary/30"
                                )}
                            >
                                <Package className={cn("w-10 h-10", formData.offeringType === 'product' ? "text-loops-primary" : "text-loops-muted")} />
                                <span className="font-bold text-sm uppercase tracking-widest">Products</span>
                            </button>
                            <button
                                onClick={() => handleFormChange('offeringType', 'service')}
                                className={cn(
                                    "p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4",
                                    formData.offeringType === 'service' ? "border-loops-primary bg-loops-primary/5" : "border-loops-border hover:border-loops-primary/30"
                                )}
                            >
                                <Zap className={cn("w-10 h-10", formData.offeringType === 'service' ? "text-loops-primary" : "text-loops-muted")} />
                                <span className="font-bold text-sm uppercase tracking-widest">Services</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-loops-muted uppercase tracking-widest pl-2">Quick Pitch</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleFormChange('description', e.target.value)}
                                placeholder="e.g. I sell high-quality campus fashion components..."
                                rows={3}
                                className="w-full p-6 text-base font-bold bg-white border border-loops-border rounded-3xl focus:border-loops-primary outline-none transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 w-full">
                        <Button variant="ghost" onClick={prevSlide} className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs">Back</Button>
                        <Button
                            disabled={!formData.offeringType || !formData.description}
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
                <div className="flex flex-col items-center justify-center space-y-12 h-full px-6 max-w-xl mx-auto w-full">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold font-display italic uppercase tracking-tighter">Brand Your Vision</h2>
                        <p className="text-loops-muted">Reserve your unique store identity.</p>
                    </div>

                    <div className="space-y-6 w-full">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-loops-muted uppercase tracking-widest pl-2">Storefront Name</label>
                            <input
                                type="text"
                                value={formData.storeName}
                                onChange={(e) => handleFormChange('storeName', e.target.value)}
                                placeholder="Veritas Fashion Lab"
                                className="w-full p-6 text-xl font-bold bg-white border border-loops-border rounded-3xl focus:border-loops-primary outline-none transition-all"
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
                                            "w-12 h-12 rounded-full border-4 transition-all",
                                            color,
                                            formData.storeBannerColor === color ? "border-loops-main scale-110" : "border-transparent opacity-60"
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
            id: 'success',
            content: (
                <div className="flex flex-col items-center justify-center text-center space-y-12 h-full px-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                        className="w-24 h-24 bg-loops-success/10 rounded-full flex items-center justify-center text-loops-success border border-loops-success/20"
                    >
                        <CheckCircle className="w-12 h-12" />
                    </motion.div>

                    <div className="space-y-4">
                        <h2 className="font-display text-4xl font-bold italic uppercase tracking-tighter">You're in the Loop.</h2>
                        <p className="text-loops-muted max-w-sm mx-auto leading-relaxed">
                            Your "Founding Plug" application is being reviewed. Keep an eye on your WhatsApp for an exclusive onboarding link.
                        </p>
                    </div>

                    {formData.storeName && (
                        <div className={cn("p-8 rounded-[2rem] text-white w-full max-w-xs shadow-2xl relative overflow-hidden", formData.storeBannerColor)}>
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <InfinityLogo className="w-16 h-16" />
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-2">Reserved Store</div>
                            <div className="text-2xl font-black italic">{formData.storeName}</div>
                            <div className="mt-4 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase">Founding 50 Candidate</span>
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
        <div className="fixed inset-0 bg-loops-bg text-loops-main overflow-hidden">
            <Navbar />

            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 mt-20">
                <div className="flex gap-2">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1 rounded-full transition-all duration-500",
                                i === currentSlide ? "w-8 bg-loops-primary" : (i < currentSlide ? "w-4 bg-loops-primary/30" : "w-4 bg-loops-border")
                            )}
                        />
                    ))}
                </div>
                {currentSlide < slides.length - 1 && (
                    <button onClick={() => window.location.href = '/'} className="text-[10px] font-bold uppercase tracking-widest text-loops-muted hover:text-loops-primary transition-colors">
                        Skip Onboarding
                    </button>
                )}
            </div>

            <main className="relative h-full w-full">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentSlide}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="absolute inset-0"
                    >
                        {slides[currentSlide].content}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

function BenefitCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="p-6 rounded-3xl bg-white border border-loops-border flex items-center gap-4 group hover:border-loops-primary/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-loops-primary/5 flex items-center justify-center text-loops-primary group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-bold text-sm text-loops-main">{title}</h4>
                <p className="text-[10px] text-loops-muted font-medium">{desc}</p>
            </div>
        </div>
    );
}

function IntentCard({ active, onClick, icon: Icon, title, desc }: { active: boolean, onClick: () => void, icon: any, title: string, desc: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center text-center gap-6 group",
                active ? "border-loops-primary bg-loops-primary/5" : "border-loops-border bg-white hover:border-loops-primary/30"
            )}
        >
            <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-all group-hover:rotate-6",
                active ? "bg-loops-primary text-white border-loops-primary" : "bg-loops-subtle text-loops-muted border-loops-border"
            )}>
                <Icon className="w-10 h-10" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-bold font-display italic uppercase tracking-tighter">{title}</h3>
                <p className="text-xs text-loops-muted leading-relaxed">{desc}</p>
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
