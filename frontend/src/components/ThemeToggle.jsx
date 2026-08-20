import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/**
 * Bascule clair / sombre.
 * Les deux icônes sont superposées et animées en rotation+opacité : la
 * transition reste fluide, sans saut de mise en page au changement d'icône.
 */
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
      className={`relative w-9 h-9 rounded-full flex items-center justify-center
                  text-academy-textMain/70 hover:text-academy-textMain
                  hover:bg-academy-textMain/5 transition-colors ${className}`}
    >
      <Sun
        size={17}
        className={`absolute transition-all duration-300 ${
          isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        }`}
      />
      <Moon
        size={17}
        className={`absolute transition-all duration-300 ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
        }`}
      />
    </button>
  )
}
