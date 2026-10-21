/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0B1120',
        },
        emerald: {
          950: '#022C22',
          900: '#064E3B',
          800: '#065F46',
          500: '#10B981',
          400: '#34D399',
          300: '#6EE7B7',
        },
        gold: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        trade: {
          /* Brand semantic tokens */
          green:  '#10B981', /* zero-duty / success */
          amber:  '#FBBF24', /* profit / highlight  */
          rose:   '#FB7185', /* loss / warning      */
          blue:   '#60A5FA', /* graph / info        */
        }
      },
      fontFamily: {
        sans:   ['Plus Jakarta Sans', 'Inter', 'Hind Siliguri', 'sans-serif'],
        bangla: ['Hind Siliguri', 'Noto Sans Bengali', 'sans-serif'],
        mono:   ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'wave':        'wave-bar 0.9s ease-in-out infinite',
        'mic-glow':    'mic-glow 1.3s ease-out infinite',
        'step-pop':    'step-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'shimmer':     'shimmer 1.6s linear infinite',
        'fade-in':     'fadeIn 0.2s ease-out',
        'slide-up':    'slideUp 0.25s ease-out',
      },
      keyframes: {
        'wave-bar': {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%':      { transform: 'scaleY(1)'   },
        },
        'mic-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(251,113,133,0.55)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(251,113,133,0)' },
        },
        'step-pop': {
          '0%':   { transform: 'scale(0.85)', opacity: '0' },
          '60%':  { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
      },
      boxShadow: {
        'em':    '0 0 0 3px rgba(16,185,129,0.25)',
        'em-lg': '0 4px 24px rgba(16,185,129,0.18)',
      },
      /* Minimum tap target: 44px x 44px (WCAG 2.1 / Apple HIG) */
      minHeight: {
        'tap': '44px',
      },
      minWidth: {
        'tap': '44px',
      },
    },
  },
  plugins: [],
}
