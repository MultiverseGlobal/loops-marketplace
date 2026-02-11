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

export function BottomNav() {
    const pathname = usePathname();
    const { getTerm } = useCampus();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const supabase = createClient();
    const { cartItems, wishlistCount } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
        { label: "Inbox", href: "/messages", icon: MessageSquare },
        { label: "Post", href: "/listings/create", icon: PlusSquare, primary: true },
        { label: "Cart", icon: ShoppingCart, badge: cartCount, isCart: true },
        { label: "Profile", href: user ? "/profile" : "/login", icon: User },
    ];

    return (
        <>
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 pointer-events-none">
                <nav className="bg-white/90 backdrop-blur-2xl border border-loops-border/40 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.15)] rounded-2xl flex items-center justify-around h-14 pointer-events-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.href && (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));

                        if (item.primary) {
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href!}
                                    className="relative -top-2.5"
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl transition-all active:scale-95",
                                        isActive ? "bg-loops-primary text-white" : "bg-loops-main text-white"
                                    )}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                </Link>
                            );
                        }

                        // Cart button (opens drawer)
                        if (item.isCart) {
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => setIsCartOpen(true)}
                                    className="flex flex-col items-center justify-center gap-1 group relative flex-1"
                                >
                                    <div className="relative p-1.5 rounded-lg transition-all duration-300 group-active:scale-90 text-loops-muted group-hover:text-loops-main">
                                        <Icon className="w-5 h-5" />
                                        {item.badge! > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-loops-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-loops-muted opacity-0 scale-75 translate-y-1">
                                        {item.label}
                                    </span>
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.href!}
                                className="flex flex-col items-center justify-center gap-1 group relative flex-1"
                            >
                                <div className={cn(
                                    "relative p-1.5 rounded-lg transition-all duration-300 group-active:scale-90",
                                    isActive ? "bg-loops-primary/10 text-loops-primary" : "text-loops-muted group-hover:text-loops-main"
                                )}>
                                    <Icon className={cn("w-5 h-5", isActive && "animate-pulse-subtle")} />
                                    {item.badge! > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-loops-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest transition-all",
                                    isActive ? "text-loops-primary opacity-100 scale-100" : "text-loops-muted opacity-0 scale-75 translate-y-1"
                                )}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <span className="absolute -top-1 w-1 h-1 bg-loops-primary rounded-full" />
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
