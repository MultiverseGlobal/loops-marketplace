import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-loops-bg text-center p-6 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-loops-primary/5 rounded-full blur-[100px] -z-10" />

            <div className="w-24 h-24 bg-white border border-loops-border rounded-3xl shadow-xl flex items-center justify-center mb-8 animate-pulse">
                <Zap className="w-12 h-12 text-loops-primary" />
            </div>

            <h1 className="text-8xl font-display font-bold text-loops-primary italic tracking-tighter mb-4">404</h1>
            <h2 className="text-2xl font-bold font-display text-loops-main mb-4">Lost in the Loop?</h2>
            <p className="max-w-md text-loops-muted mb-10 leading-relaxed">
                The campus plug you're looking for might have moved or is out of stock. Let's get you back to the main loop.
            </p>

            <Link href="/">
                <Button className="h-14 px-8 bg-loops-primary text-white font-bold rounded-2xl shadow-lg shadow-loops-primary/20 hover:scale-105 transition-all text-lg group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Marketplace
                </Button>
            </Link>

            <div className="mt-20 flex gap-8 items-center opacity-30 grayscale pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-loops-main">Infinity Marketplace</span>
                <span className="w-1.5 h-1.5 bg-loops-primary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-loops-main">Verified Plugs</span>
            </div>
        </div>
    )
}
