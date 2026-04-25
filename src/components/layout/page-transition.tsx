'use client';

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ 
                    duration: 0.4, 
                    ease: [0.22, 1, 0.36, 1],
                    // Force the filter to 'none' after the animation completes
                    // to prevent rendering 'stuckness' on mobile
                }}
                onAnimationComplete={() => {
                    const el = document.getElementById('main-transition-wrapper');
                    if (el) el.style.filter = 'none';
                }}
                id="main-transition-wrapper"
                className="w-full min-h-screen"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
