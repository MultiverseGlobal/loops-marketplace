'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/toast-context";
import { School, Palette, Type, ShieldAlert } from "lucide-react";

export default function AddUniversityPage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        location: "",
        primary_color: "#1e40af",
        secondary_color: "#3b82f6",
        accent_color: "#fbbf24",
    });

    const supabase = createClient();
    const router = useRouter();
    const toast = useToast();

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (!profile?.is_admin) {
                toast.error("Unauthorized access.");
                router.push('/');
                return;
            }

            setIsAdmin(true);
            setLoading(false);
        };
        checkAdmin();
    }, [supabase, router, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('campuses')
                .insert([formData]);

            if (error) throw error;

            toast.success("University added successfully!");
            router.push('/onboarding');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-loops-bg">Loading...</div>;

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />
            <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                <div className="flex items-center justify-between mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-loops-primary font-bold uppercase tracking-widest text-xs">
                            <ShieldAlert className="w-4 h-4" />
                            Admin Console
                        </div>
                        <h1 className="text-4xl font-bold font-display">Add University Node</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Basic Info */}
                    <div className="space-y-8 p-8 rounded-3xl bg-white border border-loops-border shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <School className="w-6 h-6 text-loops-primary" />
                            <h2 className="text-xl font-bold">Institutional Data</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-loops-muted uppercase">University Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. University of Lagos"
                                    className="w-full h-12 px-4 rounded-xl bg-loops-subtle border border-loops-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-loops-muted uppercase">Slug (unique)</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                                    placeholder="e.g. unilag"
                                    className="w-full h-12 px-4 rounded-xl bg-loops-subtle border border-loops-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-loops-muted uppercase">Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. Lagos, Nigeria"
                                    className="w-full h-12 px-4 rounded-xl bg-loops-subtle border border-loops-border"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="space-y-8 p-8 rounded-3xl bg-white border border-loops-border shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Palette className="w-6 h-6 text-loops-secondary" />
                            <h2 className="text-xl font-bold">Campus Branding</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-loops-muted uppercase">Primary Color</label>
                                <div className="flex gap-4">
                                    <input
                                        type="color"
                                        value={formData.primary_color}
                                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                        className="h-12 w-20 rounded-lg cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.primary_color}
                                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                        className="flex-1 h-12 px-4 rounded-xl bg-loops-subtle border border-loops-border font-mono"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-loops-muted uppercase">Secondary Color</label>
                                <div className="flex gap-4">
                                    <input
                                        type="color"
                                        value={formData.secondary_color}
                                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                                        className="h-12 w-20 rounded-lg cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.secondary_color}
                                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                                        className="flex-1 h-12 px-4 rounded-xl bg-loops-subtle border border-loops-border font-mono"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-loops-muted uppercase">Accent Color</label>
                                <div className="flex gap-4">
                                    <input
                                        type="color"
                                        value={formData.accent_color}
                                        onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                                        className="h-12 w-20 rounded-lg cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.accent_color}
                                        onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                                        className="flex-1 h-12 px-4 rounded-xl bg-loops-subtle border border-loops-border font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full h-16 text-xl font-bold bg-loops-primary text-white shadow-2xl shadow-loops-primary/20 rounded-2xl"
                        >
                            {submitting ? "Provisioning..." : "Launch Campus Node"}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}
