'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { School, Calendar, Mail, MessageCircle, AlertCircle } from "lucide-react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { useToast } from "@/context/toast-context";
import { motion } from "framer-motion";

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [approvingReq, setApprovingReq] = useState<any>(null);
    const [domain, setDomain] = useState("");
    const [uniName, setUniName] = useState("");
    const supabase = createClient();
    const { success, error: showError } = useToast();

    const fetchRequests = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('campus_requests')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (data) setRequests(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, [supabase]);

    const handleApproveClick = (req: any) => {
        setApprovingReq(req);
        setUniName(req.university_name);
        const emailDomain = req.school_email?.split('@')[1];
        setDomain(emailDomain || "");
    };

    const handleApproveConfirm = async () => {
        if (!domain) {
            showError("Please specify a domain for this node.");
            return;
        }

        try {
            const { error: campusError } = await supabase
                .from('campuses')
                .insert({
                    name: uniName,
                    domain: domain.toLowerCase().trim(),
                    location: "Nigeria",
                    type: "public"
                });

            if (campusError) throw campusError;

            const { error: reqError } = await supabase
                .from('campus_requests')
                .update({ status: 'added' })
                .eq('id', approvingReq.id);

            if (reqError) throw reqError;

            success(`${uniName} is now live on the Loop.`);

            setApprovingReq(null);
            fetchRequests();
        } catch (err: any) {
            showError(`Launch Failed: ${err.message}`);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Are you sure you want to reject this nomination?")) return;

        const { error } = await supabase
            .from('campus_requests')
            .update({ status: 'rejected' })
            .eq('id', id);

        if (!error) {
            fetchRequests();
            success("Request Rejected");
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-loops-bg">
                <Navbar />
                <main className="pt-32 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-bold font-display tracking-tight text-loops-main">Campus Nominations</h1>
                            <p className="text-loops-muted font-medium">Manage and prioritize new university launch requests.</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={fetchRequests}
                            className="border-loops-border h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                        >
                            Refresh Queue
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center p-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-loops-primary"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-20 bg-white border border-loops-border rounded-[2.5rem] space-y-4">
                            <AlertCircle className="w-12 h-12 text-loops-muted mx-auto opacity-20" />
                            <h3 className="font-bold text-xl text-loops-main">The Queue is Clear</h3>
                            <p className="text-loops-muted">All active nominations have been reviewed.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {requests.map((req) => (
                                <div key={req.id} className="p-8 rounded-[2rem] bg-white border border-loops-border shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row gap-8 items-start md:items-center justify-between group">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-loops-primary/5 flex items-center justify-center text-loops-primary group-hover:scale-110 transition-transform">
                                                <School className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl text-loops-main">{req.university_name}</h3>
                                                <div className="flex items-center gap-4 text-xs text-loops-muted font-bold uppercase tracking-widest mt-1">
                                                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(req.created_at).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1.5 text-loops-primary"><Mail className="w-3.5 h-3.5" /> {req.school_email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {req.reason && (
                                            <div className="p-4 rounded-xl bg-loops-subtle border border-loops-border text-xs text-loops-muted italic flex gap-3">
                                                <MessageCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                "{req.reason}"
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <Button variant="ghost" onClick={() => handleReject(req.id)} className="flex-1 md:flex-none text-loops-muted hover:text-loops-accent text-[10px] font-bold uppercase tracking-widest h-12 px-6 rounded-xl hover:bg-loops-accent/5">Reject</Button>
                                        <Button onClick={() => handleApproveClick(req)} className="flex-1 md:flex-none bg-loops-primary text-white text-[10px] font-bold uppercase tracking-widest h-12 px-8 rounded-xl shadow-lg shadow-loops-primary/20 hover:scale-105 active:scale-95 transition-all">Approve & Launch</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
                {approvingReq && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-loops-main/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl space-y-8 border border-loops-border">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-bold font-display text-loops-main tracking-tight">Launch Node</h3>
                                <p className="text-loops-muted text-sm font-medium">Verify official university details before deployment.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-loops-muted ml-1">Official Name</label>
                                    <input type="text" value={uniName} onChange={(e) => setUniName(e.target.value)} className="w-full h-14 bg-loops-subtle border border-loops-border rounded-xl px-4 font-bold text-loops-main focus:outline-none focus:ring-2 focus:ring-loops-primary/20" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-loops-muted ml-1">Domain Restriction (e.g. unilag.edu.ng)</label>
                                    <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="university.edu" className="w-full h-14 bg-loops-subtle border border-loops-border rounded-xl px-4 font-bold text-loops-main focus:outline-none focus:ring-2 focus:ring-loops-primary/20" />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button variant="ghost" onClick={() => setApprovingReq(null)} className="flex-1 h-14 rounded-2xl text-xs font-bold text-loops-muted">Cancel</Button>
                                <Button onClick={handleApproveConfirm} className="flex-1 bg-loops-primary text-white h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-loops-primary/20">Confirm Launch</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </AdminGuard>
    );
}
