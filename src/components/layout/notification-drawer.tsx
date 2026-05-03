'use client';

import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Sparkles, MessageCircle, ExternalLink, Play, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/context/notification-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

interface NotificationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
    const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
    const router = useRouter();
    const supabase = createClient();
    const [isPinging, setIsPinging] = useState(false);

    const sendTestNotification = async () => {
        setIsPinging(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setIsPinging(false);
            return;
        }

        const testNotif = {
            user_id: user.id,
            title: "Magic Loop Detected! ✨",
            message: "Someone on campus just boosted your reputation. Check out the new marketplace pulse for trending drops.",
            type: 'engagement',
            category: 'social',
            image_url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800",
            cta_link: "/",
            read: false
        };

        const { error } = await supabase.from('notifications').insert(testNotif);
        if (error) console.error("TEST_NOTIF_ERROR:", error);
        setIsPinging(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-loops-main/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-loops-border flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-2xl font-black italic tracking-tighter text-loops-main">Alert Feed</h2>
                                <p className="text-[10px] font-black text-loops-primary uppercase tracking-[0.2em] mt-1">Live from the Loop</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={markAllAsRead}
                                        className="h-9 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-loops-primary hover:bg-loops-primary/5 flex items-center gap-2"
                                    >
                                        <CheckCheck className="w-3.5 h-3.5" />
                                        All Read
                                    </Button>
                                )}
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={onClose}
                                    className="w-12 h-12 rounded-2xl bg-loops-subtle text-loops-muted hover:text-loops-main transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <motion.div
                                        key={notification.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => !notification.read && markAsRead(notification.id)}
                                        className={cn(
                                            "p-5 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden",
                                            notification.read 
                                                ? "bg-white border-loops-border" 
                                                : "bg-loops-primary/5 border-loops-primary/20 shadow-lg shadow-loops-primary/5"
                                        )}
                                    >
                                        {!notification.read && (
                                            <div className="absolute top-6 right-6 w-2 h-2 bg-loops-primary rounded-full animate-pulse" />
                                        )}

                                        <div className="flex gap-4">
                                            {/* Icon/Type Avatar */}
                                            <div className="w-10 h-10 rounded-xl bg-white border border-loops-border flex items-center justify-center flex-shrink-0 shadow-sm">
                                                {notification.type === 'engagement' ? (
                                                    <Sparkles className="w-5 h-5 text-loops-primary" />
                                                ) : notification.type === 'message' ? (
                                                    <MessageCircle className="w-5 h-5 text-blue-500" />
                                                ) : (
                                                    <Bell className="w-5 h-5 text-loops-muted" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] font-black text-loops-muted uppercase tracking-widest">
                                                        {notification.category || notification.type || 'Alert'}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-loops-muted">
                                                        {new Date(notification.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-black text-loops-main mb-1 group-hover:text-loops-primary transition-colors">
                                                    {notification.title}
                                                </h3>
                                                <p className="text-xs text-loops-muted font-medium leading-relaxed mb-3">
                                                    {notification.message}
                                                </p>

                                                {/* Rich Media: Image */}
                                                {notification.image_url && (
                                                    <div className="mt-3 rounded-2xl overflow-hidden border border-loops-border aspect-video bg-loops-subtle relative group/media">
                                                        <img 
                                                            src={notification.image_url} 
                                                            alt="" 
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover/media:scale-105" 
                                                        />
                                                    </div>
                                                )}

                                                {/* Rich Media: Video Link */}
                                                {notification.video_url && (
                                                    <a 
                                                        href={notification.video_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="mt-3 flex items-center gap-3 p-3 bg-loops-main rounded-2xl text-white group/video transition-all hover:bg-loops-main/90"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                                            <Play className="w-4 h-4 fill-current" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-black uppercase tracking-widest">Watch Presentation</p>
                                                            <p className="text-[8px] opacity-60 font-bold">Attachment Included</p>
                                                        </div>
                                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover/video:opacity-100 transition-opacity" />
                                                    </a>
                                                )}

                                                {/* CTA Button */}
                                                {notification.cta_link && (
                                                    <Button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onClose();
                                                            router.push(notification.cta_link);
                                                        }}
                                                        className="mt-4 w-full h-10 rounded-xl bg-loops-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-loops-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                    >
                                                        Explore Now
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6 opacity-30 group/empty">
                                    <div className="relative">
                                        <Bell className="w-16 h-16 text-loops-muted group-hover/empty:text-loops-primary transition-colors duration-500" />
                                        <div className="absolute -inset-4 bg-loops-primary/10 rounded-full blur-xl group-hover/empty:opacity-100 opacity-0 transition-opacity" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-black uppercase tracking-widest">All caught up</p>
                                        <p className="text-[10px] font-medium leading-relaxed max-w-[180px] mx-auto">Your campus alerts will appear here as they happen.</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        disabled={isPinging}
                                        onClick={sendTestNotification}
                                        className="rounded-xl border-loops-primary/20 text-loops-primary hover:bg-loops-primary/10 transition-all opacity-100"
                                    >
                                        {isPinging ? "Magic Pinging..." : "Send Test Magic Ping"}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-loops-border bg-loops-subtle/30 space-y-4">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                disabled={isPinging}
                                onClick={sendTestNotification}
                                className="w-full h-11 rounded-2xl border border-loops-primary/10 text-loops-primary font-black uppercase tracking-[0.2em] text-[10px] hover:bg-loops-primary/5 transition-all"
                            >
                                {isPinging ? "Syncing Magic..." : "Trigger Magic Ping"}
                            </Button>
                            <p className="text-[10px] text-center font-bold text-loops-muted uppercase tracking-[0.2em]">
                                Only your last 20 alerts are shown here
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
