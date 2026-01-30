'use client';

import { Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    className?: string;
    delay?: number;
}

export function SearchBar({ onSearch, placeholder = "Search...", className, delay = 300 }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            onSearch(query);
        }, delay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [query, delay, onSearch]);

    const handleClear = () => {
        setQuery("");
        onSearch("");
    };

    return (
        <div className={cn("relative group", className)}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-loops-muted group-focus-within:text-loops-primary transition-colors" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full h-12 pl-11 pr-11 bg-loops-subtle border border-loops-border rounded-xl text-sm text-loops-main placeholder:text-loops-muted/60 focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all font-medium shadow-sm"
            />
            {query && (
                <button
                    onClick={handleClear}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-loops-border/50 text-loops-muted hover:text-loops-main transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
