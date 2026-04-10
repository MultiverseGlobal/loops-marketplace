'use client';

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />
            <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                >
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-12">Terms of Service & Escrow Agreement</h1>
                    
                    <div className="prose prose-loops max-w-none space-y-12">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black italic border-b border-loops-border pb-2 uppercase tracking-tight">1. The "Loop" Community Trust</h2>
                            <p className="text-loops-muted leading-relaxed">
                                Loops is a student-exclusive marketplace. By accessing the platform, you represent that you are a verified student of your university node. Any attempt to use the platform with a fake institutional identity or matriculation number will result in an immediate and permanent ban.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black italic border-b border-loops-border pb-2 uppercase tracking-tight">2. The Escrow Handshake</h2>
                            <p className="text-loops-muted leading-relaxed font-bold">
                                All financial transactions on Loops are protected by our Escrow Handshake system.
                            </p>
                            <ul className="list-disc pl-5 space-y-3 text-loops-muted">
                                <li><strong>Fund Hold:</strong> When a buyer pays for a "Drop," the money is held by Loops. The seller is notified but cannot withdraw the funds yet.</li>
                                <li><strong>Verification:</strong> Funds are only released to the seller once the buyer scans the seller's Handshake QR code.</li>
                                <li><strong>Finality:</strong> Scanning the QR code represents a "Safe Handshake." By scanning, the buyer confirms they have inspected and accepted the item. <strong>Handshakes are non-reversible and non-refundable.</strong></li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black italic border-b border-loops-border pb-2 uppercase tracking-tight">3. Platform Fees & Payouts</h2>
                            <p className="text-loops-muted leading-relaxed">
                                To maintain the security and speed of the campus economy, Loops charges a 5% platform fee on all successful transactions. This fee is automatically deducted at the time of the Handshake release. Payouts to sellers are processed via Paystack to their verified Nigerian bank accounts.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black italic border-b border-loops-border pb-2 uppercase tracking-tight">4. Prohibited Content</h2>
                            <p className="text-loops-muted leading-relaxed">
                                Users are strictly prohibited from listing:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-loops-muted">
                                <li>Academic dishonesty materials (Exam scripts, pre-solved assignments).</li>
                                <li>Alcohol, drugs, or illegal substances.</li>
                                <li>Firearms or dangerous goods.</li>
                                <li>Adult content or services.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black italic border-b border-loops-border pb-2 uppercase tracking-tight">5. Dispute Resolution</h2>
                            <p className="text-loops-muted leading-relaxed">
                                If an item is not as described, or a party fails to meet at the agreed campus spot, a user may open a <strong>Dispute</strong>. Once a dispute is opened, funds are frozen until a Loops Admin reviews the case. Admin decisions on fund release or refunds are final.
                            </p>
                        </section>
                    </div>

                    <div className="pt-12 text-xs text-loops-muted font-bold uppercase tracking-widest opacity-50">
                        Last Updated: April 10, 2026
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
