'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import {
    Globe,
    MessageCircle,
    Copy,
    Check,
    Zap,
    Users,
    ArrowLeft,
    Download,
    Share2,
    Briefcase,
    Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingKit() {
    const [campuses, setCampuses] = useState<any[]>([]);
    const [selectedCampus, setSelectedCampus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState<string | null>(null);
    const supabase = createClient();
    const toast = useToast();

    useEffect(() => {
        const fetchCampuses = async () => {
            const { data } = await supabase.from('campuses').select('*').order('name');
            setCampuses(data || []);
            setLoading(false);
        };
        fetchCampuses();
    }, [supabase]);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        toast.success("Copied to clipboard! 📋");
        setTimeout(() => setCopied(null), 2000);
    };

    const templates = selectedCampus ? [
        {
            id: 'plug-recruit',
            title: 'Recruit Founding Plugs',
            icon: Zap,
            description: 'Best for campus groups and student associations.',
            content: `Hey ${selectedCampus.name}! 🚀\n\nI'm launching Loops on our campus and we're looking for the first 50 "Founding Plugs".\n\nIf you sell items, clothes, or provide services (hair, tutoring, etc.), you can now get a verified storefront and a professional reputation on the ${selectedCampus.communityName || 'Campus Loop'}.\n\nSecure your spot here:\nhttps://loops-marketplace.vercel.app/onboarding?campus=${selectedCampus.slug}\n\nLet's keep the money in the community! 🔌✨`
        },
        {
            id: 'buyer-hype',
            title: 'Buyer Hype / Launch Day',
            icon: Users,
            description: 'For general university groups on launch morning.',
            content: `Safe! ${selectedCampus.name} is finally in the Loop! 🔗\n\nNo more searching 100 groups for what you need. Buy and sell securely with verified campus Plugs.\n\nSee what's dropping today:\nhttps://loops-marketplace.vercel.app/browse?campus=${selectedCampus.slug}\n\n#${selectedCampus.slug}Loop #CampusEconomy`
        },
        {
            id: 'service-focus',
            title: 'Service Provider Focus',
            icon: Briefcase,
            description: 'For skilled students (Barbers, Braiders, Photographers).',
            content: `Attention ${selectedCampus.name} Creatives! 📸💇‍♂️\n\nStop taking bookings in the DMs. Get a professional portfolio on Loops and let the campus find you easily.\n\nVerified reputation + Auto-scheduling is now live.\n\nLaunch your store:\nhttps://loops-marketplace.vercel.app/founding-plugs`
        }
    ] : [];

    return (
        <div className="min-h-screen bg-loops-subtle pb-20">
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 pt-32">
                <div className="flex items-center justify-between mb-12">
                    <Link href="/admin">
                        <Button variant="ghost" className="rounded-2xl gap-2 text-loops-muted group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Empire
                        </Button>
                    </Link>
                    <div className="text-right">
                        <span className="px-3 py-1 bg-loops-primary/10 text-loops-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-loops-primary/20">The Blitz Tool v1.0</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Sidebar: Campus Selection */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-black italic tracking-tighter mb-2">The Blitz Kit</h1>
                            <p className="text-loops-muted font-medium text-sm">Select a target node to generate recruitment assets.</p>
                        </div>

                        <div className="space-y-3">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-16 bg-white/50 rounded-2xl animate-pulse" />)
                            ) : (
                                campuses.map(campus => (
                                    <button
                                        key={campus.id}
                                        onClick={() => setSelectedCampus(campus)}
                                        className={cn(
                                            "w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between group",
                                            selectedCampus?.id === campus.id
                                                ? "bg-loops-main border-loops-main text-white shadow-xl shadow-loops-main/20 scale-[1.02]"
                                                : "bg-white border-loops-border text-loops-main hover:border-loops-primary"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                                selectedCampus?.id === campus.id ? "bg-white/10" : "bg-loops-subtle text-loops-primary group-hover:bg-loops-primary group-hover:text-white"
                                            )}>
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-sm">{campus.name}</span>
                                        </div>
                                        {selectedCampus?.id === campus.id && <Zap className="w-4 h-4 text-loops-primary fill-loops-primary" />}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Content: Templates */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {!selectedCampus ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white border border-dashed border-loops-border rounded-[3rem] p-12 text-center"
                                >
                                    <div className="w-20 h-20 bg-loops-subtle rounded-3xl flex items-center justify-center text-loops-primary mb-6">
                                        <Zap className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-2xl font-black italic mb-2">Ready to Recruit?</h2>
                                    <p className="text-loops-muted font-medium max-w-sm">Pick a university from the sidebar to generate high-conversion onboarding scripts.</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={selectedCampus.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-8"
                                >
                                    <div className="bg-loops-main rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                                        <div className="relative z-10">
                                            <h2 className="text-3xl font-black italic tracking-tight">{selectedCampus.name} Blitz</h2>
                                            <p className="text-white/60 font-medium text-sm mt-1">Domain: {selectedCampus.domain} • Community: {selectedCampus.communityName || 'Campus Loop'}</p>
                                        </div>
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-loops-primary/20 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                                    </div>

                                    <div className="grid gap-6">
                                        {templates.map((template, idx) => (
                                            <motion.div
                                                key={template.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="bg-white rounded-[2rem] border border-loops-border p-8 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-loops-subtle rounded-2xl flex items-center justify-center text-loops-primary">
                                                            <template.icon className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black text-lg italic tracking-tight">{template.title}</h3>
                                                            <p className="text-xs text-loops-muted font-medium">{template.description}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleCopy(template.content, template.id)}
                                                        className={cn(
                                                            "rounded-xl gap-2 h-10 transition-all",
                                                            copied === template.id ? "bg-loops-success text-white" : "bg-loops-subtle text-loops-main hover:bg-loops-primary hover:text-white"
                                                        )}
                                                    >
                                                        {copied === template.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                        {copied === template.id ? "Copied" : "Copy Template"}
                                                    </Button>
                                                </div>
                                                <div className="bg-loops-subtle rounded-2xl p-6 font-mono text-sm text-loops-main whitespace-pre-wrap border border-loops-border">
                                                    {template.content}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Action Cards */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-gradient-to-br from-white to-loops-subtle p-8 rounded-[2rem] border border-loops-border flex flex-col items-center text-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-loops-primary">
                                                <Download className="w-6 h-6" />
                                            </div>
                                            <h4 className="font-black italic">Download Logo Pack</h4>
                                            <Button variant="outline" className="w-full rounded-xl">Get Assets 📦</Button>
                                        </div>
                                        <div className="bg-gradient-to-br from-loops-primary/5 to-white p-8 rounded-[2rem] border border-loops-primary/10 flex flex-col items-center text-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-loops-primary">
                                                <Share2 className="w-6 h-6" />
                                            </div>
                                            <h4 className="font-black italic">Share Direct Invite</h4>
                                            <Button className="w-full bg-loops-primary text-white rounded-xl">Copy Invite Link</Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
