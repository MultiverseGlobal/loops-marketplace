'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, School, User, Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/toast-context";
import { useCampus } from "@/context/campus-context";

interface Campus {
    id: string;
    name: string;
    slug: string;
    location: string;
}

// Fallback is no longer needed as we fetch from DB and have a "Request a Campus" button

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [selectedCampus, setSelectedCampus] = useState("");
    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [storeName, setStoreName] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [primaryRole, setPrimaryRole] = useState<'buying' | 'selling'>('buying');
    const [loading, setLoading] = useState(false);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestData, setRequestData] = useState({ name: "", email: "", reason: "" });
    const [requestLoading, setRequestLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();
    const toast = useToast();
    const { getTerm } = useCampus();

    useEffect(() => {
        const setup = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.replace('/login?view=signup');
                return;
            }

            // Fetch real campuses from DB
            const { data } = await supabase.from('campuses').select('*');
            if (data) setCampuses(data);
        };
        setup();
    }, [router, supabase]);

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Try getSession first as it's more robust for client-side valid sessions
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;

            if (!user) throw new Error("Session expired. Please sign in again.");

            console.error("Onboarding Payload:", { id: user.id, campus_id: selectedCampus, primary_role: primaryRole });
            const { error: upsertError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    campus_id: selectedCampus,
                    full_name: fullName,
                    bio: bio,
                    store_name: storeName,
                    whatsapp_number: whatsappNumber,
                    primary_role: primaryRole,
                    updated_at: new Date().toISOString(),
                });

            if (upsertError) throw upsertError;

            toast.success(`Profile Activated. Welcome to the ${getTerm('communityName')}!`);
            router.push('/browse');
        } catch (error: any) {
            toast.error(error.message || "Failed to complete onboarding. Check console.");
            if (error?.message?.includes("Session")) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setRequestLoading(true);
        try {
            const { error } = await supabase
                .from('campus_requests')
                .insert({
                    university_name: requestData.name,
                    school_email: requestData.email,
                    reason: requestData.reason
                });

            if (error) throw error;

            toast.success("Request sent! We'll notify you when your campus is live.");
            setShowRequestForm(false);
            setRequestData({ name: "", email: "", reason: "" });
        } catch (error: any) {
            toast.error(error.message || "Failed to send request.");
        } finally {
            setRequestLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-loops-primary/10 via-loops-bg to-loops-bg pointer-events-none" />
            <Navbar />

            <main className="pt-32 pb-20 max-w-2xl mx-auto px-6 relative z-10">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-12">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1 flex-1 rounded-full transition-all duration-500",
                                step >= i ? "bg-loops-primary" : "bg-loops-border"
                            )}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <h1 className="text-4xl font-extrabold font-display tracking-tight text-loops-main">
                                    Select your <span className="text-gradient italic">campus</span>
                                </h1>
                                <p className="text-loops-muted text-[16px] md:text-lg opacity-80">Loops is built on trust. Choose your verified university network to join the local {getTerm('communityName')}.</p>
                            </div>

                            <div className="grid gap-4">
                                {campuses.map((campus: any) => (
                                    <button
                                        key={campus.id}
                                        onClick={() => setSelectedCampus(campus.id)}
                                        className={cn(
                                            "flex items-center justify-between p-6 rounded-2xl border transition-all text-left group",
                                            selectedCampus === campus.id
                                                ? "bg-loops-primary/5 border-loops-primary"
                                                : "bg-loops-subtle border-loops-border hover:border-loops-primary/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                                                selectedCampus === campus.id ? "bg-loops-primary text-white" : "bg-white text-loops-muted border border-loops-border"
                                            )}>
                                                <School className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg text-loops-main">{campus.name}</div>
                                                <div className="text-sm text-loops-muted">@{campus.domain}</div>
                                            </div>
                                        </div>
                                        {selectedCampus === campus.id && (
                                            <div className="w-6 h-6 rounded-full bg-loops-primary flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <Button
                                className="w-full h-14 text-lg font-medium"
                                disabled={!selectedCampus}
                                onClick={handleNext}
                            >
                                Continue
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>

                            <div className="pt-4 text-center">
                                <button
                                    onClick={() => setShowRequestForm(true)}
                                    className="text-loops-primary font-bold hover:underline"
                                >
                                    Don't see your school? Request it here
                                </button>
                            </div>

                            <AnimatePresence>
                                {showRequestForm && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-loops-main/40 backdrop-blur-md"
                                    >
                                        <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-3xl space-y-8 border border-loops-border">
                                            <div className="space-y-4 text-center">
                                                <div className="w-16 h-16 bg-loops-primary/10 rounded-2xl flex items-center justify-center mx-auto text-loops-primary">
                                                    <School className="w-8 h-8" />
                                                </div>
                                                <h2 className="text-3xl font-bold font-display tracking-tight">Nominate your Campus</h2>
                                                <p className="text-loops-muted">Help us move fast. Tell us which university we should prioritize next.</p>
                                            </div>

                                            <form onSubmit={handleRequestSubmit} className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">University Name</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={requestData.name}
                                                        onChange={(e) => setRequestData({ ...requestData, name: e.target.value })}
                                                        placeholder="e.g. University of Benin"
                                                        className="w-full h-14 px-6 rounded-xl bg-loops-subtle border border-loops-border focus:border-loops-primary focus:outline-none focus:ring-1 focus:ring-loops-primary transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">School Email</label>
                                                    <input
                                                        required
                                                        type="email"
                                                        value={requestData.email}
                                                        onChange={(e) => setRequestData({ ...requestData, email: e.target.value })}
                                                        placeholder="yourname@school.edu.ng"
                                                        className="w-full h-14 px-6 rounded-xl bg-loops-subtle border border-loops-border focus:border-loops-primary focus:outline-none focus:ring-1 focus:ring-loops-primary transition-all"
                                                    />
                                                </div>
                                                <div className="flex gap-4 pt-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="flex-1 h-14 border-loops-border"
                                                        onClick={() => setShowRequestForm(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        className="flex-1 h-14 bg-loops-primary"
                                                        disabled={requestLoading}
                                                    >
                                                        {requestLoading ? "Submitting..." : "Submit Nomination"}
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold font-display tracking-tight text-loops-main">Create your profile</h1>
                                <p className="text-loops-muted text-lg">This is how your peers will see you in the community.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-loops-muted group-focus-within:text-loops-primary transition-colors" />
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Alex Johnson"
                                            className="w-full h-14 pl-12 pr-4 rounded-xl bg-loops-subtle border border-loops-border text-loops-main focus:border-loops-primary focus:outline-none focus:ring-1 focus:ring-loops-primary transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">Bio (Optional)</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Senior CS major. Selling my old textbooks and offering UI design help."
                                        rows={4}
                                        className="w-full p-4 rounded-xl bg-loops-subtle border border-loops-border text-loops-main focus:border-loops-primary focus:outline-none focus:ring-1 focus:ring-loops-primary transition-all resize-none shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" className="h-14 flex-1 border-loops-border text-loops-muted hover:bg-loops-subtle" onClick={handleBack}>
                                    Back
                                </Button>
                                <Button className="h-14 flex-[2] text-lg font-bold bg-loops-primary text-white shadow-xl shadow-loops-primary/20" disabled={!fullName} onClick={handleNext}>
                                    Pre-verify Identity
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold font-display tracking-tight text-loops-main">What's your primary goal?</h1>
                                <p className="text-loops-muted text-lg">Don't worry, you can always do both. This just helps us personalize your hub.</p>
                            </div>

                            <div className="grid gap-4">
                                {[
                                    {
                                        id: 'buying',
                                        title: 'The Student Consumer',
                                        desc: 'I want to find deals, buy textbooks, and request services.',
                                        icon: User,
                                        color: 'text-loops-primary'
                                    },
                                    {
                                        id: 'selling',
                                        title: 'The Campus Merchant',
                                        desc: 'I want to sell items, offer services, and build a business.',
                                        icon: Sparkles,
                                        color: 'text-loops-secondary'
                                    }
                                ].map((role: any) => (
                                    <button
                                        key={role.id}
                                        onClick={() => setPrimaryRole(role.id)}
                                        className={cn(
                                            "flex items-center gap-6 p-6 rounded-2xl border transition-all text-left group",
                                            primaryRole === role.id
                                                ? "bg-loops-primary/5 border-loops-primary shadow-lg shadow-loops-primary/5"
                                                : "bg-loops-subtle border-loops-border hover:border-loops-primary/20"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-14 h-14 rounded-xl flex items-center justify-center transition-colors shadow-sm bg-white border border-loops-border",
                                            primaryRole === role.id ? role.color : "text-loops-muted"
                                        )}>
                                            <role.icon className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-lg text-loops-main">{role.title}</div>
                                            <div className="text-sm text-loops-muted">{role.desc}</div>
                                        </div>
                                        {primaryRole === role.id && (
                                            <div className="w-6 h-6 rounded-full bg-loops-primary flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" className="h-14 flex-1 border-loops-border text-loops-muted hover:bg-loops-subtle" onClick={handleBack}>
                                    Back
                                </Button>
                                <Button className="h-14 flex-[2] text-lg font-bold bg-loops-primary text-white shadow-xl shadow-loops-primary/20" onClick={() => setStep(primaryRole === 'selling' ? 4 : 6)}>
                                    {primaryRole === 'selling' ? "Step Inside" : "Verify & Finish"}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && primaryRole === 'selling' && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <div className="text-[10px] font-bold text-loops-primary uppercase tracking-[0.3em]">Merchant Setup</div>
                                <h1 className="text-4xl font-bold font-display tracking-tight text-loops-main">Name your <span className="text-gradient italic">Pulse</span></h1>
                                <p className="text-loops-muted text-lg">Every merchant needs a brand. What should peers call your storefront?</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">Storefront Name</label>
                                    <input
                                        type="text"
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        placeholder="e.g. Alex's Gadget Hub"
                                        className="w-full h-14 px-6 rounded-xl bg-loops-subtle border border-loops-border text-loops-main focus:border-loops-primary focus:outline-none focus:ring-1 focus:ring-loops-primary transition-all shadow-sm"
                                    />
                                    <p className="text-[10px] text-loops-muted italic">This will appear on your listings and profile header.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" className="h-14 flex-1 border-loops-border text-loops-muted hover:bg-loops-subtle" onClick={handleBack}>
                                    Back
                                </Button>
                                <Button className="h-14 flex-[2] text-lg font-bold bg-loops-primary text-white" disabled={!storeName} onClick={handleNext}>
                                    Brand Active
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 5 && primaryRole === 'selling' && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <div className="text-[10px] font-bold text-loops-secondary uppercase tracking-[0.2em]">Automated Pulse</div>
                                <h1 className="text-4xl font-bold font-display tracking-tight text-loops-main">Connect <span className="text-secondary-gradient italic">L-Bot</span></h1>
                                <p className="text-loops-muted text-lg">Power your commerce via WhatsApp. List items, search, and get notified instantly.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 rounded-2xl bg-loops-secondary/5 border border-loops-secondary/20 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-loops-secondary text-white flex items-center justify-center shadow-lg">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div className="font-bold text-loops-main">AI-Powered Selling</div>
                                    </div>
                                    <p className="text-xs text-loops-muted leading-relaxed">By linking WhatsApp, you can simply text "Sell my iPhone for $400" and L-Bot will handle the listing for you.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">WhatsApp Number</label>
                                    <input
                                        type="tel"
                                        value={whatsappNumber}
                                        onChange={(e) => setWhatsappNumber(e.target.value)}
                                        placeholder="2348123456789"
                                        className="w-full h-14 px-6 rounded-xl bg-loops-subtle border border-loops-border text-loops-main focus:border-loops-secondary focus:outline-none focus:ring-1 focus:ring-loops-secondary transition-all shadow-sm"
                                    />
                                    <p className="text-[10px] text-loops-muted italic">Include country code without '+'.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" className="h-14 flex-1 border-loops-border text-loops-muted hover:bg-loops-subtle" onClick={handleBack}>
                                    Skip
                                </Button>
                                <Button className="h-14 flex-[2] text-lg font-bold bg-loops-secondary text-white shadow-xl shadow-loops-secondary/20" onClick={handleNext}>
                                    Power Up
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 6 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-8"
                        >
                            <div className="w-24 h-24 bg-loops-success/10 rounded-full flex items-center justify-center mx-auto text-loops-success border border-loops-success/20">
                                <ShieldCheck className="w-12 h-12" />
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold font-display italic tracking-tighter text-loops-main">Verified.</h1>
                                <p className="text-loops-muted text-lg max-w-sm mx-auto leading-relaxed">
                                    Your status has been pre-verified. You are now part of the
                                    <span className="text-loops-primary font-bold ml-1">{getTerm('communityName')}.</span>
                                </p>
                            </div>

                            {primaryRole === 'selling' && (
                                <div className="p-6 rounded-2xl bg-loops-primary/5 border border-loops-primary/10 max-w-sm mx-auto space-y-2">
                                    <div className="text-[10px] font-bold text-loops-primary uppercase tracking-widest">Storefront Activated</div>
                                    <div className="text-xl font-display font-bold text-loops-main">{storeName}</div>
                                </div>
                            )}

                            <div className="grid gap-4 max-w-sm mx-auto pt-4">
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-loops-subtle border border-loops-border text-left shadow-sm">
                                    <Sparkles className="w-5 h-5 text-loops-accent" />
                                    <span className="text-sm font-bold text-loops-main">{getTerm('reputationLabel')} activated</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-loops-subtle border border-loops-border text-left shadow-sm">
                                    <Check className="w-5 h-5 text-loops-success" />
                                    <span className="text-sm font-bold text-loops-main">Unlimited listings enabled</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" className="h-14 flex-1 border-loops-border text-loops-muted hover:bg-loops-subtle" onClick={() => setStep(3)}>
                                    Edit info
                                </Button>
                                <Button
                                    className="h-14 flex-[2] text-lg font-bold bg-loops-success text-white shadow-xl shadow-loops-success/20 hover:bg-loops-success/90"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? "Finalizing..." : "Enter the Hub"}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
