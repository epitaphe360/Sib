import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'Georgia', 'serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        champagne: '#E7D192',
        stone: '#4A4A4A',
      },
      boxShadow: {
        airy: '0 20px 80px rgba(0,0,0,0.03)',
        'airy-md': '0 30px 100px rgba(0,0,0,0.05)',
      },
      borderWidth: {
        ultra: '0.5px',
      },
      transitionDuration: {
        '400': '400ms',
      },
      letterSpacing: {
        prestige: '0.2em',
        ultra: '0.35em',
      },
    },
  },
  plugins: [],
}

export default config
