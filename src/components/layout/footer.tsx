'use client';

import Link from "next/link";
import { useCampus } from "@/context/campus-context";
import { MessageSquare, ShieldCheck, Instagram, Twitter, Globe, Heart, Phone } from "lucide-react";

export function Footer() {
    const { getTerm, campus } = useCampus();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-loops-border pt-20 pb-10 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12 mb-20">
                    {/* Brand Column */}
                    <div className="col-span-2 lg:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-2.5 group w-fit">
                            <div className="w-10 h-10 bg-loops-primary rounded-xl flex items-center justify-center shadow-xl shadow-loops-primary/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                                <img src="/logo.png" alt="Loops" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-2xl font-bold font-display tracking-tight text-loops-main">Loops</span>
                        </Link>
                        <p className="text-loops-muted text-sm leading-relaxed max-w-sm">
                            The economic nervous system of Nigerian student life. <br className="hidden lg:block" />
                            Trading safely within verified university networks.
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-xl bg-loops-subtle text-loops-muted hover:text-loops-primary hover:bg-loops-primary/5 transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-xl bg-loops-subtle text-loops-muted hover:text-loops-primary hover:bg-loops-primary/5 transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Discovery */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-loops-main uppercase tracking-widest text-[10px]">Discovery</h4>
                        <ul className="space-y-3">
                            <li><NavLink href="/browse">{getTerm('marketplaceName')}</NavLink></li>
                            <li><NavLink href="/services">Campus Services</NavLink></li>
                            <li><NavLink href="/requests">Student Requests</NavLink></li>
                            <li><Link href="/request-campus" className="text-loops-primary font-bold hover:underline transition-all text-sm">Request a Campus</Link></li>
                            <li><NavLink href="/listings/create">Post a Drop</NavLink></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-loops-main uppercase tracking-widest text-[10px]">Resources</h4>
                        <ul className="space-y-3">
                            <li><NavLink href="/safety">Safety Center</NavLink></li>
                            <li><NavLink href="/faq">How it Works</NavLink></li>
                            <li><NavLink href="/terms">Terms</NavLink></li>
                            <li><NavLink href="/privacy">Privacy</NavLink></li>
                        </ul>
                    </div>

                    {/* Local Loop */}
                    <div className="col-span-2 md:col-span-1 space-y-6">
                        <h4 className="font-bold text-loops-main uppercase tracking-widest text-[10px]">Local Loop</h4>
                        <div className="p-5 rounded-2xl bg-loops-subtle border border-loops-border relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-loops-success/5 rounded-full blur-2xl group-hover:bg-loops-success/10 transition-colors" />
                            <div className="flex items-center gap-3 mb-3 relative z-10">
                                <div className="w-2 h-2 rounded-full bg-loops-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                <span className="text-sm font-bold text-loops-main truncate">{campus?.name || 'Veritas Pulse'}</span>
                            </div>
                            <p className="text-[9px] text-loops-muted uppercase font-bold tracking-[0.2em] mb-4 opacity-70">Verified Active</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-loops-border pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[11px] text-loops-muted font-medium text-center md:text-left">
                        © {currentYear} Loops Marketplace. <br className="md:hidden" />
                        Built with <Heart className="inline w-3 h-3 text-loops-accent fill-loops-accent mx-0.5" /> for Nigerian Students.
                    </p>
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-1.5 text-[11px] text-loops-muted font-bold uppercase tracking-widest">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Region: NG</span>
                        </div>
                        <div className="w-px h-4 bg-loops-border hidden sm:block" />
                        <div className="text-[11px] text-loops-muted font-medium">
                            v0.1.0-beta
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link href={href} className="text-loops-muted hover:text-loops-primary transition-all text-sm block w-fit">
            {children}
        </Link>
    );
}
