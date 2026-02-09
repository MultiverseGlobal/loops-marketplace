'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { User, Shield, Bell, ChevronLeft, LogOut, Save, Zap, AlertCircle, CheckCircle as CheckIcon, Clock } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/toast-context";
import { useCampus } from "@/context/campus-context";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/image-upload";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [pendingApp, setPendingApp] = useState<any>(null);
    const [showUpgradeForm, setShowUpgradeForm] = useState(false);

    // Form fields for upgrade
    const [offeringType, setOfferingType] = useState<'product' | 'service' | ''>('');
    const [description, setDescription] = useState("");
    const [motivation, setMotivation] = useState("");
    const [itemCount, setItemCount] = useState("");
    const [studentIdUrl, setStudentIdUrl] = useState("");
    const [submittingApp, setSubmittingApp] = useState(false);
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

                // Fetch pending application
                const { data: appData } = await supabase
                    .from('seller_applications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (appData && appData.length > 0) {
                    setPendingApp(appData[0]);
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

    const handleUpgradeSubmit = async () => {
        setSubmittingApp(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        if (!studentIdUrl) {
            toast.error("Please upload your Student ID card for verification.");
            setSubmittingApp(false);
            return;
        }

        try {
            const { error } = await supabase
                .from('seller_applications')
                .insert({
                    user_id: user.id,
                    full_name: fullName,
                    whatsapp_number: whatsappNumber,
                    campus_email: user.email,
                    offering_type: offeringType,
                    offering_description: description,
                    estimated_item_count: itemCount,
                    motivation: motivation,
                    status: 'pending',
                    student_id_url: studentIdUrl
                });

            if (error) throw error;

            toast.success("Upgrade application sent! We'll review it soon.");
            setPendingApp({
                status: 'pending',
                created_at: new Date().toISOString()
            });
            setShowUpgradeForm(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to send application.");
        } finally {
            setSubmittingApp(false);
        }
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
                        <h1 className="text-4xl font-bold font-display tracking-tight text-loops-main italic">Global Loop settings.</h1>
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
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-loops-muted ml-1">Profile Picture (Avatar)</label>
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
                                    <p className="text-[9px] text-loops-muted ml-1 italic">Crucial for **LoopBot AI**. Use international format (e.g., 23481...).</p>
                                </div>
                            </div>
                        </div>

                        {/* Plug Status Section */}
                        <div className="p-8 rounded-3xl bg-white border border-loops-border shadow-xl space-y-6">
                            <div className="flex items-center gap-3 text-loops-energetic border-b border-loops-border pb-6">
                                <Zap className="w-5 h-5" />
                                <h2 className="font-bold uppercase tracking-widest text-xs">Verified Plug Status</h2>
                            </div>

                            {profile?.is_plug ? (
                                <div className="p-6 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-green-600 shadow-sm">
                                        <CheckIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-green-800">You are a Verified Plug!</h3>
                                        <p className="text-sm text-green-700/70">Your listings get priority placement and you have the verified badge.</p>
                                    </div>
                                </div>
                            ) : pendingApp && pendingApp.status === 'pending' ? (
                                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-amber-600 shadow-sm">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-amber-800">Application Under Review</h3>
                                        <p className="text-sm text-amber-700/70">Applied on {new Date(pendingApp.created_at).toLocaleDateString()}. We'll notify you soon!</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-6 bg-loops-subtle rounded-2xl border border-loops-border flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-loops-primary shadow-sm border border-loops-border">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Upgrade to Verified Plug</h3>
                                            <p className="text-sm text-loops-muted">Sell products or offer services with priority search and a trust badge.</p>

                                            {pendingApp?.status === 'rejected' && pendingApp?.rejection_reason && (
                                                <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100">
                                                    <p className="text-[10px] uppercase font-bold tracking-widest text-red-500 mb-1">Feedback from Admin</p>
                                                    <p className="text-sm text-red-600 italic font-medium">"{pendingApp.rejection_reason}"</p>
                                                    <p className="text-[10px] text-red-400 mt-2">Please update your details and resubmit.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {!showUpgradeForm ? (
                                        <Button
                                            onClick={() => setShowUpgradeForm(true)}
                                            className="w-full h-14 bg-loops-energetic text-white font-bold rounded-xl"
                                        >
                                            Start Application
                                        </Button>
                                    ) : (
                                        <div className="pt-4 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-bold tracking-widest text-loops-muted ml-1">What will you offer?</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => setOfferingType('product')}
                                                        className={cn("h-12 rounded-xl border-2 font-bold text-sm transition-all", offeringType === 'product' ? "border-loops-primary bg-loops-primary/5 text-loops-primary" : "border-loops-border text-loops-muted")}
                                                    >
                                                        Products
                                                    </button>
                                                    <button
                                                        onClick={() => setOfferingType('service')}
                                                        className={cn("h-12 rounded-xl border-2 font-bold text-sm transition-all", offeringType === 'service' ? "border-loops-primary bg-loops-primary/5 text-loops-primary" : "border-loops-border text-loops-muted")}
                                                    >
                                                        Services
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-bold tracking-widest text-loops-muted ml-1">Tell us about your business</label>
                                                <textarea
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder="What are you planning to sell or offer on campus?"
                                                    className="w-full p-4 rounded-xl bg-loops-subtle border border-loops-border focus:border-loops-primary focus:outline-none transition-all resize-none text-sm"
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-bold tracking-widest text-loops-muted ml-1">Initial Inventory Size</label>
                                                <select
                                                    value={itemCount}
                                                    onChange={(e) => setItemCount(e.target.value)}
                                                    className="w-full h-12 px-4 rounded-xl bg-loops-subtle border border-loops-border focus:border-loops-primary focus:outline-none transition-all text-sm font-bold appearance-none"
                                                >
                                                    <option value="">Select size...</option>
                                                    <option value="1-5">1-5 items</option>
                                                    <option value="5-10">5-10 items</option>
                                                    <option value="10+">10+ items</option>
                                                </select>
                                            </div>

                                            <div className="flex gap-3">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setShowUpgradeForm(false)}
                                                    className="flex-1 h-12 font-bold text-loops-muted"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleUpgradeSubmit}
                                                    disabled={submittingApp || !offeringType || !description || !itemCount}
                                                    className="flex-[2] h-12 bg-loops-primary text-white font-bold rounded-xl"
                                                >
                                                    {submittingApp ? "Submitting..." : "Send Application"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
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
