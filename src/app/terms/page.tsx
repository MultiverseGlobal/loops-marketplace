'use client';

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />
            <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                <h1 className="text-4xl font-bold font-display mb-8">Terms of Service & Community Guidelines</h1>
                <div className="prose prose-loops max-w-none space-y-6">
                    <section>
                        <h2 className="text-xl font-bold border-b border-loops-border pb-2 mb-4">1. Acceptance of Terms</h2>
                        <p>By accessing or using Loops, you agree to be bound by these Terms. Loops is a student-exclusive marketplace. Providing false information during verification (e.g., incorrect matric number) will result in immediate termination of access.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold border-b border-loops-border pb-2 mb-4">2. Marketplace Conduct & Safety</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Public Meetups:</strong> For your safety, all physical exchanges must take place in high-traffic, well-lit campus areas (e.g., libraries, student union hubs, or cafeterias).</li>
                            <li><strong>Daylight Hours:</strong> We strongly recommend completing transactions during daylight hours.</li>
                            <li><strong>Personal Responsibility:</strong> Loops facilitates connections but is not a party to the transactions. Trust your instincts; if a deal feels unsafe, do not proceed.</li>
                        </ul>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold border-b border-loops-border pb-2 mb-4">3. Prohibited Items & Academic Integrity</h2>
                        <p>The following are strictly prohibited on Loops:</p>
                        <ul className="list-disc pl-5 mt-2">
                            <li><strong>Academic Dishonesty:</strong> Selling or buying exam scripts, solved assignments, or providing services that violate university academic integrity policies.</li>
                            <li><strong>Illegal Substances:</strong> Drugs, alcohol, or any regulated substances.</li>
                            <li><strong>Dangerous Goods:</strong> Weapons, explosives, or hazardous materials.</li>
                        </ul>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold border-b border-loops-border pb-2 mb-4">4. The "Plug" Reputation</h2>
                        <p>Being a "Campus Plug" is a position of trust. Fraudulent listings, selling misrepresented items, or intentional "ghosting" of buyers will result in permanent suspension of your Plug status and potential removal from the platform.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold border-b border-loops-border pb-2 mb-4">5. Limitation of Liability</h2>
                        <p>Loops is not responsible for the quality, safety, or legality of the items or services listed. Users interact at their own risk. Always verify the item before making payment.</p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
