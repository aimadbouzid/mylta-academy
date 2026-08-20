// Logo.jsx — Composant Logo Officiel MYLTA ACADEMY
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getCurrentSeason } from '../utils/season'

export default function Logo({ className = '', size = 'md', stacked = false, onClick, theme = 'light', title: overrideTitle }) {
  const season = getCurrentSeason()

  let locationPath = '/'
  try {
    const location = useLocation()
    locationPath = location.pathname
  } catch (e) {
    // Fallback if rendered outside router context
  }

  let currentLang = 'fr'
  let t = null
  try {
    const langContext = useLanguage()
    currentLang = langContext.currentLang
    t = langContext.t
  } catch (e) {
    // Fallback if outside context
  }

  const fontSizes = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg md:text-xl',
    lg: 'text-lg sm:text-xl md:text-2xl',
  }

  const badgeSizes = {
    sm: 'w-6 h-6 rounded-full',
    md: 'w-8 h-8 sm:w-9 sm:h-9 rounded-full',
    lg: 'w-10 h-10 sm:w-11 sm:h-11 rounded-full',
  }

  const getDynamicTitle = () => {
    if (overrideTitle) return overrideTitle
    return currentLang === 'ar' ? 'الرئيسية' : currentLang === 'en' ? 'Home' : 'Accueil'
  }

  const dynamicTitle = getDynamicTitle()

  return (
    <div
      onClick={onClick}
      dir="ltr"
      className={`inline-flex items-center gap-2 sm:gap-2.5 font-display tracking-tight select-none group cursor-pointer ${className}`}
    >
      {/* Badge Image du Logo (Cercle Parfait) */}
      <div className={`${badgeSizes[size] || badgeSizes.md} flex items-center justify-center shadow-xs group-hover:shadow-sm group-hover:scale-[1.03] transition-all duration-300 relative overflow-hidden ring-1 ring-neutral-200/80 bg-white dark:bg-academy-surfaceDark shrink-0`}>
        <img 
          src="/logo-128.png" 
          alt="Logo Mylta Academy" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = '/logo-256.png';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* Separator vertical line */}
      <div className={`h-4.5 sm:h-5.5 w-[1.5px] ${theme === 'dark' ? 'bg-white/20 dark:bg-academy-surfaceDark/20' : 'bg-neutral-300/80'} shrink-0 mx-0.5 rounded-full`} />

      {/* Dynamic Title (Page Title or "The 1% ☀️ Été") */}
      {dynamicTitle ? (
        <span className={`${fontSizes[size] || fontSizes.md} font-extrabold tracking-tight leading-none font-display max-w-[170px] sm:max-w-[240px] truncate ${theme === 'dark' ? 'text-white' : 'text-neutral-900 dark:text-academy-textMain'}`}>
          {dynamicTitle}
        </span>
      ) : (
        <span className={`${fontSizes[size] || fontSizes.md} font-extrabold tracking-tight inline-flex items-center gap-1.5 leading-none font-display whitespace-nowrap`}>
          <span className={theme === 'dark' ? 'text-white' : 'text-neutral-900 dark:text-academy-textMain'}>The</span>
          <span className="text-[#b91c1c] font-black">1%</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${season.badgeBg}`}>
            {season.icon} {season.label}
          </span>
        </span>
      )}
    </div>
  )
}



