'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an analytics service
        console.error(error)
    }, [error])

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-loops-dark text-white text-center p-4">
            <h2 className="text-4xl font-display font-bold text-red-500 mb-4">Something went wrong!</h2>
            <p className="text-white/60 mb-8">We encountered an error processing your request.</p>
            <div className="flex gap-4">
                <Button
                    onClick={() => reset()}
                    className="bg-white text-loops-dark hover:bg-white/90"
                >
                    Try again
                </Button>
            </div>
        </div>
    )
}
