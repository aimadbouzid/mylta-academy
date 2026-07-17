/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        academy: {
          primary: '#a93232',
          light: '#d25b5b',
          dark: '#7d1f1f',
          surface: '#f1f5f7',
          surfaceDark: '#e7eef2',
          textMain: '#171717',
          border: '#e1e1e1',
          white: '#ffffff',
        },
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"DM Sans"', 'sans-serif'],
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
