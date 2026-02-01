'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserCircle, LogOut, MessageSquare, Sparkles, LogOut as SignOut, LayoutDashboard } from "lucide-react";
import { InfinityLogo } from "@/components/ui/infinity-logo";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCampus } from "@/context/campus-context";

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
    const supabase = createClient();
    const router = useRouter();
    const { campus, getTerm } = useCampus();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('avatar_url, full_name')
                    .eq('id', user.id)
                    .single();
                setProfile(data);
            }
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-loops-border bg-white/80 backdrop-blur-xl">
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
                        <NavLink href="/browse">The Feed</NavLink>
                        <NavLink href="/services">Services</NavLink>
                        <NavLink href="/requests">Requests</NavLink>
                        {user && <NavLink href="/messages">Messages</NavLink>}
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
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" className="h-11 px-6 rounded-2xl text-xs font-bold text-loops-muted hover:text-loops-primary hover:bg-loops-primary/5">
                                    Log in
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
    );
}
