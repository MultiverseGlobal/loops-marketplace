'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, School, User, Sparkles, ShieldCheck, Search } from "lucide-react";
import { cn } from "@/lib/utils";
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
    const [selectedCampus, setSelectedCampus] = useState("");
    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [storeName, setStoreName] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [primaryRole, setPrimaryRole] = useState<'buying' | 'plug'>('buying');
    const [storeCategory, setStoreCategory] = useState("");
    const [storeBannerColor, setStoreBannerColor] = useState("bg-loops-primary");
    const [loading, setLoading] = useState(false);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestData, setRequestData] = useState({ name: "", email: "", reason: "" });
    const [requestLoading, setRequestLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [matricNumber, setMatricNumber] = useState("");

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

            // Fetch all active campuses from DB
            const { data } = await supabase
                .from('campuses')
                .select('*')
                .order('name', { ascending: true });
            if (data) setCampuses(data);
        };
        setup();
    }, [router, supabase]);

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
                    whatsapp_number: whatsappNumber,
                    primary_role: primaryRole,
                    is_plug: primaryRole === 'plug',
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

                            <div className="pt-8 text-center space-y-4">
                                <p className="text-sm text-loops-muted">Not from Veritas University?</p>
                                <button
                                    onClick={() => setShowRequestForm(true)}
                                    className="w-full h-14 rounded-2xl border border-dashed border-loops-primary/40 text-loops-primary font-bold hover:bg-loops-primary/5 transition-all flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Nominate your Campus for the next Loop
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
                                <Button className="h-14 flex-[2] text-lg font-bold bg-loops-primary text-white shadow-xl shadow-loops-primary/20" onClick={() => setStep(primaryRole === 'plug' ? 4 : 6)}>
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
                                <div className="text-[10px] font-bold text-loops-primary uppercase tracking-[0.3em]">Plug Setup</div>
                                <h1 className="text-4xl font-bold font-display tracking-tight text-loops-main">Select your <span className="text-gradient italic">Vibe</span></h1>
                                <p className="text-loops-muted text-lg">Detailed stores sell 3x more. Pick a banner color and name your Pulse.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">Storefront Name</label>
                                    <input
                                        type="text"
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        placeholder="e.g. Benin City Sneaker Plug"
                                        className="w-full h-14 px-6 rounded-xl bg-loops-subtle border border-loops-border text-loops-main focus:border-loops-primary focus:outline-none focus:ring-1 focus:ring-loops-primary transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">Banner Accent</label>
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
                                    Activate Vibe
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
                                <div className="text-[10px] font-bold text-loops-secondary uppercase tracking-[0.2em]">Growth Strategy</div>
                                <h1 className="text-4xl font-bold font-display tracking-tight text-loops-main">Define your <span className="text-secondary-gradient italic">Niche</span></h1>
                                <p className="text-loops-muted text-lg">What are you plugging? This helps us route buyers to your store.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">Primary Category</label>
                                    <select
                                        value={storeCategory}
                                        onChange={(e) => setStoreCategory(e.target.value)}
                                        className="w-full h-14 px-6 rounded-xl bg-loops-subtle border border-loops-border text-loops-main focus:border-loops-secondary focus:outline-none focus:ring-1 focus:ring-loops-secondary transition-all"
                                    >
                                        <option value="">Select Niche...</option>
                                        <option value="Electronics">Electronics Plug</option>
                                        <option value="Fashion">Fashion Plug</option>
                                        <option value="Books">Academics/Books</option>
                                        <option value="Food">Food/Snacks</option>
                                        <option value="Services">Services (Graphics, Code, etc)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-loops-muted uppercase tracking-widest">WhatsApp Connectivity</label>
                                    <input
                                        type="tel"
                                        value={whatsappNumber}
                                        onChange={(e) => setWhatsappNumber(e.target.value)}
                                        placeholder="2348123456789"
                                        className="w-full h-14 px-6 rounded-xl bg-loops-subtle border border-loops-border text-loops-main focus:border-loops-secondary focus:outline-none focus:ring-1 focus:ring-loops-secondary transition-all shadow-sm"
                                    />
                                    <p className="text-[10px] text-loops-muted italic">Mandatory for the L-Bot AI Listing assistant.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" className="h-14 flex-1 border-loops-border text-loops-muted hover:bg-loops-subtle" onClick={handleBack}>
                                    Back
                                </Button>
                                <Button className="h-14 flex-[2] text-lg font-bold bg-loops-secondary text-white shadow-xl shadow-loops-secondary/20" disabled={!storeCategory || !whatsappNumber} onClick={handleNext}>
                                    Go Live
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

                            {primaryRole === 'plug' && (
                                <div className={cn("p-6 rounded-2xl border max-w-sm mx-auto space-y-2 text-white", storeBannerColor)}>
                                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Verified Plug Storefront</div>
                                    <div className="text-2xl font-display font-bold">{storeName}</div>
                                    <div className="text-xs font-medium opacity-90">{storeCategory} Hub</div>
                                </div>
                            )}

                            <div className="grid gap-4 max-w-sm mx-auto pt-4">
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-loops-subtle border border-loops-border text-left shadow-sm">
                                    <Sparkles className="w-5 h-5 text-loops-accent" />
                                    <span className="text-sm font-bold text-loops-main">Plug Reputation activated</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-loops-subtle border border-loops-border text-left shadow-sm">
                                    <Check className="w-5 h-5 text-loops-success" />
                                    <span className="text-sm font-bold text-loops-main">Unlimited Listings enabled</span>
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
                                    {loading ? "Finalizing..." : "Enter the Loop"}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
