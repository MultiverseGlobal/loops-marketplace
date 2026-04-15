'use client';

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { HelpCircle, ShieldCheck, Zap, Globe, MessageSquare, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
    {
        question: "Why can't I pay with my card yet?",
        answer: "We are currently in 'Phase 1: Secure Handshake' mode. Integrated Paystack Escrow payments are launching in August 2026. For now, use the platform to coordinate safe meetups and payments directly with verified student 'Plugs'.",
        icon: Zap,
        color: "text-amber-500 bg-amber-50"
    },
    {
        question: "How do Loops work when school is not in session?",
        answer: "The 'Loop' doesn't stop during holidays. While we are campus-first, the Handshake Protocol is city-agnostic. You can search for students in your home city (Lagos, Abuja, PH, etc.) and use the same secure QR flow to complete trades off-campus.",
        icon: Globe,
        color: "text-blue-500 bg-blue-50"
    },
    {
        question: "Is it safe to meet a seller I don't know?",
        answer: "Yes, because every user on Loops is a verified student. We use matriculation numbers and institutional emails to ensure you are only trading with your peers. Always meet in busy, public spots as recommended in our Safety Center.",
        icon: ShieldCheck,
        color: "text-emerald-500 bg-emerald-50"
    },
    {
        question: "What is the 5% Handshake Fee?",
        answer: "This fee supports the infrastructure that keeps the campus nodes secure. It covers student verification, real-time message encryption, and the upcoming escrow protection launching in August.",
        icon: HelpCircle,
        color: "text-loops-primary bg-loops-primary/5"
    }
];

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />
            <main className="pt-32 pb-20 max-w-5xl mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-6">
                            Campus <span className="text-loops-primary">Help Hub</span>.
                        </h1>
                        <p className="text-lg text-loops-muted font-medium leading-relaxed">
                            Everything you need to know about navigating the student economy. 
                            From Handshake protocols to the August roadmap.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {FAQS.map((faq, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                key={index}
                                className="bg-white p-8 rounded-[2.5rem] border border-loops-border hover:border-loops-primary/30 transition-all hover:shadow-2xl hover:shadow-loops-primary/5 group"
                            >
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3", faq.color)}>
                                    <faq.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight mb-4 text-loops-main group-hover:text-loops-primary transition-colors">
                                    {faq.question}
                                </h3>
                                <p className="text-loops-muted text-sm leading-relaxed">
                                    {faq.answer}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="bg-loops-main p-10 md:p-16 rounded-[3.5rem] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-loops-primary/20 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse" />
                        <div className="relative z-10 space-y-8 max-w-xl">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic leading-tight">
                                Still stuck? <br />
                                <span className="text-loops-primary">The Squad</span> is here.
                            </h2>
                            <p className="text-white/60 font-medium">
                                Our student support team is active 24/7 during the session. If it's a dispute, a bug, or just a question—we've got you.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <button className="px-8 h-14 bg-loops-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-loops-primary/20">
                                    <MessageSquare className="w-4 h-4" />
                                    Open Support Ticket
                                </button>
                                <button className="px-8 h-14 bg-white/10 backdrop-blur-md text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:bg-white/20 transition-all border border-white/10">
                                    Contact Admin
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
