'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { School, Calendar, Mail, MessageCircle, AlertCircle } from "lucide-react";

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchRequests = async () => {
            const { data, error } = await supabase
                .from('campus_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) setRequests(data);
            setLoading(false);
        };
        fetchRequests();
    }, [supabase]);

    return (
        <div className="min-h-screen bg-loops-bg">
            <Navbar />
            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-bold font-display tracking-tight text-loops-main">Campus Nominations</h1>
                        <p className="text-loops-muted font-medium">Manage and prioritize new university launch requests.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-loops-primary"></div>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-loops-border rounded-[2.5rem] space-y-4">
                        <AlertCircle className="w-12 h-12 text-loops-muted mx-auto opacity-20" />
                        <h3 className="font-bold text-xl">No requests yet</h3>
                        <p className="text-loops-muted">When students nominate their schools, they will appear here.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {requests.map((req) => (
                            <div key={req.id} className="p-8 rounded-[2rem] bg-white border border-loops-border shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-loops-primary/5 flex items-center justify-center text-loops-primary">
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
                                        <div className="p-4 rounded-xl bg-loops-subtle border border-loops-border text-sm text-loops-muted italic flex gap-3">
                                            <MessageCircle className="w-4 h-4 shrink-0 mt-1" />
                                            "{req.reason}"
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 w-full md:w-auto">
                                    <Button variant="outline" className="flex-1 md:flex-none border-loops-border text-xs font-bold uppercase tracking-widest h-12 px-6 rounded-xl">Ignore</Button>
                                    <Button className="flex-1 md:flex-none bg-loops-success text-white text-xs font-bold uppercase tracking-widest h-12 px-6 rounded-xl">Review</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
