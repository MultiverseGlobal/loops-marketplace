'use client';

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Award, Users, CheckCircle, Star, ArrowRight, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/toast-context";
import { cn } from "@/lib/utils";
import { InfinityLogo } from "@/components/ui/infinity-logo";

export default function FoundingPlugsPage() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [email, setEmail] = useState("");
    const [offeringType, setOfferingType] = useState<'product' | 'service' | ''>('');
    const [description, setDescription] = useState("");
    const [itemCount, setItemCount] = useState("");
    const [currentlySelling, setCurrentlySelling] = useState("");
    const [motivation, setMotivation] = useState("");

    // Store Build State
    const [storeName, setStoreName] = useState("");
    const [storeBannerColor, setStoreBannerColor] = useState("bg-loops-primary");
    const [storeCategory, setStoreCategory] = useState("");

    const [submitting, setSubmitting] = useState(false);

    const supabase = createClient();
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { error } = await supabase
                .from('seller_applications')
                .insert({
                    full_name: name,
                    whatsapp_number: whatsapp,
                    campus_email: email,
                    offering_type: offeringType,
                    offering_description: description,
                    estimated_item_count: itemCount,
                    currently_selling: currentlySelling,
                    motivation: motivation,
                    status: 'pending',
                    // Store details if provided
                    store_name: storeName,
                    store_banner_color: storeBannerColor,
                    store_category: storeCategory || matchingCategory(offeringType)
                });

            if (error) throw error;

            toast.success("Founding Plug Application Received! ♾️");
            setStep(3); // Success step
        } catch (error: any) {
            toast.error(error.message || "Failed to submit application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const matchingCategory = (type: string) => {
        if (type === 'product') return 'General Goods';
        if (type === 'service') return 'Campus Services';
        return 'General';
    };

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-loops-primary/10 via-transparent to-transparent pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-loops-primary/10 text-loops-primary text-xs font-bold uppercase tracking-widest border border-loops-primary/20"
                    >
                        <Sparkles className="w-4 h-4" />
                        Limited Founding Opportunity
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight"
                    >
                        Become a <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-loops-primary to-loops-energetic">Founding Plug</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg sm:text-xl text-loops-muted max-w-2xl mx-auto leading-relaxed"
                    >
                        Be among the first sellers and service providers to shape the campus marketplace. Zero competition, maximum visibility.
                    </motion.p>
                </div>
            </section>

            {/* Benefits Grid */}
            <section className="py-16 px-4 sm:px-6 bg-white border-y border-loops-border">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-center text-2xl sm:text-3xl font-bold font-display mb-12">Why Join as a Founding Plug?</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <BenefitCard
                            icon={Award}
                            title="Verified Badge"
                            description="Permanent 'Founding Plug' badge on your profile forever"
                            color="text-amber-500"
                        />
                        <BenefitCard
                            icon={TrendingUp}
                            title="Priority Placement"
                            description="Your listings appear first in search for 3 months"
                            color="text-loops-primary"
                        />
                        <BenefitCard
                            icon={Users}
                            title="Exclusive Community"
                            description="Private WhatsApp group with other founding sellers"
                            color="text-loops-success"
                        />
                        <BenefitCard
                            icon={Shield}
                            title="Personal Onboarding"
                            description="1-on-1 setup help and professional listing photos"
                            color="text-loops-accent"
                        />
                        <BenefitCard
                            icon={Zap}
                            title="First Mover Advantage"
                            description="Build your reputation before anyone else"
                            color="text-loops-energetic"
                        />
                        <BenefitCard
                            icon={Star}
                            title="Founding 50 Showcase"
                            description="Featured on the main landing page permanently"
                            color="text-amber-500"
                        />
                    </div>
                </div>
            </section>

            {/* Application Form */}
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-[2.5rem] border border-loops-border shadow-2xl shadow-loops-primary/5 overflow-hidden">
                        {/* Progress Header */}
                        <div className="flex bg-loops-subtle border-bottom border-loops-border">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={cn(
                                    "flex-1 text-center py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                                    step === i ? "text-loops-primary bg-white" : "text-loops-muted opacity-50"
                                )}>
                                    Step {i}
                                </div>
                            ))}
                        </div>

                        <div className="p-8 sm:p-12">
                            {step === 1 && (
                                <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <FormField label="Full Name" required>
                                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="form-input" />
                                        </FormField>
                                        <FormField label="WhatsApp Number" required>
                                            <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+234..." required className="form-input" />
                                        </FormField>
                                    </div>

                                    <FormField label="Campus Email (for verification)" required>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" required className="form-input" />
                                    </FormField>

                                    <FormField label="What do you sell/offer?" required>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button type="button" onClick={() => setOfferingType('product')} className={cn("selection-btn", offeringType === 'product' && "active")}>Products</button>
                                            <button type="button" onClick={() => setOfferingType('service')} className={cn("selection-btn", offeringType === 'service' && "active")}>Services</button>
                                        </div>
                                    </FormField>

                                    <FormField label="Describe your items/services" required>
                                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="form-textarea" required />
                                    </FormField>

                                    <Button type="submit" className="w-full h-16 text-lg font-bold bg-loops-primary text-white rounded-2xl">
                                        Continue to Storefront setup
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </form>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold font-display">Configure your Storefront Vision</h3>
                                        <p className="text-sm text-loops-muted">You can build your shop now or finish signing up and do it later.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <FormField label="Storefront Name (Optional)">
                                            <input
                                                type="text"
                                                value={storeName}
                                                onChange={(e) => setStoreName(e.target.value)}
                                                placeholder="e.g. Veritas Tech Hub"
                                                className="form-input"
                                            />
                                        </FormField>

                                        <FormField label="Brand Color Theme">
                                            <div className="flex gap-4">
                                                {['bg-loops-primary', 'bg-loops-secondary', 'bg-loops-accent', 'bg-black'].map((color) => (
                                                    <button
                                                        key={color}
                                                        onClick={() => setStoreBannerColor(color)}
                                                        className={cn(
                                                            "w-12 h-12 rounded-full border-4 transition-all",
                                                            color,
                                                            storeBannerColor === color ? "border-loops-main scale-110" : "border-transparent opacity-60"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </FormField>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                        <Button
                                            variant="outline"
                                            className="h-14 flex-1 border-loops-primary text-loops-primary hover:bg-loops-primary/5 font-bold"
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                        >
                                            {submitting ? "Processing..." : "Finish Signup (Setup Later)"}
                                        </Button>
                                        <Button
                                            className="h-14 flex-1 bg-loops-primary text-white font-bold"
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                        >
                                            {submitting ? "Finalizing Store..." : "Build My Storefront Now"}
                                            <Zap className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="text-center space-y-8 py-10 animate-in zoom-in duration-500">
                                    <div className="w-24 h-24 bg-loops-success/10 rounded-full flex items-center justify-center mx-auto text-loops-success border border-loops-success/20">
                                        <CheckCircle className="w-12 h-12" />
                                    </div>
                                    <h2 className="text-3xl font-bold font-display">Application Received!</h2>
                                    <p className="text-loops-muted max-w-sm mx-auto">
                                        We're reviewing your "Founding Plug" status. You'll get a WhatsApp invite to the founding group within 48 hours.
                                    </p>
                                    <div className="pt-6">
                                        {storeName ? (
                                            <div className={cn("p-6 rounded-2xl text-white space-y-2 max-w-xs mx-auto shadow-xl", storeBannerColor)}>
                                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Reserved Storefront</div>
                                                <div className="text-xl font-bold">{storeName}</div>
                                                <div className="text-[10px] italic">Founding 50 Collection</div>
                                            </div>
                                        ) : (
                                            <div className="p-4 rounded-xl bg-loops-subtle border border-dashed border-loops-border italic text-xs text-loops-muted">
                                                No storefront configured yet. You can do this in Settings after your account is activated.
                                            </div>
                                        )}
                                    </div>
                                    <Button variant="outline" className="mt-8 border-loops-border" onClick={() => window.location.href = '/'}>
                                        Back to Home
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-4 sm:px-6 bg-loops-subtle border-t border-loops-border">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold font-display text-center mb-12">Frequently Asked Questions</h2>

                    <div className="space-y-6">
                        <FAQItem
                            question="What is a Founding Plug?"
                            answer="The first 50 sellers and service providers who join Loops before the public launch. You'll help us build the initial supply and get exclusive benefits."
                        />
                        <FAQItem
                            question="Is there a fee to join?"
                            answer="No! Joining as a Founding Plug is completely free. There are no listing fees or commissions."
                        />
                        <FAQItem
                            question="When will my listings go live?"
                            answer="Within 3-5 days after approval. We'll help you create your first listings and ensure they're high-quality."
                        />
                        <FAQItem
                            question="How long does the Founding Plug status last?"
                            answer="Forever! Your badge and Founding 50 showcase placement are permanent."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function BenefitCard({ icon: Icon, title, description, color }: { icon: any, title: string, description: string, color: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-loops-subtle border border-loops-border hover:border-loops-primary/30 transition-all group"
        >
            <div className={cn("w-12 h-12 rounded-xl bg-white border border-loops-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", color)}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-sm text-loops-muted">{description}</p>
        </motion.div>
    );
}

function FormField({ label, required, children }: { label: string, required?: boolean, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-loops-muted uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-loops-primary/30" />
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            {children}
        </div>
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white rounded-2xl border border-loops-border overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-loops-subtle transition-colors"
            >
                <span className="font-bold text-loops-main">{question}</span>
                <CheckCircle className={cn("w-5 h-5 transition-transform", isOpen && "rotate-180", isOpen ? "text-loops-primary" : "text-loops-muted")} />
            </button>
            {isOpen && (
                <div className="px-6 pb-6 text-sm text-loops-muted leading-relaxed">
                    {answer}
                </div>
            )}
        </div>
    );
}
