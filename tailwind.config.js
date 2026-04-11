/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode with class strategy
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        siports: {
          primary: '#1B365D',    // Bleu marine profond (conservé)
          secondary: '#2E5984',  // Bleu océan (conservé)
          accent: '#4A90A4',     // Bleu turquoise (conservé)
          light: '#87CEEB',      // Bleu ciel (conservé)
          dark: '#0F2A44',       // Bleu nuit (conservé)
          gold: '#D4AF37',       // Or maritime (conservé)
          orange: '#FF6B35',     // Orange énergique (conservé)
          // Nouvelles couleurs inspirées du site SIPORTS
          'navy': '#0A1929',     // Bleu marine très foncé
          'teal': '#006D77',     // Bleu-vert océan
          'coral': '#FF7F50',    // Corail pour les accents
          'sand': '#F4E4BC',     // Sable pour les fonds clairs
          'maritime': '#2C5F5D', // Vert maritime
          gray: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'Inter', 'sans-serif']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }]
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem'
      },
      boxShadow: {
        'siports': '0 4px 6px -1px rgba(27, 54, 93, 0.1), 0 2px 4px -1px rgba(27, 54, 93, 0.06)',
        'siports-lg': '0 10px 15px -3px rgba(27, 54, 93, 0.1), 0 4px 6px -2px rgba(27, 54, 93, 0.05)'
      },
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
};
