import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://loops-marketplace.vercel.app';

    // Static routes
    const routes = [
        '',
        '/',
        '/services',
        '/founding-plugs',
        '/safety',
        '/terms',
        '/privacy',
        '/login',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return [...routes];
}
