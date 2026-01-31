'use client';

import { AdminGuard } from "@/components/admin/admin-guard";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { School, Settings, Globe, ShieldCheck, MapPin, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminCampusesPage() {
    const [campuses, setCampuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchCampuses = async () => {
            const { data } = await supabase
                .from('campuses')
                .select('*')
                .order('name', { ascending: true });
            if (data) setCampuses(data);
            setLoading(false);
        };
        fetchCampuses();
    }, [supabase]);

    return (
        <AdminGuard>
            <div className="min-h-screen bg-loops-bg">
                <Navbar />
                <main className="pt-32 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-bold font-display tracking-tight text-loops-main">Active Nodes</h1>
                            <p className="text-loops-muted font-medium">Configure and monitor live university ecosystems.</p>
                        </div>
                        <Button className="bg-loops-primary text-white h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                            Launch New Node
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="h-64 rounded-3xl bg-white border border-loops-border animate-pulse" />
                            ))
                        ) : campuses.map((campus) => (
                            <div key={campus.id} className="p-8 rounded-[2.5rem] bg-white border border-loops-border shadow-sm hover:shadow-xl transition-all space-y-6 group">
                                <div className="flex items-start justify-between">
                                    <div className="w-14 h-14 rounded-2xl bg-loops-primary/5 flex items-center justify-center text-loops-primary group-hover:scale-110 transition-transform">
                                        <School className="w-7 h-7" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-loops-success animate-pulse" />
                                        <span className="text-[10px] font-bold text-loops-success uppercase tracking-widest">Live</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-loops-main tracking-tight">{campus.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-loops-muted font-medium">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>Nigeria • {campus.type || 'Public'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4 border-t border-loops-border">
                                    <div className="flex-1">
                                        <div className="text-[10px] font-bold text-loops-muted uppercase tracking-widest mb-1">Branding</div>
                                        <div className="flex gap-1.5">
                                            <div className="w-4 h-4 rounded-full border border-loops-border" style={{ backgroundColor: campus.primary_color }} />
                                            <div className="w-4 h-4 rounded-full border border-loops-border" style={{ backgroundColor: campus.secondary_color }} />
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl text-loops-muted hover:text-loops-primary hover:bg-loops-primary/5">
                                        <Settings className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
                <Footer />
            </div>
        </AdminGuard>
    );
}
