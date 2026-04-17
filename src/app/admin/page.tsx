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
    referral_code?: string | null;
    is_founding_member?: boolean;
}

interface DashboardViewProps {
    stats: any;
    analytics: any;
    allUsers: any[];
    applications: any[];
    setCurrentView: (view: AdminView) => void;
    setMarketplaceFilter: (filter: 'all' | 'product' | 'service') => void;
    setUserTab: (tab: 'requests' | 'directory') => void;
    setDirectoryFilter: (filter: 'all' | 'plug' | 'admin' | 'student' | 'founding') => void;
}

interface UniversityViewProps {
    campuses: any[];
    campusRequests: any[];
    handleLaunchNode: (req: any) => void;
    processingId: string | null;
}

interface SafetyViewProps {
    reports: any[];
}

interface DisputesViewProps {
    disputes: any[];
    processingId: string | null;
    handleResolveDispute: (id: string, decision: 'REFUND' | 'RELEASE', notes: string) => void;
}

interface MarketplaceViewProps {
    allListings: any[];
    marketplaceSearch: string;
    setMarketplaceSearch: (s: string) => void;
    marketplaceFilter: 'all' | 'product' | 'service';
    setMarketplaceFilter: (f: 'all' | 'product' | 'service') => void;
    supabase: any;
    setAllListings: (fn: (prev: any[]) => any[]) => void;
    toast: any;
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
        pendingApps: 0,
        readyPlugs: 0
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
    const [disputes, setDisputes] = useState<any[]>([]);

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
    const [applicationSubTab, setApplicationSubTab] = useState<'product' | 'service' | 'review' | 'approved'>('product');
    const [directoryFilter, setDirectoryFilter] = useState<'all' | 'plug' | 'admin' | 'student' | 'founding'>('all');

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

