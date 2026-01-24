'use client';

import { motion } from "framer-motion";

export function SkeletonCard() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="aspect-square rounded-2xl bg-loops-subtle border border-loops-border" />
            <div className="space-y-2 px-1">
                <div className="h-3 w-1/3 bg-loops-subtle rounded" />
                <div className="h-5 w-2/3 bg-loops-subtle rounded" />
            </div>
        </div>
    );
}

export function SkeletonItem() {
    return (
        <div className="p-6 rounded-2xl border border-loops-border bg-loops-subtle animate-pulse">
            <div className="flex gap-6 items-center">
                <div className="w-16 h-16 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-3">
                    <div className="h-4 w-1/4 bg-slate-200 rounded" />
                    <div className="h-6 w-3/4 bg-slate-200 rounded" />
                </div>
            </div>
        </div>
    );
}
