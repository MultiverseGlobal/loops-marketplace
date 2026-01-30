'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserCircle, LogOut, MessageSquare, Sparkles } from "lucide-react";
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
        <nav className="fixed top-0 w-full z-50 border-b border-loops-border bg-white/70 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="font-display text-xl font-bold tracking-tight text-loops-main hover:opacity-80 transition-opacity">
                        Loops
                    </Link>
                    <nav className="hidden md:flex items-center gap-1">
                        <NavLink href="/browse">The Feed</NavLink>
                        <NavLink href="/services">Services</NavLink>
                        <NavLink href="/requests">Requests</NavLink>
                        {user && <NavLink href="/messages">Messages</NavLink>}
                    </nav>
                </div>
                <div className="flex items-center gap-3 sm:gap-6">
                    {user ? (
                        <>
                            <Link href="/messages" className="hidden md:flex text-loops-muted hover:text-loops-primary transition-colors relative group">
                                <MessageSquare className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-loops-primary rounded-full" />
                            </Link>

                            <Link href="/listings/create" className="hidden md:block">
                                <Button className="bg-loops-primary text-white hover:bg-loops-primary/90 h-10 px-4 flex items-center gap-2 rounded-xl text-xs font-bold uppercase tracking-widest">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {getTerm('listingAction')}
                                </Button>
                            </Link>

                            <div className="h-4 w-px bg-loops-border mx-1 hidden sm:block" />

                            <Link href="/profile" className="flex items-center gap-2 group">
                                <div className="w-8 h-8 rounded-full bg-loops-primary/5 flex items-center justify-center text-loops-primary text-xs font-bold border border-loops-primary/20 group-hover:bg-loops-primary/10 transition-all overflow-hidden relative">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        (profile?.full_name || user.email || 'U').charAt(0).toUpperCase()
                                    )}
                                </div>
                            </Link>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleSignOut}
                                className="text-loops-muted hover:text-loops-accent transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" className="text-loops-muted hover:text-loops-primary">Log in</Button>
                            </Link>
                            <Link href="/login?view=signup">
                                <Button className="bg-loops-primary text-white hover:bg-loops-primary/90 h-9 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
                                    Join the Loop
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
