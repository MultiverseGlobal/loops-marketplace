"use client";
import * as Icons from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function FeaturedHubs() {
    // Filter out 'all' and 'others' for the home page showcase
    const hubs = CATEGORIES.filter(cat => cat.id !== 'all' && cat.id !== 'others');

    return (
        <section className="py-24 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-4">
                        <div className="text-[10px] font-bold text-loops-primary uppercase tracking-[0.3em]">Curated Nodes</div>
                        <h2 className="font-display text-5xl md:text-6xl font-bold text-loops-main tracking-tighter italic">Enter the Hubs.</h2>
                        <p className="text-loops-muted text-lg max-w-xl">Dedicated marketplaces for everything you need on campus.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {hubs.map((hub, idx) => {
                        const Icon = (Icons as any)[hub.icon] || Icons.HelpCircle;
                        return (
                            <motion.div
                                key={hub.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Link href={`/browse?category=${hub.id}`}>
                                    <div className="group relative aspect-[4/5] rounded-[32px] overflow-hidden bg-white border border-loops-border hover:border-transparent transition-all duration-500 shadow-sm hover:shadow-2xl">
                                        {/* Background Accent */}
                                        <div
                                            className="absolute inset-x-0 bottom-0 h-2/3 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                                            style={{ background: `linear-gradient(to top, ${hub.color}, transparent)` }}
                                        />

                                        <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                            <div
                                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                                                style={{ backgroundColor: hub.color }}
                                            >
                                                <Icon className="w-7 h-7" />
                                            </div>

                                            <div className="space-y-1">
                                                <h3 className="text-xl font-bold text-loops-main group-hover:text-loops-primary transition-colors">{hub.label} Hub</h3>
                                                <p className="text-[10px] font-bold text-loops-muted uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Explore Pulse</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