    const handleLaunchNode = async (req: any) => {
        setProcessingId(req.id);
        try {
            // 1. Create the new campus
            const { error: campusError } = await supabase
                .from('campuses')
                .insert({
                    name: req.university_name,
                    domain: req.school_email.split('@')[1],
                    is_active: true,
                    type: 'Standard',
                    location: 'Campus Hub'
                });

            if (campusError) throw campusError;

            // 2. Update request status
            await supabase
                .from('campus_requests')
                .update({ status: 'approved' })
                .eq('id', req.id);

            // 3. Notify the requester
            await supabase.from('notifications').insert({
                user_id: req.user_id,
                title: "Node Launched! 🚀",
                message: `Congratulations! Your request for ${req.university_name} has been bridged. The Loop is now live on your campus.`,
                type: 'system',
                link: '/browse'
            });

            setCampusRequests(prev => prev.filter(r => r.id !== req.id));
            setCampuses(prev => [...prev, { name: req.university_name, is_active: true, type: 'Standard' }]);
            toast.success(`${req.university_name} has been bridged to the Loop! 🚀`);
        } catch (err: any) {
            toast.error(`Launch failed: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const executeBroadcast = async () => {
        if (selectedApps.length === 0 && selectedUsers.length === 0) return;
        setProcessingId('broadcast');

        try {
            // Prepare recipients (combine both lists if selected)
            let recipients: any[] = [];

            if (selectedApps.length > 0) {
                const appRecipients = applications
                    .filter(a => selectedApps.includes(a.id))
                    .map(a => ({ id: a.id, whatsapp_number: a.whatsapp_number, full_name: a.full_name, type: 'Applicant' }));
                recipients = [...recipients, ...appRecipients];
            }

            if (selectedUsers.length > 0) {
                const userRecipients = allUsers
                    .filter(u => selectedUsers.includes(u.id))
                    .map(u => ({ id: u.id, whatsapp_number: u.whatsapp_number || u.email, full_name: u.full_name, type: 'User' }));
                recipients = [...recipients, ...userRecipients];
            }


            // Deduplicate recipients by a unique key (email or combination of ID/Type)
            // Using a Map to keep the first occurrence of each unique ID
            const uniqueRecipients = Array.from(
                recipients.reduce((map, r) => {
                    const key = r.id; // Using ID as the unique key
                    if (!map.has(key)) map.set(key, r);
                    return map;
                }, new Map()).values()
            );

            const res = await fetch('/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients: uniqueRecipients,
                    message: broadcastMessage
                })
            });

            if (!res.ok) throw new Error('Broadcast failed');

            // --- Notification Blast Integration ---
            const notificationEntries = uniqueRecipients
                .filter(r => r.id && (r.type === 'Plug' || r.type === 'User')) // Notify all registered types
                .map(r => ({
                    user_id: r.id,
                    title: broadcastMessage.toLowerCase().includes('launch') ? "Veritas Grand Launch 🚀" : "Admin Announcement 📣",
                    message: broadcastMessage,
                    type: 'system',
                    link: '/browse'
                }));

            if (notificationEntries.length > 0) {
                // Batch insert into notifications
                await supabase.from('notifications').insert(notificationEntries);
            }
            // --------------------------------------

            toast.success(`Broadcast sent to ${recipients.length} recipients! 📣`);
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
    const handleGoldenTicketBroadcast = async () => {
        const targetingApps = applications.filter(a => 
            a.status === 'pending' || 
            (a.status === 'approved' && !allUsers.some(u => u.id === a.user_id))
        );
        if (targetingApps.length === 0) {
            toast.error("No eligible recipients found.");
            return;
        }

        if (!confirm(`Are you sure you want to send the Golden Ticket to all ${targetingApps.length} eligible vendors?`)) return;

        setProcessingId('broadcast');
        try {
            const messageTemplate = "👑 *GOLDEN TICKET ACTIVATED!* \n\nHello {name}, your waitlist spot is ready. Use the link below and code *PLUG37* to launch your store instantly and claim your Founding Badge. \n\n🔗 https://loops-marketplace.com/founding-plugs \n\n♾️ LOOPS PLATFORMS";
            
            const recipients = targetingApps.map(a => ({
                id: a.id,
                whatsapp_number: a.whatsapp_number,
                full_name: a.full_name
            }));

            const res = await fetch('/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients,
                    message: messageTemplate
                })
            });

            if (!res.ok) throw new Error('Broadcast failed');

            // Also send system notifications if they have user_ids
            const notificationEntries = pendingApps
                .filter(a => a.user_id)
                .map(a => ({
                    user_id: a.user_id,
                    title: "👑 Golden Ticket Activated!",
                    message: "Your waitlist spot is ready! Use code PLUG37 to join as a Founding Plug.",
                    type: 'system',
                    link: '/founding-plugs'
                }));

            if (notificationEntries.length > 0) {
                await supabase.from('notifications').insert(notificationEntries);
            }

            toast.success(`Golden Ticket sent to ${targetingApps.length} vendors! 🚀`);
        } catch (err: any) {
            toast.error(err.message);
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
                    supabase.from('reports').select('*', { count: 'exact', head: true }),
                    supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open')
                ]);

                // 2. Applications (Fetch both pending and approved for history)
                const { data: allApplications } = await supabase
                    .from('seller_applications')
                    .select('*')
                    .in('status', ['pending', 'approved'])
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

                // 7. Disputes
                const { data: disputesData } = await supabase
                    .from('disputes')
                    .select('*, transactions(*, profiles!transactions_buyer_id_fkey(full_name, email), sellers:profiles!transactions_seller_id_fkey(full_name, email))')
                    .order('created_at', { ascending: false });

                // 8. All Users for Directory
                const { data: usersData } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(1000);
                setStats({
                    totalUsers: users.count || 0,
                    totalPlugs: activePlugs.count || 0,
                    foundingPlugs: foundingCount.count || 0,
                    products: products.count || 0,
                    services: servicesCount.count || 0,
                    reports: reportsCount.count || 0,
                    pendingApps: allApplications?.filter(a => 
                        a.status === 'pending' || 
                        (a.status === 'approved' && !usersData?.some(u => u.id === a.user_id))
                    ).length || 0,
                    readyPlugs: usersData?.filter(u => {
                        const has3Listings = (listingsData?.filter(l => l.seller_id === u.id).length || 0) >= 3;
                        return u.is_plug && has3Listings;
                    }).length || 0
                });
                setApplications(allApplications || []);
                setAnalytics(analyticsData);
                setCampuses(campusesData.data || []);
                setCampusRequests(requestsData.data || []);
                setReports(reportsData || []);
                setDisputes(disputesData || []);
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

                // --- Plug Approval Notification ---
                await supabase.from('notifications').insert({
                    user_id: app.user_id,
                    title: "Status Update: Approved! 👑",
                    message: `Welcome to the elite Founding ${stats.foundingPlugs + 1}. Your store "${app.store_name}" is now live!`,
                    type: 'referral',
                    link: '/profile'
                });
                // ----------------------------------

                toast.success("Plug Approved! 🔌");
            }

            setApplications((prev: any[]) => prev.map(a => a.id === app.id ? { ...a, status: action } : a));
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

    const handleBoostListing = async (listingId: string, durationDays: number) => {
        setProcessingId(listingId);
        try {
            const boostedUntil = new Date();
            boostedUntil.setDate(boostedUntil.getDate() + durationDays);

            const { error } = await supabase
                .from('listings')
                .update({ boosted_until: durationDays === 0 ? null : boostedUntil.toISOString() })
                .eq('id', listingId);

            if (error) throw error;

            setAllListings(prev => prev.map(l => 
                l.id === listingId ? { ...l, boosted_until: durationDays === 0 ? null : boostedUntil.toISOString() } : l
            ));
            toast.success(durationDays === 0 ? "Boost removed" : `Listing boosted for ${durationDays} days! 💎`);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const toggleFoundingMember = async (userId: string, currentStatus: boolean) => {
        setProcessingId(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_founding_member: !currentStatus })
                .eq('id', userId);

            if (error) throw error;

            setAllUsers(prev => prev.map(u => 
                u.id === userId ? { ...u, is_founding_member: !currentStatus } : u
            ));
            toast.success(`Founding status ${!currentStatus ? 'activated' : 'deactivated'}`);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleResolveDispute = async (disputeId: string, decision: 'REFUND' | 'RELEASE', notes: string) => {
        setProcessingId(disputeId);
        try {
            const res = await fetch('/api/admin/disputes/resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ disputeId, decision, adminNotes: notes })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Resolution failed');
            }

            toast.success(`Dispute resolved: ${decision}`);
            // Force refresh data
            const { data: updatedDisputes } = await supabase
                .from('disputes')
                .select('*, transactions(*, profiles!transactions_buyer_id_fkey(full_name, email), sellers:profiles!transactions_seller_id_fkey(full_name, email))')
                .order('created_at', { ascending: false });
            setDisputes(updatedDisputes || []);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setProcessingId(null);
        }
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
                        {currentView === 'dashboard' && (
                            <DashboardView
                                stats={stats}
                                analytics={analytics}
                                allUsers={allUsers}
                                applications={applications}
                                setCurrentView={setCurrentView}
                                setMarketplaceFilter={setMarketplaceFilter}
                                setUserTab={setUserTab}
                                setDirectoryFilter={setDirectoryFilter}
                            />
                        )}
                        {currentView === 'users' && (
                            <UserView
                                applications={applications}
                                applicationSubTab={applicationSubTab}
                                setApplicationSubTab={setApplicationSubTab}
                                stats={stats}
                                allUsers={allUsers}
                                userSearch={userSearch}
                                setUserSearch={setUserSearch}
                                userTab={userTab}
                                setUserTab={setUserTab}
                                directoryFilter={directoryFilter}
                                setDirectoryFilter={setDirectoryFilter}
                                selectedUsers={selectedUsers}
                                setSelectedUsers={setSelectedUsers}
                                selectedApps={selectedApps}
                                setSelectedApps={setSelectedApps}
                                setShowBroadcastModal={setShowBroadcastModal}
                                setBroadcastMessage={setBroadcastMessage}
                                groupApplications={groupApplications}
                                approveWithNotifications={approveWithNotifications}
                                toggleAppSelection={toggleAppSelection}
                                toggleUserSelection={toggleUserSelection}
                                togglePlugStatus={togglePlugStatus}
                                processingId={processingId}
                                handleGoldenTicketBroadcast={handleGoldenTicketBroadcast}
                            />
                        )}
                        {currentView === 'universities' && (
                            <UniversityView
                                campuses={campuses}
                                campusRequests={campusRequests}
                                handleLaunchNode={handleLaunchNode}
                                processingId={processingId}
                            />
                        )}
                        {currentView === 'safety' && <SafetyView reports={reports} />}
                        {currentView === 'disputes' && (
                            <DisputesView
                                disputes={disputes}
                                processingId={processingId}
                                handleResolveDispute={handleResolveDispute}
                            />
                        )}
                        {currentView === 'marketplace' && (
                            <MarketplaceView
                                allListings={allListings}
                                marketplaceSearch={marketplaceSearch}
                                setMarketplaceSearch={setMarketplaceSearch}
                                marketplaceFilter={marketplaceFilter}
                                setMarketplaceFilter={setMarketplaceFilter}
                                supabase={supabase}
                                setAllListings={setAllListings}
                                toast={toast}
                            />
                        )}
                        {currentView === 'monetization' && (
                            <MonetizationView 
                                allListings={allListings}
                                allUsers={allUsers}
                                handleBoostListing={handleBoostListing}
                                toggleFoundingMember={toggleFoundingMember}
                                processingId={processingId}
                            />
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
                                <p className="text-sm text-loops-muted font-medium mt-1">Targeting {selectedApps.length + selectedUsers.length} Recipients.</p>
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

interface UserViewProps {
    applications: any[];
    applicationSubTab: 'product' | 'service' | 'review' | 'approved';
    setApplicationSubTab: (tab: 'product' | 'service' | 'review' | 'approved') => void;
    stats: any;
    allUsers: AdminProfile[];
    userSearch: string;
    setUserSearch: (s: string) => void;
    userTab: 'requests' | 'directory';
    setUserTab: (t: 'requests' | 'directory') => void;
    directoryFilter: 'all' | 'plug' | 'admin' | 'student' | 'founding';
    setDirectoryFilter: (f: 'all' | 'plug' | 'admin' | 'student' | 'founding') => void;
    selectedUsers: string[];
    setSelectedUsers: (ids: string[]) => void;
    selectedApps: string[];
    setSelectedApps: (ids: string[]) => void;
    setShowBroadcastModal: (b: boolean) => void;
    setBroadcastMessage: (s: string) => void;
    groupApplications: (apps: any[]) => any;
    approveWithNotifications: (app: any) => void;
    toggleAppSelection: (id: string) => void;
    toggleUserSelection: (id: string) => void;
    togglePlugStatus: (userId: string, currentStatus: boolean) => void;
    processingId: string | null;
    handleGoldenTicketBroadcast: () => void;
}

const UserView = ({
    applications,
    applicationSubTab,
    setApplicationSubTab,
    stats,
    allUsers,
    userSearch,
    setUserSearch,
    userTab,
    setUserTab,
    directoryFilter,
    setDirectoryFilter,
    selectedUsers,
    setSelectedUsers,
    selectedApps,
    setSelectedApps,
    setShowBroadcastModal,
    setBroadcastMessage,
    groupApplications,
    approveWithNotifications,
    toggleAppSelection,
    toggleUserSelection,
    togglePlugStatus,
    processingId,
    handleGoldenTicketBroadcast
}: UserViewProps) => {
    // Filter applications based on tab
    const tabFilteredApps = applications.filter(a => {
        if (applicationSubTab === 'approved') {
            return a.status === 'approved';
        }
        // For other tabs, only show pending
        if (a.status !== 'pending') return false;

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
            (directoryFilter === 'founding' && (u as any).is_founding_member) ||
            (directoryFilter === 'student' && !u.is_plug && !u.is_admin);
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-8">
            {/* View Switcher */}
            <div className="flex gap-4 border-b border-loops-border pb-6 justify-between items-center">
                <div className="flex gap-4">
                    <button
                        onClick={() => setUserTab('requests')}
                        className={cn(
                            "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all",
                            userTab === 'requests' ? "bg-loops-primary text-white shadow-xl shadow-loops-primary/20" : "text-loops-muted hover:text-loops-main"
                        )}
                    >
                        Join Requests ({stats.pendingApps})
                    </button>
                    <button
                        onClick={() => setUserTab('directory')}
                        className={cn(
                            "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all",
                            userTab === 'directory' ? "bg-loops-primary text-white shadow-xl shadow-loops-primary/20" : "text-loops-muted hover:text-loops-main"
                        )}
                    >
                        Student Directory ({allUsers.length})
                    </button>
                </div>

                <Button
                    onClick={() => {
                        // Select ALL visible users (Students + Plugs)
                        const allVisibleIds = allUsers.map(u => u.id);
                        setSelectedUsers(allVisibleIds);

                        // Select ALL Pending Applicants
                        const allPendingIds = applications.map(a => a.id);
                        setSelectedApps(allPendingIds);

                        setShowBroadcastModal(true);
                        setBroadcastMessage("");
                    }}
                    className="bg-black text-white font-black uppercase tracking-widest text-[10px] px-6 h-10 rounded-xl hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2"
                >
                    <MessageCircle className="w-4 h-4" />
                    Broadcast to All ({new Set([
                        ...allUsers.map(u => u.id), 
                        ...applications.map(a => a.user_id || a.id)
                    ]).size})
                </Button>

                <Button
                    onClick={handleGoldenTicketBroadcast}
                    disabled={processingId === 'broadcast' || stats.pendingApps === 0}
                    className="bg-loops-primary text-white font-black uppercase tracking-widest text-[10px] px-6 h-10 rounded-xl hover:bg-loops-primary/90 transition-all shadow-lg shadow-loops-primary/20 flex items-center gap-2"
                >
                    <Award className="w-4 h-4" />
                    Invite All ({stats.pendingApps})
                </Button>
            </div>

            {userTab === 'requests' ? (
                /* Applications View */
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Sub-tabs for Applications */}
                    <div className="flex gap-2 p-1.5 bg-loops-subtle rounded-2xl border border-loops-border w-fit">
                        {(['product', 'service', 'review', 'approved'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setApplicationSubTab(tab)}
                                className={cn(
                                    "px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                    applicationSubTab === tab ? "bg-white text-loops-primary shadow-sm" : "text-loops-muted hover:text-loops-main"
                                )}
                            >
                                {tab === 'approved' ? 'Approval History 👑' : tab === 'review' ? 'Manual Review' : `${tab}s`}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-12">
                        {Object.entries(groups).map(([name, groupApps]) => (groupApps as any[]).length > 0 && (
                            <div key={name} className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-loops-muted ml-2 flex items-center gap-4">
                                    {name}
                                    <div className="h-px flex-1 bg-loops-border" />
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(groupApps as any[]).map((app: any) => (
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
                                                    <div className="flex flex-col">
                                                        <p className="text-xs font-bold text-loops-muted">{app.full_name}</p>
                                                        {app.referred_by_code && (
                                                            <p className="text-[10px] font-bold text-loops-primary mt-1">
                                                                Ref: <span className="font-mono">{app.referred_by_code}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-loops-primary/60 uppercase tracking-widest bg-loops-primary/5 px-3 py-1.5 rounded-full w-fit border border-loops-primary/10">
                                                        <School className="w-3 h-3" />
                                                        {app.university}
                                                    </div>
                                                    <a
                                                        href={`https://wa.me/${app.whatsapp_number?.replace(/\+/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex items-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1.5 rounded-full w-fit border border-green-100 hover:bg-green-100 transition-colors"
                                                    >
                                                        <MessageCircle className="w-3 h-3" />
                                                        Chat
                                                    </a>
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
                                                    {(user as any).is_founding_member && <span className="px-3 py-1 bg-loops-primary/20 text-loops-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-loops-primary shadow-[0_0_10px_rgba(16,185,129,0.3)]">Founding Plug</span>}
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

const DashboardView = ({
    stats,
    analytics,
    allUsers,
    applications,
    setCurrentView,
    setMarketplaceFilter,
    setUserTab,
    setDirectoryFilter
}: DashboardViewProps) => (
    <div className="space-y-12">
        {/* Grand Launch Pad */}
        <div className="bg-loops-main rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/10 group">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="space-y-4 max-w-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-loops-primary rounded-2xl flex items-center justify-center text-loops-main shadow-lg shadow-loops-primary/20 group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6 fill-current" />
                        </div>
                        <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Critical Mission</span>
                    </div>
                    <h2 className="text-4xl font-black italic tracking-tighter leading-tight">Empire Launch Readiness</h2>
                    <p className="text-white/60 font-medium text-base">We need 50 Vendors with at least 3 active listings to trigger the Veritas Grand Launch. Currently monitoring node health and inventory depth.</p>
                </div>

                <div className="flex-1 w-full max-w-md space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Launch Saturation</span>
                        <span className="text-xl font-black italic">{stats.readyPlugs}/50 <span className="text-[10px] opacity-40 not-italic uppercase tracking-widest ml-1">Ready</span></span>
                    </div>
                    <div className="h-4 w-full bg-white/5 rounded-full border border-white/10 overflow-hidden backdrop-blur-sm">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((stats.readyPlugs / 50) * 100, 100)}%` }}
                            className="h-full bg-gradient-to-r from-loops-primary to-loops-secondary shadow-[0_0_20px_rgba(var(--loops-primary-rgb),0.5)] transition-all"
                        />
                    </div>
                    <div className="flex justify-between text-[9px] font-bold text-white/30 uppercase tracking-widest">
                        <span>Initializing</span>
                        <span className="text-loops-primary">Critical Mass (50)</span>
                        <span>Expansion</span>
                    </div>
                </div>
            </div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-loops-primary/10 rounded-full blur-[100px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-loops-primary" />
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">Referral Champions</h3>
                    </div>
                    <span className="text-[10px] font-black uppercase px-3 py-1 bg-loops-primary/10 text-loops-primary rounded-full border border-loops-primary/20">Growth Leaderboard</span>
                </div>

                <div className="bg-white rounded-[2rem] border border-loops-border overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-loops-border bg-loops-subtle/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-loops-muted">Founding Plug</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-loops-muted">Code</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-loops-muted">Recruits</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-loops-muted text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-loops-border">
                            {allUsers
                                .filter(u => u.referral_code)
                                .map(u => ({
                                    ...u,
                                    referrals: applications.filter(a => a.referred_by_code === u.referral_code && a.status === 'approved').length
                                }))
                                .sort((a, b) => b.referrals - a.referrals)
                                .slice(0, 5)
                                .map((plug, idx) => (
                                    <tr key={plug.id} className="group hover:bg-loops-subtle/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-loops-subtle border border-loops-border flex items-center justify-center font-bold text-loops-main">
                                                    {plug.full_name?.[0] || 'P'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-loops-main">{plug.full_name}</div>
                                                    <div className="text-[10px] font-medium text-loops-muted">Top Growth Partner</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <code className="px-2 py-1 bg-loops-subtle rounded-md text-[10px] font-mono font-bold border border-loops-border text-loops-primary">
                                                {plug.referral_code}
                                            </code>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-black text-loops-main">{plug.referrals}</div>
                                                <div className="text-[9px] font-black uppercase tracking-widest text-loops-muted opacity-40">Approved</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {plug.referrals >= 3 ? (
                                                <span className="px-2 py-1 bg-loops-success/10 text-loops-success border border-loops-success/20 rounded-lg text-[9px] font-black uppercase tracking-widest">Legendary</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-loops-subtle text-loops-muted border border-loops-border rounded-lg text-[9px] font-black uppercase tracking-widest">Rising</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <Activity className="w-5 h-5 text-loops-primary" />
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Live Signals</h3>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-loops-border shadow-sm space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-loops-muted opacity-50">Node Health</div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-loops-success animate-pulse" />
                                <span className="text-[11px] font-bold">Campus Node</span>
                            </div>
                            <span className="text-[10px] font-black text-loops-success">98% UP</span>
                        </div>
                        <div className="h-1 w-full bg-loops-subtle rounded-full overflow-hidden">
                            <div className="h-full bg-loops-success w-[98%]" />
                        </div>
                    </div>
                </div>
            </div>
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

const UniversityView = ({
    campuses,
    campusRequests,
    handleLaunchNode,
    processingId
}: UniversityViewProps) => (
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
                        <Button
                            onClick={() => handleLaunchNode(req)}
                            disabled={processingId === req.id}
                            className="bg-loops-primary text-white font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-2xl shadow-xl shadow-loops-primary/20 hover:scale-105 transition-all"
                        >
                            {processingId === req.id ? 'Bridging Node...' : 'Launch Node 🚀'}
                        </Button>
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

const SafetyView = ({ reports }: SafetyViewProps) => (
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

const DisputesView = ({
    disputes,
    processingId,
    handleResolveDispute
}: DisputesViewProps) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Disputes Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-white border border-loops-border rounded-[2rem] shadow-sm">
                <p className="text-[10px] font-black text-loops-muted uppercase tracking-[0.2em] mb-1">Open Cases</p>
                <p className="text-4xl font-black font-display italic text-loops-primary tracking-tight">
                    {disputes.filter(d => d.status === 'open' || d.status === 'under_review').length}
                </p>
            </div>
            <div className="p-8 bg-white border border-loops-border rounded-[2rem] shadow-sm">
                <p className="text-[10px] font-black text-loops-muted uppercase tracking-[0.2em] mb-1">Resolved (Released)</p>
                <p className="text-4xl font-black font-display italic text-loops-success tracking-tight">
                    {disputes.filter(d => d.status === 'resolved_released').length}
                </p>
            </div>
            <div className="p-8 bg-white border border-loops-border rounded-[2rem] shadow-sm">
                <p className="text-[10px] font-black text-loops-muted uppercase tracking-[0.2em] mb-1">Resolved (Refunded)</p>
                <p className="text-4xl font-black font-display italic text-loops-muted tracking-tight">
                    {disputes.filter(d => d.status === 'resolved_refunded').length}
                </p>
            </div>
        </div>

        {/* Disputes List */}
        <div className="space-y-6">
            {disputes.map(dispute => (
                <div key={dispute.id} className="bg-white border border-loops-border rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Left: Metadata & Evidence */}
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="px-3 py-1 bg-loops-primary/10 text-loops-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-loops-primary/20">
                                    TX: {dispute.transactions?.id.slice(0, 8)}...
                                </div>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    dispute.status === 'open' ? "bg-amber-50 text-amber-600 border-amber-200" :
                                    dispute.status.includes('resolved') ? "bg-loops-success/10 text-loops-success border-loops-success/20" :
                                    "bg-loops-subtle text-loops-muted border-loops-border"
                                )}>
                                    {dispute.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black italic tracking-tight capitalize">{dispute.reason.replace('_', ' ')}</h3>
                                <p className="text-loops-muted text-sm font-medium leading-relaxed">{dispute.description || "No additional details provided."}</p>
                            </div>

                            {/* Participants */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-loops-subtle rounded-2xl border border-loops-border">
                                    <p className="text-[9px] font-black text-loops-muted uppercase tracking-widest mb-1">Buyer</p>
                                    <p className="text-xs font-bold text-loops-main">{dispute.transactions?.profiles?.full_name}</p>
                                    <p className="text-[10px] text-loops-muted font-medium">{dispute.transactions?.profiles?.email}</p>
                                </div>
                                <div className="p-4 bg-loops-subtle rounded-2xl border border-loops-border">
                                    <p className="text-[9px] font-black text-loops-muted uppercase tracking-widest mb-1">Seller</p>
                                    <p className="text-xs font-bold text-loops-main">{dispute.transactions?.sellers?.full_name}</p>
                                    <p className="text-[10px] text-loops-muted font-medium">{dispute.transactions?.sellers?.email}</p>
                                </div>
                            </div>

                            {/* Evidence Gallery */}
                            {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-loops-muted uppercase tracking-widest ml-1">Evidence Captured</p>
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {dispute.evidence_urls.map((url: string, i: number) => (
                                            <div key={i} className="relative w-32 h-32 rounded-2xl overflow-hidden border border-loops-border flex-shrink-0 cursor-zoom-in hover:scale-105 transition-transform">
                                                <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Resolution Control */}
                        <div className="w-full lg:w-80 space-y-6 lg:border-l lg:pl-12 border-loops-border">
                            <div className="text-center p-6 bg-loops-subtle rounded-3xl border border-loops-border space-y-2">
                                <p className="text-[10px] font-black text-loops-muted uppercase tracking-widest">In Escrow</p>
                                <p className="text-3xl font-black italic text-loops-primary tracking-tight">₦{dispute.transactions?.amount.toLocaleString()}</p>
                            </div>

                            {dispute.status === 'open' || dispute.status === 'under_review' ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-loops-muted ml-1">Admin Notes</label>
                                        <textarea 
                                            id={`notes-${dispute.id}`}
                                            placeholder="Document your findings..."
                                            className="w-full h-24 p-4 rounded-2xl bg-loops-subtle border border-loops-border outline-none focus:border-loops-primary text-sm font-medium resize-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <Button 
                                            onClick={() => {
                                                const notes = (document.getElementById(`notes-${dispute.id}`) as HTMLTextAreaElement)?.value;
                                                handleResolveDispute(dispute.id, 'RELEASE', notes);
                                            }}
                                            disabled={processingId === dispute.id}
                                            className="w-full h-12 bg-loops-success text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-loops-success/20 transition-all hover:translate-y-[-2px] active:translate-y-0"
                                        >
                                            {processingId === dispute.id ? "Syncing..." : "Release to Seller ✅"}
                                        </Button>
                                        <Button 
                                            onClick={() => {
                                                const notes = (document.getElementById(`notes-${dispute.id}`) as HTMLTextAreaElement)?.value;
                                                handleResolveDispute(dispute.id, 'REFUND', notes);
                                            }}
                                            disabled={processingId === dispute.id}
                                            variant="outline"
                                            className="w-full h-12 border-red-500 text-red-500 hover:bg-red-50 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all"
                                        >
                                            Refund Buyer 💸
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 rounded-3xl border border-dashed border-loops-border text-center space-y-3">
                                    <CheckCircle className="w-8 h-8 text-loops-success/40 mx-auto" />
                                    <div>
                                        <p className="text-[10px] font-black text-loops-muted uppercase tracking-widest">Resolved By</p>
                                        <p className="text-xs font-bold text-loops-main">Founding Node</p>
                                    </div>
                                    {dispute.admin_notes && (
                                        <p className="text-[10px] text-loops-muted italic font-medium leading-relaxed">"{dispute.admin_notes}"</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-loops-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                </div>
            ))}

            {disputes.length === 0 && (
                <div className="py-24 text-center space-y-4">
                    <div className="w-20 h-20 bg-loops-subtle rounded-full flex items-center justify-center mx-auto text-loops-muted/20">
                        <ShieldAlert className="w-10 h-10" />
                    </div>
                    <p className="text-loops-muted font-bold italic">No disputes active. The marketplace is harmonious.</p>
                </div>
            )}
        </div>
    </div>
);

const MarketplaceView = ({
    allListings,
    marketplaceSearch,
    setMarketplaceSearch,
    marketplaceFilter,
    setMarketplaceFilter,
    supabase,
    setAllListings,
    toast
}: MarketplaceViewProps) => (
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
                                        setAllListings((prev: any[]) => prev.map(l => l.id === item.id ? { ...l, boosted_until: newDate } : l));
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
                                            setAllListings((prev: any[]) => prev.filter(l => l.id !== item.id));
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
);

interface MonetizationViewProps {
    allListings: any[];
    allUsers: any[];
    handleBoostListing: (listingId: string, durationDays: number) => void;
    toggleFoundingMember: (userId: string, currentStatus: boolean) => void;
    processingId: string | null;
}

const MonetizationView = ({
    allListings,
    allUsers,
    handleBoostListing,
    toggleFoundingMember,
    processingId
}: MonetizationViewProps) => (
    <div className="space-y-12">
        {/* Founders Board */}
        <div className="bg-loops-main rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/10 group">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="space-y-4 max-w-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-loops-primary rounded-2xl flex items-center justify-center text-loops-main shadow-lg shadow-loops-primary/20 group-hover:scale-125 transition-transform">
                            <Award className="w-6 h-6 fill-current" />
                        </div>
                        <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Elite Membership</span>
                    </div>
                    <h2 className="text-4xl font-black italic tracking-tighter leading-tight">Founder Management</h2>
                    <p className="text-white/60 font-medium text-base">Elevate elite Plugs to Founding Member status to grant them permanent platform benefits and verification badges.</p>
                </div>
            </div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-loops-primary/20 rounded-full blur-[100px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Boost Active Center */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-loops-primary" />
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">Active Boosts</h3>
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] border border-loops-border overflow-hidden shadow-sm">
                    <div className="divide-y divide-loops-border">
                        {allListings.filter(l => l.boosted_until && new Date(l.boosted_until) > new Date()).map(listing => (
                            <div key={listing.id} className="p-6 flex items-center justify-between group hover:bg-loops-subtle/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-loops-subtle overflow-hidden">
                                        <img src={listing.images?.[0]} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-loops-main">{listing.title}</p>
                                        <p className="text-[10px] font-bold text-loops-primary uppercase tracking-widest">Expires {new Date(listing.boosted_until!).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleBoostListing(listing.id, 0)}
                                    className="text-red-500 hover:bg-red-50 font-bold text-[10px] uppercase tracking-widest"
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                        {allListings.filter(l => l.boosted_until && new Date(l.boosted_until) > new Date()).length === 0 && (
                            <div className="p-12 text-center text-loops-muted italic text-xs font-medium">No listings currently boosted.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Founding Directory */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-amber-500" />
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">Founding Members</h3>
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] border border-loops-border overflow-hidden shadow-sm">
                    <div className="divide-y divide-loops-border">
                        {allUsers.filter(u => u.is_founding_member).map(user => (
                            <div key={user.id} className="p-6 flex items-center justify-between group hover:bg-loops-subtle/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold border border-amber-500/20">
                                        {user.full_name?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-loops-main">{user.full_name}</p>
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Founding Plug</p>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => toggleFoundingMember(user.id, true)}
                                    className="text-red-500 hover:bg-red-50 font-bold text-[10px] uppercase tracking-widest"
                                >
                                    Revoke
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
