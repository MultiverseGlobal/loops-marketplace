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
                    success: "#10B981",

                    // Backgrounds - High-end Light Mode style
                    bg: "#ffffff", // Crisp white
                    subtle: "#f8fafc", // Slate 50 - Very subtle background
                    card: "#ffffff", // White cards
                    border: "#e2e8f0", // Slate 200 - Soft borders

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
                }
            }
        },
    },
    plugins: [],
};
