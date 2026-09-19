/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: '#064E3B',       // Primary Deep Sustainable Green
          emerald: '#059669',     // Eco Green Accent
          yellow: '#EAB308',      // Eco Yellow / Solar Amber
          amber: '#F59E0B',       // Action Amber
          accent: '#10B981',      // Primary sustainability accent
          water: '#0EA5E9',       // Supporting water indicator blue
          light: '#ECFDF5',       // Mint wash
          dark: '#022C22',        // Deep forest night
          surface: '#F8FAFC',
          surfaceAlt: '#F1F5F9',
        },
        status: {
          normal: '#22C55E',     // Success / Normal Green
          warning: '#EAB308',    // Eco Warning Yellow
          danger: '#F97316',     // High Danger Orange
          critical: '#EF4444',   // Critical / Flood Red
          dark: '#0F172A',       // Dark Dashboard
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'Noto Sans Oriya', 'Noto Sans Telugu', 'Noto Sans Tamil', 'Noto Sans Bengali', 'Nirmala UI', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Inter', 'Noto Sans Devanagari', 'Noto Sans Oriya', 'Noto Sans Telugu', 'Noto Sans Tamil', 'Noto Sans Bengali', 'Nirmala UI', 'sans-serif']
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px -1px rgba(15, 76, 92, 0.05), 0 2px 4px -2px rgba(15, 76, 92, 0.05)',
        'card-hover': '0 10px 15px -3px rgba(15, 76, 92, 0.1), 0 4px 6px -4px rgba(15, 76, 92, 0.08)',
        'glow-accent': '0 0 15px rgba(14, 165, 233, 0.35)',
        'glow-critical': '0 0 15px rgba(239, 68, 68, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 2s linear infinite',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
