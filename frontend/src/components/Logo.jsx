// Logo.jsx — Logo officiel ACADEMY (version horizontale)
const heights = {
  sm: 'h-3.5 sm:h-4',
  md: 'h-4 sm:h-[18px]',
  lg: 'h-5 sm:h-6',
}

// theme="dark" : logo blanc pour les fonds sombres (barre latérale admin).
export default function Logo({ className = '', size = 'md', onClick, theme = 'light' }) {
  return (
    <div onClick={onClick} dir="ltr" className={`inline-flex items-center select-none cursor-pointer shrink-0 ${className}`}>
      <img
        src={theme === 'dark' ? '/logo-wordmark-white.png' : '/logo-wordmark.png'}
        alt="Mylta Academy"
        className={`${heights[size] || heights.md} w-auto`}
        draggable="false"
      />
    </div>
  )
}
