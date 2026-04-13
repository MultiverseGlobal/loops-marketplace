'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserCircle, LogOut, MessageSquare, Sparkles, LogOut as SignOut, LayoutDashboard, Smartphone, Download, ShoppingCart, Heart, Bell, Home, Search, PlusSquare, Package } from "lucide-react";
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

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link href={href} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-loops-muted hover:text-loops-primary hover:bg-loops-primary/5 transition-all tracking-[0.15em] uppercase">
            {children}
        </Link>
    );
}

export function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
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
                    .select('avatar_url, full_name, is_admin')
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
        <>
            {/* Desktop Navbar */}
            <nav className="hidden md:block fixed top-0 w-full z-50 border-b border-loops-border bg-white/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-loops-primary/20 group-hover:rotate-12 transition-transform duration-500 overflow-hidden border border-loops-border">
                                <InfinityLogo className="w-9 h-9" />
                            </div>
                            <span className="font-display text-2xl font-bold tracking-tighter text-loops-main">
                                Loops
                            </span>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-2">
                            <NavLink href="/browse?view=product">{getTerm('marketplaceName') || 'Marketplace'}</NavLink>
                            <NavLink href="/browse?view=service">Services</NavLink>
                            <NavLink href="/requests">Requests</NavLink>
                            {user && (
                                <Link href="/messages" className="relative">
                                    <NavLink href="/messages">Messages</NavLink>
                                    {unreadMessagesCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-loops-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                                            {unreadMessagesCount}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {user ? (
                            <>
                                <Link href="/listings/create" className="hidden sm:block">
                                    <Button className="bg-loops-primary text-white hover:bg-loops-primary/90 h-11 px-6 flex items-center gap-2 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-loops-primary/10 transition-all active:scale-95">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        {getTerm('listingAction')}
                                    </Button>
                                </Link>

                                <div className="w-px h-6 bg-loops-border mx-2 hidden sm:block" />

                                {profile?.is_admin && (
                                    <Link href="/admin" className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-loops-accent/10 border border-loops-accent/20 text-loops-accent hover:bg-loops-accent/20 transition-all group/admin">
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Loop Command</span>
                                    </Link>
                                )}

                                <Link href="/profile" className="hidden sm:flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-loops-subtle border border-loops-border hover:border-loops-primary/20 transition-all group">
                                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-loops-primary text-sm font-bold border border-loops-border shadow-sm overflow-hidden relative group-hover:scale-105 transition-transform">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            (profile?.full_name || user.email || 'U').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <div className="text-[10px] font-bold text-loops-main uppercase tracking-widest leading-none">Me</div>
                                        <div className="text-[9px] text-loops-muted font-medium mt-1">Plug Profile</div>
                                    </div>
                                </Link>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleSignOut}
                                    className="w-11 h-11 rounded-2xl text-loops-muted hover:text-loops-accent hover:bg-loops-accent/5 transition-all"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsCartOpen(true)}
                                    className="w-11 h-11 rounded-2xl text-loops-main bg-loops-subtle hover:bg-loops-border transition-all relative"
                                    title="Your Cart"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-loops-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                                            {cartCount}
                                        </span>
                                    )}
                                </Button>

                                <Link href="/profile">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-11 h-11 rounded-2xl text-loops-main bg-loops-subtle hover:bg-loops-border transition-all relative"
                                        title="Saved Items"
                                    >
                                        <Heart className="w-5 h-5" />
                                        {wishlistCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
                                        )}
                                    </Button>
                                </Link>

                                <Link href="/messages">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-11 h-11 rounded-2xl text-loops-main bg-loops-subtle hover:bg-loops-border transition-all relative"
                                        title="Notifications"
                                    >
                                        <Bell className={cn("w-5 h-5", pendingLoopsCount > 0 && "text-loops-primary animate-pulse")} />
                                        {pendingLoopsCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-loops-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                                                {pendingLoopsCount}
                                            </span>
                                        )}
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" className="h-11 px-6 rounded-2xl text-xs font-bold text-loops-muted hover:text-loops-primary hover:bg-loops-primary/5">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/login?view=signup">
                                    <Button className="bg-loops-primary text-white hover:bg-loops-primary/90 h-11 px-6 rounded-2xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-loops-primary/20">
                                        Join the Loop
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Header (Sticky Logo Only) */}
            <nav className={cn(
                "md:hidden fixed top-0 w-full z-50 border-b border-loops-border bg-white/80 backdrop-blur-xl transition-all duration-500",
                showAppBanner ? "pt-12" : "pt-0"
            )}>
                {showAppBanner && (
                    <div className="absolute top-0 w-full h-12 bg-loops-primary text-white flex items-center justify-between px-6 animate-in slide-in-from-top duration-500">
                        <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Get the Loops App</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    triggerPWAInstall();
                                    setShowAppBanner(false);
                                    localStorage.setItem('loops_app_banner_dismissed', 'true');
                                }}
                                className="text-[9px] font-black uppercase tracking-widest bg-white text-loops-primary px-3 py-1 rounded-full shadow-lg"
                            >
                                Install Now
                            </button>
                            <button
                                onClick={() => {
                                    setShowAppBanner(false);
                                    localStorage.setItem('loops_app_banner_dismissed', 'true');
                                }}
                                className="opacity-50 hover:opacity-100"
                            >
                                <Icons.X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
                <div className="px-6 h-14 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-loops-primary/10 border border-loops-border">
                            <InfinityLogo className="w-6 h-6" />
                        </div>
                        <span className="font-display text-lg font-bold tracking-tighter text-loops-main">
                            Loops
                        </span>
                    </Link>

                    <div className="flex items-center gap-3">
                        {user && (
                            <Link href="/messages" className="relative p-2 text-loops-muted hover:text-loops-primary">
                                <Bell className={cn("w-5 h-5", pendingLoopsCount > 0 && "text-loops-primary")} />
                                {pendingLoopsCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-loops-primary rounded-full border border-white" />
                                )}
                            </Link>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCartOpen(true)}
                            className="w-10 h-10 text-loops-main relative"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-loops-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                                    {cartCount}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </nav>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 w-full z-50 border-t border-loops-border bg-white/90 backdrop-blur-xl safe-padding-bottom">
                <div className="flex items-center justify-around h-16">
                    <Link href="/" className="flex flex-col items-center gap-1 group">
                        <Home className={cn("w-5 h-5", router.hasOwnProperty('pathname') && (router as any).pathname === "/" ? "text-loops-primary" : "text-loops-muted")} />
                        <span className="text-[10px] font-bold uppercase tracking-widest scale-90">Home</span>
                    </Link>
                    <Link href="/browse?view=product" className="flex flex-col items-center gap-1 group">
                        <Search className="w-5 h-5 text-loops-muted group-active:text-loops-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest scale-90 text-loops-muted">Market</span>
                    </Link>
                    <Link href="/listings/create" className="flex flex-col items-center gap-1 relative -top-3">
                        <div className="w-12 h-12 bg-loops-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-loops-primary/30 active:scale-90 transition-transform">
                            <PlusSquare className="w-6 h-6" />
                        </div>
                    </Link>
                    <Link href="/requests" className="flex flex-col items-center gap-1 group">
                        <Package className="w-5 h-5 text-loops-muted group-active:text-loops-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest scale-90 text-loops-muted">Requests</span>
                    </Link>
                    <Link href="/profile" className="flex flex-col items-center gap-1 group">
                        <UserCircle className="w-5 h-5 text-loops-muted group-active:text-loops-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest scale-90 text-loops-muted">Profile</span>
                    </Link>
                </div>
            </nav>
        </>
    );
}
