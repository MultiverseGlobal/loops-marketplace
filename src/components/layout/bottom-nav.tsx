'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Zap, PlusSquare, MessageSquare, User } from "lucide-react";
import { useCampus } from "@/context/campus-context";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";

export function BottomNav() {
    const pathname = usePathname();
    const { getTerm } = useCampus();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const supabase = createClient();

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

    // Don't show on landing page if you want a cleaner landing, 
    // but usually web-apps show it everywhere once logged in.
    // For this app, let's keep it for functional app pages only.
    const isLandingPage = pathname === "/";
    const isOnboarding = pathname === "/onboarding";

    // We can decide to hide it on specific pages if needed
    if (isOnboarding) return null;

    const navItems = [
        { label: "Feed", href: "/browse", icon: Home },
        { label: "Skills", href: "/services", icon: Zap },
        { label: "Post", href: "/listings/create", icon: PlusSquare, primary: true },
        { label: "Inbox", href: "/messages", icon: MessageSquare },
        { label: "Profile", href: user ? "/profile" : "/login", icon: User },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none">
            <nav className="bg-white/80 backdrop-blur-2xl border border-loops-border/50 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.15)] rounded-[2rem] flex items-center justify-around h-16 pointer-events-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                    if (item.primary) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative -top-3"
                            >
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-95",
                                    isActive ? "bg-loops-primary text-white" : "bg-loops-main text-white"
                                )}>
                                    <Icon className="w-7 h-7" />
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center gap-1 group relative flex-1"
                        >
                            <div className={cn(
                                "p-2 rounded-xl transition-all duration-300 group-active:scale-90",
                                isActive ? "bg-loops-primary/10 text-loops-primary" : "text-loops-muted group-hover:text-loops-main"
                            )}>
                                <Icon className={cn("w-6 h-6", isActive && "animate-pulse-subtle")} />
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
    );
}
