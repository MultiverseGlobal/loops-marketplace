'use client';

import { AdminGuard } from "@/components/admin/admin-guard";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
    LayoutDashboard,
    School,
    Users,
    Package,
    TrendingUp,
    ArrowRight,
    Search,
    Plus,
    CheckCircle2,
    Clock
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboard() {
    const [counts, setCounts] = useState({ students: 0, listings: 0, campuses: 0 });
    const supabase = createClient();

    useEffect(() => {
        const fetchStats = async () => {
            const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: listingCount } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active');
            const { count: campusCount } = await supabase.from('campuses').select('*', { count: 'exact', head: true });

            setCounts({
                students: studentCount || 0,
                listings: listingCount || 0,
                campuses: campusCount || 0
            });
        };
        fetchStats();
    }, [supabase]);

    return (
        <AdminGuard>
            <div className="min-h-screen bg-loops-bg">
                <Navbar />

                <main className="pt-32 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
                    <div className="space-y-12">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-loops-primary/10 text-loops-primary text-[10px] font-bold uppercase tracking-widest border border-loops-primary/20">
                                    <LayoutDashboard className="w-3.5 h-3.5" /> High Command
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-loops-main italic">
                                    Loops Dashboard.
                                </h1>
                                <p className="text-loops-muted font-medium max-w-md">
                                    Manage growth, oversee nodes, and prioritize infrastructure deployment.
                                </p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Students"
                                value={counts.students >= 1000 ? `${(counts.students / 1000).toFixed(1)}k` : counts.students}
                                change={`${counts.students > 0 ? '+100%' : '0%'} total`}
                                icon={Users}
                                color="loops-primary"
                            />
                            <StatCard
                                title="Active Listings"
                                value={counts.listings}
                                change="Live data"
                                icon={Package}
                                color="loops-accent"
                            />
                            <StatCard
                                title="Active Campuses"
                                value={counts.campuses}
                                change="Stable"
                                icon={School}
                                color="loops-secondary"
                            />
                            <StatCard title="Node Load" value="Optimal" change="All healthy" icon={TrendingUp} color="loops-success" />
                        </div>

                        {/* Management Hub */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <Link href="/admin/requests" className="group">
                                <div className="p-8 rounded-[2.5rem] bg-white border border-loops-border shadow-sm hover:shadow-2xl hover:shadow-loops-primary/5 transition-all space-y-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                                        <School className="w-24 h-24" />
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-loops-primary/10 flex items-center justify-center text-loops-primary">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-loops-main">University Requests</h3>
                                        <p className="text-loops-muted text-sm leading-relaxed max-w-xs">
                                            Review nominations from students wanting Loops on their campus. Approve nodes to launch.
                                        </p>
                                    </div>
                                    <div className="inline-flex items-center gap-2 text-xs font-bold text-loops-primary uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                        See Queue <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>

                            <Link href="/admin/campuses" className="group">
                                <div className="p-8 rounded-[2.5rem] bg-white border border-loops-border shadow-sm hover:shadow-2xl hover:shadow-loops-accent/5 transition-all space-y-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                                        <CheckCircle2 className="w-24 h-24" />
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-loops-accent/10 flex items-center justify-center text-loops-accent">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-loops-main">Manage Active Nodes</h3>
                                        <p className="text-loops-muted text-sm leading-relaxed max-w-xs">
                                            Configure branding, terms, and verification settings for current campuses.
                                        </p>
                                    </div>
                                    <div className="inline-flex items-center gap-2 text-xs font-bold text-loops-accent uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                        Edit Nodes <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </AdminGuard>
    );
}

function StatCard({ title, value, change, icon: Icon, color }: any) {
    return (
        <div className="p-6 rounded-[2rem] bg-white border border-loops-border shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center text-${color} mb-4`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
                <div className="text-2xl font-bold font-display tracking-tight text-loops-main">{value}</div>
                <div className="text-[10px] uppercase font-bold text-loops-muted tracking-widest">{title}</div>
            </div>
            <div className="mt-4 pt-4 border-t border-loops-border flex items-center justify-between">
                <span className="text-[10px] font-bold text-loops-success">{change}</span>
                <TrendingUp className="w-3.5 h-3.5 text-loops-success" />
            </div>
        </div>
    );
}
