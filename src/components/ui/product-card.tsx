"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

interface ProductCardProps {
    id: string;
    title: string;
    price: string;
    image: string;
    category: string;
    delay?: number;
}

export function ProductCard({ id, title, price, image, category, delay = 0 }: ProductCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="group"
        >
            <Link href={`/listings/${id}`}>
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-loops-subtle border border-loops-border group-hover:border-loops-primary/30 transition-all duration-500">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/90 text-loops-main backdrop-blur-md uppercase tracking-widest shadow-sm">
                            {category}
                        </span>
                    </div>
                </div>
                <div className="mt-3 space-y-0.5 px-0.5">
                    <h3 className="text-sm font-bold text-loops-main group-hover:text-loops-primary transition-colors truncate">{title}</h3>
                    <p className="text-[13px] text-loops-success font-bold tracking-tight">{price}</p>
                </div>
            </Link>
        </motion.div>
    );
}
