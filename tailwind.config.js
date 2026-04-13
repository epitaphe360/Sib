/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode with class strategy
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette officielle SIB — Salon International du Bâtiment
        sib: {
          navy:         '#1B365D',  // Bleu architecte — couleur primaire
          'navy-light': '#2E5984',  // Bleu moyen
          'navy-dark':  '#0F2034',  // Bleu nuit
          gold:         '#C9A84C',  // Or architectural — accent premium
          'gold-light': '#E8C96A',  // Or clair
          'gold-dark':  '#A88830',  // Or profond
          green:        '#2D6A4F',  // Vert construction durable
          'green-light':'#3D8A65',
          bg:           '#F8FBFF',  // Fond de base
          surface:      '#FFFFFF',  // Surface cartes
          anthracite:   '#1A2332',  // Texte principal
          gray: {
            50:  '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
          },
        },
        // Aliases pour rétrocompatibilité (classes bg-SIB-primary, text-SIB-gold, etc.)
        'SIB-primary':   '#1B365D',
        'SIB-secondary': '#2E5984',
        'SIB-gold':      '#C9A84C',
        'SIB-accent':    '#2D6A4F',
        // Ancien namespace conservé pour migration progressive
        siports: {
          primary:   '#1B365D',
          secondary: '#2E5984',
          gold:      '#C9A84C',
          orange:    '#FF6B35',
        },
      },
      fontFamily: {
        sans: ['"Open Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['"Big Shoulders Display"', '"Open Sans"', 'sans-serif']
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
        'sib':    '0 4px 6px -1px rgba(27, 54, 93, 0.12), 0 2px 4px -1px rgba(27, 54, 93, 0.07)',
        'sib-lg': '0 10px 15px -3px rgba(27, 54, 93, 0.12), 0 4px 6px -2px rgba(27, 54, 93, 0.07)',
        'sib-xl': '0 18px 38px -10px rgba(27, 54, 93, 0.18), 0 12px 22px -8px rgba(27, 54, 93, 0.12)',
        // Rétrocompatibilité
        'siports':    '0 4px 6px -1px rgba(27, 54, 93, 0.1), 0 2px 4px -1px rgba(27, 54, 93, 0.06)',
        'siports-lg': '0 10px 15px -3px rgba(27, 54, 93, 0.1), 0 4px 6px -2px rgba(27, 54, 93, 0.05)',
        'siports-xl': '0 18px 38px -18px rgba(7, 32, 57, 0.45), 0 12px 22px -16px rgba(7, 32, 57, 0.32)',
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
