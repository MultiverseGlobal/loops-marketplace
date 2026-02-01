"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { User } from "lucide-react";

interface ProductCardProps {
    id: string;
    title: string;
    price: string;
    image: string;
    category: string;
    delay?: number;
    author?: string;
}

export function ProductCard({ id, title, price, image, category, delay = 0, author = "Campus Plug" }: ProductCardProps) {
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
                    <h3 className="text-[13px] md:text-sm font-bold text-loops-main group-hover:text-loops-primary transition-colors truncate tracking-tight">{title}</h3>
                    <div className="flex items-center justify-between">
                        <p className="text-[12px] md:text-[13px] text-loops-primary font-black tracking-tighter">{price}</p>
                        <div className="flex items-center gap-1.5 opacity-60">
                            <User className="w-2.5 h-2.5 text-loops-muted" />
                            <span className="text-[9px] font-bold text-loops-muted uppercase tracking-wider truncate max-w-[80px]">{author}</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-loops-primary/20 animate-pulse-subtle" />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
