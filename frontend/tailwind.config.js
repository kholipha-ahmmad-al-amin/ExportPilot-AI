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
          950: '#090E17',
          900: '#0F1726',
          800: '#162238',
          700: '#1E2D47',
          600: '#334155',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50:  '#F8FAFC',
        },
        emerald: {
          950: '#022C22',
          900: '#064E3B',
          800: '#065F46',
          700: '#047857',
          600: '#059669',
          500: '#10B981',
          400: '#34D399',
          300: '#6EE7B7',
        },
        amber: {
          500: '#F59E0B',
          600: '#D97706',
        },
        rose: {
          500: '#F43F5E',
          600: '#E11D48',
        },
        trade: {
          green:  '#10B981', /* Zero-duty / Verified ESG */
          amber:  '#F59E0B', /* Tariff / Alert */
          rose:   '#F43F5E', /* Middleman Loss */
          blue:   '#38BDF8', /* Telemetry / Coordinates */
        }
      },
      fontFamily: {
        sans:   ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        bangla: ['Hind Siliguri', 'Noto Sans Bengali', 'sans-serif'],
        mono:   ['JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      animation: {
        'wave':        'wave-bar 0.9s cubic-bezier(0.65, 0, 0.35, 1) infinite',
        'fade-in':     'fadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up':    'slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'wave-bar': {
          '0%, 100%': { transform: 'scaleY(0.28)' },
          '50%':      { transform: 'scaleY(1)'   },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
      },
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
