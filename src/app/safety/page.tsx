'use client';

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ShieldCheck, MapPin, Sun, Bell, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SafetyPage() {
    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />
            <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-loops-success/10 text-loops-success text-[10px] font-black uppercase tracking-widest border border-loops-success/20">
                            <ShieldCheck className="w-4 h-4" /> Trusted Exchange
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter">Campus Safety Guide</h1>
                        <p className="text-loops-muted text-lg max-w-2xl mx-auto">
                            The security of our Loop is communal. Follow these golden rules for every exchange.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <SafetyCard 
                            icon={MapPin}
                            title="Public Meetups Only"
                            desc="Always meet in high-traffic, well-lit university areas. Recommended spots: University Library, Student Union Building, or open cafeterias."
                            color="text-loops-primary"
                        />
                        <SafetyCard 
                            icon={Sun}
                            title="Daylight Hours"
                            desc="We strongly advise completing all 'handshakes' during daylight hours. Never meet in isolated areas or after dark."
                            color="text-loops-accent"
                        />
                        <SafetyCard 
                            icon={AlertTriangle}
                            title="Inspect Before Handshake"
                            desc="Once you scan the QR code, the funds are released and cannot be refunded. Inspect the item thoroughly before scanning."
                            color="text-loops-energetic"
                        />
                        <SafetyCard 
                            icon={Bell}
                            title="Trust Your Gut"
                            desc="If a user pressures you or changes the meeting spot to a private location, cancel the transaction and alert an admin."
                            color="text-loops-secondary"
                        />
                    </div>

                    <section className="p-8 md:p-12 rounded-[2.5rem] bg-loops-main text-white space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-loops-primary opacity-20 blur-3xl -mr-32 -mt-32" />
                        <h2 className="text-3xl font-black italic">The Handshake Protocol</h2>
                        <div className="space-y-4 relative z-10">
                            <Step num="1" text="Negotiate and pay securely through the Loops platform." />
                            <Step num="2" text="Coordinate a meeting at a verified public campus spot." />
                            <Step num="3" text="Inspect the goods or service in person." />
                            <Step num="4" text="Only when satisfied, scan the seller's Handshake QR code to release the escrow." />
                        </div>
                    </section>

                    <div className="bg-white border border-loops-border rounded-3xl p-8 space-y-4">
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-loops-success" />
                            Escrow Protection
                        </h3>
                        <p className="text-loops-muted leading-relaxed">
                            Your money stays in our secure vault until you verify the item in person. If the seller never shows up, or the item is fake, opening a dispute freezes the funds so our admins can investigate and refund you.
                        </p>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}

function SafetyCard({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
    return (
        <div className="p-8 rounded-3xl bg-white border border-loops-border hover:border-loops-primary/30 transition-all shadow-sm">
            <div className={`w-12 h-12 rounded-2xl bg-loops-subtle flex items-center justify-center mb-6 ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-black italic text-lg mb-2 uppercase tracking-tight">{title}</h3>
            <p className="text-sm text-loops-muted leading-relaxed">{desc}</p>
        </div>
    );
}

function Step({ num, text }: { num: string, text: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm shrink-0">{num}</div>
            <p className="text-white/80 font-medium">{text}</p>
        </div>
    );
}
