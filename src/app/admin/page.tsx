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
    AlertTriangle,
    Settings,
    ChevronRight,
    ChevronDown,
    ArrowUpRight,
    Copy,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AdminSidebar, AdminView } from "@/components/admin/sidebar";
import { motion, AnimatePresence } from "framer-motion";

interface AdminProfile {
    id: string;
    full_name: string | null;
    email: string | null;
    whatsapp_number: string | null;
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
        totalPlugs: 0,
        foundingPlugs: 0,
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
    const [selectedApps, setSelectedApps] = useState<string[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [batchMessage, setBatchMessage] = useState("");
    const [broadcastMessage, setBroadcastMessage] = useState("");



    // Safety Hub States
    const [reports, setReports] = useState<any[]>([]);

    // Universities States
    const [campuses, setCampuses] = useState<any[]>([]);
    const [campusRequests, setCampusRequests] = useState<any[]>([]);

    // Marketplace Management
    const [allListings, setAllListings] = useState<any[]>([]);
    const [marketplaceFilter, setMarketplaceFilter] = useState<'all' | 'product' | 'service'>('all');
    const [marketplaceSearch, setMarketplaceSearch] = useState("");

    // User Directory
    const [allUsers, setAllUsers] = useState<AdminProfile[]>([]);
    const [userTab, setUserTab] = useState<'requests' | 'directory'>('requests');
    const [directoryFilter, setDirectoryFilter] = useState<'all' | 'plug' | 'admin' | 'student'>('all');

    const supabase = createClient();
    const router = useRouter();
    const toast = useToast();
    const [passkey, setPasskey] = useState("");
    const [isPasskeyVerified, setIsPasskeyVerified] = useState(false);

    // Broadcast & Approval Helper Functions (Moved up to fix modal positioning)
    const approveWithNotifications = async (app: any) => {
        setProcessingId(app.id);
        try {
            await handleApplicationAction(app, 'approved');

            // Auto-copy the success message for convenience
            const text = `👑 CONGRATULATIONS ${app.full_name.toUpperCase()}! Your Founding Plug application for "${app.store_name}" has been APPROVED. \n\nYou are now part of the elite Founding 50. Please wait for the full launch sequence. \n\n♾️ LOOPS PLATFORMS`;
            navigator.clipboard.writeText(text);
            toast.success("Empire expanded! Approval message copied. 🔌");
        } catch (err) {
            toast.error("Approval sequence failed. Check connection.");
        } finally {
            setProcessingId(null);
        }
    };

    const approveSelected = async () => {
        if (selectedApps.length === 0) return;
        setProcessingId('batch');
        try {
            const res = await fetch('/api/admin/applications/approve-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedApps, message: batchMessage })
            });

            if (!res.ok) throw new Error('Batch approval failed');

            setApplications(prev => prev.filter(a => !selectedApps.includes(a.id)));
            setSelectedApps([]);
            setShowBatchModal(false);
            setBatchMessage("");
            toast.success("Selected Plugs approved and notified! ⚡");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const toggleAppSelection = (id: string) => {
        setSelectedApps(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleUserSelection = (id: string) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const executeBroadcast = async () => {
        const isFromApps = selectedApps.length > 0;
        const targetIds = isFromApps ? selectedApps : selectedUsers;

        if (targetIds.length === 0) return;
        setProcessingId('broadcast');

        try {
            // Prepare recipients
            let recipients = [];
            if (isFromApps) {
                recipients = applications
                    .filter(a => selectedApps.includes(a.id))
                    .map(a => ({ id: a.id, whatsapp_number: a.whatsapp_number, full_name: a.full_name }));
            } else {
                recipients = allUsers
                    .filter(u => selectedUsers.includes(u.id))
                    .map(u => ({ id: u.id, whatsapp_number: u.whatsapp_number || u.email, full_name: u.full_name }));
            }

            const res = await fetch('/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients,
                    message: broadcastMessage
                })
            });

            if (!res.ok) throw new Error('Broadcast failed');

            toast.success(`Broadcast sent to ${targetIds.length} recipients! 📣`);
            setSelectedApps([]);
            setSelectedUsers([]);
            setShowBroadcastModal(false);
            setBroadcastMessage("");
        } catch (err: any) {
            toast.error(`Broadcast failed: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };
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
                const [users, activePlugs, foundingCount, products, servicesCount, reportsCount] = await Promise.all([
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_plug', true),
                    supabase.from('seller_applications').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
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
                    .select('*, profiles(full_name, email), listings(title, images, type)')
                    .order('created_at', { ascending: false });

                // 6. All Listings for Marketplace View
                const { data: listingsData } = await supabase
                    .from('listings')
                    .select('*, profiles(full_name, avatar_url)')
                    .order('created_at', { ascending: false });

                // 7. All Users for Directory
                const { data: usersData } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(100);

                setStats({
                    totalUsers: users.count || 0,
                    totalPlugs: activePlugs.count || 0,
                    foundingPlugs: foundingCount.count || 0,
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
                setAllListings(listingsData || []);
                setAllUsers(usersData || []);

            } catch (err) {
                console.error("Data fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [supabase, router]);

    const handleViewChange = (view: AdminView) => {
        if (view === 'onboarding') {
            router.push('/admin/onboarding-kit');
            return;
        }
        setCurrentView(view);
    };

    // Empire Management Helper Functions
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

    const groupApplications = (apps: any[]) => {
        const filtered = apps.filter(app =>
            app.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
            app.store_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
            app.campus_email?.toLowerCase().includes(userSearch.toLowerCase())
        );

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

        const groups = {
            today: [] as any[],
            thisWeek: [] as any[],
            older: [] as any[]
        };

        filtered.forEach(app => {
            const created = new Date(app.created_at);
            if (created >= startOfDay) groups.today.push(app);
            else if (created >= startOfWeek) groups.thisWeek.push(app);
            else groups.older.push(app);
        });

        return groups;
    };

    const DashboardView = () => (
        <div className="space-y-12">
            {/* Grand Launch Pad */}
            <div className="bg-loops-main rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/10 group">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="space-y-4 max-w-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-loops-primary rounded-2xl flex items-center justify-center text-loops-main shadow-lg shadow-loops-primary/20 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6 fill-current" />
                            </div>
                            <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Active Campaign</span>
                        </div>
                        <h2 className="text-4xl font-black italic tracking-tighter leading-tight">Bring the 10 Nodes Online.</h2>
                        <p className="text-white/60 font-medium text-base">We've seeded the infrastructure. Now use the **Blitz Kit** to recruit your first 500 Plugs. High-conversion scripts and asset packs ready.</p>
                        <div className="pt-2 flex gap-4">
                            <Link href="/admin/onboarding-kit">
                                <Button className="bg-loops-primary text-loops-main font-black uppercase tracking-widest text-xs px-8 h-12 rounded-2xl hover:scale-105 transition-all">Open Blitz Kit 🚀</Button>
                            </Link>
                            <Button variant="ghost" className="text-white/60 hover:text-white font-bold text-xs uppercase tracking-widest px-6 h-12 rounded-2xl border border-white/5 hover:bg-white/5">View Node Stats</Button>
                        </div>
                    </div>

                    <div className="relative w-full md:w-64 aspect-square flex items-center justify-center">
                        <div className="absolute inset-0 bg-loops-primary/20 rounded-full blur-[80px]" />
                        <div className="relative z-10 grid grid-cols-2 gap-3 w-full">
                            <div className="p-4 bg-white/5 backdrop-blur rounded-2xl border border-white/10 text-center">
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Target</p>
                                <p className="text-2xl font-black text-white italic">10</p>
                            </div>
                            <div className="p-4 bg-loops-primary rounded-2xl border border-white/10 text-center">
                                <p className="text-[8px] font-black uppercase tracking-widest text-loops-main/40 mb-1">Live</p>
                                <p className="text-2xl font-black text-loops-main italic">{campuses.length}</p>
                            </div>
                            <div className="col-span-2 p-4 bg-white/5 backdrop-blur rounded-2xl border border-white/10 text-center">
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Recruitment Link Clicked</p>
                                <p className="text-xl font-black text-white italic">--</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-loops-primary/10 rounded-full blur-[100px]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                    icon={Users}
                    label="Active Plugs"
                    value={stats.totalPlugs}
                    description={`${stats.foundingPlugs} Founding`}
                    color="text-loops-primary"
                    onClick={() => {
                        setCurrentView('users');
                        setUserTab('directory');
                        setDirectoryFilter('plug');
                    }}
                />
                <StatCard
                    icon={Users}
                    label="Total Users"
                    value={stats.totalUsers}
                    color="text-loops-muted"
                    onClick={() => {
                        setCurrentView('users');
                        setUserTab('directory');
                        setDirectoryFilter('all');
                    }}
                />
                <StatCard
                    icon={Package}
                    label="Products"
                    value={stats.products}
                    color="text-blue-500"
                    onClick={() => {
                        setCurrentView('marketplace');
                        setMarketplaceFilter('product');
                    }}
                />
                <StatCard
                    icon={Zap}
                    label="Services"
                    value={stats.services}
                    color="text-amber-500"
                    onClick={() => {
                        setCurrentView('marketplace');
                        setMarketplaceFilter('service');
                    }}
                />
                <StatCard
                    icon={ShieldAlert}
                    label="Active Reports"
                    value={stats.reports}
                    color="text-red-500"
                    onClick={() => setCurrentView('safety')}
                />
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

    const UserView = () => {
        const [showUserManager, setShowUserManager] = useState(false);
        const [applicationSubTab, setApplicationSubTab] = useState<'product' | 'service' | 'review'>('product');

        // Filter applications based on tab
        const tabFilteredApps = applications.filter(a => {
            if (applicationSubTab === 'review') {
                return a.offering_type !== 'product' && a.offering_type !== 'service';
            }
            return a.offering_type === applicationSubTab;
        });

        const groups = groupApplications(tabFilteredApps);

        const filteredUsers = allUsers.filter(u => {
            const matchesSearch = u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                u.email?.toLowerCase().includes(userSearch.toLowerCase());
            const matchesRole = directoryFilter === 'all' ||
                (directoryFilter === 'plug' && u.is_plug) ||
                (directoryFilter === 'admin' && u.is_admin) ||
                (directoryFilter === 'student' && !u.is_plug && !u.is_admin);
            return matchesSearch && matchesRole;
        });

        // Duplicate helper functions removed (now at top-level)
        return (
            <div className="space-y-8">
                {/* View Switcher */}
                <div className="flex gap-4 border-b border-loops-border pb-6">
                    <button
                        onClick={() => setShowUserManager(false)}
                        className={cn(
                            "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all",
                            !showUserManager ? "bg-loops-primary text-white shadow-xl shadow-loops-primary/20" : "text-loops-muted hover:text-loops-main"
                        )}
                    >
                        Join Requests ({applications.length})
                    </button>
                    <button
                        onClick={() => setShowUserManager(true)}
                        className={cn(
                            "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all",
                            showUserManager ? "bg-loops-primary text-white shadow-xl shadow-loops-primary/20" : "text-loops-muted hover:text-loops-main"
                        )}
                    >
                        Student Directory ({allUsers.length})
                    </button>
                </div>

                {!showUserManager ? (
                    /* Applications View */
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Sub-tabs for Applications */}
                        <div className="flex gap-2 p-1.5 bg-loops-subtle rounded-2xl border border-loops-border w-fit">
                            {(['product', 'service', 'review'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setApplicationSubTab(tab)}
                                    className={cn(
                                        "px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                        applicationSubTab === tab ? "bg-white text-loops-primary shadow-sm" : "text-loops-muted hover:text-loops-main"
                                    )}
                                >
                                    {tab}s
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 gap-12">
                            {Object.entries(groups).map(([name, groupApps]) => groupApps.length > 0 && (
                                <div key={name} className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-loops-muted ml-2 flex items-center gap-4">
                                        {name}
                                        <div className="h-px flex-1 bg-loops-border" />
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {groupApps.map((app: any) => (
                                            <div key={app.id} className="bg-white border border-loops-border rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className="w-12 h-12 rounded-3xl bg-loops-subtle border border-loops-border flex items-center justify-center font-bold text-loops-primary group-hover:scale-110 transition-transform">
                                                        {app.full_name?.charAt(0)}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toggleAppSelection(app.id); }}
                                                            className={cn(
                                                                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                                                selectedApps.includes(app.id) ? "bg-loops-primary border-loops-primary text-white" : "border-loops-border hover:border-loops-primary"
                                                            )}
                                                        >
                                                            {selectedApps.includes(app.id) && <Check className="w-3.2 h-3.2" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="text-xl font-black italic tracking-tight">{app.store_name}</h4>
                                                        <p className="text-xs font-bold text-loops-muted">{app.full_name}</p>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-[10px] font-black text-loops-primary/60 uppercase tracking-widest bg-loops-primary/5 px-3 py-1.5 rounded-full w-fit border border-loops-primary/10">
                                                        <School className="w-3 h-3" />
                                                        {app.university}
                                                    </div>
                                                </div>

                                                <div className="mt-8 flex gap-3">
                                                    <Button
                                                        onClick={() => approveWithNotifications(app)}
                                                        disabled={processingId === app.id}
                                                        className="flex-1 bg-loops-primary text-white font-black uppercase tracking-widest text-[9px] h-11 rounded-xl shadow-lg shadow-loops-primary/20"
                                                    >
                                                        {processingId === app.id ? 'Approving...' : 'Approve 👑'}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {applications.length === 0 && (
                                <div className="py-24 text-center space-y-4">
                                    <div className="w-20 h-20 bg-loops-subtle rounded-3xl flex items-center justify-center mx-auto text-loops-muted opacity-20">
                                        <Award className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-bold font-display italic">Peace in the Loop.</h3>
                                    <p className="text-loops-muted text-sm px-12">No pending applications to process. Your empire is stable.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Directory View */
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Directory Search & Filter */}
                        <div className="bg-white border border-loops-border rounded-[2rem] p-4 flex flex-col md:flex-row gap-4 items-center shadow-xl shadow-loops-primary/5">
                            <div className="relative flex-1 w-full">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-loops-muted" />
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    placeholder="Search student directory..."
                                    className="w-full h-14 pl-12 pr-6 rounded-2xl bg-loops-subtle border border-transparent focus:border-loops-primary focus:bg-white outline-none transition-all font-bold"
                                />
                            </div>
                            <div className="flex bg-loops-subtle p-1.5 rounded-2xl border border-loops-border">
                                {(['all', 'plug', 'admin', 'student'] as const).map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setDirectoryFilter(role)}
                                        className={cn(
                                            "px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all capitalize",
                                            directoryFilter === role ? "bg-white text-loops-primary shadow-sm" : "text-loops-muted"
                                        )}
                                    >
                                        {role}s
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative">
                            {/* Selection Bar for Directory */}
                            {selectedUsers.length > 0 && (
                                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-loops-main text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-8 duration-500 border border-white/10 backdrop-blur-xl">
                                    <div className="flex flex-col">
                                        <span className="text-xl font-black italic">{selectedUsers.length} Users</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Selected for Broadcast</span>
                                    </div>
                                    <div className="h-10 w-px bg-white/20" />
                                    <div className="flex gap-4">
                                        <Button
                                            onClick={() => setShowBroadcastModal(true)}
                                            className="bg-white text-loops-main font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-2xl hover:bg-loops-subtle transition-all"
                                        >
                                            Broadcast Message 📣
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setSelectedUsers([])}
                                            className="text-white hover:bg-white/10 font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="col-span-full bg-white border border-loops-border rounded-[2.5rem] overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-loops-subtle/50 border-b border-loops-border">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-loops-muted w-12">
                                                {/* Potential Select All Checkbox */}
                                            </th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-loops-muted">User</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-loops-muted">Role</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-loops-muted">WhatsApp</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-loops-muted text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-loops-border">
                                        {filteredUsers.map(user => (
                                            <tr
                                                key={user.id}
                                                onClick={() => toggleUserSelection(user.id)}
                                                className={cn(
                                                    "hover:bg-loops-subtle/30 transition-colors group cursor-pointer",
                                                    selectedUsers.includes(user.id) && "bg-loops-primary/5"
                                                )}
                                            >
                                                <td className="px-8 py-6">
                                                    <div className={cn(
                                                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                                        selectedUsers.includes(user.id) ? "bg-loops-primary border-loops-primary text-white" : "border-loops-border bg-white"
                                                    )}>
                                                        {selectedUsers.includes(user.id) && <Check className="w-3 h-3" />}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-loops-subtle flex items-center justify-center font-bold text-loops-primary border border-loops-border group-hover:scale-110 transition-transform shadow-sm">
                                                            {user.full_name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-loops-main">{user.full_name || 'Anonymous User'}</div>
                                                            <div className="text-[10px] font-bold text-loops-muted uppercase tracking-tight">{user.email || 'No email'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex gap-2">
                                                        {user.is_admin && <span className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-red-100">Admin</span>}
                                                        {user.is_plug && <span className="px-3 py-1 bg-loops-primary/5 text-loops-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-loops-primary/10">Plug</span>}
                                                        {!user.is_admin && !user.is_plug && <span className="px-3 py-1 bg-loops-subtle text-loops-muted text-[9px] font-black uppercase tracking-widest rounded-full border border-loops-border">Student</span>}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-xs font-bold text-loops-muted">
                                                    <div className="flex items-center gap-2">
                                                        {user.whatsapp_number ? (
                                                            <>
                                                                <MessageCircle className="w-3 h-3 text-loops-success" />
                                                                <span>{user.whatsapp_number}</span>
                                                            </>
                                                        ) : (
                                                            <span className="opacity-30 italic">Not set</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex gap-2 justify-end" onClick={e => e.stopPropagation()}>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={processingId === user.id}
                                                            onClick={() => togglePlugStatus(user.id, user.is_plug)}
                                                            className={cn(
                                                                "h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
                                                                user.is_plug ? "text-red-500 border-red-100 hover:bg-red-50" : "text-loops-primary border-loops-primary/10 hover:bg-loops-primary/5"
                                                            )}
                                                        >
                                                            {user.is_plug ? 'Revoke Plug' : 'Verify Plug'}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="py-20 text-center">
                                <p className="text-loops-muted italic font-medium">No users found matching your search.</p>
                            </div>
                        )}
                    </div>
                )
                }
            </div >
        );
    };

    const UniversityView = () => (
        <div className="space-y-12">
            {/* Launch Coverage Summary */}
            <div className="bg-loops-main rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Phase 1: Grand Launch</span>
                            <span className="text-loops-primary font-black animate-pulse text-[10px] uppercase">● System Live</span>
                        </div>
                        <h2 className="text-4xl font-black italic tracking-tighter">10 Nodes Coverage</h2>
                        <p className="text-white/60 font-medium text-sm">Strategic dominance across Veritas, Bingham, Nile, UniAbuja, ATBU, UniJos, MOUAU, UNILAG, ABU, and UNN.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Target Nodes</p>
                            <p className="text-2xl font-black italic">10</p>
                        </div>
                        <div className="text-center p-4 bg-loops-primary rounded-2xl border border-white/10">
                            <p className="text-[9px] font-black uppercase tracking-widest text-loops-main/40 mb-1">Active Now</p>
                            <p className="text-2xl font-black italic text-loops-main">{campuses.length}</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-loops-primary/20 rounded-full -mr-32 -mt-32 blur-3xl" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campuses.map(campus => (
                    <div key={campus.id} className="p-8 rounded-[2rem] bg-white border border-loops-border shadow-sm hover:shadow-xl transition-all group flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-loops-subtle rounded-2xl flex items-center justify-center text-loops-primary border border-loops-border group-hover:bg-loops-primary group-hover:text-white transition-all">
                                    <School className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base tracking-tight">{campus.name}</h3>
                                    <p className="text-[10px] text-loops-muted font-bold uppercase tracking-widest">{campus.domain}</p>
                                </div>
                            </div>
                            <div className={cn(
                                "w-2.5 h-2.5 rounded-full",
                                campus.is_active ? "bg-loops-success shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-loops-muted opacity-30"
                            )} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-loops-subtle rounded-xl border border-loops-border">
                                <p className="text-[8px] font-black uppercase tracking-widest text-loops-muted mb-1">Type</p>
                                <p className="text-[10px] font-bold capitalize">{campus.type || 'Standard'}</p>
                            </div>
                            <div className="p-3 bg-loops-subtle rounded-xl border border-loops-border">
                                <p className="text-[8px] font-black uppercase tracking-widest text-loops-muted mb-1">Location</p>
                                <p className="text-[10px] font-bold truncate">{campus.location || 'Unknown'}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-loops-border">
                            <span className="text-[9px] font-black uppercase tracking-widest text-loops-muted">Node Status: <span className="text-loops-main">Stable</span></span>
                            <Button variant="ghost" size="sm" className="h-8 p-0 w-8 rounded-lg text-loops-muted hover:text-loops-primary">
                                <Globe className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-loops-border rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="p-10 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-3">
                            <Globe className="w-6 h-6 text-loops-primary" />
                            Node Launch Requests
                        </h2>
                        <p className="text-sm text-loops-muted font-medium mt-1">Founders asking to bridge their campus into the Loop.</p>
                    </div>
                    <span className="px-4 py-2 bg-loops-subtle rounded-xl text-[10px] font-black uppercase tracking-widest">{campusRequests.length} Pending</span>
                </div>
                <div className="divide-y divide-loops-border">
                    {campusRequests.map(req => (
                        <div key={req.id} className="p-8 hover:bg-loops-subtle transition-colors flex items-center justify-between group">
                            <div className="space-y-2">
                                <h3 className="font-black text-lg italic group-hover:text-loops-primary transition-colors">{req.university_name}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-loops-muted uppercase tracking-widest">{req.school_email}</span>
                                    <span className="w-1 h-1 bg-loops-border rounded-full" />
                                    <span className="text-[10px] font-bold text-loops-primary uppercase tracking-widest bg-loops-primary/5 px-2 py-0.5 rounded-full border border-loops-primary/10">Priority Node</span>
                                </div>
                            </div>
                            <Button className="bg-loops-primary text-white font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-2xl shadow-xl shadow-loops-primary/20 hover:scale-105 transition-all">Launch Node 🚀</Button>
                        </div>
                    ))}
                    {campusRequests.length === 0 && (
                        <div className="p-20 text-center space-y-4">
                            <Award className="w-12 h-12 text-loops-muted opacity-20 mx-auto" />
                            <p className="text-loops-muted italic font-medium">All valid node requests have been bridged.</p>
                        </div>
                    )}
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
            <AdminSidebar currentView={currentView} onViewChange={handleViewChange} />

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
                            <div className="space-y-8">
                                {/* Marketplace Search & Filter */}
                                <div className="bg-white border border-loops-border rounded-[2rem] p-4 flex flex-col md:flex-row gap-4 items-center shadow-xl shadow-loops-primary/5">
                                    <div className="relative flex-1 w-full">
                                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-loops-muted" />
                                        <input
                                            type="text"
                                            value={marketplaceSearch}
                                            onChange={e => setMarketplaceSearch(e.target.value)}
                                            placeholder="Search items, vendors, or descriptions..."
                                            className="w-full h-14 pl-12 pr-6 rounded-2xl bg-loops-subtle border border-transparent focus:border-loops-primary focus:bg-white outline-none transition-all font-bold"
                                        />
                                    </div>
                                    <div className="flex bg-loops-subtle p-1.5 rounded-2xl border border-loops-border">
                                        {(['all', 'product', 'service'] as const).map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setMarketplaceFilter(tab)}
                                                className={cn(
                                                    "px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all capitalize",
                                                    marketplaceFilter === tab ? "bg-white text-loops-primary shadow-sm" : "text-loops-muted"
                                                )}
                                            >
                                                {tab}s
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {allListings.filter(item => {
                                        const matchesSearch = item.title?.toLowerCase().includes(marketplaceSearch.toLowerCase()) ||
                                            item.profiles?.full_name?.toLowerCase().includes(marketplaceSearch.toLowerCase());
                                        const matchesTab = marketplaceFilter === 'all' || item.type === marketplaceFilter;
                                        return matchesSearch && matchesTab;
                                    }).map(item => (
                                        <div key={item.id} className="bg-white border border-loops-border rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                                            <div className="aspect-square rounded-2xl bg-loops-subtle overflow-hidden mb-4 relative">
                                                {item.images?.[0] ? (
                                                    <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-loops-muted/30">
                                                        <Package className="w-12 h-12" />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-loops-primary border border-loops-primary/10">
                                                    {item.type}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-loops-primary transition-colors">{item.title}</h3>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-6 h-6 rounded-full bg-loops-subtle flex items-center justify-center text-[10px] font-bold text-loops-primary">
                                                        {item.profiles?.full_name?.charAt(0)}
                                                    </div>
                                                    <p className="text-xs text-loops-muted font-bold">{item.profiles?.full_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-loops-border mt-auto">
                                                <span className="font-black text-xl italic text-loops-main">₦{item.price?.toLocaleString()}</span>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={cn(
                                                            "h-9 px-3 rounded-lg flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all",
                                                            item.boosted_until && new Date(item.boosted_until) > new Date()
                                                                ? "bg-loops-primary text-loops-main border-loops-primary"
                                                                : "bg-loops-subtle text-loops-muted border-loops-border hover:bg-loops-primary hover:text-loops-main hover:border-loops-primary"
                                                        )}
                                                        onClick={async () => {
                                                            const isCurrentlyBoosted = item.boosted_until && new Date(item.boosted_until) > new Date();
                                                            const newDate = isCurrentlyBoosted ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

                                                            const { error } = await supabase
                                                                .from('listings')
                                                                .update({ boosted_until: newDate })
                                                                .eq('id', item.id);

                                                            if (!error) {
                                                                setAllListings(prev => prev.map(l => l.id === item.id ? { ...l, boosted_until: newDate } : l));
                                                                toast.success(isCurrentlyBoosted ? "Boost Removed" : "Loop Boost Activated! ⚡");
                                                            }
                                                        }}
                                                    >
                                                        <Zap className={cn("w-3.5 h-3.5", item.boosted_until && new Date(item.boosted_until) > new Date() ? "fill-current" : "")} />
                                                        {item.boosted_until && new Date(item.boosted_until) > new Date() ? "Boosted" : "Boost"}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 w-9 p-0 rounded-lg text-loops-muted border-loops-border hover:bg-red-50 hover:text-red-500 transition-all"
                                                        onClick={async () => {
                                                            if (confirm('Moderate this listing? It will be removed.')) {
                                                                const { error } = await supabase.from('listings').delete().eq('id', item.id);
                                                                if (!error) {
                                                                    setAllListings(prev => prev.filter(l => l.id !== item.id));
                                                                    toast.success("Listing Moderated");
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {allListings.length === 0 && (
                                    <div className="py-24 text-center">
                                        <Package className="w-12 h-12 text-loops-muted mx-auto mb-4 opacity-20" />
                                        <p className="text-loops-muted italic font-medium">No active listings found.</p>
                                    </div>
                                )}
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

            {/* Global Overlays (Rendered at top level to fix positioning) */}
            <AnimatePresence>
                {showBatchModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-loops-main/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-y-auto border border-loops-border"
                        >
                            <div className="p-8 border-b border-loops-border bg-loops-subtle/30">
                                <h3 className="text-2xl font-black italic tracking-tight text-loops-main">Batch Approval Sequence</h3>
                                <p className="text-sm text-loops-muted font-medium mt-1">Approving {selectedApps.length} Plugs at once.</p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-loops-muted ml-2">Personalized WhatsApp Message</label>
                                    <textarea
                                        value={batchMessage}
                                        onChange={(e) => setBatchMessage(e.target.value)}
                                        placeholder="Leave blank for default system message..."
                                        className="w-full h-40 p-6 rounded-3xl bg-loops-subtle border border-loops-border outline-none focus:ring-2 focus:ring-loops-primary/20 transition-all font-medium text-sm resize-none"
                                    />
                                </div>
                            </div>

                            <div className="p-8 bg-loops-subtle/30 flex gap-4">
                                <Button
                                    onClick={() => setShowBatchModal(false)}
                                    variant="ghost"
                                    className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] text-loops-muted"
                                >
                                    Abort
                                </Button>
                                <Button
                                    onClick={approveSelected}
                                    disabled={processingId === 'batch'}
                                    className="flex-2 h-14 bg-loops-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-loops-primary/20"
                                >
                                    {processingId === 'batch' ? 'Expanding Empire...' : 'Execute Approval ♾️'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showBroadcastModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-loops-main/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-y-auto border border-loops-border"
                        >
                            <div className="p-8 border-b border-loops-border bg-loops-subtle/30">
                                <h3 className="text-2xl font-black italic tracking-tight text-loops-main flex items-center gap-3">
                                    <MessageCircle className="w-6 h-6 text-loops-primary" />
                                    Broadcast Transmission
                                </h3>
                                <p className="text-sm text-loops-muted font-medium mt-1">Targeting {selectedApps.length || selectedUsers.length} Recipients.</p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: "Launch Update", text: "🚀 Loop Alpha is now LIVE! Check your store for new features and start dropping items today. ♾️" },
                                            { label: "Profile Warning", text: "⚠️ Action Required: Please complete your profile verification to remain active in the Founding 10 Loop. 🔒" },
                                            { label: "Success Story", text: "🌟 Congrats to our top plugs this week! The Loop is growing fast—keep sharing your store links! 📈" },
                                            { label: "System Maintenance", text: "⚙️ Brief maintenance window tonight @ 12AM. The Loop will be pulsed for 15 mins. ⚡" }
                                        ].map(tmp => (
                                            <button
                                                key={tmp.label}
                                                onClick={() => setBroadcastMessage(tmp.text)}
                                                className="p-3 text-left bg-loops-subtle border border-loops-border rounded-xl hover:border-loops-primary transition-all group"
                                            >
                                                <p className="text-[8px] font-black uppercase tracking-widest text-loops-muted mb-1 group-hover:text-loops-primary">{tmp.label}</p>
                                                <p className="text-[10px] font-bold text-loops-main line-clamp-1">{tmp.text}</p>
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={broadcastMessage}
                                        onChange={(e) => setBroadcastMessage(e.target.value)}
                                        placeholder="Craft your global transmission..."
                                        className="w-full h-40 p-6 rounded-3xl bg-loops-subtle border border-loops-border outline-none focus:ring-2 focus:ring-loops-primary/20 transition-all font-medium text-sm resize-none"
                                    />
                                </div>
                            </div>

                            <div className="p-8 bg-loops-subtle/30 flex gap-4">
                                <Button
                                    onClick={() => setShowBroadcastModal(false)}
                                    variant="ghost"
                                    className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] text-loops-muted"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={executeBroadcast}
                                    disabled={processingId === 'broadcast'}
                                    className="flex-2 h-14 bg-loops-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-loops-primary/20"
                                >
                                    {processingId === 'broadcast' ? 'Transmitting...' : 'Send Broadcast 📣'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, description, color, onClick }: { icon: any, label: string, value: any, description?: string, color: string, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "p-8 bg-white border border-loops-border rounded-3xl shadow-sm hover:shadow-xl transition-all group",
                onClick && "cursor-pointer hover:border-loops-primary"
            )}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl bg-opacity-10 group-hover:scale-110 transition-transform", color.replace('text-', 'bg-'))}>
                    <Icon className={cn("w-6 h-6", color)} />
                </div>
                {onClick && <ArrowUpRight className="w-4 h-4 text-loops-muted group-hover:text-loops-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />}
            </div>
            <p className="text-[10px] font-black text-loops-muted uppercase tracking-[0.2em] mb-1">{label}</p>
            <div className="flex items-end justify-between">
                <div className="text-4xl font-black font-display text-loops-main group-hover:text-loops-primary transition-colors tracking-tight italic">
                    {value}
                </div>
                {description && (
                    <div className="text-[9px] font-bold text-loops-muted bg-loops-subtle px-2 py-1 rounded-lg border border-loops-border">
                        {description}
                    </div>
                )}
            </div>
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
