/** @type {import('tailwindcss').Config} */
module.exports = {
  safelist: [
    'text-white',
    'border-border',
    'bg-white',
    'bg-zinc-800',
    'bg-zinc-900',
    'border-zinc-700',
    'bg-red-500',
    'bg-blue-600',
    'hover:bg-red-400',
    'hover:bg-red-600',
    'hover:bg-blue-500',
    'hover:bg-blue-600',
    'hover:bg-blue-700',
    'hover:bg-zinc-700',
    'hover:text-white',
    'text-zinc-400',
    'text-white/80',
    'bg-black/50',
    'bg-black/70',
    'bg-accent-secondary',
    'bg-accent-secondary/80',
    'opacity-0',
    'opacity-100',
    'transition-opacity',
    'transition-colors',
    'rounded-lg',
    'rounded-md',
    'rounded-full',
    'focus:ring-2',
    'focus:ring-red-500',
    'focus:outline-none',
    'focus:border-transparent',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'group-hover:opacity-100',
    'group-hover:text-white',
    'group-hover:bg-accent',
    'group-hover:bg-accent-secondary',
    'group-hover:bg-accent-secondary/80',
    'transition-all',
    'duration-200',
    'gap-2',
    'gap-3',
    'flex',
    'items-center',
    'justify-center',
    'font-bold',
    'font-semibold',
    'font-medium',
    'text-lg',
    'text-xl',
    'text-2xl',
    'text-3xl',
    'text-xs',
    'text-sm',
    'text-muted-foreground',
    'text-foreground',
    'text-accent-secondary',
    'bg-background',
    'bg-card',
    'bg-card-background',
    'border-card-border',
    'border',
    'border-transparent',
    'border-zinc-700',
    'border-border',
    'border-accent',
    'hover:border-accent',
    'hover:border-accent-secondary',
    'hover:border-accent-secondary/80',
    'hover:bg-background',
    'hover:bg-card',
    'hover:bg-card-background',
    'hover:bg-zinc-800',
    'hover:bg-zinc-900',
    'hover:bg-black/50',
    'hover:bg-black/70',
    'hover:bg-red-500',
    'hover:bg-red-600',
    'hover:bg-blue-600',
    'hover:bg-blue-700',
    'hover:text-blue-400',
    'hover:text-white',
    'hover:opacity-100',
    'hover:opacity-0',
    'hover:transition-opacity',
    'hover:transition-colors',
    'hover:rounded-lg',
    'hover:rounded-md',
    'hover:rounded-full',
    'hover:focus:ring-2',
    'hover:focus:ring-red-500',
    'hover:focus:outline-none',
    'hover:focus:border-transparent',
    'hover:disabled:opacity-50',
    'hover:disabled:cursor-not-allowed',
    'hover:group-hover:opacity-100',
    'hover:group-hover:text-white',
    'hover:group-hover:bg-accent',
    'hover:group-hover:bg-accent-secondary',
    'hover:group-hover:bg-accent-secondary/80',
    'hover:transition-all',
    'hover:duration-200',
    'hover:gap-2',
    'hover:gap-3',
    'hover:flex',
    'hover:items-center',
    'hover:justify-center',
    'hover:font-bold',
    'hover:font-semibold',
    'hover:font-medium',
    'hover:text-lg',
    'hover:text-xl',
    'hover:text-2xl',
    'hover:text-3xl',
    'hover:text-xs',
    'hover:text-sm',
    'hover:text-muted-foreground',
    'hover:text-foreground',
    'hover:text-accent-secondary',
    'hover:bg-background',
    'hover:bg-card',
    'hover:bg-card-background',
    'hover:border-card-border',
    'hover:border',
    'hover:border-transparent',
    'hover:border-zinc-700',
    'hover:border-border',
    'hover:border-accent',
    'hover:border-accent-secondary',
    'hover:border-accent-secondary/80',
  ],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--text-primary)',
        muted: {
          DEFAULT: 'var(--text-muted)',
          foreground: 'var(--text-muted)',
        },
        border: 'var(--card-border)',
        'card-border': 'var(--card-border)',
        card: {
          background: 'var(--card-background)',
          border: 'var(--card-border)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
        },
        button: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
        },
        shadow: {
          light: 'var(--shadow-light)',
          dark: 'var(--shadow-dark)',
        },
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
        white: '#ffffff',
        black: '#000000',
        red: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        blue: {
          400: '#4a90e2',
          500: '#002366',
          600: '#001a4d',
          700: '#001233',
        },
      },
      spacing: {
        'grid': '2px',
        'panel': '1px',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        'base': ['1rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        'lg': ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }],
        'xl': ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        '2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.025em' }],
        '3xl': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
        `,
        'carbon-fiber': `
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.03) 2px,
            rgba(255, 255, 255, 0.03) 4px
          )
        `,
      },
      backgroundSize: {
        'grid': '24px 24px',
        'carbon': '8px 8px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'wheel-spin': 'wheelSpin 0.5s ease-in-out',
        'tach-progress': 'tachProgress 2s ease-in-out',
        'smoke': 'smoke 2s ease-out forwards',
        'smokeRise': 'smokeRise 2.5s ease-out forwards',
      },
      keyframes: {
        wheelSpin: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        tachProgress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        smoke: {
          '0%': { 
            transform: 'translate(0, 0) scale(0.8)', 
            opacity: '0.6' 
          },
          '50%': { 
            transform: 'translate(-8px, -12px) scale(1.2)', 
            opacity: '0.4' 
          },
          '100%': { 
            transform: 'translate(-16px, -24px) scale(1.5)', 
            opacity: '0' 
          },
        },
        smokeRise: {
          '0%': { 
            transform: 'translate(0, 0) scale(0.6)', 
            opacity: '0.5' 
          },
          '30%': { 
            transform: 'translate(-2px, -6px) scale(1.2)', 
            opacity: '0.3' 
          },
          '70%': { 
            transform: 'translate(-6px, -14px) scale(1.4)', 
            opacity: '0.2' 
          },
          '100%': { 
            transform: 'translate(-10px, -22px) scale(1.6)', 
            opacity: '0' 
          },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.theme-transition': {
          transition: 'all 0.3s ease-in-out',
        },
        '.hover-lift': {
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        },
        '.hover-glow': {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 25px -3px rgba(58, 174, 216, 0.2)',
          },
        },
        '.like-animation': {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1) rotate(12deg)',
          },
        },
      }
      addUtilities(newUtilities)
    }
  ],
}; 