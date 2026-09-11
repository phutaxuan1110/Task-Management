import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F9F9F7',
        ink: '#111111',
        rule: '#E5E5E0',
        accent: '#CC0000',
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Times New Roman"', 'serif'],
        body: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        full: '0px',
      },
      boxShadow: {
        hard: '4px 4px 0px 0px #111111',
        'hard-sm': '2px 2px 0px 0px #111111',
      },
      maxWidth: { screen: '100vw' },
      keyframes: {
        ticker: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'sheet-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        ticker: 'ticker 40s linear infinite',
        'sheet-up': 'sheet-up 200ms ease-out',
        'fade-in': 'fade-in 150ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config
