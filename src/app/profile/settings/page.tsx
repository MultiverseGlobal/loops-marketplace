'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { User, Shield, Bell, ChevronLeft, LogOut, Save } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/toast-context";
import { useCampus } from "@/context/campus-context";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/image-upload";

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const supabase = createClient();
    const router = useRouter();
    const toast = useToast();
    const { campus } = useCampus();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (data) {
                    setProfile(data);
                    setFullName(data.full_name || "");
                    setBio(data.bio || "");
                    setWhatsappNumber(data.whatsapp_number || "");
                    setAvatarUrl(data.avatar_url || "");
                }
            } else {
                router.push('/login');
            }
            setLoading(false);
        };
        fetchProfile();
    }, [supabase, router]);

    const handleSave = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    bio: bio,
                    whatsapp_number: whatsappNumber,
                    avatar_url: avatarUrl,
                })
                .eq('id', user.id);

            if (error) {
                toast.error(`Error: ${error.message || "Failed to save settings."}`);
            } else {
                toast.success("Settings updated successfully!");
                router.push('/profile');
            }
        }
        setSaving(false);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />
            <main className="pt-32 pb-20 max-w-2xl mx-auto px-6">
                <Link href="/profile" className="inline-flex items-center gap-2 text-loops-muted hover:text-loops-primary mb-8 transition-colors font-bold uppercase tracking-widest text-xs">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Profile
                </Link>

                <div className="space-y-12">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold font-display tracking-tight text-loops-main italic">Global Pulse settings.</h1>
                        <p className="text-loops-muted text-lg">Manage your identity and preferences across the {campus?.name || 'Loop'}.</p>
                    </div>

                    <div className="space-y-8">
                        {/* Identity Section */}
                        <div className="p-8 rounded-3xl bg-white border border-loops-border shadow-xl space-y-6">
                            <div className="flex items-center gap-3 text-loops-primary border-b border-loops-border pb-6">
                                <User className="w-5 h-5" />
                                <h2 className="font-bold uppercase tracking-widest text-xs">Identity Details</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-loops-muted ml-1">Profile Pulse (Avatar)</label>
                                    <div className="pt-2">
                                        <ImageUpload
                                            maxFiles={1}
                                            value={avatarUrl ? [avatarUrl] : []}
                                            onUpload={(urls) => setAvatarUrl(urls[0] || "")}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-loops-muted ml-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full h-14 px-4 rounded-xl bg-loops-subtle border border-loops-border focus:border-loops-primary focus:outline-none transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-loops-muted ml-1">Campus Bio</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={4}
                                        className="w-full p-4 rounded-xl bg-loops-subtle border border-loops-border focus:border-loops-primary focus:outline-none transition-all resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-loops-muted ml-1">WhatsApp Number (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="+234..."
                                        value={whatsappNumber}
                                        onChange={(e) => setWhatsappNumber(e.target.value)}
                                        className="w-full h-14 px-4 rounded-xl bg-loops-subtle border border-loops-border focus:border-loops-primary focus:outline-none transition-all font-bold"
                                    />
                                    <p className="text-[9px] text-loops-muted ml-1 italic">Enables a direct "Chat on WhatsApp" button on your Pulse.</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="h-16 text-lg font-bold bg-loops-primary text-white shadow-xl shadow-loops-primary/20 rounded-2xl transition-all"
                            >
                                <Save className="w-5 h-5 mr-3" />
                                {saving ? "Saving Changes..." : "Save Preferences"}
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={handleSignOut}
                                className="h-14 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold uppercase tracking-widest text-xs"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Terminate Session
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
