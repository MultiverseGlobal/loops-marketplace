'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CategoryDistributionProps {
    data: Record<string, number>;
    className?: string;
}

export function CategoryDistribution({ data, className }: CategoryDistributionProps) {
    const total = Object.values(data).reduce((acc, curr) => acc + curr, 0);
    const sortedData = Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // Top 5 categories

    const colors = [
        'bg-loops-primary',
        'bg-loops-energetic',
        'bg-loops-accent',
        'bg-loops-vibrant',
        'bg-loops-muted'
    ];

    return (
        <div className={cn("space-y-6", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-loops-muted">Category Pulse</h3>
                <span className="text-[10px] font-bold px-2 py-1 bg-loops-subtle rounded-lg text-loops-muted">
                    {total} Listings
                </span>
            </div>

            <div className="space-y-4">
                {sortedData.map(([category, count], index) => {
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    return (
                        <div key={category} className="space-y-1.5">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-loops-main">{category}</span>
                                <span className="text-[10px] font-black text-loops-muted">{count} ({Math.round(percentage)}%)</span>
                            </div>
                            <div className="h-2 w-full bg-loops-subtle rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                                    className={cn("h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]", colors[index % colors.length])}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {Object.entries(data).length > 5 && (
                <p className="text-[10px] text-center text-loops-muted font-bold italic">
                    + {Object.entries(data).length - 5} other categories
                </p>
            )}
        </div>
    );
}
