/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ===========================================================
         * SIB 2026 — Design System unifié
         * Palette: primaire bleu identitaire + neutres chauds
         * =========================================================== */

        /* Primaire — bleu identitaire (navigation, CTA, liens actifs) */
        primary: {
          50:  '#F0F5FB',
          100: '#DCE8F3',
          200: '#BAD2E8',
          300: '#8FB4D6',
          400: '#5E8FBE',
          500: '#2E5984',
          600: '#1B365D',
          700: '#112744',
          800: '#0A1C32',
          900: '#07182C',
          DEFAULT: '#1B365D',
        },

        /* Neutres chauds — structure 90% du site */
        neutral: {
          0:   '#FFFFFF',
          50:  '#FAFAF7',
          100: '#F4F4EE',
          200: '#E8E8E0',
          300: '#D1D1C7',
          400: '#A8A89E',
          500: '#787872',
          600: '#5C5C55',
          700: '#3E3E38',
          800: '#26261F',
          900: '#1A1A17',
        },

        /* Accent — bleu secondaire (CTA, highlights) */
        accent: {
          50:  '#F0F5FB',
          100: '#DCE8F3',
          200: '#BAD2E8',
          500: '#2E5984',
          600: '#1B365D',
          700: '#112744',
          DEFAULT: '#2E5984',
        },

        /* Couleurs fonctionnelles — statuts uniquement */
        success: {
          50: '#ECFDF5', 100: '#D1FAE5', 500: '#15803D', 600: '#166534', DEFAULT: '#15803D',
        },
        warning: {
          50: '#FFFBEB', 100: '#FEF3C7', 500: '#B45309', 600: '#92400E', DEFAULT: '#B45309',
        },
        danger: {
          50: '#FEF2F2', 100: '#FEE2E2', 500: '#B91C1C', 600: '#991B1B', DEFAULT: '#B91C1C',
        },
        info: {
          50: '#EFF6FF', 100: '#DBEAFE', 500: '#1D4ED8', 600: '#1E40AF', DEFAULT: '#1D4ED8',
        },

        /* ===========================================================
         * Alias rétrocompatibles — mappent l'existant vers le nouveau
         * système pour éviter toute régression pendant la migration.
         * =========================================================== */
        sib: {
          primary:   '#001b38',
          secondary: '#00162f',
          accent:    '#f47920',
          light:     '#f7f7f5',
          dark:      '#00162f',
          gold:      '#f47920',
          orange:    '#f47920',
          navy:      '#001b38',
          'navy-deep': '#00162f',
          'navy-footer': '#00172f',
          paper:     '#f7f7f5',
          ink:       '#09223b',
          teal:      '#2E5984',
          coral:     '#f47920',
          sand:      '#f1f3f4',
          maritime:  '#001b38',
          gray: {
            50:  '#FAFAF7',
            100: '#F4F4EE',
            200: '#E8E8E0',
            300: '#D1D1C7',
            400: '#A8A89E',
            500: '#787872',
            600: '#5C5C55',
            700: '#3E3E38',
            800: '#26261F',
            900: '#1A1A17',
          },
        },
        SIB: {
          primary:   '#1B365D',
          secondary: '#2E5984',
          accent:    '#5E8FBE',
          light:     '#DCE8F3',
          dark:      '#07182C',
          gold:      '#2E5984',
          orange:    '#F39200',
        },
        urba: {
          blue:           '#1B365D',
          lavender:       '#FAFAF7',
          orange:         '#F39200',
          text:           '#1A1A17',
          secondary:      '#5C5C55',
          success:        '#15803D',
          alert:          '#B91C1C',
          gold:           '#2E5984',
          white:          '#FFFFFF',
          'blue-dark':    '#112744',
          'blue-light':   '#5E8FBE',
          'orange-light': '#FFE4C4',
        },
      },

      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['"Barlow Condensed"', 'Inter', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Inter', 'sans-serif'],
      },

      fontSize: {
        'xs':   ['0.75rem',  { lineHeight: '1.25rem' }],
        'sm':   ['0.875rem', { lineHeight: '1.375rem' }],
        'base': ['0.9375rem', { lineHeight: '1.6' }],
        'lg':   ['1.0625rem', { lineHeight: '1.65' }],
        'xl':   ['1.25rem',  { lineHeight: '1.6' }],
        '2xl':  ['1.5rem',   { lineHeight: '1.4' }],
        '3xl':  ['1.875rem', { lineHeight: '1.25' }],
        '4xl':  ['2.25rem',  { lineHeight: '1.15' }],
        '5xl':  ['2.75rem',  { lineHeight: '1.1' }],
        '6xl':  ['3.25rem',  { lineHeight: '1.05' }],
      },

      spacing: {
        '18':  '4.5rem',
        '88':  '22rem',
        '128': '32rem',
      },

      borderRadius: {
        'sm':  '0.375rem',
        'md':  '0.5rem',
        'lg':  '0.625rem',
        'xl':  '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },

      boxShadow: {
        /* Ombres unifiées — 3 niveaux subtils */
        'xs':    '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'sm':    '0 1px 2px 0 rgba(15, 23, 42, 0.05), 0 1px 3px 0 rgba(15, 23, 42, 0.06)',
        'md':    '0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        'lg':    '0 10px 20px -8px rgba(15, 23, 42, 0.10), 0 4px 8px -2px rgba(15, 23, 42, 0.06)',
        'xl':    '0 20px 40px -12px rgba(15, 23, 42, 0.14), 0 8px 16px -4px rgba(15, 23, 42, 0.08)',
        '2xl':   '0 32px 64px -16px rgba(15, 23, 42, 0.18)',
        'inner-soft': 'inset 0 1px 2px 0 rgba(15, 23, 42, 0.05)',

        /* Alias rétrocompat — mappent vers les nouvelles ombres */
        'sib':    '0 1px 2px 0 rgba(15, 23, 42, 0.05), 0 1px 3px 0 rgba(15, 23, 42, 0.06)',
        'sib-lg': '0 10px 20px -8px rgba(15, 23, 42, 0.10), 0 4px 8px -2px rgba(15, 23, 42, 0.06)',
        'sib-xl': '0 20px 40px -12px rgba(15, 23, 42, 0.14), 0 8px 16px -4px rgba(15, 23, 42, 0.08)',
      },

      letterSpacing: {
        'tight':   '-0.015em',
        'tighter': '-0.025em',
        'display': '-0.02em',
      },

      maxWidth: {
        'container': '1280px',
        'content': '1180px',
        'prose-md':  '65ch',
      },

      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      animation: {
        'blob':        'blob 7s infinite',
        'fade-in':     'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in-up':  'fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-in':    'slideIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in':    'scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'shimmer':     'shimmer 2.5s linear infinite',
        'float':       'float 6s ease-in-out infinite',
        'pulse-soft':  'pulseSoft 3s ease-in-out infinite',
      },

      keyframes: {
        blob: {
          '0%':   { transform: 'translate(0px, 0px) scale(1)' },
          '33%':  { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%':  { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
};
