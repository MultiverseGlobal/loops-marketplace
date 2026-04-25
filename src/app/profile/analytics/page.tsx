'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/layout/navbar';
import { 
    TrendingUp, Users, ShoppingBag, MessageCircle, 
    ArrowUpRight, ArrowDownRight, DollarSign, 
    Zap, Target, BarChart3, Clock, ChevronRight, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CURRENCY = '₦';

export default function AnalyticsPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch Listings and their stats
            const { data: listings } = await supabase
                .from('listings')
                .select('id, title, price, status, views, created_at')
                .eq('seller_id', user.id);

            // 2. Fetch Transactions
            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .eq('seller_id', user.id);

            // 3. Fetch Message counts (Interest)
            const { data: messages } = await supabase
                .from('messages')
                .select('id, created_at')
                .eq('receiver_id', user.id);

            // Process Data
            const totalRevenue = transactions?.reduce((acc: number, curr: any) => 
                curr.status === 'completed' ? acc + Number(curr.amount) : acc, 0) || 0;
            
            const pendingRevenue = transactions?.reduce((acc: number, curr: any) => 
                curr.status === 'pending' ? acc + Number(curr.amount) : acc, 0) || 0;

            const totalViews = listings?.reduce((acc: number, curr: any) => acc + (curr.views || 0), 0) || 0;
            const activeListings = listings?.filter(l => l.status === 'active').length || 0;
            const soldListings = listings?.filter(l => l.status === 'sold').length || 0;

            // Mocking some "Growth" percentages for the UI feel
            setStats({
                totalRevenue,
                pendingRevenue,
                totalViews,
                activeListings,
                soldListings,
                interestCount: messages?.length || 0,
                conversionRate: totalViews > 0 ? ((soldListings / totalViews) * 100).toFixed(1) : 0,
                growth: {
                    revenue: 12.5,
                    views: 8.2,
                    interest: 15.1
                }
            });

            setRecentActivity(transactions?.slice(0, 5) || []);
            setLoading(false);
        };

        fetchAnalytics();
    }, [supabase]);

    if (loading) return <div className="min-h-screen bg-loops-bg flex items-center justify-center"><Zap className="w-8 h-8 text-loops-primary animate-pulse" /></div>;

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main pb-20">
            <Navbar />
            
            <main className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-loops-primary/10 text-loops-primary text-[10px] font-black uppercase tracking-[0.2em] border border-loops-primary/20">
                            <BarChart3 className="w-3 h-3" />
                            Plug Performance Hub
                        </div>
                        <h1 className="font-display text-4xl sm:text-5xl font-black italic tracking-tighter">
                            Advanced <span className="text-loops-primary">Analytics.</span>
                        </h1>
                        <p className="text-loops-muted text-sm max-w-md">Tracking your growth in the Founding Month of Loops.</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <Button variant="outline" className="h-12 px-6 rounded-2xl border-white/10 bg-white/5 font-bold uppercase tracking-widest text-[10px]">
                            Export Data
                        </Button>
                        <Button className="h-12 px-6 rounded-2xl bg-loops-primary text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-loops-primary/20">
                            Boost Listing
                        </Button>
                    </div>
                </div>

                {/* Top Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard 
                        title="Total Revenue" 
                        value={`${CURRENCY}${stats.totalRevenue.toLocaleString()}`} 
                        icon={<DollarSign className="w-5 h-5" />}
                        trend={stats.growth.revenue}
                        subtitle={`+ ${CURRENCY}${stats.pendingRevenue.toLocaleString()} pending`}
                    />
                    <StatCard 
                        title="Campus Views" 
                        value={stats.totalViews.toLocaleString()} 
                        icon={<Users className="w-5 h-5" />}
                        trend={stats.growth.views}
                        subtitle="Unique student views"
                    />
                    <StatCard 
                        title="Loop Interest" 
                        value={stats.interestCount} 
                        icon={<MessageCircle className="w-5 h-5" />}
                        trend={stats.growth.interest}
                        subtitle="New inquiries this week"
                    />
                    <StatCard 
                        title="Conv. Rate" 
                        value={`${stats.conversionRate}%`} 
                        icon={<Target className="w-5 h-5" />}
                        trend={2.4}
                        subtitle="Views to sales ratio"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart Placeholder */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-8 rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl relative overflow-hidden h-[400px]">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                                <TrendingUp className="w-64 h-64" />
                            </div>
                            
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-display font-black text-xl italic tracking-tight">Revenue Flow</h3>
                                <div className="flex gap-2">
                                    {['7D', '14D', '30D'].map(period => (
                                        <button key={period} className={cn(
                                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                            period === '30D' ? "bg-loops-primary text-white" : "text-loops-muted hover:bg-white/50"
                                        )}>
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Simple CSS Chart Bars */}
                            <div className="flex items-end justify-between h-48 gap-2 mt-12">
                                {[40, 65, 45, 90, 55, 75, 100, 60, 85, 45, 70, 95].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="w-full relative">
                                            <motion.div 
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%` }}
                                                transition={{ delay: i * 0.05, duration: 0.8, ease: "circOut" }}
                                                className="w-full bg-gradient-to-t from-loops-primary/20 to-loops-primary rounded-t-lg group-hover:to-loops-energetic transition-colors"
                                            />
                                        </div>
                                        <span className="text-[8px] font-bold text-loops-muted opacity-0 group-hover:opacity-100 transition-opacity">Day {i+1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Inventory Pulse */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-[2rem] bg-loops-primary/5 border border-loops-primary/10 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-loops-muted">Inventory Health</p>
                                    <p className="text-2xl font-black italic">{stats.activeListings} <span className="text-sm font-bold text-loops-muted not-italic">Active Items</span></p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-loops-primary/10 flex items-center justify-center text-loops-primary">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-loops-energetic/5 border border-loops-energetic/10 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-loops-muted">Sales Velocity</p>
                                    <p className="text-2xl font-black italic">{stats.soldListings} <span className="text-sm font-bold text-loops-muted not-italic">Items Sold</span></p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-loops-energetic/10 flex items-center justify-center text-loops-energetic">
                                    <Zap className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Activity & Insights */}
                    <div className="space-y-8">
                        <div className="p-8 rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl">
                            <h3 className="font-display font-black text-xl italic tracking-tight mb-6">Recent Loops</h3>
                            <div className="space-y-6">
                                {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                                    <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                        <div className="w-10 h-10 rounded-xl bg-loops-subtle flex items-center justify-center text-loops-primary border border-white/50 group-hover:border-loops-primary/30 transition-all">
                                            <ShoppingBag className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-loops-main truncate">Sale Confirmation</p>
                                            <p className="text-[10px] text-loops-muted">{new Date(activity.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-loops-primary">+{CURRENCY}{activity.amount}</p>
                                            <p className="text-[8px] font-bold uppercase tracking-widest text-loops-muted opacity-60">{activity.status}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10">
                                        <p className="text-xs text-loops-muted italic">No recent loops yet. Keep pushing!</p>
                                    </div>
                                )}
                            </div>
                            <Button variant="ghost" className="w-full mt-8 h-12 text-[10px] font-black uppercase tracking-widest text-loops-primary hover:bg-loops-primary/5">
                                View All Transactions <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                        </div>

                        {/* AI Insights Card */}
                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-loops-primary to-loops-energetic text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-500">
                                <Sparkles className="w-12 h-12" />
                            </div>
                            <h3 className="font-display font-black text-xl italic tracking-tight mb-4">Growth Insight</h3>
                            <p className="text-sm font-medium leading-relaxed opacity-90">
                                "Items with <span className="font-black">clear pricing</span> and <span className="font-black">multiple photos</span> are getting 45% more campus interest this week."
                            </p>
                            <div className="mt-6 pt-6 border-t border-white/20 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 opacity-60" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Updated 2h ago</span>
                                </div>
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, trend, subtitle }: any) {
    const isPositive = trend > 0;
    return (
        <div className="p-6 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl group hover:scale-[1.02] transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-loops-primary/10 flex items-center justify-center text-loops-primary group-hover:bg-loops-primary group-hover:text-white transition-all">
                    {icon}
                </div>
                <div className={cn(
                    "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg",
                    isPositive ? "text-loops-success bg-loops-success/10" : "text-red-500 bg-red-500/10"
                )}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(trend)}%
                </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-loops-muted mb-1">{title}</p>
            <h4 className="text-3xl font-black italic tracking-tighter mb-2">{value}</h4>
            <p className="text-[10px] font-bold text-loops-muted opacity-60">{subtitle}</p>
        </div>
    );
}
