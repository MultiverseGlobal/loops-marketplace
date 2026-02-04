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
        products: 0,
        services: 0,
        reports: 0,
        pendingApps: 0
    });
    const [applications, setApplications] = useState<any[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);
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

            // Fetch pending applications
            const { data: pendingApplications, count: appsCount } = await supabase
                .from('seller_applications')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            setStats({
                totalUsers: users.count || 0,
                totalListings: listings.count || 0,
                products: products.count || 0,
                services: servicesCount.count || 0,
                services: servicesCount.count || 0,
                reports: reports.count || 0,
                pendingApps: appsCount || 0
            });
            setApplications(pendingApplications || []);
            setLoading(false);
        };

        checkAdmin();
    }, [supabase, router]);

    const handleApplicationAction = async (id: string, action: 'approved' | 'rejected') => {
        setProcessingId(id);
        try {
            const { error } = await supabase
                .from('seller_applications')
                .update({
                    status: action,
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: (await supabase.auth.getUser()).data.user?.id
                })
                .eq('id', id);

            if (error) throw error;

            toast.success(`Application ${action}`);

            // Update local state
            setApplications(prev => prev.filter(app => app.id !== id));
            setStats(prev => ({ ...prev, pendingApps: prev.pendingApps - 1 }));

        } catch (err) {
            toast.error("Failed to update status");
        } finally {
            setProcessingId(null);
        }
    };

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
                    <StatCard icon={Zap} label="Services Offered" value={stats.services} color="text-amber-500" />
                    <StatCard icon={ShieldAlert} label="Active Reports" value={stats.reports} color="text-red-500" />
                    <StatCard icon={Activity} label="Pending Plugs" value={stats.pendingApps} color="text-loops-energetic" />
                </div>

                <div className="space-y-8">
                    {/* Seller Applications Section */}
                    <div className="bg-white border border-loops-border rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-loops-border flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold font-display flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-loops-energetic" />
                                    Founding Plug Applications
                                </h2>
                                <p className="text-sm text-loops-muted mt-1">Review and vetting queue for new sellers.</p>
                            </div>
                            <span className="px-3 py-1 bg-loops-subtle rounded-full text-xs font-bold text-loops-muted uppercase tracking-widest">{applications.length} Pending</span>
                        </div>

                        {applications.length === 0 ? (
                            <div className="p-12 text-center text-loops-muted italic">No pending applications. Good job, founder! 🚀</div>
                        ) : (
                            <div className="divide-y divide-loops-border">
                                {applications.map((app) => (
                                    <div key={app.id} className="p-6 hover:bg-loops-subtle transition-colors group">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-lg">{app.full_name}</h3>
                                                    <span className={cn("px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold", app.offering_type === 'product' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600')}>
                                                        {app.offering_type}
                                                    </span>
                                                    <span className="text-xs text-loops-muted font-mono">{app.campus_email}</span>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4 text-sm mt-3">
                                                    <div className="bg-white p-3 rounded-xl border border-loops-border/50">
                                                        <span className="text-[10px] text-loops-muted font-bold uppercase block mb-1">Items Description</span>
                                                        {app.offering_description}
                                                    </div>
                                                    <div className="bg-white p-3 rounded-xl border border-loops-border/50">
                                                        <span className="text-[10px] text-loops-muted font-bold uppercase block mb-1">Motivation</span>
                                                        {app.motivation}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-loops-muted mt-2">
                                                    <span className="flex items-center gap-1">
                                                        📱 {app.whatsapp_number}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        📦 Est. {app.estimated_item_count} items
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        📍 {app.currently_selling || 'New Seller'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 pt-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleApplicationAction(app.id, 'approved')}
                                                    disabled={processingId === app.id}
                                                    className="bg-green-500 hover:bg-green-600 text-white font-bold"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleApplicationAction(app.id, 'rejected')}
                                                    disabled={processingId === app.id}
                                                    className="text-red-500 hover:bg-red-50 border-red-200"
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
