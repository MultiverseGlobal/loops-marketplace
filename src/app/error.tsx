'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Activity, RefreshCcw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-loops-bg text-center p-6 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px] -z-10" />

            <div className="w-20 h-20 bg-white border border-loops-border rounded-3xl shadow-xl flex items-center justify-center mb-8">
                <Activity className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-4xl font-display font-bold text-loops-main mb-4 tracking-tight">Loop Interrupted</h1>
            <p className="max-w-md text-loops-muted mb-10 leading-relaxed">
                Something went wrong while loading this part of the marketplace. Our verification plugs are on it.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    onClick={() => reset()}
                    className="h-14 px-8 bg-loops-primary text-white font-bold rounded-2xl shadow-lg shadow-loops-primary/20 hover:scale-105 transition-all text-lg group"
                >
                    <RefreshCcw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    Repair the Loop
                </Button>
                <Button
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                    className="h-14 px-8 border-loops-border text-loops-main font-bold rounded-2xl hover:bg-loops-subtle transition-all text-lg"
                >
                    Back to Home
                </Button>
            </div>

            <div className="mt-20">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500/50">Error ID: {error.digest || 'Internal Loop Failure'}</p>
            </div>
        </div>
    )
}
