import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "../lib/utils";

// const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: {
        default: "Loops | The Campus Marketplace",
        template: "%s | Loops"
    },
    icons: {
        icon: "/logo.png",
        apple: "/logo.png",
    },
    description: "The economic nervous system of Nigerian student life. Buy, sell, and connect safely within your verified university network.",
    keywords: ["campus marketplace", "nigerian university", "student commerce", "loops", "university marketplace", "unilag marketplace", "uniabuja marketplace"],
    authors: [{ name: "Loops Team" }],
    metadataBase: new URL("https://loops-marketplace.vercel.app"),
    openGraph: {
        title: "Loops | The Campus Marketplace",
        description: "The economic nervous system of Nigerian student life. Buy, sell, and connect safely on campus.",
        type: "website",
        locale: "en_NG",
        siteName: "Loops",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Loops Marketplace"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Loops | The Campus Marketplace",
        description: "The economic nervous system of Nigerian student life.",
        images: ["/og-image.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
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
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PWALogic } from "../components/pwa-logic";
import { CartProvider } from "../context/cart-context";
import { NotificationProvider } from "../context/notification-context";
import { CookieConsent } from "../components/layout/cookie-consent";
import { AuthPromptProvider } from "../context/auth-prompt-context";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#6366f1" />
                
                {/* Social Sharing / WhatsApp / Twitter */}
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Loops" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@loops_campus" />
            </head>
            <body
                suppressHydrationWarning
                className={cn("font-sans antialiased bg-loops-bg text-loops-main selection:bg-loops-secondary/30")}
            >
                <PWALogic />
                <CampusProvider>
                    <ToastProvider>
                        <ModalProvider>
                            <AuthPromptProvider>
                                <CartProvider>
                                    <NotificationProvider>
                                        <PageTransition>
                                            {children}
                                            <CookieConsent />
                                        </PageTransition>
                                        <BottomNav />
                                    </NotificationProvider>
                                </CartProvider>
                            </AuthPromptProvider>
                            <Analytics />
                            <SpeedInsights />
                        </ModalProvider>
                    </ToastProvider>
                </CampusProvider>
            </body>
        </html>
    );
}

