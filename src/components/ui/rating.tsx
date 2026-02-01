'use client';

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface RatingProps {
    value: number;
    max?: number;
    readonly?: boolean;
    onChange?: (value: number) => void;
    size?: 'sm' | 'md' | 'lg';
}

export function Rating({ value, max = 5, readonly = true, onChange, size = 'md' }: RatingProps) {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const iconSize = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-6 h-6"
    }[size];

    return (
        <div className="flex items-center gap-1">
            {[...Array(max)].map((_, i) => {
                const starValue = i + 1;
                const isActive = hoverValue !== null ? starValue <= hoverValue : starValue <= value;

                return (
                    <button
                        key={i}
                        type="button"
                        disabled={readonly}
                        onClick={() => onChange?.(starValue)}
                        onMouseEnter={() => !readonly && setHoverValue(starValue)}
                        onMouseLeave={() => !readonly && setHoverValue(null)}
                        className={cn(
                            "transition-all duration-200",
                            !readonly && "hover:scale-125 hover:rotate-12",
                            isActive ? "text-yellow-400 fill-yellow-400" : "text-loops-border fill-transparent",
                            !readonly && "cursor-pointer"
                        )}
                    >
                        <Star className={iconSize} />
                    </button>
                );
            })}
        </div>
    );
}
