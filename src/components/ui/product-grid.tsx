'use client';

import { motion } from "framer-motion";
import { ProductCard } from "./product-card";

interface Product {
    id: string;
    title: string;
    price: string;
    image: string;
    category: string;
}

interface ProductGridProps {
    products: Product[];
    loading?: boolean;
}

export function ProductGrid({ products, loading = false }: ProductGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-4 animate-pulse">
                        <div className="aspect-[3/4] w-full bg-white/5 rounded-xl" />
                        <div className="space-y-2">
                            <div className="h-4 bg-white/5 rounded w-3/4" />
                            <div className="h-4 bg-white/5 rounded w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product, idx) => (
                <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    image={product.image}
                    category={product.category}
                    delay={idx * 0.05}
                />
            ))}
        </div>
    );
}
