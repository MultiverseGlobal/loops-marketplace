'use client';

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { School, Send, CheckCircle2, Sparkles, Rocket, Users } from "lucide-react";
import { useToast } from "@/context/toast-context";

export default function RequestCampusPage() {
    const [formData, setFormData] = useState({ name: "", email: "", reason: "" });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const supabase = createClient();
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase
                .from('campus_requests')
                .insert({
                    university_name: formData.name,
                    school_email: formData.email,
                    reason: formData.reason
                });

            if (error) throw error;
            setSubmitted(true);
            toast.success("Nomination received! Help us grow by sharing.");
        } catch (error: any) {
            toast.error(error.message || "Failed to send request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main selection:bg-loops-primary/20">
            <Navbar />

            <main className="pt-32 pb-24 px-6 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-loops-primary/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-loops-secondary/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto space-y-16 relative z-10">
                    {/* Hero Section */}
                    <div className="text-center space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-loops-primary/10 text-loops-primary text-xs font-bold uppercase tracking-widest border border-loops-primary/20"
                        >
                            <Rocket className="w-4 h-4" /> Expand the Network
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold font-display tracking-tight text-loops-main leading-tight"
                        >
                            Bring Loops to <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-loops-primary to-loops-secondary italic">Your Campus.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-loops-muted max-w-2xl mx-auto leading-relaxed"
                        >
                            Loops is scaling fast across Nigerian universities. Nominate your school next and be the first to know when we launch.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-5 gap-12 items-start">
                        {/* Features/Stats */}
                        <div className="md:col-span-2 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="p-6 rounded-3xl bg-white border border-loops-border shadow-xl shadow-loops-primary/5 space-y-4"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-loops-primary/10 flex items-center justify-center text-loops-primary">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg">Power in Numbers</h3>
                                <p className="text-sm text-loops-muted">We prioritize campuses based on the number of requests. The more students ask, the faster we move.</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="p-6 rounded-3xl bg-white border border-loops-border shadow-xl shadow-loops-primary/5 space-y-4"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-loops-accent/10 flex items-center justify-center text-loops-accent">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg">Founding Member Status</h3>
                                <p className="text-sm text-loops-muted">The first 100 students to request their campus get early access and exclusive "Genesis" reputation badges.</p>
                            </motion.div>
                        </div>

                        {/* Form Section */}
                        <div className="md:col-span-3">
                            <AnimatePresence mode="wait">
                                {!submitted ? (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-loops-border shadow-2xl shadow-loops-primary/10"
                                    >
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-loops-muted uppercase tracking-widest ml-1">University Name</label>
                                                <div className="relative group">
                                                    <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-loops-muted group-focus-within:text-loops-primary transition-colors" />
                                                    <input
                                                        required
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        placeholder="e.g. University of Lagos"
                                                        className="w-full h-14 pl-12 pr-6 rounded-2xl bg-loops-subtle border border-loops-border focus:border-loops-primary focus:outline-none focus:ring-1 focus:ring-loops-primary transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-loops-muted uppercase tracking-widest ml-1">Your Email</label>
                                                <input
                                                    required
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="yourname@school.edu.ng"
                                                    className="w-full h-14 px-6 rounded-2xl bg-loops-subtle border border-loops-border focus:border-loops-primary focus:outline-none focus:ring-1 focus:ring-loops-primary transition-all"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-loops-muted uppercase tracking-widest ml-1">Why should we launch there?</label>
                                                <textarea
                                                    value={formData.reason}
                                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                                    placeholder="Tell us about the student hustle on your campus..."
                                                    rows={4}
                                                    className="w-full p-6 rounded-2xl bg-loops-subtle border border-loops-border focus:border-loops-primary focus:outline-none focus:ring-1 focus:ring-loops-primary transition-all resize-none"
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full h-16 rounded-2xl bg-loops-primary text-white text-lg font-bold shadow-xl shadow-loops-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                                            >
                                                {loading ? "Sending Nomination..." : "Submit Nomination"}
                                                <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </Button>
                                        </form>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white p-12 rounded-[2.5rem] border border-loops-border shadow-2xl shadow-loops-success/10 text-center space-y-8"
                                    >
                                        <div className="w-20 h-20 bg-loops-success/10 rounded-full flex items-center justify-center text-loops-success mx-auto">
                                            <CheckCircle2 className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-3xl font-bold font-display tracking-tight leading-none italic">Nomination Recorded!</h2>
                                            <p className="text-loops-muted">We've added {formData.name} to our prioritization list. We'll notify you at {formData.email} as soon as we're live.</p>
                                        </div>

                                        <div className="pt-6 border-t border-loops-border space-y-4">
                                            <p className="text-xs font-bold text-loops-muted uppercase tracking-widest">Share to Speed Up Launch</p>
                                            <div className="flex gap-4">
                                                <Button
                                                    className="flex-1 bg-loops-primary text-white h-14 rounded-2xl font-bold"
                                                    onClick={() => {
                                                        const text = `I just nominated ${formData.name} for Loops! Join me so we can launch here faster: ${window.location.origin}/request-campus`;
                                                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
                                                    }}
                                                >
                                                    Share on WhatsApp
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
