'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserCircle, LogOut, MessageSquare, Sparkles, LogOut as SignOut, LayoutDashboard, Smartphone, Download, ShoppingCart, Heart, Bell, Home, Search, PlusSquare, Package, X } from "lucide-react";
import { InfinityLogo } from "@/components/ui/infinity-logo";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCampus } from "@/context/campus-context";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import { CartDrawer } from "./cart-drawer";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/context/notification-context";
import { NotificationDrawer } from "./notification-drawer";
import { SearchBar } from "../ui/search-bar";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { ActivityBuzz } from "../ui/activity-buzz";
import { VerificationBanner } from "../ui/verification-banner";

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link href={href} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-loops-muted hover:text-loops-primary hover:bg-loops-primary/5 transition-all tracking-[0.15em] uppercase">
            {children}
        </Link>
    );
}

import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const supabase = createClient();
    const router = useRouter();
    const { campus, getTerm } = useCampus();
    const toast = useToast();
    const { unreadCount, unreadMessagesCount, pendingLoopsCount } = useNotifications();
    const [showAppBanner, setShowAppBanner] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem('loops_app_banner_dismissed');
        const isMobile = window.innerWidth < 768;
        if (isMobile && !dismissed) {
            setShowAppBanner(true);
        }
    }, []);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                // Fetch Profile
                const { data } = await supabase
                    .from('profiles')
                    .select('avatar_url, full_name, is_admin, is_verified')
                    .eq('id', user.id)
                    .single();
                setProfile(data);
            }
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session?.user) {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const triggerPWAInstall = () => {
        window.dispatchEvent(new CustomEvent('show-pwa-install'));
    };

    const { cartItems, wishlistCount } = useCart();
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="fixed top-0 inset-x-0 z-50 flex flex-col">
            {/* 1. Global Utility Banners Stack */}
            <div className="flex flex-col">
                {user && profile && !profile.is_verified && (
                    <VerificationBanner email={user.email} isVerified={profile.is_verified} />
                )}
                <ActivityBuzz />
            </div>

            {/* 2. Main Desktop Navbar */}
            <nav className="hidden md:block bg-white/80 backdrop-blur-2xl border-b border-loops-border">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
                    {/* Logo & Campus Section */}
                    <Link href="/welcome" className="flex items-center gap-4 group shrink-0">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-loops-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <motion.div 
                                whileHover={{ rotate: 12, scale: 1.1 }}
                                className="relative w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-loops-border overflow-hidden z-10"
                            >
                                <InfinityLogo className="w-10 h-10" />
                            </motion.div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display text-2xl font-black tracking-tighter text-loops-main leading-none">
                                Loops
                            </span>
                            {campus && (
                                <div className="flex items-center gap-1.5 mt-0.5 ml-0.5">
                                    <div className="w-1 h-1 rounded-full bg-loops-primary" />
                                    <span className="text-[10px] font-bold text-loops-muted uppercase tracking-widest">{campus.name}</span>
                                </div>
                            )}
                        </div>
                    </Link>

                    {/* Amazon-style Search Bar (Center) */}
                    <div className="flex-1 max-w-2xl">
                        <SearchBar 
                            onSearch={(q) => q && router.push(`/browse?q=${q}`)} 
                            placeholder={`Search items in ${campus?.name || 'the Loop'}...`}
                            className="h-11"
                        />
                    </div>

                    {/* Actions Section */}
                    <div className="flex items-center gap-3 shrink-0">
                        {user ? (
                            <>
                                <Link href="/listings/create">
                                    <Button className="bg-loops-primary text-white hover:bg-loops-primary/90 h-11 px-6 flex items-center gap-2 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-loops-primary/10 transition-all active:scale-95">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Post a Drop
                                    </Button>
                                </Link>

                                <div className="w-px h-6 bg-loops-border mx-1" />

                                {profile?.is_admin && (
                                    <Link href="/admin">
                                        <Button variant="ghost" className="h-11 px-4 rounded-xl bg-loops-accent/5 border border-loops-accent/10 text-loops-accent hover:bg-loops-accent/10 transition-all">
                                            <LayoutDashboard className="w-4 h-4 mr-2" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Command</span>
                                        </Button>
                                    </Link>
                                )}

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsNotificationsOpen(true)}
                                        className="w-11 h-11 rounded-2xl text-loops-main bg-loops-subtle hover:bg-loops-border transition-all relative"
                                    >
                                        <Bell className={cn("w-5 h-5", unreadCount > 0 && "text-loops-primary animate-pulse")} />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-loops-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white px-1">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsCartOpen(true)}
                                        className="w-11 h-11 rounded-2xl text-loops-main bg-loops-subtle hover:bg-loops-border transition-all relative"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-loops-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Button>

                                    <Link href="/profile" className="flex items-center gap-3 p-1 rounded-2xl bg-loops-subtle border border-loops-border hover:border-loops-primary/20 transition-all group">
                                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-loops-primary text-sm font-bold border border-loops-border shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                (profile?.full_name || user.email || 'U').charAt(0).toUpperCase()
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" className="h-11 px-6 rounded-2xl text-xs font-bold text-loops-muted">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/login?view=signup">
                                    <Button className="bg-loops-primary text-white hover:bg-loops-primary/90 h-11 px-6 rounded-2xl text-[10px] font-bold uppercase tracking-[0.15em] shadow-lg shadow-loops-primary/20">
                                        Join Loop
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop Category Bar */}
                <div className="bg-loops-subtle/30 border-t border-loops-border">
                    <div className="max-w-7xl mx-auto px-6 h-11 flex items-center gap-6 overflow-x-auto no-scrollbar">
                        <Link href="/browse" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-loops-main whitespace-nowrap hover:text-loops-primary">
                            <Package className="w-4 h-4" />
                            All Departments
                        </Link>
                        <div className="w-px h-4 bg-loops-border" />
                        {PRODUCT_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                            <Link 
                                key={cat.id} 
                                href={`/browse?category=${cat.id}`}
                                className="text-[10px] font-bold uppercase tracking-widest text-loops-muted whitespace-nowrap hover:text-loops-primary transition-colors"
                            >
                                {cat.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Mobile Header */}
            <nav className={cn(
                "md:hidden w-full z-50 border-b border-loops-border bg-white/80 backdrop-blur-xl transition-all duration-500",
                showAppBanner ? "pt-12" : "pt-0"
            )}>
                {showAppBanner && (
                    <div className="absolute top-0 w-full h-12 bg-loops-primary text-white flex items-center justify-between px-6">
                        <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Get the App</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={triggerPWAInstall} className="text-[9px] font-black uppercase tracking-widest bg-white text-loops-primary px-3 py-1 rounded-full">Install</button>
                            <button onClick={() => setShowAppBanner(false)}><X className="w-4 h-4 opacity-50" /></button>
                        </div>
                    </div>
                )}
                <div className="px-6 h-14 flex items-center justify-between">
                    <Link href="/welcome" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-loops-border shadow-sm">
                            <InfinityLogo className="w-6 h-6" />
                        </div>
                        <span className="font-display text-lg font-bold tracking-tighter text-loops-main">Loops</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        {user && (
                            <button onClick={() => setIsNotificationsOpen(true)} className="relative p-2">
                                <Bell className={cn("w-5 h-5", unreadCount > 0 && "text-loops-primary")} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 min-w-[16px] h-4 bg-loops-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(true)} className="w-10 h-10 relative">
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-loops-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">{cartCount}</span>
                            )}
                        </Button>
                    </div>
                </div>
            </nav>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        </header>
    );
}
