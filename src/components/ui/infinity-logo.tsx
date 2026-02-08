import React from 'react';

export function InfinityLogo({ className = "w-10 h-10", gradientId = "logo-gradient" }) {
    return (
        <svg
            viewBox="0 0 100 50"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
            </defs>
            {/* Clean, premium filled infinity shape */}
            <path
                d="M30 15C15 15 15 35 30 35C35 35 43 30 50 25C57 20 65 15 70 15C85 15 85 35 70 35C65 35 57 30 50 25C43 20 35 15 30 15ZM30 20C33 20 38 23 44 27C48 30 52 30 56 27C62 23 67 20 70 20C80 20 80 30 70 30C67 30 62 27 56 23C52 20 48 20 44 23C38 27 33 30 30 30C20 30 20 20 30 20Z"
                fill={`url(#${gradientId})`}
                fillRule="evenodd"
            />
        </svg>
    );
}
