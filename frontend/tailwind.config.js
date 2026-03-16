/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary palette — deep slate navy
        ink: {
          50:  '#F4F5F7',
          100: '#E8EAF0',
          200: '#C9CDD9',
          300: '#9EA5B8',
          400: '#6B7694',
          500: '#3E4A6A',
          600: '#2A3555',
          700: '#1C2540',  // primary dark navy
          800: '#131A2E',
          900: '#0B1020',
        },
        // Accent — warm antique gold
        gold: {
          50:  '#FAF5E8',
          100: '#F3E5C0',
          200: '#E8CD88',
          300: '#DCAE50',
          400: '#C9A84C',  // primary gold
          500: '#B08C38',
          600: '#8C6E28',
          700: '#6A511C',
          800: '#4A380F',
          900: '#2C2007',
        },
        // Neutral warm — warm stone/cream
        stone: {
          50:  '#FAFAF8',
          100: '#F5F4F0',
          200: '#ECEAE3',
          300: '#D8D5CB',
          400: '#B8B4A8',
          500: '#8C8880',
          600: '#6A6760',
          700: '#4D4A44',
          800: '#332F2A',
          900: '#1C1A16',
        },
        // Semantic
        success: '#2D7A4F',
        warning: '#B08C38',
        danger:  '#8C2A2A',
        info:    '#2A4B8C',
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        serif:   ['"DM Serif Display"', 'Georgia', 'serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'none': '0',
        'sm':   '2px',
        DEFAULT: '4px',
        'md':   '6px',
        'lg':   '8px',
        'xl':   '12px',
        '2xl':  '16px',
      },
      boxShadow: {
        'sharp':   '4px 4px 0px 0px rgba(28,37,64,0.15)',
        'sharp-gold': '4px 4px 0px 0px rgba(201,168,76,0.4)',
        'card':    '0 1px 3px rgba(28,37,64,0.08), 0 4px 16px rgba(28,37,64,0.06)',
        'card-hover': '0 4px 8px rgba(28,37,64,0.10), 0 12px 32px rgba(28,37,64,0.10)',
        'float':   '0 8px 32px rgba(28,37,64,0.16)',
      },
      animation: {
        'fade-up':     'fadeUp 0.6s ease forwards',
        'fade-in':     'fadeIn 0.4s ease forwards',
        'slide-right': 'slideRight 0.4s ease forwards',
        'scale-in':    'scaleIn 0.3s ease forwards',
        'shimmer':     'shimmer 1.5s infinite',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'grid-ink':    'radial-gradient(circle, rgba(28,37,64,0.06) 1px, transparent 1px)',
        'noise':       "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
