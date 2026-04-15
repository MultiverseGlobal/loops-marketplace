'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Rocket, Share2, Store, Verified, ArrowRight, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/toast-context";

interface GrowthTask {
    id: string;
    title: string;
    description: string;
    icon: any;
    isComplete: boolean;
    actionLabel: string;
    action: () => void;
}

export function FoundingPlugGrowthKit({ profile }: { profile: any }) {
    const toast = useToast();
    const [tasks, setTasks] = useState<GrowthTask[]>([]);
    
    useEffect(() => {
        // Mock task status based on profile data
        setTasks([
            {
                id: 'verify',
                title: 'Institutional Verification',
                description: 'Verify your student ID to unlock official trust badge.',
                icon: Verified,
                isComplete: profile?.is_verified || false,
                actionLabel: 'Verify Now',
                action: () => window.location.href = '/onboarding/verify'
            },
            {
                id: 'drops',
                title: 'Post First 3 Drops',
                description: 'Get your inventory live. 3 items is the magic number for trust.',
                icon: Store,
                isComplete: false, // Would check listing count in real scenario
                actionLabel: 'Add Listing',
                action: () => window.location.href = '/listings/create'
            },
            {
                id: 'share',
                title: 'Broadcast Storefront',
                description: 'Share your Loops Profile to your WhatsApp status.',
                icon: Share2,
                isComplete: false,
                actionLabel: 'Get Link',
                action: () => {
                    const url = `${window.location.origin}/u/${profile?.username}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Profile link copied! Share to WhatsApp.");
                }
            }
        ]);
    }, [profile]);

    const completedCount = tasks.filter(t => t.isComplete).length;
    const progress = (completedCount / tasks.length) * 100;

    return (
        <div className="bg-white rounded-[2.5rem] border border-loops-border overflow-hidden shadow-2xl shadow-loops-primary/5">
            {/* Header */}
            <div className="p-8 bg-gradient-to-br from-loops-main to-loops-main/90 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                    <Rocket className="w-32 h-32" />
                </div>
                
                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-loops-primary/20 rounded-full border border-loops-primary/30">
                        <Zap className="w-3 h-3 text-loops-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-loops-primary">Founding 37 Growth Kit</span>
                    </div>
                    
                    <h2 className="text-3xl font-black italic tracking-tighter">
                        Road to <span className="text-loops-primary">First 5 Sales</span>.
                    </h2>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-60">
                            <span>Platform Mastery</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-loops-primary shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Task List */}
            <div className="p-4 sm:p-8 space-y-4">
                {tasks.map((task) => (
                    <div 
                        key={task.id}
                        className={cn(
                            "group p-6 rounded-3xl border transition-all duration-300 flex items-center gap-6",
                            task.isComplete 
                                ? "bg-loops-success/5 border-loops-success/20" 
                                : "bg-white border-loops-border hover:border-loops-primary/30 hover:shadow-xl hover:shadow-loops-primary/5"
                        )}
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                            task.isComplete 
                                ? "bg-loops-success text-white" 
                                : "bg-loops-subtle text-loops-muted group-hover:bg-loops-primary group-hover:text-white"
                        )}>
                            <task.icon className="w-6 h-6" />
                        </div>

                        <div className="flex-grow space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-loops-main">{task.title}</h3>
                                {task.isComplete && <CheckCircle2 className="w-4 h-4 text-loops-success" />}
                            </div>
                            <p className="text-xs text-loops-muted font-medium line-clamp-1">{task.description}</p>
                        </div>

                        {!task.isComplete && (
                            <Button 
                                onClick={task.action}
                                className="h-10 px-6 rounded-xl bg-loops-main hover:bg-loops-primary text-white font-bold text-[10px] uppercase tracking-widest transition-all"
                            >
                                {task.actionLabel}
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer Tip */}
            <div className="px-8 py-6 bg-loops-subtle border-t border-loops-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-loops-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-loops-muted">Next Milestone: Silver Badge</span>
                </div>
                <ArrowRight className="w-4 h-4 text-loops-muted" />
            </div>
        </div>
    );
}
