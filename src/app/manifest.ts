import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Loops | Campus Marketplace',
        short_name: 'Loops',
        description: 'The economic nervous system of Nigerian student life.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#10b981',
        icons: [
            {
                src: '/favicon-l.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
            {
                src: '/logo.png',
                sizes: '512x512',
                type: 'image/png',
            }
        ],
    }
}
