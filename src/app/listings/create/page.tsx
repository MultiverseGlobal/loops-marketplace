'use client';

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Zap, MessageSquare, ChevronRight, ChevronLeft, Upload, DollarSign, Info, Sparkles, ShieldCheck, MapPin } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/toast-context";
import { useCampus } from "@/context/campus-context";
import { CURRENCY } from "@/lib/constants";

type ListingType = 'product' | 'service' | 'request';

const STEPS = [
    { title: "Choose Type", description: "What are you putting into the Loop?" },
    { title: "Details", description: "Tell the campus all about it" },
    { title: "Review", description: "One last check before it's live" }
];

export default function CreateListingPage() {
    const [step, setStep] = useState(1);
    const [type, setType] = useState<ListingType | null>(null);
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [pickupLocation, setPickupLocation] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const toast = useToast();
    const { campus } = useCampus();

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in to post.");

            const { data: profile } = await supabase
                .from('profiles')
                .select('campus_id, email_verified')
                .eq('id', user.id)
                .single();

            const isVerified = profile?.email_verified || !!user.email_confirmed_at || !!user.phone_confirmed_at;

            if (!isVerified) {
                // Determine if we should redirect or show alert. 
                // Alert is simpler for now as per plan
                throw new Error("You must verify your email to post listings. Check your inbox or dashboard.");
            }

            if (!profile?.campus_id) {
                throw new Error("Campus not set. Please complete your onboarding first.");
            }

            const { error } = await supabase
                .from('listings')
                .insert({
                    seller_id: user.id,
                    campus_id: profile.campus_id,
                    title,
                    description,
                    price: parseFloat(price) || 0,
                    type,
                    category,
                    images, // Save the array of image URLs
                    pickup_location: pickupLocation,
                    status: 'active'
                });

            if (error) {
                throw error;
            }
            if (!error) {
                toast.success("Listing created! Your Pulse is now live in the Loop.");
                router.push('/browse');
            } else {
                throw error;
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create listing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-loops-primary/10 via-transparent to-transparent pointer-events-none" />
            <Navbar />

            <main className="pt-32 pb-20 max-w-2xl mx-auto px-6">
                {/* Header */}
                <div className="text-center space-y-4 mb-12">
                    <p className="text-sm font-bold text-loops-primary uppercase tracking-widest leading-none">Marketplace Engine</p>
                    <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight italic text-loops-main">Post to the {campus?.name || 'Loop'}.</h1>
                    <div className="flex justify-center gap-8 text-[10px] font-bold uppercase tracking-widest text-loops-muted pt-4">
                        {STEPS.map((s, i) => (
                            <div key={i} className={cn(
                                "flex items-center gap-2 transition-all duration-500",
                                step === i + 1 ? "text-loops-primary" : "opacity-40"
                            )}>
                                <span className={cn(
                                    "w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold transition-all",
                                    step === i + 1 ? "bg-loops-primary text-white border-loops-primary shadow-lg shadow-loops-primary/20 scale-110" : ""
                                )}>
                                    {i + 1}
                                </span>
                                <span className="hidden sm:inline">{s.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="grid gap-4"
                        >
                            <ListingTypeCard
                                icon={Package}
                                title="Product"
                                description="Books, electronics, dorm gear, clothes."
                                active={type === 'product'}
                                onClick={() => { setType('product'); handleNext(); }}
                            />
                            <ListingTypeCard
                                icon={Zap}
                                title="Service"
                                description="Tutoring, moving help, photography, design."
                                active={type === 'service'}
                                onClick={() => { setType('service'); handleNext(); }}
                            />
                            <ListingTypeCard
                                icon={MessageSquare}
                                title="Request"
                                description="Need something specific? Let the Loop find it."
                                active={type === 'request'}
                                onClick={() => { setType('request'); handleNext(); }}
                            />
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
                            <div className="space-y-6">
                                <FormGroup label="Listing Title">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder={type === 'request' ? "I'm looking for..." : "What are you offering?"}
                                        className="w-full h-16 bg-loops-subtle border border-loops-border rounded-2xl px-6 focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all font-medium text-loops-main shadow-sm"
                                    />
                                </FormGroup>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormGroup label={
                                        type === 'request' ? `Max Budget (${CURRENCY})` :
                                            type === 'service' ? `Service Fee (${CURRENCY})` :
                                                `Price (${CURRENCY})`
                                    }>
                                        <div className="relative">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-loops-primary">{CURRENCY}</div>
                                            <input
                                                type="number"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full h-16 bg-loops-subtle border border-loops-border rounded-2xl pl-12 pr-6 focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all font-medium text-loops-main shadow-sm"
                                            />
                                        </div>
                                    </FormGroup>
                                    <FormGroup label={type === 'service' ? "Location (Remote/Hostel)" : "Pickup Location (Hostel/Dept)"}>
                                        <div className="relative">
                                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-loops-primary font-bold" />
                                            <input
                                                type="text"
                                                value={pickupLocation}
                                                onChange={(e) => setPickupLocation(e.target.value)}
                                                placeholder="e.g. Block A, Hall 2"
                                                className="w-full h-16 bg-loops-subtle border border-loops-border rounded-2xl pl-12 pr-6 focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all font-medium text-loops-main shadow-sm"
                                            />
                                        </div>
                                    </FormGroup>
                                    <FormGroup label="Category">
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full h-16 bg-loops-subtle border border-loops-border rounded-2xl px-6 focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all font-medium text-loops-main shadow-sm appearance-none"
                                        >
                                            <option value="">Select...</option>
                                            <option value="books">Books</option>
                                            <option value="electronics">Electronics</option>
                                            <option value="tutoring">Tutoring</option>
                                            <option value="fashion">Fashion</option>
                                            <option value="others">Others</option>
                                        </select>
                                    </FormGroup>
                                </div>

                                <FormGroup label="Details & Description">
                                    <textarea
                                        rows={5}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add details like condition, location, or specifics..."
                                        className="w-full p-6 bg-loops-subtle border border-loops-border rounded-2xl focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all resize-none shadow-sm font-medium text-loops-main text-sm"
                                    />
                                </FormGroup>

                                {type !== 'request' && (
                                    <FormGroup label="Photos">
                                        <ImageUpload onUpload={setImages} />
                                    </FormGroup>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-loops-border">
                                <Button variant="ghost" className="h-16 flex-1 text-loops-muted font-bold uppercase tracking-widest text-xs hover:bg-loops-subtle" onClick={handleBack}>
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                                <Button
                                    className="h-16 flex-[2] text-lg font-bold bg-loops-primary hover:bg-loops-primary/90 text-white shadow-xl shadow-loops-primary/20"
                                    disabled={!title || !category}
                                    onClick={handleNext}
                                >
                                    Review Listing
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            <div className="p-8 rounded-3xl bg-white border border-loops-border shadow-2xl shadow-loops-primary/5 space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-loops-primary/5 text-loops-primary uppercase tracking-widest border border-loops-primary/20 shadow-sm">{type}</span>
                                    <span className="text-[10px] text-loops-muted uppercase font-bold tracking-widest italic opacity-50">• Live Campus Preview</span>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-bold font-display tracking-tight text-loops-main">{title || "No Title"}</h2>
                                    <div className="text-3xl font-bold text-loops-success tracking-tighter">{CURRENCY}{price || "0.00"}</div>
                                </div>
                                <div className="bg-loops-subtle p-6 rounded-2xl">
                                    <p className="text-loops-muted leading-relaxed italic text-sm">"{description || "No description provided."}"</p>
                                </div>

                                <div className="h-px bg-loops-border" />

                                <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-loops-muted">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-loops-success/5 rounded-full text-loops-success border border-loops-success/10">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Verified Listing
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-loops-accent/5 rounded-full text-loops-accent border border-loops-accent/10">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Initial Status
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-loops-border">
                                <Button variant="ghost" className="h-16 flex-1 text-loops-muted font-bold uppercase tracking-widest text-xs hover:bg-loops-subtle" onClick={handleBack}>
                                    Edit Details
                                </Button>
                                <Button
                                    className="h-16 flex-[2] text-lg font-bold bg-loops-primary hover:bg-loops-primary/90 text-white shadow-xl shadow-loops-primary/20 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? "Injecting into Loop..." : "Confirm & Post Live"}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function ListingTypeCard({ icon: Icon, title, description, active, onClick }: { icon: any, title: string, description: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "p-8 rounded-2xl border transition-all text-left flex items-center gap-6 group hover:scale-[1.02] shadow-sm",
                active
                    ? "bg-white border-loops-primary ring-4 ring-loops-primary/5"
                    : "bg-white border-loops-border hover:border-loops-primary/30 hover:bg-loops-subtle"
            )}
        >
            <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl",
                active
                    ? "bg-loops-primary text-white scale-110 shadow-loops-primary/20"
                    : "bg-loops-subtle text-loops-primary/40 group-hover:text-loops-primary/60"
            )}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <div className={cn(
                    "font-bold text-xl mb-1 transition-colors",
                    active ? "text-loops-primary" : "text-loops-main"
                )}>{title}</div>
                <div className="text-xs text-loops-muted font-bold uppercase tracking-widest opacity-60">{description}</div>
            </div>
            <ChevronRight className={cn(
                "w-6 h-6 ml-auto transition-all",
                active ? "text-loops-primary translate-x-1" : "text-loops-muted opacity-20 group-hover:opacity-100 group-hover:translate-x-1"
            )} />
        </button>
    );
}

function FormGroup({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-loops-muted ml-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-loops-primary/30" />
                {label}
            </label>
            {children}
        </div>
    );
}
