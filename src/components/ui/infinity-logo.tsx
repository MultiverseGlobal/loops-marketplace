import React from 'react';

export function InfinityLogo({ className = "w-10 h-10", gradientId = "logo-gradient" }) {
    return (
        <svg
            viewBox="0 0 100 50"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" /> {/* Emerald-500 */}
                    <stop offset="100%" stopColor="#059669" /> {/* Teal-600 */}
                </linearGradient>
            </defs>
            <path
                d="M30 15C15 15 15 35 30 35C35 35 43 30 50 25C57 20 65 15 70 15C85 15 85 35 70 35C65 35 57 30 50 25C43 20 35 15 30 15Z"
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
