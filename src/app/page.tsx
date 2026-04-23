import { Navbar } from "../components/layout/navbar";
import { PulseFeed } from "../components/ui/pulse-feed";
import { Footer } from "../components/layout/footer";
import { CampusSelector } from "../components/ui/campus-selector";
import { FeaturedHubs } from "../components/ui/featured-hubs";
import { Button } from "../components/ui/button";
import { useCampus } from "../context/campus-context";
import { useRouter } from "next/navigation";
import { Sparkles, Search, ShoppingBag, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
    const { campus, loading } = useCampus();
    const router = useRouter();

    if (loading) return null;


    return (
        <div className="bg-loops-bg min-h-screen">
            <Navbar />
            <CampusSelector />
            
            <main className="pt-32 md:pt-48 pb-24">
                {/* Amazon-style Hero Section */}
                <section className="max-w-7xl mx-auto px-4 md:px-6 mb-12">
                    <div className="relative h-[300px] md:h-[450px] rounded-[2.5rem] overflow-hidden bg-loops-main">
                        <div className="absolute inset-0 bg-gradient-to-r from-loops-main via-loops-main/40 to-transparent z-10" />
                        <Image 
                            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
                            alt="Campus Life" 
                            fill 
                            className="object-cover opacity-60"
                        />
                        
                        <div className="absolute inset-0 z-20 p-8 md:p-16 flex flex-col justify-center max-w-2xl space-y-6">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-loops-primary/20 text-loops-primary border border-loops-primary/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em]"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Founding Plug Season</span>
                            </motion.div>
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter"
                            >
                                Everything <br />
                                <span className="text-loops-primary italic">Campus</span> <br />
                                is right here.
                            </motion.h1>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-wrap gap-4"
                            >
                                <Link href="/browse">
                                    <Button className="h-14 px-8 bg-loops-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-loops-primary/20 hover:scale-105 transition-all">
                                        Shop All Depts <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link href="/listings/create">
                                    <Button variant="outline" className="h-14 px-8 border-white/20 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10 backdrop-blur-md transition-all">
                                        Start Selling
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Hubs (Departmental Grid) */}
                <FeaturedHubs />

                {/* Main Feed Section (Amazon: Recommended / Just In) */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-12">
                    <div className="p-8 md:p-12 rounded-[2.5rem] bg-white border border-loops-border shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                            <div className="space-y-2">
                                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-loops-main italic">Today&apos;s Pulse<span className="text-loops-primary">.</span></h2>
                                <p className="text-sm font-bold text-loops-muted uppercase tracking-widest">Recommended deals from {campus?.name || 'your campus'}</p>
                            </div>
                            <Link href="/browse">
                                <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-loops-primary hover:bg-loops-primary/5">
                                    Explore More <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                        <PulseFeed campusId={campus?.id} />
                    </div>

                    {/* Middle Banner (Amazon Style) */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-64 rounded-[2.5rem] bg-gradient-to-br from-loops-primary to-loops-secondary p-8 flex flex-col justify-between group cursor-pointer overflow-hidden relative">
                            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
                            <div className="relative z-10">
                                <ShieldCheck className="w-10 h-10 text-white mb-4" />
                                <h3 className="text-2xl font-black text-white tracking-tight">Secure Handshake</h3>
                                <p className="text-white/60 text-sm font-medium mt-1">Escrow protection for every student trade.</p>
                            </div>
                            <Button className="w-fit h-10 px-6 bg-white text-loops-primary font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg relative z-10">
                                Learn How
                            </Button>
                        </div>
                        <div className="h-64 rounded-[2.5rem] bg-loops-main p-8 flex flex-col justify-between group cursor-pointer overflow-hidden relative border border-white/10">
                             <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-loops-primary/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
                            <div className="relative z-10">
                                <Zap className="w-10 h-10 text-loops-primary mb-4" />
                                <h3 className="text-2xl font-black text-white tracking-tight">Verified Plugs</h3>
                                <p className="text-white/60 text-sm font-medium mt-1">Join the network of top student sellers.</p>
                            </div>
                            <Button className="w-fit h-10 px-6 bg-loops-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg relative z-10">
                                Apply Now
                            </Button>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
