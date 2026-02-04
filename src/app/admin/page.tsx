'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Users, Package, Zap, Activity, ShieldAlert, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalListings: 0,
        products: 0,
        services: 0,
        reports: 0
    });
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();
    const toast = useToast();

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (!profile?.is_admin) {
                toast.error("Unauthorized Access");
                router.push('/');
                return;
            }

            fetchStats();
        };

        const fetchStats = async () => {
            // Parallel requests for stats
            const [users, listings, products, services, reports] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('listings').select('*', { count: 'exact', head: true }),
                supabase.from('listings').select('*', { count: 'exact', head: true }).eq('type', 'product'),
                supabase.from('listings').select('*', { count: 'exact', head: true }).eq('service', 'product'), // Typo fix: eq('type', 'service')
                supabase.from('reports').select('*', { count: 'exact', head: true })
            ]);

            // Fix typo in services query above:
            const servicesCount = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('type', 'service');

            setStats({
                totalUsers: users.count || 0,
                totalListings: listings.count || 0,
                products: products.count || 0,
                services: servicesCount.count || 0,
                reports: reports.count || 0
            });
            setLoading(false);
        };

        checkAdmin();
    }, [supabase, router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-loops-bg">Loading Loop Command...</div>;

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />
            <main className="pt-32 pb-20 max-w-7xl mx-auto px-6">
                <div className="mb-12">
                    <p className="text-xs font-bold text-loops-accent uppercase tracking-widest mb-2">Restricted Access</p>
                    <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-loops-main">Loop Command Center</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="text-loops-primary" />
                    <StatCard icon={Package} label="Products Listed" value={stats.products} color="text-blue-500" />
                    <StatCard icon={Zap} label="Services Offered" value={stats.services} color="text-amber-500" />
                    <StatCard icon={ShieldAlert} label="Active Reports" value={stats.reports} color="text-red-500" />
                </div>

                <div className="space-y-8">
                    <div className="bg-loops-subtle border border-loops-border rounded-3xl p-8">
                        <h2 className="text-xl font-bold mb-4 font-display">Recent Activity Log</h2>
                        <div className="text-center py-12 text-loops-muted text-sm italic">
                            Real-time firehose implementation coming soon.
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
    return (
        <div className="p-6 bg-white border border-loops-border rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-2">
                <div className={`p-2 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-loops-muted">{label}</span>
            </div>
            <div className="text-4xl font-bold font-display tracking-tighter text-loops-main">{value}</div>
        </div>
    );
}
