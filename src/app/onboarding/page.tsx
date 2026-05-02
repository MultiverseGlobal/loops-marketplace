'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
// Redundant import removed as it's now global
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Check, ChevronRight, School, User, Sparkles, ShieldCheck, Search, Phone, Smartphone } from "lucide-react";
import { cn, formatWhatsAppNumber, isValidWhatsApp } from "@/lib/utils";
import { useToast } from "@/context/toast-context";
import { useCampus } from "@/context/campus-context";

const NIGERIAN_UNI_DOMAINS: Record<string, string> = {
    "University of Lagos": "unilag.edu.ng",
    "University of Ibadan": "ui.edu.ng",
    "University of Benin": "uniben.edu.ng",
    "Covenant University": "covenantuniversity.edu.ng",
    "Babcock University": "babcock.edu.ng",
    "Obafemi Awolowo University": "oauife.edu.ng",
    "Ahmadu Bello University": "abu.edu.ng",
    "University of Nigeria": "unn.edu.ng",
    "Lagos State University": "lasu.edu.ng",
    "Federal University of Technology Akure": "futa.edu.ng",
    "Federal University of Technology Minna": "futminna.edu.ng",
    "Federal University of Technology Owerri": "futo.edu.ng",
    "Nnamdi Azikiwe University": "unizik.edu.ng",
    "University of Port Harcourt": "uniport.edu.ng",
    "University of Jos": "unijos.edu.ng",
    "University of Calabar": "unical.edu.ng",
    "University of Abuja": "uniabuja.edu.ng",
    "Bayero University Kano": "buk.edu.ng",
    "Landmark University": "lmu.edu.ng",
    "Pan-Atlantic University": "pau.edu.ng",
    "American University of Nigeria": "aun.edu.ng",
    "Bowen University": "bowen.edu.ng",
    "Redeemer's University": "run.edu.ng",
    "Afe Babalola University": "abuad.edu.ng",
    "Nile University of Nigeria": "nileuniversity.edu.ng",
    "Baze University": "bazeuniversity.edu.ng",
    "Kwara State University": "kwasu.edu.ng",
    "Ladoke Akintola University": "lautech.edu.ng",
    "Rivers State University": "rsu.edu.ng",
    "Enugu State University": "esut.edu.ng",
    "Ambrose Alli University": "aauekpoma.edu.ng",
    "Delta State University": "delsu.edu.ng",
    "Abia State University": "abiastateuniversity.edu.ng",
    "Ekiti State University": "eksu.edu.ng",
    "Olabisi Onabanjo University": "oouagoiwoye.edu.ng",
    "Adekunle Ajasin University": "aaua.edu.ng",
    "Benue State University": "bsum.edu.ng",
    "Kaduna State University": "kasu.edu.ng",
    "Imo State University": "imsu.edu.ng",
    "Ebonyi State University": "ebsu.edu.ng",
    "Niger Delta University": "ndu.edu.ng",
    "Tai Solarin University": "tasued.edu.ng",
    "Osun State University": "uniosun.edu.ng",
    "Kogi State University": "ksu.edu.ng",
    "Benson Idahosa University": "biu.edu.ng",
    "Igbinedion University": "iuokada.edu.ng",
    "Madonna University": "madonnauniversity.edu.ng",
    "Ajayi Crowther University": "acu.edu.ng",
    "Al-Hikmah University": "alhikmah.edu.ng",
    "Lead City University": "lcu.edu.ng",
    "Veritas University": "veritas.edu.ng"
};

