/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                loops: {
                    primary: "var(--loops-primary, #059669)",
                    secondary: "var(--loops-secondary, #2563eb)",
                    accent: "var(--loops-accent, #f59e0b)",
                    vibrant: "#FF3366", // Energetic pink
                    energetic: "#7C3AED", // Vibrant purple
                    success: "#10B981",

                    // Backgrounds - High-end Light Mode style
                    bg: "#ffffff", // Crisp white
                    subtle: "#f8fafc", // Slate 50 - Very subtle background
                    card: "#ffffff", // White cards
                    border: "#f1f5f9", // Slate 100 - Even softer borders

                    // Text
                    main: "#0f172a", // Slate 900 - Deep readability
                    muted: "#64748b", // Slate 500 - Meta info
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)'],
                display: ['var(--font-outfit)'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'pulse-subtle': {
                    '0%, 100%': { transform: 'scale(1)', opacity: '1' },
                    '50%': { transform: 'scale(1.05)', opacity: '0.8' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                }
            },
            fontSize: {
                'xs-mobile': ['0.65rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
                'sm-mobile': ['0.8rem', { lineHeight: '1.25rem' }],
                'base-mobile': ['0.95rem', { lineHeight: '1.5rem' }],
                'h1-mobile': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
            }
        },
    },
    plugins: [],
};
