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
    ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import { cn } from "@/lib/utils";
import { AdminSidebar, AdminView } from "@/components/admin/sidebar";
import { motion, AnimatePresence } from "framer-motion";

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    label="Total Users"
                    value={stats.totalUsers}
                    color="text-loops-primary"
                    onClick={() => setCurrentView('users')}
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

        const approveWithNotifications = async (app: any) => {
            setProcessingId(app.id);
            try {
                const res = await fetch('/api/admin/applications/approve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ applicationId: app.id })
                });
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || 'API request failed');

                setApplications(prev => prev.filter(a => a.id !== app.id));

                // Detailed success feedback
                const n = data.notifications;
                if (n.email.success && n.whatsapp.success) {
                    toast.success("Empire Expanded: Plug approved & fully notified! 👑");
                } else {
                    if (!n.email.success) toast.error(`Email failed: ${n.email.error || 'Unknown error'}`);
                    if (!n.whatsapp.success) toast.error(`WhatsApp failed: ${n.whatsapp.error || 'Check 24h window'}`);
                    toast.success("Plug status updated, but some notifications failed.");
                }
            } catch (err: any) {
                toast.error(`Approval failed: ${err.message}`);
            } finally {
                setProcessingId(null);
            }
        };

        return (
            <div className="space-y-8">
                {/* Main View Switcher */}
                <div className="flex gap-4 border-b border-loops-border pb-6">
                    <button
                        onClick={() => setUserTab('requests')}
                        className={cn(
                            "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all",
                            userTab === 'requests' ? "bg-loops-primary text-white shadow-xl shadow-loops-primary/20" : "text-loops-muted hover:text-loops-main"
                        )}
                    >
                        Join Requests ({applications.length})
                    </button>
                    <button
                        onClick={() => setUserTab('directory')}
                        className={cn(
                            "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all",
                            userTab === 'directory' ? "bg-loops-primary text-white shadow-xl shadow-loops-primary/20" : "text-loops-muted hover:text-loops-main"
                        )}
                    >
                        Active Directory
                    </button>
                </div>

                {userTab === 'requests' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* User Manager Toggle */}
                        <div className="bg-white border border-loops-border rounded-3xl overflow-hidden shadow-sm">
                            <button
                                onClick={() => setShowUserManager(!showUserManager)}
                                className="w-full p-6 flex items-center justify-between hover:bg-loops-subtle transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-loops-primary" />
                                    <span className="font-bold text-sm tracking-tight">Manual User Lookup & Verification</span>
                                </div>
                                <ChevronRight className={cn("w-5 h-5 text-loops-muted transition-transform", showUserManager && "rotate-90")} />
                            </button>
                            {showUserManager && (
                                <div className="p-8 border-t space-y-6">
                                    <div className="flex gap-4">
                                        <input
                                            type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
                                            placeholder="Search by email or ID..."
                                            className="flex-1 h-12 px-4 rounded-xl bg-loops-subtle border border-loops-border outline-none focus:ring-2 focus:ring-loops-primary/20 font-medium"
                                        />
                                        <Button onClick={searchUser} className="h-12 bg-loops-primary text-white font-bold px-8 rounded-xl shadow-lg shadow-loops-primary/20">Search</Button>
                                    </div>
                                    {foundUser && (
                                        <div className="p-6 bg-loops-subtle rounded-2xl border border-loops-border flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-loops-primary border">
                                                    {foundUser.full_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm">{foundUser.full_name}</h3>
                                                    <p className="text-[10px] text-loops-muted font-bold uppercase tracking-widest">{foundUser.email}</p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => togglePlugStatus(foundUser.id, foundUser.is_plug)}
                                                className={cn("font-bold text-[10px] uppercase tracking-widest h-10 px-6 rounded-xl", foundUser.is_plug ? "bg-red-50 text-red-500 border border-red-100" : "bg-loops-primary text-white")}
                                            >
                                                {foundUser.is_plug ? "Revoke Plug" : "Verify Plug"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Search & Filter Header */}
                        <div className="bg-white border border-loops-border rounded-[2rem] p-4 flex flex-col md:flex-row gap-4 items-center shadow-xl shadow-loops-primary/5">
                            <div className="relative flex-1 w-full">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-loops-muted" />
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    placeholder="Find a Plug by name, store, or email..."
                                    className="w-full h-14 pl-12 pr-6 rounded-2xl bg-loops-subtle border border-transparent focus:border-loops-primary focus:bg-white outline-none transition-all font-bold"
                                />
                            </div>
                            <div className="flex bg-loops-subtle p-1.5 rounded-2xl border border-loops-border">
                                <button
                                    onClick={() => setApplicationSubTab('product')}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                        applicationSubTab === 'product' ? "bg-white text-loops-primary shadow-sm" : "text-loops-muted"
                                    )}
                                >
                                    Products
                                </button>
                                <button
                                    onClick={() => setApplicationSubTab('service')}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                        applicationSubTab === 'service' ? "bg-white text-loops-primary shadow-sm" : "text-loops-muted"
                                    )}
                                >
                                    Services
                                </button>
                                <button
                                    onClick={() => setApplicationSubTab('review')}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                        applicationSubTab === 'review' ? "bg-white text-loops-primary shadow-sm" : "text-loops-muted"
                                    )}
                                >
                                    Review ({applications.filter(a => a.offering_type !== 'product' && a.offering_type !== 'service').length})
                                </button>
                            </div>
                        </div>

                        {/* Applications Deck logic remains the same... */}
                        {/* [REDACTED FOR BREVITY, Logic after line 347-509 remains the same but wrapped in this condition] */}

                        {/* Applications Deck */}
                        <div className="space-y-12 pb-20">
                            {(Object.entries(groups) as [keyof typeof groups, any[]][]).map(([timeKey, apps]) => (
                                apps.length > 0 && (
                                    <section key={timeKey} className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-loops-muted">
                                                {timeKey === 'today' ? '🔥 Fresh Today' : timeKey === 'thisWeek' ? '📅 This Week' : '⏳ Earlier'}
                                            </h3>
                                            <div className="h-px bg-loops-border flex-1" />
                                            <span className="text-[10px] font-bold text-loops-primary px-3 py-1 bg-loops-primary/5 rounded-full border border-loops-primary/10">
                                                {apps.length} BATCH
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                            {apps.map(app => (
                                                <div key={app.id} className="bg-white border border-loops-border rounded-[2rem] p-8 shadow-sm hover:shadow-2xl hover:border-loops-primary transition-all group relative overflow-hidden">
                                                    {/* Top Bar: Info & Contacts */}
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="flex gap-4">
                                                            <div className="w-16 h-16 rounded-2xl bg-loops-subtle border border-loops-border overflow-hidden flex items-center justify-center relative shadow-inner">
                                                                {app.store_logo_url ? (
                                                                    <img src={app.store_logo_url} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-2xl font-black text-loops-primary italic">{app.store_name?.charAt(0) || 'P'}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-xl italic tracking-tight text-loops-main group-hover:text-loops-primary transition-colors">{app.store_name}</h4>
                                                                <div className="flex items-center gap-2 text-[10px] font-bold text-loops-muted uppercase tracking-widest">
                                                                    <span>{app.full_name}</span>
                                                                    <span className="w-1 h-1 bg-loops-border rounded-full" />
                                                                    <span>{app.offering_type}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <a
                                                                href={`https://wa.me/${app.whatsapp_number?.replace(/\+/g, '')}`}
                                                                target="_blank"
                                                                className="p-3 bg-loops-success/5 text-loops-success rounded-xl hover:bg-loops-success hover:text-white transition-all border border-loops-success/10"
                                                            >
                                                                <MessageCircle className="w-5 h-5" />
                                                            </a>
                                                            <div className="p-3 bg-loops-subtle text-loops-muted rounded-xl border border-loops-border">
                                                                <Package className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Middle Section: Pitch & Inventory */}
                                                    <div className="space-y-4 mb-8">
                                                        <div className="p-5 bg-loops-subtle/50 rounded-2xl border border-loops-border/50">
                                                            <p className="text-xs font-bold text-loops-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                <Zap className="w-3 h-3" /> The Pitch
                                                            </p>
                                                            <p className="text-sm text-loops-main leading-relaxed font-medium">"{app.offering_description}"</p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1 px-4 py-3 rounded-xl bg-white border border-loops-border flex items-center justify-between">
                                                                <span className="text-[10px] font-bold text-loops-muted uppercase">Inventory</span>
                                                                <span className="text-xs font-black text-loops-main">{app.estimated_item_count || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex-1 px-4 py-3 rounded-xl bg-white border border-loops-border flex items-center justify-between">
                                                                <span className="text-[10px] font-bold text-loops-muted uppercase">Applied</span>
                                                                <span className="text-xs font-black text-loops-main">{new Date(app.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Bar */}
                                                    <div className="flex gap-4 pt-2">
                                                        <Button
                                                            onClick={() => approveWithNotifications(app)}
                                                            disabled={processingId === app.id}
                                                            className="flex-2 h-14 bg-loops-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-loops-primary/20"
                                                        >
                                                            {processingId === app.id ? 'Granting Access...' : 'Approve & Notify ♾️'}
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleApplicationAction(app, 'rejected')}
                                                            disabled={processingId === app.id}
                                                            variant="outline"
                                                            className="flex-1 h-14 border-loops-border text-red-500 hover:bg-red-50 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>

                                                    {/* Abstract Texture */}
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-loops-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-loops-primary/10 transition-all" />
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )
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
                );
    };

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
                </div>
                );
}

                function StatCard({icon: Icon, label, value, color, onClick }: {icon: any, label: string, value: any, color: string, onClick?: () => void }) {
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
                    <div className="text-4xl font-black font-display text-loops-main group-hover:text-loops-primary transition-colors tracking-tight italic">
                        {value}
                    </div>
                </div>
                );
}

                function StatTile({label, value, icon: Icon }: {label: string, value: any, icon: any }) {
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
