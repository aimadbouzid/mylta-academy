// Logo.jsx — Composant Logo Officiel MYLTA ACADEMY
import { Link } from 'react-router-dom'

export default function Logo({ className = '', size = 'md', stacked = false, onClick, theme = 'light' }) {
  const fontSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
  }

  const badgeSizes = {
    sm: 'w-6 h-6 rounded-full',
    md: 'w-7 h-7 sm:w-8 sm:h-8 rounded-full',
    lg: 'w-9 h-9 sm:w-10 sm:h-10 rounded-full',
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 sm:gap-3 font-display tracking-tight select-none group cursor-pointer ${className}`}
    >
      {/* Image du Logo (Cercle Parfait) */}
      <div className={`${badgeSizes[size] || badgeSizes.md} flex items-center justify-center shadow-md shadow-gray-900/40 group-hover:shadow-lg group-hover:shadow-gray-900/60 group-hover:scale-[1.05] transition-all duration-300 relative overflow-hidden ring-2 ring-white/20 bg-black`}>
        <img 
          src="/logo.png" 
          alt="Logo Mylta Academy" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = '/logo.jpg'; // Fallback au cas où l'extension soit .jpg
          }}
        />
        {/* Effet de brillance subtil par dessus */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* Typographie Officielle MYLTA ACADEMY */}
      {stacked ? (
        <div className="flex flex-col leading-none text-left justify-center mt-0.5">
          <span className={`${theme === 'dark' ? 'text-white' : 'text-academy-textMain'} font-bold tracking-wider text-xs sm:text-sm uppercase`}>MYLTA</span>
          <span className={`font-semibold tracking-[0.2em] text-[8px] sm:text-[9px] uppercase ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-800'} mt-0.5`}>ACADEMY</span>
        </div>
      ) : (
        <span className={`${fontSizes[size] || fontSizes.md} flex items-center gap-1.5 sm:gap-2 uppercase tracking-tighter`}>
          <span className={`${theme === 'dark' ? 'text-white' : 'text-academy-textMain'} font-bold`}>MYLTA</span>
          <span className={`${theme === 'dark' ? 'text-neutral-400' : 'text-gray-900'} font-bold tracking-tight`}>ACADEMY</span>
        </span>
      )}
    </div>
  )
}

