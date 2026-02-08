"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { User, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    id: string;
    title: string;
    price: string;
    image: string;
    category: string;
    delay?: number;
    author?: string;
}

export function ProductCard({ id, title, price, image, category, delay = 0, author = "Campus Hub" }: ProductCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="group"
        >
            <Link href={`/listings/${id}`}>
                <div className="relative aspect-square overflow-hidden rounded-2xl md:rounded-3xl bg-loops-subtle border border-loops-border group-hover:border-loops-primary/30 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-loops-primary/10">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-2 left-2 md:top-4 md:left-4">
                        <span className="text-[8px] md:text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/95 text-loops-main backdrop-blur-md uppercase tracking-widest shadow-sm border border-loops-border/50">
                            {category}
                        </span>
                    </div>
                </div>
                <div className="mt-3 space-y-1 px-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[13px] md:text-sm font-bold text-loops-main group-hover:text-loops-primary transition-colors truncate tracking-tight flex-1">{title}</h3>
                        {(author as any)?.is_plug && (
                            <div className="flex-shrink-0 px-1.5 py-0.5 rounded-md bg-loops-primary/10 text-loops-primary text-[8px] font-bold uppercase tracking-tighter flex items-center gap-1">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                <span>Plug</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-[12px] md:text-[13px] text-loops-primary font-black tracking-tighter">{price}</p>
                        <div className="flex items-center gap-1.5 opacity-60">
                            <User className="w-2.5 h-2.5 text-loops-muted" />
                            <span className="text-[9px] font-bold text-loops-muted uppercase tracking-wider truncate max-w-[80px]">{(author as any)?.store_name || (author as any)?.full_name || "Campus Hub"}</span>
                        </div>
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse-subtle", (author as any)?.store_banner_color || "bg-loops-primary")} />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
