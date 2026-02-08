'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Package, Zap, ArrowLeft, DollarSign, Info, Sparkles, Save } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/toast-context";
import { useCampus } from "@/context/campus-context";
import { useModal } from "@/context/modal-context";

export default function EditListingPage() {
    const { id } = useParams();
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const toast = useToast();
    const { campus } = useCampus();
    const modal = useModal();

    useEffect(() => {
        const fetchListing = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                if (data.seller_id !== user.id) {
                    router.push(`/listings/${id}`);
                    return;
                }
                setTitle(data.title);
                setPrice(data.price.toString());
                setDescription(data.description);
                setCategory(data.category);
            }
            setLoading(false);
        };
        fetchListing();
    }, [id, supabase, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('listings')
                .update({
                    title,
                    description,
                    price: parseFloat(price) || 0,
                    category,
                })
                .eq('id', id);

            if (error) throw error;
            toast.success("Listing updated successfully!");
            router.push(`/listings/${id}`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update listing.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />
            <main className="pt-32 pb-20 max-w-2xl mx-auto px-6">
                <Link href={`/listings/${id}`} className="inline-flex items-center gap-2 text-loops-muted hover:text-loops-primary mb-8 transition-colors font-bold uppercase tracking-widest text-xs">
                    <ArrowLeft className="w-4 h-4" />
                    Discard Changes
                </Link>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <p className="text-sm font-bold text-loops-primary uppercase tracking-widest">Editor Mode</p>
                        <h1 className="text-4xl font-bold font-display tracking-tight text-loops-main italic">Refine your Listing.</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="p-8 rounded-3xl bg-white border border-loops-border shadow-xl space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-loops-muted">Listing Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-4 bg-loops-subtle border border-loops-border rounded-xl focus:border-loops-primary focus:outline-none transition-all font-bold text-xl"
                                    placeholder="What are you selling?"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-loops-muted">Price ($)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-loops-muted" />
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full p-4 pl-10 bg-loops-subtle border border-loops-border rounded-xl focus:border-loops-primary focus:outline-none transition-all font-bold"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-loops-muted">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full p-4 bg-loops-subtle border border-loops-border rounded-xl focus:border-loops-primary focus:outline-none transition-all font-bold"
                                        required
                                    >
                                        <option value="books">Books</option>
                                        <option value="electronics">Electronics</option>
                                        <option value="fashion">Fashion</option>
                                        <option value="tutoring">Tutoring</option>
                                        <option value="others">Others</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-loops-muted">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-4 bg-loops-subtle border border-loops-border rounded-xl focus:border-loops-primary focus:outline-none transition-all min-h-[150px] resize-none"
                                    placeholder="Add more details..."
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={saving}
                                className="w-full h-16 text-lg font-bold bg-loops-primary hover:bg-loops-primary/90 text-white shadow-xl shadow-loops-primary/20 rounded-2xl transition-all"
                            >
                                <Save className="w-5 h-5 mr-3" />
                                {saving ? "Saving Changes..." : "Update Listing"}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
