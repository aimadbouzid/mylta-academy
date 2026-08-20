/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Palier intermédiaire entre le mobile étroit et `sm` (640px).
      // CourseCard s'en sert pour choisir un libellé de bouton selon la place
      // disponible ; sans ce point de rupture, les classes `xs:` ne sont pas
      // générées et plusieurs libellés s'affichent en même temps.
      screens: {
        xs: '475px',
      },
      colors: {
        // Tokens branchés sur les variables CSS de src/index.css.
        // `<alpha-value>` préserve les modificateurs d'opacité Tailwind
        // (text-academy-textMain/50…), très utilisés dans le projet.
        academy: {
          primary:     'rgb(var(--academy-primary) / <alpha-value>)',
          light:       'rgb(var(--academy-light) / <alpha-value>)',
          dark:        'rgb(var(--academy-dark) / <alpha-value>)',
          surface:     'rgb(var(--academy-surface) / <alpha-value>)',
          surfaceDark: 'rgb(var(--academy-surface-dark) / <alpha-value>)',
          textMain:    'rgb(var(--academy-text) / <alpha-value>)',
          border:      'rgb(var(--academy-border) / <alpha-value>)',
          // Texte/icône posé SUR un fond `academy-primary` : blanc en clair,
          // noir en sombre (où l'accent devient blanc). À utiliser partout où
          // le code écrivait `text-white` sur une surface de marque.
          onPrimary:   'rgb(var(--academy-on-primary) / <alpha-value>)',
          // `white` désigne les cartes : en sombre, ce n'est plus du blanc.
          white:       'rgb(var(--academy-card) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans:    ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 40px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out forwards',
        'fade-up':    'fadeUp 0.6s ease-out forwards',
        'shimmer':    'shimmer 1.8s ease-in-out infinite',
        'pulse-gold': 'pulseGold 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'slide-in':   'slideIn 0.3s ease-out forwards',
        'shine':      'shine 3s ease-in-out infinite',
        'marquee-text': 'marqueeText 15s linear infinite',
      },
      keyframes: {
        fadeIn:     { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        fadeUp:     { '0%': { opacity: 0, transform: 'translateY(24px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        shimmer:    { '0%': { backgroundPosition: '-600px 0' }, '100%': { backgroundPosition: '600px 0' } },
        pulseGold:  { '0%,100%': { boxShadow: '0 0 15px rgba(59,130,246,0.15)' }, '50%': { boxShadow: '0 0 45px rgba(59,130,246,0.45)' } },
        pulseGlow:  { '0%,100%': { boxShadow: '0 0 15px rgba(255,255,255,0.1)' }, '50%': { boxShadow: '0 0 30px rgba(255,255,255,0.4)' } },
        float:      { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        slideIn:    { '0%': { opacity: 0, transform: 'translateX(20px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        shine:      { '0%': { left: '-100%' }, '20%,100%': { left: '200%' } },
        marqueeText: { '0%': { transform: 'translateX(100vw)' }, '100%': { transform: 'translateX(-100%)' } },
      },
      safelist: [
        'from-blue-900', 'to-indigo-950', 'via-slate-900',
        'from-teal-900', 'to-emerald-950', 'via-teal-950',
        'from-cyan-900', 'to-blue-950', 'via-sky-950',
      ],
    },
  },
  plugins: [],
}
