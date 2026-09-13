import React from 'react';

/**
 * Modern, high-resolution vector logo for SUOWMRS.
 * Represents water conservation, circular reuse, and environmental sustainability.
 */
export default function Logo({ size = 'md', className = '', showText = false, textClassName = '' }) {
  const sizeMap = {
    xs: { box: 'w-6 h-6', icon: 24 },
    sm: { box: 'w-8 h-8', icon: 32 },
    md: { box: 'w-10 h-10', icon: 40 },
    lg: { box: 'w-12 h-12', icon: 48 },
    xl: { box: 'w-16 h-16', icon: 64 },
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`${dim.box} rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-400/20 shadow-md shadow-emerald-950/10 flex items-center justify-center flex-shrink-0 p-1 group-hover:scale-105 transition-transform`}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Water Flow Gradient */}
            <linearGradient id="suowmrs-water-grad" x1="10%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="60%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>

            {/* Circular Reuse Ring Gradient */}
            <linearGradient id="suowmrs-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="45%" stopColor="#0D9488" />
              <stop offset="85%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            {/* Eco Leaf Gradient */}
            <linearGradient id="suowmrs-leaf-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#15803D" />
              <stop offset="60%" stopColor="#16A34A" />
              <stop offset="100%" stopColor="#4ADE80" />
            </linearGradient>

            {/* Solar Amber Accent */}
            <linearGradient id="suowmrs-amber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            <filter id="suowmrs-shadow" x="-10%" y="-10%" width="130%" height="130%" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#042f2e" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background subtle circular flow track */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="url(#suowmrs-ring-grad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="205 45"
            transform="rotate(-85 50 50)"
            filter="url(#suowmrs-shadow)"
          />

          {/* Inner Counter-Flow Water Wave */}
          <path
            d="M26 53 C26 38, 40 28, 54 30 C44 33, 34 40, 35 52 C36 63, 46 68, 56 65 C68 62, 73 49, 70 42 C67 52, 58 60, 48 59 C37 58, 30 55, 26 53 Z"
            fill="url(#suowmrs-ring-grad)"
            opacity="0.85"
          />

          {/* Central Water Droplet */}
          <path
            d="M50 25 C50 25, 41 38, 41 46 C41 51.5, 45 55, 50 55 C55 55, 59 51.5, 59 46 C59 38, 50 25, 50 25 Z"
            fill="url(#suowmrs-water-grad)"
            filter="url(#suowmrs-shadow)"
          />

          {/* Highlight on Droplet */}
          <ellipse cx="47" cy="45" rx="1.8" ry="3.5" transform="rotate(-25 47 45)" fill="white" opacity="0.65" />

          {/* Triple Sprouting Sustainability Leaves */}
          {/* Main Top Leaf */}
          <path
            d="M58 44 C67 36, 79 36, 82 28 C74 31, 67 36, 61 44 Z"
            fill="url(#suowmrs-leaf-grad)"
            filter="url(#suowmrs-shadow)"
          />
          {/* Middle Leaf */}
          <path
            d="M62 48 C72 45, 83 48, 86 42 C78 43, 70 47, 65 50 Z"
            fill="url(#suowmrs-leaf-grad)"
            filter="url(#suowmrs-shadow)"
          />
          {/* Lower Sprout Leaf / Solar Amber Bud */}
          <circle cx="61" cy="53" r="3.2" fill="url(#suowmrs-amber-grad)" />
        </svg>
      </div>

      {showText && (
        <div className={`flex flex-col leading-none ${textClassName}`}>
          <span className="font-black text-lg sm:text-2xl tracking-tight text-slate-900 dark:text-white font-display">
            SUOW<span className="text-amber-500">MRS</span>
          </span>
          <span className="text-[10px] sm:text-xs tracking-widest uppercase font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
            Water Monitoring & Reuse
          </span>
        </div>
      )}
    </div>
  );
}
