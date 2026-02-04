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
    const [name, setName] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [email, setEmail] = useState("");
    const [offeringType, setOfferingType] = useState<'product' | 'service' | ''>('');
    const [description, setDescription] = useState("");
    const [itemCount, setItemCount] = useState("");
    const [currentlySelling, setCurrentlySelling] = useState("");
    const [motivation, setMotivation] = useState("");
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
                    status: 'pending'
                });

            if (error) throw error;

            toast.success("Application submitted! We'll contact you within 48 hours.");

            // Reset form
            setName("");
            setWhatsapp("");
            setEmail("");
            setOfferingType('');
            setDescription("");
            setItemCount("");
            setCurrentlySelling("");
            setMotivation("");
        } catch (error: any) {
            toast.error(error.message || "Failed to submit application. Please try again.");
        } finally {
            setSubmitting(false);
        }
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
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">Apply Now</h2>
                        <p className="text-loops-muted">Limited to the first 50 sellers. Applications reviewed within 48 hours.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-white rounded-3xl border border-loops-border shadow-2xl shadow-loops-primary/5">
                        <FormField label="Full Name" required>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                                className="w-full h-14 rounded-xl bg-loops-subtle border border-loops-border px-6 focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all"
                            />
                        </FormField>

                        <FormField label="WhatsApp Number" required>
                            <input
                                type="tel"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                placeholder="+234..."
                                required
                                className="w-full h-14 rounded-xl bg-loops-subtle border border-loops-border px-6 focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all"
                            />
                        </FormField>

                        <FormField label="Campus Email (for verification)" required>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@university.edu"
                                required
                                className="w-full h-14 rounded-xl bg-loops-subtle border border-loops-border px-6 focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all"
                            />
                        </FormField>

                        <FormField label="What do you sell/offer?" required>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setOfferingType('product')}
                                    className={cn(
                                        "p-4 rounded-xl border-2 transition-all font-bold text-sm",
                                        offeringType === 'product'
                                            ? "border-loops-primary bg-loops-primary/5 text-loops-primary"
                                            : "border-loops-border text-loops-muted hover:border-loops-primary/30"
                                    )}
                                >
                                    Products
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOfferingType('service')}
                                    className={cn(
                                        "p-4 rounded-xl border-2 transition-all font-bold text-sm",
                                        offeringType === 'service'
                                            ? "border-loops-primary bg-loops-primary/5 text-loops-primary"
                                            : "border-loops-border text-loops-muted hover:border-loops-primary/30"
                                    )}
                                >
                                    Services
                                </button>
                            </div>
                        </FormField>

                        <FormField label="Describe what you'd list (be specific)" required>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Second-hand textbooks for CS courses, MacBook accessories, fashion items..."
                                required
                                rows={4}
                                className="w-full p-6 rounded-xl bg-loops-subtle border border-loops-border focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all resize-none"
                            />
                        </FormField>

                        <FormField label="How many items/services could you post in the first week?" required>
                            <select
                                value={itemCount}
                                onChange={(e) => setItemCount(e.target.value)}
                                required
                                className="w-full h-14 rounded-xl bg-loops-subtle border border-loops-border px-6 focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all appearance-none"
                            >
                                <option value="">Select...</option>
                                <option value="1-2">1-2</option>
                                <option value="3-5">3-5</option>
                                <option value="6-10">6-10</option>
                                <option value="10+">10+</option>
                            </select>
                        </FormField>

                        <FormField label="Do you already sell on campus? Where?">
                            <input
                                type="text"
                                value={currentlySelling}
                                onChange={(e) => setCurrentlySelling(e.target.value)}
                                placeholder="e.g. WhatsApp Status, Instagram, word of mouth..."
                                className="w-full h-14 rounded-xl bg-loops-subtle border border-loops-border px-6 focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all"
                            />
                        </FormField>

                        <FormField label="Why do you want to be a Founding Plug?" required>
                            <textarea
                                value={motivation}
                                onChange={(e) => setMotivation(e.target.value)}
                                placeholder="Tell us why this opportunity excites you..."
                                required
                                rows={3}
                                className="w-full p-6 rounded-xl bg-loops-subtle border border-loops-border focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all resize-none"
                            />
                        </FormField>

                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full h-16 text-xl font-bold bg-loops-primary hover:bg-loops-primary/90 text-white shadow-xl shadow-loops-primary/20 transition-all"
                        >
                            {submitting ? "Submitting..." : "Submit Application"}
                            {!submitting && <ArrowRight className="w-5 h-5 ml-2" />}
                        </Button>

                        <p className="text-center text-xs text-loops-muted">
                            We'll review your application and get back to you within 48 hours via WhatsApp.
                        </p>
                    </form>
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
