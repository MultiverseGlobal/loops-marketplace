'use client';

import Link from "next/link";
import { useCampus } from "@/context/campus-context";
import { MessageSquare, ShieldCheck, Instagram, Twitter, Globe, Heart, Phone } from "lucide-react";

export function Footer() {
    const { getTerm, campus } = useCampus();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-loops-border pt-16 pb-8 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 bg-loops-primary rounded-xl flex items-center justify-center shadow-lg shadow-loops-primary/20 group-hover:scale-105 transition-transform">
                                <MessageSquare className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold font-display tracking-tight text-loops-main">Loops</span>
                        </Link>
                        <p className="text-loops-muted text-sm leading-relaxed max-w-xs">
                            The economic nervous system of Nigerian student life. Trading safely within verified university networks.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="p-2 rounded-lg bg-loops-subtle text-loops-muted hover:text-loops-primary transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 rounded-lg bg-loops-subtle text-loops-muted hover:text-loops-primary transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Discovery */}
                    <div>
                        <h4 className="font-bold text-loops-main mb-6 uppercase tracking-widest text-xs">Discovery</h4>
                        <ul className="space-y-4">
                            <li><Link href="/browse" className="text-loops-muted hover:text-loops-primary transition-colors text-sm">{getTerm('marketplaceName')}</Link></li>
                            <li><Link href="/services" className="text-loops-muted hover:text-loops-primary transition-colors text-sm">Campus Services</Link></li>
                            <li><Link href="/requests" className="text-loops-muted hover:text-loops-primary transition-colors text-sm">Student Requests</Link></li>
                            <li><Link href="/request-campus" className="text-loops-primary font-bold hover:underline transition-all text-sm">Request a Campus</Link></li>
                            <li><Link href="/listings/create" className="text-loops-muted hover:text-loops-primary transition-colors text-sm">Post a Drop</Link></li>
                        </ul>
                    </div>

                    {/* Support & Safety */}
                    <div>
                        <h4 className="font-bold text-loops-main mb-6 uppercase tracking-widest text-xs">Support & Safety</h4>
                        <ul className="space-y-4">
                            <li><Link href="/safety" className="text-loops-muted hover:text-loops-primary transition-colors text-sm flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Safety Center
                            </Link></li>
                            <li><Link href="/faq" className="text-loops-muted hover:text-loops-primary transition-colors text-sm">How it Works</Link></li>
                            <li><a
                                href="https://wa.me/2348123456789?text=Hello%20Loops%20Team!%20I%20need%20help%20with..."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-loops-success hover:text-loops-success/80 transition-colors text-sm font-bold flex items-center gap-2"
                            >
                                <Phone className="w-4 h-4" /> LoopBot WhatsApp
                            </a></li>
                            <li><Link href="/terms" className="text-loops-muted hover:text-loops-primary transition-colors text-sm">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="text-loops-muted hover:text-loops-primary transition-colors text-sm">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Campus Column */}
                    <div>
                        <h4 className="font-bold text-loops-main mb-6 uppercase tracking-widest text-xs">Your Campus</h4>
                        <div className="p-4 rounded-2xl bg-loops-subtle border border-loops-border">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 rounded-full bg-loops-success animate-pulse" />
                                <span className="text-sm font-bold text-loops-main">{campus?.name || 'Veritas Pulse'}</span>
                            </div>
                            <p className="text-[10px] text-loops-muted uppercase font-bold tracking-widest mb-4">Official Node Active</p>
                            <Link href="/profile" className="text-xs font-bold text-loops-primary hover:underline">
                                Manage Profile →
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-loops-border pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-loops-muted font-medium">
                        © {currentYear} Loops Marketplace. Built for Nigerian Students.
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5 text-xs text-loops-muted font-medium">
                            <Globe className="w-3.5 h-3.5" />
                            <span>NG-Region</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-loops-muted font-medium">
                            <span>Made with</span>
                            <Heart className="w-3.5 h-3.5 text-loops-accent fill-loops-accent" />
                            <span>for {campus?.slug === 'veritas' ? 'Veritas' : 'Campus'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