interface Campus {
    id: string;
    name: string;
    slug: string;
    location: string;
    domain: string;
}

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [selectedCampus, setSelectedCampus] = useState(""); // No default, force selection
    const [referralCode, setReferralCode] = useState("");
    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [storeName, setStoreName] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [primaryRole, setPrimaryRole] = useState<'buying' | 'plug'>('buying');
    const [storeCategory, setStoreCategory] = useState("");
    const [storeBannerColor, setStoreBannerColor] = useState("bg-loops-primary");
    const [plugType, setPlugType] = useState("Individual");
    const [businessStage, setBusinessStage] = useState("Just Starting");
    const [deliveryMode, setDeliveryMode] = useState("Campus Meetup");
    const [refundPolicy, setRefundPolicy] = useState("No Refunds");
    const [isGeneratingStore, setIsGeneratingStore] = useState(false);
    const [generationStep, setGenerationStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestData, setRequestData] = useState({ name: "", email: "", reason: "" });
    const [requestLoading, setRequestLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [matricNumber, setMatricNumber] = useState("");
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

    const filteredCampuses = campuses.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
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

            // Check if user has already completed onboarding
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profile?.campus_id) {
                router.replace('/browse');
                return;
            }

            // Pre-fill state if profile exists (partial onboarding or system created)
            if (profile) {
                if (profile.full_name) setFullName(profile.full_name);
                if (profile.bio) setBio(profile.bio);
                if (profile.whatsapp_number) setWhatsappNumber(profile.whatsapp_number);
                if (profile.primary_role) setPrimaryRole(profile.primary_role);
                if (profile.store_name) setStoreName(profile.store_name);
                if (profile.store_category) setStoreCategory(profile.store_category);
            }

            // Fetch all active campuses from DB (only show activated founding nodes)
            const { data } = await supabase
                .from('campuses')
                .select('*')
                .eq('is_active', true)
                .order('name', { ascending: true });
            if (data) setCampuses(data);
        };
        setup();
    }, [router, supabase]);

    useEffect(() => {
        if (step === 7 && primaryRole === 'plug') {
            setGenerationStep(0);
            const interval = setInterval(() => {
                setGenerationStep(prev => {
                    if (prev >= 3) {
                        clearInterval(interval);
                        setTimeout(() => setStep(8), 800);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1200);
            return () => clearInterval(interval);
        }
    }, [step, primaryRole]);

    const handleNext = async () => {
        if (step === 1) {
            const campus = campuses.find(c => c.id === selectedCampus);
            const { data: { session } } = await supabase.auth.getSession();
            const userEmail = session?.user?.email;

            if (campus?.domain && !userEmail?.endsWith(campus.domain)) {
                // Relaxed: Just a warning instead of a hard block
                toast.error(`Verification Note: You're joining with a non-school email. Please ensure your Matric Number is accurate for verification.`);
            }
        }
        setStep(step + 1);
    };
    const handleBack = () => setStep(step - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Try getSession first as it's more robust for client-side valid sessions
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;

            if (!user) throw new Error("Session expired. Please sign in again.");

            if (primaryRole === 'plug' && !isValidWhatsApp(whatsappNumber)) {
                toast.error("Verified Plugs must have a valid WhatsApp number for the Handshake flow.");
                setLoading(false);
                return;
            }

            console.error("Onboarding Payload:", { id: user.id, campus_id: selectedCampus, primary_role: primaryRole });
            const { error: upsertError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    campus_id: selectedCampus,
                    full_name: fullName,
                    bio: bio,
                    store_name: storeName,
                    store_category: storeCategory,
                    store_banner_color: storeBannerColor,
                    whatsapp_number: formatWhatsAppNumber(whatsappNumber),
                    primary_role: primaryRole,
                    is_plug: primaryRole === 'plug',
                    plug_type: plugType,
                    delivery_mode: deliveryMode,
                    refund_policy: refundPolicy,
                    business_stage: businessStage,
                    referred_by_code: referralCode || null,
                    updated_at: new Date().toISOString(),
                });

            if (upsertError) throw upsertError;

            // Save sensitive verification info to a private table
            if (matricNumber) {
                const { error: verifyError } = await supabase
                    .from('student_verifications')
                    .upsert({
                        user_id: user.id,
                        matric_number: matricNumber,
                        updated_at: new Date().toISOString()
                    });

                if (verifyError) {
                    console.error("Verification Storage Error:", verifyError);
                    // We don't block onboarding for this, but log it
                }
            }

            toast.success(`Profile Activated. Welcome to the ${getTerm('communityName')}!`);

            // Trigger PWA Install Prompt on success
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('show-pwa-install'));
            }

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

            <main className="pt-24 sm:pt-32 pb-16 sm:pb-20 max-w-2xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Progress Bar */}
                <div className="flex gap-1 sm:gap-2 mb-8 sm:mb-12">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1 flex-1 rounded-full transition-all duration-500",
                                step >= i ? "bg-loops-primary" : "bg-loops-border",
                                step === 7 && i === 7 ? "animate-pulse bg-loops-accent" : ""
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
                                <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-loops-main">
                                    Select your <span className="text-gradient italic">campus</span>
                                </h1>
                                <p className="text-loops-muted text-[16px] md:text-lg opacity-80">Loops is built on trust. Choose your verified university network to join the local {getTerm('communityName')}.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-loops-muted group-focus-within:text-loops-primary transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search for your university..."
                                        className="w-full h-14 pl-12 pr-4 rounded-xl bg-loops-subtle border border-loops-border text-loops-main focus:border-loops-primary focus:outline-none focus:ring-1 focus:ring-loops-primary transition-all shadow-sm font-medium"
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        value={searchTerm}
                                    />
                                </div>

                                <div className="max-h-[340px] overflow-y-auto pr-2 space-y-2 custom-scrollbar pb-2">
                                    {filteredCampuses.map((campus: any) => (
                                        <button
                                            key={campus.id}
                                            onClick={() => {
                                                setSelectedCampus(campus.id);
                                                setSearchTerm(campus.name);
                                            }}
                                            className={cn(
                                                "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left group animate-in fade-in slide-in-from-bottom-2 duration-300",
                                                selectedCampus === campus.id
                                                    ? "bg-loops-primary text-white border-loops-primary shadow-lg shadow-loops-primary/20 scale-[1.02]"
                                                    : "bg-white border-loops-border hover:border-loops-primary/40 hover:shadow-md"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-inner",
                                                    selectedCampus === campus.id ? "bg-white/20 text-white" : "bg-loops-subtle text-loops-muted border border-loops-border"
                                                )}>
                                                    <School className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className={cn("font-bold transition-colors", selectedCampus === campus.id ? "text-white" : "text-loops-main")}>{campus.name}</div>
                                                    <div className={cn("text-[10px] uppercase font-bold tracking-widest opacity-60 italic", selectedCampus === campus.id ? "text-white/80" : "text-loops-muted")}>@{campus.domain}</div>
                                                </div>
                                            </div>
                                            {selectedCampus === campus.id && (
                                                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                    <Check className="w-3 h-3 text-loops-primary" />
                                                </div>
                                            )}
                                        </button>
                                    ))}

                                    {filteredCampuses.length === 0 && (
                                        <div className="py-10 text-center bg-loops-subtle/30 rounded-[2rem] border border-dashed border-loops-border/60 space-y-4">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                                <Search className="w-6 h-6 text-loops-muted/40" />
                                            </div>
                                            <p className="text-sm text-loops-muted italic px-8">" {searchTerm} " hasn't joined the Loop yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 sm:h-14 text-base sm:text-lg font-medium rounded-xl sm:rounded-2xl"
                                disabled={!selectedCampus}
                                onClick={handleNext}
                            >
                                Continue
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>

                            <div className="pt-4 text-center space-y-4">
                                <p className="text-sm text-loops-muted font-bold italic">Can't find your school?</p>
                                <button
                                    onClick={() => setShowRequestForm(true)}
                                    className="w-full h-14 rounded-2xl border border-dashed border-loops-primary/40 text-loops-primary font-bold hover:bg-loops-primary/5 transition-all flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Nominate your Campus
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
                                                        onChange={(e) => {
                                                            const name = e.target.value;
                                                            setRequestData({ ...requestData, name });
                                                            // Try to auto-match domain
                                                            const match = Object.entries(NIGERIAN_UNI_DOMAINS).find(([uni]) =>
                                                                name.toLowerCase().includes(uni.toLowerCase())
                                                            );
                                                            if (match && !requestData.email.includes('@')) {
                                                                setRequestData(prev => ({ ...prev, name, email: `yourname@${match[1]}` }));
                                                            }
                                                        }}
                                                        placeholder="e.g. University of Benin"
                                                        className="w-full h-14 px-6 rounded-xl bg-loops-subtle border border-loops-border focus:border-loops-primary focus:outline-none focus:ring-1 focus:ring-loops-primary transition-all font-bold"
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
                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">Matriculation / Student ID Number</label>
                                    <div className="relative group">
                                        <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-loops-muted group-focus-within:text-loops-primary transition-colors" />
                                        <input
                                            type="text"
                                            value={matricNumber}
                                            onChange={(e) => setMatricNumber(e.target.value)}
                                            placeholder="e.g. VUG/CSC/21/5432"
                                            className="w-full h-14 pl-12 pr-4 rounded-xl bg-loops-subtle border border-loops-border text-loops-main focus:border-loops-primary focus:outline-none focus:ring-1 focus:ring-loops-primary transition-all shadow-sm font-bold"
                                        />
                                    </div>
                                    <p className="text-[10px] text-loops-muted italic">Used to verify your student status at {campuses.find(c => c.id === selectedCampus)?.name || 'your campus'}.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">WhatsApp Number</label>
                                        {whatsappNumber && isValidWhatsApp(whatsappNumber) && (
                                            <button
                                                onClick={() => {
                                                    const formatted = formatWhatsAppNumber(whatsappNumber);
                                                    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent("Testing my Loops connection! ⚡")}`, '_blank');
                                                    toast.success("Opening WhatsApp test...");
                                                }}
                                                className="text-[10px] font-black uppercase text-loops-primary hover:underline flex items-center gap-1"
                                            >
                                                <Smartphone className="w-3 h-3" />
                                                Test Connection
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-loops-muted group-focus-within:text-loops-primary transition-colors" />
                                        <input
                                            type="tel"
                                            value={whatsappNumber}
                                            onChange={(e) => setWhatsappNumber(e.target.value)}
                                            placeholder="e.g. 08123456789 or 234..."
                                            className={cn(
                                                "w-full h-14 pl-12 pr-4 rounded-xl bg-loops-subtle border text-loops-main focus:outline-none focus:ring-1 transition-all shadow-sm font-bold",
                                                whatsappNumber && !isValidWhatsApp(whatsappNumber) ? "border-red-400 focus:ring-red-400" : "border-loops-border focus:border-loops-primary focus:ring-loops-primary"
                                            )}
                                        />
                                    </div>
                                    <p className="text-[10px] text-loops-muted italic">Essential for the Handshake. Use your local number (e.g. 080...) or international format.</p>
                                </div>



                                <div className="space-y-2 pt-4">
                                    <label className="text-sm font-bold text-loops-primary uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Referral Code (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={referralCode}
                                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                        placeholder="ENTER CODE"
                                        className="w-full h-14 px-6 rounded-xl bg-loops-primary/5 border border-loops-primary/20 text-loops-primary focus:border-loops-primary focus:outline-none focus:ring-1 focus:ring-loops-primary transition-all font-black tracking-[0.2em] shadow-sm uppercase placeholder:text-loops-primary/30"
                                    />
                                    <p className="text-[10px] text-loops-muted italic">If a friend referred you, enter their code here to give them a boost! ⚡</p>
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
                                <p className="text-loops-muted text-lg">Don't worry, you can always do both. This just helps us personalize your Loop.</p>
                            </div>

                            <div className="grid gap-4">
                                {[
                                    {
                                        id: 'buying',
                                        title: 'The Student Buyer',
                                        desc: 'I want to find deals, buy textbooks, and request services.',
                                        icon: User,
                                        color: 'text-loops-primary'
                                    },
                                    {
                                        id: 'plug',
                                        title: 'The Campus Plug',
                                        desc: 'I want to sell items, offer services, and build a campus business.',
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
                                <Button className="h-14 flex-[2] text-lg font-bold bg-loops-primary text-white shadow-xl shadow-loops-primary/20" onClick={() => setStep(primaryRole === 'plug' ? 4 : 8)}>
                                    {primaryRole === 'plug' ? "Step Inside" : "Verify & Finish"}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && primaryRole === 'plug' && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <div className="text-[10px] font-bold text-loops-primary uppercase tracking-[0.3em]">Step 1 of 3: Brand</div>
                                <h1 className="text-4xl font-bold font-display tracking-tight text-loops-main">Build your <span className="text-gradient italic">Brand</span></h1>
                                <p className="text-loops-muted text-lg">Every great empire starts with a name. What are we calling yours?</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">Business Structure</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Individual', 'Business/Brand'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setPlugType(type)}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 transition-all text-left font-bold",
                                                    plugType === type ? "border-loops-primary bg-loops-primary/5 text-loops-primary" : "border-loops-border bg-white text-loops-muted hover:border-loops-primary/30"
                                                )}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">Storefront Name</label>
                                    <input
                                        type="text"
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        placeholder="e.g. Benin City Sneaker Plug"
                                        className="w-full h-14 px-6 rounded-xl bg-loops-subtle border border-loops-border text-loops-main focus:border-loops-primary focus:outline-none focus:ring-1 focus:ring-loops-primary transition-all shadow-sm font-bold text-lg"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">Brand Accent Color</label>
                                    <div className="flex gap-4">
                                        {['bg-loops-primary', 'bg-loops-secondary', 'bg-loops-accent', 'bg-black'].map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setStoreBannerColor(color)}
                                                className={cn(
                                                    "w-12 h-12 rounded-full transition-all border-4",
                                                    color,
                                                    storeBannerColor === color ? "border-loops-main scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" className="h-14 flex-1 border-loops-border text-loops-muted hover:bg-loops-subtle" onClick={handleBack}>
                                    Back
                                </Button>
                                <Button className="h-14 flex-[2] text-lg font-bold bg-loops-primary text-white" disabled={!storeName} onClick={handleNext}>
                                    Next: The Niche
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 5 && primaryRole === 'plug' && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <div className="text-[10px] font-bold text-loops-secondary uppercase tracking-[0.2em]">Step 2 of 3: Strategy</div>
                                <h1 className="text-4xl font-bold font-display tracking-tight text-loops-main">Define your <span className="text-secondary-gradient italic">Niche</span></h1>
                                <p className="text-loops-muted text-lg">What are you plugging? Let buyers know what makes you special.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">Business Stage</label>
                                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                        {['Just Starting', 'Already Selling', 'Scaling Up'].map((stage) => (
                                            <button
                                                key={stage}
                                                onClick={() => setBusinessStage(stage)}
                                                className={cn(
                                                    "px-5 py-3 rounded-xl border-2 transition-all whitespace-nowrap font-bold text-sm",
                                                    businessStage === stage ? "border-loops-secondary bg-loops-secondary/5 text-loops-secondary" : "border-loops-border bg-white text-loops-muted hover:border-loops-secondary/30"
                                                )}
                                            >
                                                {stage}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">Primary Category</label>
                                    <select
                                        value={storeCategory}
                                        onChange={(e) => setStoreCategory(e.target.value)}
                                        className="w-full h-14 px-6 rounded-xl bg-loops-subtle border border-loops-border text-loops-main focus:border-loops-secondary focus:outline-none focus:ring-1 focus:ring-loops-secondary transition-all font-bold"
                                    >
                                        <option value="">Select Niche...</option>
                                        <option value="Electronics">Electronics & Gadgets</option>
                                        <option value="Fashion">Fashion & Thrift</option>
                                        <option value="Books">Academics & Textbooks</option>
                                        <option value="Food">Food & Snacks</option>
                                        <option value="Services">Services (Graphics, Hair, Code, etc)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest flex items-center gap-2">Store Pitch <span className="text-[10px] bg-loops-border text-loops-muted px-2 py-1 rounded-md ml-auto">Optional</span></label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="E.g., The best thrift vintage plug on campus. Next day delivery guaranteed."
                                        rows={3}
                                        className="w-full p-4 rounded-xl bg-loops-subtle border border-loops-border text-loops-main focus:border-loops-secondary focus:outline-none focus:ring-1 focus:ring-loops-secondary transition-all resize-none shadow-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" className="h-14 flex-1 border-loops-border text-loops-muted hover:bg-loops-subtle" onClick={handleBack}>
                                    Back
                                </Button>
                                <Button className="h-14 flex-[2] text-lg font-bold bg-loops-secondary text-white shadow-xl shadow-loops-secondary/20" disabled={!storeCategory} onClick={handleNext}>
                                    Next: Operations
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 6 && primaryRole === 'plug' && (
                        <motion.div
                            key="step6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <div className="text-[10px] font-bold text-loops-accent uppercase tracking-[0.2em]">Step 3 of 3: Logistics</div>
                                <h1 className="text-4xl font-bold font-display tracking-tight text-loops-main">How you <span className="text-accent-gradient italic">Operate</span></h1>
                                <p className="text-loops-muted text-lg">Set the rules for your buyers to ensure smooth transactions.</p>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">Delivery Mode</label>
                                    <div className="grid gap-3">
                                        {[
                                            { id: 'Campus Meetup', desc: 'Buyers meet you at a safe spot on campus' },
                                            { id: 'Hostel Delivery', desc: 'You deliver directly to their room/hostel' },
                                            { id: 'Digital/Virtual', desc: 'For digital services, code, or design' }
                                        ].map((mode) => (
                                            <button
                                                key={mode.id}
                                                onClick={() => setDeliveryMode(mode.id)}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-1",
                                                    deliveryMode === mode.id ? "border-loops-accent bg-loops-accent/5" : "border-loops-border bg-white hover:border-loops-accent/30"
                                                )}
                                            >
                                                <span className={cn("font-bold", deliveryMode === mode.id ? "text-loops-accent" : "text-loops-main")}>{mode.id}</span>
                                                <span className="text-xs text-loops-muted">{mode.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">Refund Policy</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['No Refunds', '24hr Exchange', 'Money Back Guarantee'].map((policy) => (
                                            <button
                                                key={policy}
                                                onClick={() => setRefundPolicy(policy)}
                                                className={cn(
                                                    "px-5 py-3 rounded-xl border-2 transition-all font-bold text-sm flex-1 text-center whitespace-nowrap",
                                                    refundPolicy === policy ? "border-loops-accent bg-loops-accent/5 text-loops-accent" : "border-loops-border bg-white text-loops-muted hover:border-loops-accent/30"
                                                )}
                                            >
                                                {policy}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" className="h-14 flex-1 border-loops-border text-loops-muted hover:bg-loops-subtle" onClick={handleBack}>
                                    Back
                                </Button>
                                <Button className="h-14 flex-[2] text-lg font-bold bg-loops-accent text-loops-main shadow-xl shadow-loops-accent/20" onClick={handleNext}>
                                    Generate Store
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 7 && primaryRole === 'plug' && (
                        <motion.div
                            key="step7"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 space-y-8 text-center"
                        >
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                {/* Rotating gradient ring */}
                                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-loops-accent border-r-loops-primary animate-spin" style={{ animationDuration: '1.5s' }} />
                                <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-loops-secondary border-l-loops-accent animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                                <div className="w-16 h-16 bg-loops-main rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                            </div>

                            <div className="space-y-3 h-24">
                                <h2 className="text-2xl font-bold font-display text-loops-main">
                                    {generationStep === 0 && "Registering Brand..."}
                                    {generationStep === 1 && "Setting up Logistics..."}
                                    {generationStep === 2 && "Securing Storefront..."}
                                    {generationStep >= 3 && "Store Activated!"}
                                </h2>
                                <p className="text-loops-muted font-medium">
                                    {generationStep === 0 && `Reserving ${storeName}`}
                                    {generationStep === 1 && `Applying ${refundPolicy} rules`}
                                    {generationStep === 2 && "Finalizing database entries"}
                                    {generationStep >= 3 && "Redirecting to dashboard"}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {step === 8 && (
                        <motion.div
                            key="step8"
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

                            {primaryRole === 'plug' && (
                                <div className={cn("p-6 rounded-2xl border max-w-sm mx-auto space-y-3 text-white shadow-xl transform hover:scale-[1.02] transition-transform", storeBannerColor)}>
                                    <div className="flex justify-between items-center opacity-80">
                                        <div className="text-[10px] font-bold uppercase tracking-widest">{plugType} Store</div>
                                        <div className="text-[10px] font-bold uppercase">{deliveryMode}</div>
                                    </div>
                                    <div className="text-2xl font-display font-bold leading-tight">{storeName}</div>
                                    <div className="text-xs font-medium bg-black/20 inline-block px-3 py-1 rounded-full">{storeCategory} Hub</div>
                                </div>
                            )}

                            <div className="flex flex-col gap-4 max-w-sm mx-auto pt-4">
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-loops-subtle border border-loops-border text-left shadow-sm">
                                    <Sparkles className="w-5 h-5 text-loops-accent" />
                                    <span className="text-sm font-bold text-loops-main">Plug Reputation activated</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-loops-subtle border border-loops-border text-left shadow-sm">
                                    <Check className="w-5 h-5 text-loops-success" />
                                    <span className="text-sm font-bold text-loops-main">Unlimited Listings enabled</span>
                                </div>

                                {/* Terms Checkbox */}
                                <div className="pt-4 flex items-start gap-3 text-left">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={hasAcceptedTerms}
                                        onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                                        className="mt-1 w-5 h-5 rounded border-loops-border text-loops-success focus:ring-loops-success transition-all cursor-pointer"
                                    />
                                    <label htmlFor="terms" className="text-sm text-loops-muted leading-relaxed cursor-pointer select-none">
                                        I agree to the <Link href="/terms" target="_blank" className="text-loops-primary font-bold hover:underline">Terms of Service</Link> and Community Guidelines for the Loop.
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" className="h-14 flex-1 border-loops-border text-loops-muted hover:bg-loops-subtle" onClick={() => setStep(3)}>
                                    Edit info
                                </Button>
                                <Button
                                    className="h-14 flex-[2] text-lg font-bold bg-loops-success text-white shadow-xl shadow-loops-success/20 hover:bg-loops-success/90 disabled:opacity-50 disabled:grayscale"
                                    onClick={handleSubmit}
                                    disabled={loading || !hasAcceptedTerms}
                                >
                                    {loading ? "Finalizing..." : "Enter the Loop"}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div >
    );
}
