'use client';

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />
            <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                >
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-12">Privacy Policy & Data Rights</h1>
                    
                    <div className="prose prose-loops max-w-none space-y-12">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black italic border-b border-loops-border pb-2 uppercase tracking-tight">1. Data We Collect</h2>
                            <p className="text-loops-muted leading-relaxed">
                                To protect the campus community, Loops collects specific data to verify your student status:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-loops-muted">
                                <li>Full Name and Institutional Email address.</li>
                                <li>University Matriculation Number (Used only for one-time verification).</li>
                                <li>Transaction history and communication logs within the platform.</li>
                                <li>Bank account details for payout processing (Handled securely via Paystack).</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black italic border-b border-loops-border pb-2 uppercase tracking-tight">2. How We Use Your Data</h2>
                            <p className="text-loops-muted leading-relaxed">
                                Your data is used exclusively to facilitate safe commerce. We do not sell your personal information to third-party advertisers. Your matriculation number is never shown publicly and is only accessible to verified administrators for security audits.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black italic border-b border-loops-border pb-2 uppercase tracking-tight">3. Payment Security</h2>
                            <p className="text-loops-muted leading-relaxed">
                                Loops does not store your credit card or debit card details. All payment processing is handled by <strong>Paystack</strong>, a PCI-certified payment gateway. During Payouts, your bank account name is verified against our records to prevent identity theft.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black italic border-b border-loops-border pb-2 uppercase tracking-tight">4. Your Data Rights</h2>
                            <p className="text-loops-muted leading-relaxed">
                                You have the right to request a full export of your data or the deletion of your Loops account. Note that transaction records may be retained for a limited period to resolve existing disputes or comply with financial reporting regulations.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black italic border-b border-loops-border pb-2 uppercase tracking-tight">5. Cookies</h2>
                            <p className="text-loops-muted leading-relaxed">
                                We use essential cookies to keep you logged in and remember your campus preferences. By using the platform, you agree to the use of these functional cookies.
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
