'use client';

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { ChevronDown, Star, ShieldCheck, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ProductPage() {
    const [selectedSize, setSelectedSize] = useState("M");
    const [activeAccordion, setActiveAccordion] = useState<string | null>("details");

    return (
        <div className="min-h-screen bg-loops-dark text-white">
            <Navbar />

            <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-16">
                    {/* Gallery (Sticky) */}
                    <div className="space-y-4 lg:sticky lg:top-32 lg:h-fit">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-loops-card border border-white/5"
                        >
                            <Image
                                src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1000"
                                alt="Product"
                                fill
                                className="object-cover"
                            />
                        </motion.div>
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="relative aspect-square rounded-lg bg-loops-card border border-white/5 overflow-hidden hover:ring-2 hover:ring-loops-primary transition-all cursor-pointer">
                                    {/* Mock Thumbnails */}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="mt-10 lg:mt-0 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-loops-success text-sm font-medium">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Verified Student Listing</span>
                            </div>
                            <h1 className="font-display text-4xl font-bold tracking-tight text-white">Calculus Early Transcendentals</h1>
                            <div className="flex items-center gap-4">
                                <p className="text-3xl font-medium text-white">$45.00</p>
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-loops-success text-loops-success" />
                                    <span className="text-sm text-loops-muted">4.9 (12 reviews)</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-white/5" />

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white/70">Publisher Edition</label>
                                <div className="flex flex-wrap gap-3">
                                    {["8th Ed", "9th Ed", "International"].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                                                selectedSize === size
                                                    ? "bg-white text-loops-dark border-white"
                                                    : "bg-transparent text-white border-white/10 hover:border-white/30"
                                            )}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button className="w-full h-14 text-lg font-medium bg-loops-primary hover:bg-loops-primary/90">
                                Contact Seller
                            </Button>
                            <p className="text-center text-xs text-white/30">
                                Secure transaction handling available on campus meetup.
                            </p>
                        </div>

                        <div className="space-y-4 pt-8">
                            <AccordionItem
                                title="Description"
                                isOpen={activeAccordion === "details"}
                                onClick={() => setActiveAccordion(activeAccordion === "details" ? null : "details")}
                            >
                                <p className="text-white/60 leading-relaxed">
                                    Used for MAT101 at Stanford. Minimal highlighting on first 3 chapters.
                                    Binding is solid. Includes online access code (unused).
                                </p>
                            </AccordionItem>
                            <AccordionItem
                                title="Meetup Location"
                                isOpen={activeAccordion === "shipping"}
                                onClick={() => setActiveAccordion(activeAccordion === "shipping" ? null : "shipping")}
                            >
                                <div className="flex items-center gap-3 text-white/60">
                                    <Truck className="w-5 h-5" />
                                    <span>Tresidder Union, Green Library</span>
                                </div>
                            </AccordionItem>
                        </div>
                        <div className="space-y-4 pt-8 border-t border-white/5 mt-8">
                            <h3 className="font-display text-xl font-bold">Safe Trading Tips</h3>
                            <ul className="space-y-3 text-sm text-white/50">
                                <li className="flex items-center gap-2 italic">• Always meet in public university spaces (e.g., Tresidder, Libraries).</li>
                                <li className="flex items-center gap-2 italic">• Verify the item condition before payment.</li>
                                <li className="flex items-center gap-2 italic">• Use the built-in reputation system to check seller history.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Related Section */}
                <div className="mt-32 pt-16 border-t border-white/5">
                    <h2 className="font-display text-3xl font-bold mb-12">Related for your courses</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="group relative aspect-[3/4] rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden hover:border-loops-primary transition-all">
                                <div className="absolute inset-0 bg-gradient-to-t from-loops-dark/80 to-transparent z-10" />
                                <div className="absolute bottom-4 left-4 right-4 z-20 space-y-1">
                                    <div className="text-xs font-medium text-loops-primary">Books</div>
                                    <div className="font-bold text-white truncate">Related Item {i}</div>
                                    <div className="text-sm text-white/60">$35.00</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}

function AccordionItem({ title, isOpen, onClick, children }: { title: string, isOpen: boolean, onClick: () => void, children: React.ReactNode }) {
    return (
        <div className="border-t border-white/5">
            <button
                onClick={onClick}
                className="flex w-full items-center justify-between py-6 text-left hover:text-white/80 transition-colors"
            >
                <span className="font-medium">{title}</span>
                <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-6">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
