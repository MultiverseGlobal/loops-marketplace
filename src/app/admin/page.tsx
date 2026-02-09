'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
    Users,
    Package,
    Zap,
    Activity,
    ShieldAlert,
    CheckCircle,
    XCircle,
    TrendingUp,
    BarChart3,
    PieChart,
    Award,
    School,
    Globe,
    MessageCircle,
    Trash2,
    Edit3,
    Search as SearchIcon,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import { cn } from "@/lib/utils";
import { AdminSidebar, AdminView } from "@/components/admin/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Profile } from "@/lib/types"; // Assuming there's a types file, if not I'll define it locally or use a generic

interface AdminProfile {
    id: string;
    full_name: string | null;
    email: string | null;
    is_admin: boolean;
    is_plug: boolean;
    reputation: number;
    avatar_url?: string | null;
    created_at: string;
}

export default function AdminDashboard() {
    const [currentView, setCurrentView] = useState<AdminView>('dashboard');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalListings: 0,
        products: 0,
        services: 0,
        reports: 0,
        pendingApps: 0
    });
    const [analytics, setAnalytics] = useState<any>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [userSearch, setUserSearch] = useState("");
    const [foundUser, setFoundUser] = useState<AdminProfile | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [verificationResults, setVerificationResults] = useState<Record<string, any>>({});

    // Safety Hub States
    const [reports, setReports] = useState<any[]>([]);

    // Universities States
    const [campuses, setCampuses] = useState<any[]>([]);
    const [campusRequests, setCampusRequests] = useState<any[]>([]);

    const supabase = createClient();
    const router = useRouter();
    const toast = useToast();
    const [passkey, setPasskey] = useState("");
    const [isPasskeyVerified, setIsPasskeyVerified] = useState(false);
    const ADMIN_ACCESS_CODE = "LOOPS404";

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

            fetchAllData();
        };

        const fetchAllData = async () => {
            setLoading(true);
            try {
                // 1. Stats
                const [users, listings, products, servicesCount, reportsCount] = await Promise.all([
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('listings').select('*', { count: 'exact', head: true }),
                    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('type', 'product'),
                    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('type', 'service'),
                    supabase.from('reports').select('*', { count: 'exact', head: true })
                ]);

                // 2. Applications
                const { data: pendingApplications } = await supabase
                    .from('seller_applications')
                    .select('*')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false });

                // 3. Analytics
                const analyticsRes = await fetch('/api/admin/analytics');
                const analyticsData = analyticsRes.ok ? await analyticsRes.json() : null;

                // 4. Campuses & Requests
                const [campusesData, requestsData] = await Promise.all([
                    supabase.from('campuses').select('*').order('name'),
                    supabase.from('campus_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false })
                ]);

                // 5. Reports
                const { data: reportsData } = await supabase
                    .from('reports')
                    .select('*, profiles(full_name, email), listings(title, images)')
                    .order('created_at', { ascending: false });

                setStats({
                    totalUsers: users.count || 0,
                    totalListings: listings.count || 0,
                    products: products.count || 0,
                    services: servicesCount.count || 0,
                    reports: reportsCount.count || 0,
                    pendingApps: pendingApplications?.length || 0
                });
                setApplications(pendingApplications || []);
                setAnalytics(analyticsData);
                setCampuses(campusesData.data || []);
                setCampusRequests(requestsData.data || []);
                setReports(reportsData || []);

            } catch (err) {
                console.error("Data fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [supabase, router]);

    // Handle Actions (kept from original for logic consistency)
    const handleVerifyID = async (app: any) => {
        try {
            const response = await fetch('/api/verify-id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ application_id: app.id }),
            });
            const result = await response.json();
            if (response.ok) {
                setVerificationResults(prev => ({ ...prev, [app.id]: result }));
                toast.success(result.verified ? "ID Verified!" : "Low confidence review recommended.");
            }
        } catch (error: any) {
            toast.error('Verification failed');
        }
    };

    const handleApplicationAction = async (app: any, action: 'approved' | 'rejected', reason?: string) => {
        setProcessingId(app.id);
        try {
            const { error: appError } = await supabase
                .from('seller_applications')
                .update({
                    status: action,
                    rejection_reason: reason || null,
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: (await supabase.auth.getUser()).data.user?.id
                })
                .eq('id', app.id);

            if (appError) throw appError;

            if (action === 'approved' && app.user_id) {
                await supabase.from('profiles').update({ is_plug: true, reputation: 100 }).eq('id', app.user_id);
                toast.success("Plug Approved! 🔌");
            }

            setApplications((prev: any[]) => prev.filter(a => a.id !== app.id));
            toast.success(`Application ${action}`);
        } catch (err: any) {
            toast.error("Action failed");
        } finally {
            setProcessingId(null);
        }
    };

    const togglePlugStatus = async (userId: string, currentStatus: boolean) => {
        setProcessingId(userId);
        try {
            await supabase.from('profiles').update({ is_plug: !currentStatus }).eq('id', userId);
            setFoundUser((prev: AdminProfile | null) => prev ? { ...prev, is_plug: !currentStatus } : null);
            toast.success("Status updated");
        } finally {
            setProcessingId(null);
        }
    };

    const searchUser = async () => {
        if (!userSearch) return;
        const { data } = await supabase.from('profiles').select('*').or(`email.ilike.%${userSearch}%,id.eq.${userSearch}`).single();
        setFoundUser(data);
    };

    // View Components
    const DashboardView = () => (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="text-loops-primary" />
                <StatCard icon={Package} label="Products" value={stats.products} color="text-blue-500" />
                <StatCard icon={Zap} label="Services" value={stats.services} color="text-amber-500" />
                <StatCard icon={ShieldAlert} label="Active Reports" value={stats.reports} color="text-red-500" />
            </div>

            {analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 p-8 rounded-3xl bg-white border border-loops-border shadow-sm space-y-8">
                        <div className="flex items-center justify-between border-b pb-6">
                            <h2 className="text-xl font-bold font-display">Loop Velocity</h2>
                            <div className="text-3xl font-display font-bold text-loops-primary italic">₦{analytics.overview?.listedGMV?.toLocaleString()}</div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            <StatTile label="Plugs" value={analytics.overview?.verifiedPlugs} icon={Zap} />
                            <StatTile label="Adoption" value={`${analytics.overview?.totalUsers > 0 ? Math.round((analytics.overview?.verifiedPlugs / analytics.overview?.totalUsers) * 100) : 0}%`} icon={BarChart3} />
                            <StatTile label="Products" value={analytics.overview?.products} icon={Package} />
                            <StatTile label="Services" value={analytics.overview?.services} icon={Award} />
                        </div>
                    </div>
                    <div className="p-8 rounded-3xl bg-white border border-loops-border shadow-sm space-y-6">
                        <h2 className="text-xl font-bold font-display flex items-center gap-2"><Award className="w-5 h-5 text-loops-energetic" /> Top Plugs</h2>
                        <div className="space-y-4">
                            {analytics.topSellers?.map((seller: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-loops-subtle border border-loops-border">
                                    <span className="font-bold text-sm">{seller.name}</span>
                                    <span className="text-loops-primary font-bold">{seller.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const UserView = () => (
        <div className="space-y-8">
            <div className="bg-white border border-loops-border rounded-3xl p-8 space-y-6 shadow-sm">
                <h2 className="text-xl font-bold font-display flex items-center gap-2"><Users className="w-5 h-5 text-loops-primary" /> User Manager</h2>
                <div className="flex gap-4">
                    <input
                        type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
                        placeholder="Search by email or ID..."
                        className="flex-1 h-12 px-4 rounded-xl bg-loops-subtle border border-loops-border outline-none focus:ring-2 focus:ring-loops-primary/20"
                    />
                    <Button onClick={searchUser} className="h-12 bg-loops-primary text-white font-bold px-8">Search</Button>
                </div>
                {foundUser && (
                    <div className="p-6 bg-loops-subtle rounded-2xl border border-loops-border flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg">{foundUser.full_name}</h3>
                            <p className="text-xs text-loops-muted">{foundUser.email}</p>
                        </div>
                        <Button
                            onClick={() => togglePlugStatus(foundUser.id, foundUser.is_plug)}
                            className={cn("font-bold", foundUser.is_plug ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-loops-primary text-white")}
                        >
                            {foundUser.is_plug ? "Revoke Plug Badge" : "Verify as Plug"}
                        </Button>
                    </div>
                )}
            </div>

            <div className="bg-white border border-loops-border rounded-3xl shadow-sm overflow-hidden">
                <div className="p-8 border-b">
                    <h2 className="text-xl font-bold font-display flex items-center gap-2"><Activity className="w-5 h-5 text-loops-energetic" /> Pending Applications</h2>
                </div>
                <div className="divide-y">
                    {applications.map(app => (
                        <div key={app.id} className="p-6 hover:bg-loops-subtle transition-colors flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="font-bold">{app.full_name}</h3>
                                <p className="text-xs text-loops-muted">{app.campus_email} • {app.offering_type}</p>
                                <p className="text-xs italic">"{app.motivation.substring(0, 100)}..."</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleApplicationAction(app, 'approved')} className="bg-loops-success text-white">Approve</Button>
                                <Button size="sm" variant="outline" onClick={() => handleApplicationAction(app, 'rejected')} className="text-red-500 border-red-200">Reject</Button>
                            </div>
                        </div>
                    ))}
                    {applications.length === 0 && <div className="p-12 text-center text-loops-muted italic font-medium">Clear queue. Great job!</div>}
                </div>
            </div>
        </div>
    );

    const UniversityView = () => (
        <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campuses.map(campus => (
                    <div key={campus.id} className="p-6 rounded-3xl bg-white border border-loops-border shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-loops-primary/10 rounded-xl flex items-center justify-center text-loops-primary font-bold">
                                <School className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-tight">{campus.name}</h3>
                                <p className="text-[10px] text-loops-muted font-bold uppercase">{campus.domain}</p>
                            </div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-loops-success" />
                    </div>
                ))}
            </div>

            <div className="bg-white border border-loops-border rounded-3xl shadow-sm overflow-hidden">
                <div className="p-8 border-b">
                    <h2 className="text-xl font-bold font-display flex items-center gap-2"><Globe className="w-5 h-5 text-loops-primary" /> Node Launch Requests</h2>
                </div>
                <div className="divide-y">
                    {campusRequests.map(req => (
                        <div key={req.id} className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="font-bold">{req.university_name}</h3>
                                <p className="text-xs text-loops-muted">{req.school_email}</p>
                            </div>
                            <Button className="bg-loops-primary text-white font-bold text-xs uppercase tracking-widest px-6 h-10 rounded-xl">Launch Node</Button>
                        </div>
                    ))}
                    {campusRequests.length === 0 && <div className="p-12 text-center text-loops-muted italic font-medium">No pending launch requests.</div>}
                </div>
            </div>
        </div>
    );

    const SafetyView = () => (
        <div className="bg-white border border-loops-border rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b">
                <h2 className="text-xl font-bold font-display flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-red-500" /> Safety Moderation</h2>
            </div>
            <div className="divide-y">
                {reports.map(report => (
                    <div key={report.id} className="p-6 hover:bg-loops-subtle transition-colors flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-red-100">Marketplace Report</span>
                                <h3 className="font-bold text-sm">Issue with "{report.listings?.title || 'Unknown Item'}"</h3>
                            </div>
                            <p className="text-xs text-loops-muted">Reported by <span className="font-bold text-loops-main">{report.profiles?.full_name}</span>: "{report.reason}"</p>
                        </div>
                        <div className="flex gap-3">
                            <Button size="sm" variant="outline" className="text-loops-muted border-loops-border">Ignore</Button>
                            <Button size="sm" className="bg-red-500 text-white font-bold px-6">Remove Listing</Button>
                        </div>
                    </div>
                ))}
                {reports.length === 0 && <div className="p-12 text-center text-loops-muted italic font-medium">Platform is safe. No active reports.</div>}
            </div>
        </div>
    );

    if (!isPasskeyVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-loops-bg px-6">
                <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-loops-border shadow-2xl text-center space-y-6">
                    <ShieldAlert className="w-12 h-12 text-loops-primary mx-auto" />
                    <div>
                        <h1 className="text-2xl font-bold font-display italic">Restricted Access</h1>
                        <p className="text-sm text-loops-muted mt-2">Enter the Loop Command access code to proceed.</p>
                    </div>
                    <input
                        type="password" value={passkey}
                        onChange={(e) => {
                            setPasskey(e.target.value);
                            if (e.target.value.toUpperCase() === ADMIN_ACCESS_CODE) {
                                setIsPasskeyVerified(true);
                                toast.success("Access Granted. Welcome, Founder.");
                            }
                        }}
                        placeholder="••••••••"
                        className="w-full h-14 text-center text-2xl font-mono tracking-widest bg-loops-subtle border border-loops-border rounded-xl focus:ring-2 focus:ring-loops-primary outline-none"
                    />
                </div>
            </div>
        );
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-loops-bg font-bold font-display italic text-loops-primary animate-pulse">SYNCING COMMAND CENTER...</div>;

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main flex">
            <AdminSidebar currentView={currentView} onViewChange={setCurrentView} />

            <main className="flex-1 ml-[280px] p-12 overflow-y-auto">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-loops-primary uppercase tracking-[0.3em] mb-2">Systems Oversight</p>
                        <h1 className="text-5xl font-black font-display tracking-tight text-loops-main capitalize">{currentView}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-loops-muted uppercase">Administrator</p>
                            <p className="text-xs font-bold text-loops-main">Founding Node</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-loops-primary shadow-lg shadow-loops-primary/20 flex items-center justify-center text-white font-black italic text-xl">F</div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentView}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {currentView === 'dashboard' && <DashboardView />}
                        {currentView === 'users' && <UserView />}
                        {currentView === 'universities' && <UniversityView />}
                        {currentView === 'safety' && <SafetyView />}
                        {currentView === 'marketplace' && (
                            <div className="p-12 text-center bg-white border border-loops-border rounded-3xl shadow-sm">
                                <SearchIcon className="w-12 h-12 text-loops-muted mx-auto mb-4 opacity-20" />
                                <h2 className="text-xl font-bold font-display">Feed Content Moderate</h2>
                                <p className="text-loops-muted mt-2">Listing search and direct feed control coming soon.</p>
                            </div>
                        )}
                        {currentView === 'settings' && (
                            <div className="p-12 text-center bg-white border border-loops-border rounded-3xl shadow-sm">
                                <Settings className="w-12 h-12 text-loops-muted mx-auto mb-4 opacity-20" />
                                <h2 className="text-xl font-bold font-display">System Configuration</h2>
                                <p className="text-loops-muted mt-2">Global platform controls and feature flags.</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: any, color: string }) {
    return (
        <div className="p-8 bg-white border border-loops-border rounded-3xl shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl bg-opacity-10 group-hover:scale-110 transition-transform", color.replace('text-', 'bg-'))}>
                    <Icon className={cn("w-6 h-6", color)} />
                </div>
                <TrendingUp className="w-4 h-4 text-loops-success opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-loops-muted mb-1">{label}</p>
            <div className="text-4xl font-black font-display tracking-tighter text-loops-main">{value}</div>
        </div>
    );
}

function StatTile({ label, value, icon: Icon }: { label: string, value: any, icon: any }) {
    return (
        <div className="p-4 rounded-2xl bg-loops-subtle border border-loops-border group hover:bg-white transition-all">
            <div className="flex items-center gap-2 text-loops-muted mb-2">
                <Icon className="w-3.5 h-3.5 group-hover:text-loops-primary transition-colors" />
                <span className="text-[9px] uppercase font-bold tracking-[0.1em]">{label}</span>
            </div>
            <p className="text-2xl font-black font-display italic tracking-tight">{value}</p>
        </div>
    );
}
