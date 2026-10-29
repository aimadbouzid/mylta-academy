// WelcomeMessage.jsx — message d'accueil affiché à l'arrivée sur le site,
// masqué automatiquement au bout de 5 secondes.
//
// Affiché une seule fois par visite (sessionStorage) : le revoir à chaque
// changement de page deviendrait vite pénible pour le visiteur.

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useSiteSettings } from '../context/SiteSettingsContext'

const SEEN_KEY = 'welcome_seen'
const DURATION = 5000

export default function WelcomeMessage() {
  const { settings } = useSiteSettings()
  const cfg = settings?.welcomeMessage
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!cfg?.enabled || !cfg?.text) return

    let alreadySeen = false
    try { alreadySeen = sessionStorage.getItem(SEEN_KEY) === cfg.text } catch { /* stockage indisponible */ }
    if (alreadySeen) return

    try { sessionStorage.setItem(SEEN_KEY, cfg.text) } catch { /* sans mémoire : affiché à chaque page */ }

    setVisible(true)
    const timer = setTimeout(() => setVisible(false), DURATION)
    return () => clearTimeout(timer)
  }, [cfg?.enabled, cfg?.text])

  if (!visible) return null

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[120] px-4 w-full max-w-md pointer-events-none">
      <div
        role="status"
        className="pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3
                   bg-academy-white border border-academy-border
                   shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)] animate-fade-up"
      >
        <p className="flex-1 text-sm font-bold text-academy-textMain leading-snug">
          {cfg.text}
        </p>
        <button
          onClick={() => setVisible(false)}
          aria-label="Fermer"
          className="shrink-0 w-7 h-7 grid place-items-center rounded-full
                     text-academy-textMain/40 hover:text-academy-textMain
                     hover:bg-academy-textMain/5 transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
