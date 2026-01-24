import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-loops-dark text-white text-center p-4">
            <h2 className="text-6xl font-display font-bold text-loops-primary mb-4">404</h2>
            <p className="text-xl text-white/60 mb-8">This page got lost in the loop.</p>
            <Link href="/">
                <Button variant="outline" className="text-white border-white/10 hover:bg-white/5">
                    Return Home
                </Button>
            </Link>
        </div>
    )
}
