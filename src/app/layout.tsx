import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "../lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: {
        default: "Loops | The Campus Marketplace",
        template: "%s | Loops"
    },
    icons: {
        icon: "/logo.png",
        apple: "/logo.png",
    },
    description: "The economic nervous system of Nigerian student life. Buy, sell, and trade safely within your verified university network.",
    keywords: ["campus marketplace", "nigerian university", "student trade", "loops", "university marketplace"],
    openGraph: {
        title: "Loops | The Campus Marketplace",
        description: "The economic nervous system of Nigerian student life.",
        type: "website",
        locale: "en_NG",
        siteName: "Loops"
    },
    twitter: {
        card: "summary_large_image",
        title: "Loops | The Campus Marketplace",
        description: "The economic nervous system of Nigerian student life.",
    },
    robots: {
        index: true,
        follow: true
    },
    themeColor: '#10b981',
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Loops',
    },
};

import { PageTransition } from "../components/layout/page-transition";
import { CampusProvider } from "../context/campus-context";
import { ToastProvider } from "../context/toast-context";
import { ModalProvider } from "../context/modal-context";
import { BottomNav } from "../components/layout/bottom-nav";
import { Analytics } from "@vercel/analytics/next";
import { PWALogic } from "../components/pwa-logic";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                suppressHydrationWarning
                className={cn(inter.variable, outfit.variable, "font-sans antialiased bg-loops-bg text-loops-main selection:bg-loops-secondary/30")}
            >
                <PWALogic />
                <CampusProvider>
                    <ToastProvider>
                        <ModalProvider>
                            <PageTransition>{children}</PageTransition>
                            <BottomNav />
                            <Analytics />
                        </ModalProvider>
                    </ToastProvider>
                </CampusProvider>
            </body>
        </html>
    );
}
