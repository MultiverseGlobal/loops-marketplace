'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Zap, PlusSquare, MessageSquare, User, ShoppingCart, Heart } from "lucide-react";
import { useCampus } from "@/context/campus-context";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useCart } from "@/context/cart-context";
import { CartDrawer } from "./cart-drawer";
import { useNotifications } from "@/context/notification-context";
import { motion } from "framer-motion";

export function BottomNav() {
    const pathname = usePathname();
    const { getTerm } = useCampus();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const supabase = createClient();
    const { cartItems, wishlistCount } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { unreadCount } = useNotifications();

    const cartCount = (cartItems || []).reduce((sum, item) => sum + (item?.quantity || 0), 0);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    // Define routes where the bottom nav should be hidden
    const hideOnRoutes = ["/onboarding", "/login", "/signup", "/auth", "/founding-plugs"];
    const shouldHide = hideOnRoutes.includes(pathname) ||
        pathname.startsWith("/auth/") ||
        pathname.startsWith("/messages/");

    if (shouldHide) return null;

    const navItems = [
        { label: "Feed", href: "/browse", icon: Home },
        { label: "Inbox", href: "/messages", icon: MessageSquare, badge: unreadCount },
        { label: "Post", href: "/listings/create", icon: PlusSquare, primary: true },
        { label: "Cart", icon: ShoppingCart, badge: cartCount, isCart: true },
        { label: "Profile", href: user ? "/profile" : "/login", icon: User },
    ];

    const handleNavClick = () => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(10); // Subtle haptic tap
        }
    };

    return (
        <>
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 pointer-events-none">
                <nav className="bg-white/80 backdrop-blur-3xl border border-white/20 shadow-[0_-12px_40px_-15px_rgba(0,0,0,0.2)] rounded-[2.5rem] flex items-center justify-around h-16 pointer-events-auto px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.href && (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));

                        if (item.primary) {
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href!}
                                    onClick={handleNavClick}
                                    className="relative -top-3"
                                >
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-90",
                                        isActive ? "bg-loops-primary text-white" : "bg-loops-main text-white"
                                    )}>
                                        <Icon className="w-7 h-7" />
                                    </div>
                                </Link>
                            );
                        }

                        // Cart button (opens drawer)
                        if (item.isCart) {
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => {
                                        handleNavClick();
                                        setIsCartOpen(true);
                                    }}
                                    className="flex flex-col items-center justify-center gap-1 group relative flex-1"
                                >
                                    <div className="relative p-2 rounded-xl transition-all duration-300 group-active:scale-90 text-loops-muted group-hover:text-loops-main">
                                        <Icon className="w-5 h-5" />
                                        {item.badge! > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-loops-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.href!}
                                onClick={handleNavClick}
                                className="flex flex-col items-center justify-center gap-1 group relative flex-1"
                            >
                                <div className={cn(
                                    "relative p-2 rounded-xl transition-all duration-300 group-active:scale-90",
                                    isActive ? "bg-loops-primary/10 text-loops-primary scale-110" : "text-loops-muted group-hover:text-loops-main"
                                )}>
                                    <Icon className={cn("w-5 h-5", isActive && "animate-pulse-subtle")} />
                                    {item.badge! > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-loops-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                {isActive && (
                                    <motion.span 
                                        layoutId="navIndicator"
                                        className="absolute -top-1.5 w-1 h-1 bg-loops-primary rounded-full shadow-lg shadow-loops-primary/50" 
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
