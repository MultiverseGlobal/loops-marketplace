'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface ReviewFormProps {
    listingId: string;
    revieweeId: string;
    onSuccess: () => void;
}

export function ReviewForm({ listingId, revieweeId, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleSubmit = async () => {
        if (rating === 0) return;
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('reviews')
            .insert({
                listing_id: listingId,
                reviewer_id: user.id,
                reviewee_id: revieweeId,
                rating,
                comment
            });

        if (!error) {
            // Update user reputation score (simplified: +10 per review)
            await supabase.rpc('increment_reputation', { user_id: revieweeId, amount: 10 });
            onSuccess();
        }
        setLoading(false);
    };

    return (
        <div className="p-8 rounded-3xl bg-white border border-loops-border shadow-2xl shadow-loops-primary/5 space-y-8">
            <div className="space-y-2">
                <p className="text-[10px] font-bold text-loops-primary uppercase tracking-widest leading-none">Trust Engine</p>
                <h3 className="text-3xl font-bold font-display italic tracking-tighter text-loops-main">Rate the Trade.</h3>
                <p className="text-loops-muted text-xs font-bold uppercase tracking-widest opacity-60">Help keep the Loop secure for all students.</p>
            </div>

            <div className="flex justify-center gap-4 py-4 bg-loops-subtle rounded-2xl border border-loops-border/50">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="transition-all hover:scale-125 active:scale-90"
                    >
                        <Star
                            className={cn(
                                "w-10 h-10 transition-colors",
                                (hover || rating) >= star ? "fill-loops-accent text-loops-accent filter drop-shadow-sm" : "text-loops-muted opacity-20"
                            )}
                        />
                    </button>
                ))}
            </div>

            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the interaction? (Optional)"
                rows={3}
                className="w-full p-6 bg-loops-subtle border border-loops-border rounded-2xl focus:border-loops-primary focus:outline-none focus:ring-4 focus:ring-loops-primary/10 transition-all resize-none text-sm font-medium text-loops-main shadow-sm"
            />

            <Button
                onClick={handleSubmit}
                disabled={rating === 0 || loading}
                className="w-full h-16 bg-loops-success hover:bg-loops-success/90 text-white font-bold rounded-2xl shadow-xl shadow-loops-success/20 transition-all hover:scale-[1.02] active:scale-95 text-lg"
            >
                {loading ? "Syncing Ledger..." : "Submit Review"}
            </Button>
        </div>
    );
}
