/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#F7F8FA',
          dark: '#0B0B0E',
        },
        primary: {
          DEFAULT: '#111111',
          dark: '#FFFFFF',
        },
        success: '#16A34A',
        expense: '#EF4444',
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#16161B',
        },
        border: {
          DEFAULT: '#ECEEF2',
          dark: '#26262E',
        },
        muted: {
          DEFAULT: '#6B7280',
          dark: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(17, 17, 17, 0.04), 0 4px 12px rgba(17, 17, 17, 0.04)',
        card: '0 1px 3px rgba(17, 17, 17, 0.04), 0 8px 24px rgba(17, 17, 17, 0.05)',
        floating: '0 8px 24px rgba(17, 17, 17, 0.14), 0 2px 6px rgba(17, 17, 17, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 240ms cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-down': 'slideDown 240ms cubic-bezier(0.22, 1, 0.36, 1)',
        'scale-in': 'scaleIn 180ms ease-out',
        'progress': 'progress 600ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        progress: {
          '0%': { width: '0%' },
        },
      },
    },
  },
  plugins: [],
}
