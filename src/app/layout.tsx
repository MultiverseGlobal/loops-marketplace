import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: {
        default: "Loops | The Campus Marketplace",
        template: "%s | Loops"
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
    }
};

import { PageTransition } from "@/components/layout/page-transition";
import { CampusProvider } from "@/context/campus-context";
import { ToastProvider } from "@/context/toast-context";
import { ModalProvider } from "@/context/modal-context";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                suppressHydrationWarning
                className={cn(inter.variable, outfit.variable, "font-sans antialiased bg-loops-bg text-loops-main selection:bg-loops-secondary/30 pb-24 md:pb-0")}
            >
                <CampusProvider>
                    <ToastProvider>
                        <ModalProvider>
                            <PageTransition>{children}</PageTransition>
                            <BottomNav />
                        </ModalProvider>
                    </ToastProvider>
                </CampusProvider>
            </body>
        </html>
    );
}
