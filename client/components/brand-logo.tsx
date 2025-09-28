import * as React from "react"

export default function VahiniLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Vahini logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="vh-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <filter id="vh-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
        </filter>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#vh-grad)" opacity="0.2" />
      <path
        d="M14 14 L34 14 L28 30 L50 30 L22 50 L30 34 L14 34 Z"
        fill="url(#vh-grad)"
        filter="url(#vh-shadow)"
      />
    </svg>
  )
}
