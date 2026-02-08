'use client';

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-loops-bg text-loops-main">
            <Navbar />
            <main className="pt-32 pb-20 max-w-4xl mx-auto px-6">
                <h1 className="text-4xl font-bold font-display mb-8">Privacy Policy</h1>
                <div className="prose prose-loops max-w-none space-y-6">
                    <section>
                        <h2 className="text-xl font-bold border-b border-loops-border pb-2 mb-4">1. Data Collection</h2>
                        <p>We collect basic information required to provide the Loops service, including your name, university email, and WhatsApp number for buyer-seller coordination.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold border-b border-loops-border pb-2 mb-4">2. Usage of Data</h2>
                        <p>Your data is used strictly for authentication, verification of student status, and facilitating transactions on the marketplace. We do not sell your personal data to third parties.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold border-b border-loops-border pb-2 mb-4">3. Security</h2>
                        <p>We implement Row Level Security (RLS) on our databases to ensure that your sensitive information, such as carts and private messages, is only accessible to you.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold border-b border-loops-border pb-2 mb-4">4. Compliance</h2>
                        <p>Loops aims to comply with relevant data protection regulations in Nigeria (NDPR). Students have the right to request deletion of their data at any time.</p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
