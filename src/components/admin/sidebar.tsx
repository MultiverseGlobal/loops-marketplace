'use client';

import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    School,
    ShieldAlert,
    ShoppingBag,
    Settings,
    ChevronLeft,
    ChevronRight,
    Search
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export type AdminView = 'dashboard' | 'users' | 'universities' | 'marketplace' | 'safety' | 'settings';

interface AdminSidebarProps {
    currentView: AdminView;
    onViewChange: (view: AdminView) => void;
}

export function AdminSidebar({ currentView, onViewChange }: AdminSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users' as const, label: 'User Manager', icon: Users },
        { id: 'universities' as const, label: 'Universities', icon: School },
        { id: 'marketplace' as const, label: 'Marketplace', icon: ShoppingBag },
        { id: 'safety' as const, label: 'Safety Hub', icon: ShieldAlert },
        { id: 'settings' as const, label: 'Settings', icon: Settings },
    ];

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? "80px" : "280px" }}
            className="fixed left-0 top-0 h-screen bg-white border-r border-loops-border z-[60] flex flex-col transition-all duration-300 ease-in-out"
        >
            {/* Logo Section */}
            <div className="p-6 flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-loops-primary rounded-xl flex-shrink-0 flex items-center justify-center text-white font-black italic">
                    L
                </div>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-display font-bold text-xl tracking-tight"
                    >
                        Command<span className="text-loops-primary">Center</span>
                    </motion.div>
                )}
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-4 space-y-2 py-4">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative",
                            currentView === item.id
                                ? "bg-loops-primary text-white shadow-lg shadow-loops-primary/20"
                                : "text-loops-muted hover:bg-loops-subtle hover:text-loops-main"
                        )}
                    >
                        <item.icon className={cn(
                            "w-5 h-5 flex-shrink-0",
                            currentView === item.id ? "text-white" : "group-hover:text-loops-primary"
                        )} />
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-bold text-sm tracking-wide"
                            >
                                {item.label}
                            </motion.span>
                        )}
                        {currentView === item.id && isCollapsed && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full" />
                        )}
                    </button>
                ))}
            </nav>

            {/* User Profile / Status Section */}
            <div className="p-4 border-t border-loops-border">
                {!isCollapsed && (
                    <div className="bg-loops-subtle p-4 rounded-2xl mb-4">
                        <p className="text-[10px] font-bold text-loops-muted uppercase tracking-widest mb-1">Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-loops-success animate-pulse" />
                            <span className="text-xs font-bold text-loops-main">System Online</span>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full h-10 flex items-center justify-center rounded-xl bg-loops-subtle text-loops-muted hover:bg-loops-border hover:text-loops-main transition-all"
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>
        </motion.aside>
    );
}
