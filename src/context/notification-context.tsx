'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from './toast-context';
import { User } from '@supabase/supabase-js';

type NotificationContextType = {
    notifications: any[];
    unreadCount: number;
    unreadMessagesCount: number;
    pendingLoopsCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const [pendingLoopsCount, setPendingLoopsCount] = useState(0);
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();
    const toast = useToast();

    const fetchNotifications = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (data && !error) {
            setNotifications(data);
            const unread = data.filter((n: any) => !n.read);
            setUnreadCount(unread.length);
            setUnreadMessagesCount(unread.filter((n: any) => n.type === 'message').length);
            setPendingLoopsCount(unread.filter((n: any) => n.type === 'loop' || n.type === 'transaction').length);
        }
    }, [supabase]);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) fetchNotifications(user.id);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const nextUser = session?.user ?? null;
            setUser(nextUser);
            if (nextUser) fetchNotifications(nextUser.id);
            else {
                setNotifications([]);
                setUnreadCount(0);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase, fetchNotifications]);

    useEffect(() => {
        if (!user) return;

        // Request browser notification permissions
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const channel = supabase
            .channel(`realtime-notifications-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    const newNotif = payload.new;
                    setNotifications(prev => [newNotif, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    
                    if (newNotif.type === 'message') {
                        setUnreadMessagesCount(prev => prev + 1);
                    }
                    if (newNotif.type === 'loop' || newNotif.type === 'transaction') {
                        setPendingLoopsCount(prev => prev + 1);
                    }

                    // 1. In-App Toast
                    if (newNotif.type === 'engagement') {
                        toast.success(`🔔 ${newNotif.title}`);
                    } else {
                        toast.success(`${newNotif.title}: ${newNotif.message.slice(0, 60)}${newNotif.message.length > 60 ? '...' : ''}`);
                    }

                    // 2. System/OS Notification (The "Drop")
                    if ('Notification' in window && Notification.permission === 'granted') {
                        const systemNotif = new Notification(newNotif.title, {
                            body: newNotif.message,
                            icon: '/logo.png', // Ensure this exists in public folder
                            tag: newNotif.id,
                        });

                        systemNotif.onclick = () => {
                            window.focus();
                            if (newNotif.link) window.location.href = newNotif.link;
                        };
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, supabase, toast]);

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);

        if (!error) {
            const markedNotif = notifications.find(n => n.id === id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            if (markedNotif?.type === 'message') setUnreadMessagesCount(prev => Math.max(0, prev - 1));
            if (markedNotif?.type === 'loop' || markedNotif?.type === 'transaction') setPendingLoopsCount(prev => Math.max(0, prev - 1));
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false);

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            setUnreadMessagesCount(0);
            setPendingLoopsCount(0);
        }
    };

    const refreshNotifications = async () => {
        if (user) await fetchNotifications(user.id);
    };

    const value = {
        notifications,
        unreadCount,
        unreadMessagesCount,
        pendingLoopsCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
