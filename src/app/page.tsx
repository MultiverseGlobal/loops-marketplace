'use client';

import { Navbar } from "../components/layout/navbar";
import { PulseFeed } from "../components/ui/pulse-feed";
import { Footer } from "../components/layout/footer";
import { CampusSelector } from "../components/ui/campus-selector";
import { Button } from "../components/ui/button";
import { useCampus } from "../context/campus-context";
import { useRouter } from "next/navigation";
import { Sparkles, Search } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
    const { campus, loading } = useCampus();
    const router = useRouter();

    if (loading) return null;


    return (
        <div className="bg-loops-bg min-h-screen">
            <Navbar />
            <CampusSelector />
            
            {/* Restored Simple Feed Layout */}
            <main className="pt-24 pb-24">
                <PulseFeed campusId={campus?.id} />
            </main>



            <Footer />
        </div>
    );
}
