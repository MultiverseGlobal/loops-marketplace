'use client';

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />
            <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                <h1 className="text-4xl font-bold font-display mb-8">Terms of Service</h1>
                <div className="prose prose-loops max-w-none space-y-6">
                    <section>
                        <h2 className="text-xl font-bold border-b border-loops-border pb-2 mb-4">1. Acceptance of Terms</h2>
                        <p>By using Loops, you agree to abide by these terms. Loops is a student-to-student marketplace designed for university campuses.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold border-b border-loops-border pb-2 mb-4">2. Marketplace Conduct</h2>
                        <p>Loops facilitates connections but is not responsible for the quality, safety, or legality of the items listed. All transactions are completed person-to-person.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold border-b border-loops-border pb-2 mb-4">3. Prohibited Items</h2>
                        <p>Users are strictly prohibited from listing illegal substances, weapons, or any items that violate university policy.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold border-b border-loops-border pb-2 mb-4">4. Account Responsibility</h2>
                        <p>You are responsible for maintaining the security of your account. Any suspicious activity should be reported to the Loops team immediately.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold border-b border-loops-border pb-2 mb-4">5. Termination</h2>
                        <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity within the marketplace.</p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
