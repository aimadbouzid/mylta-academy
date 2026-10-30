// ReserveCTA.jsx — bouton « Réserver ma place » présent sur tout le site.
//
// Barre en bas de l'écran sur téléphone, pastille en bas à gauche sur grand
// écran : le coin bas-droit reste au bouton WhatsApp. L'animation est lente
// et discrète (halo qui respire) — un clignotement rapide fatigue et finit
// par être ignoré.

import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { useSiteSettings } from '../context/SiteSettingsContext'

// Pages où le bouton n'a pas lieu d'être : on y est déjà, ou c'est l'admin.
const HIDDEN_ON = ['/coaching-presentiel', '/admin', '/instructor', '/watch']

export default function ReserveCTA() {
  const { settings } = useSiteSettings()
  const { pathname } = useLocation()

  if (settings?.inPerson?.enabled === false) return null
  if (HIDDEN_ON.some(p => pathname.startsWith(p))) return null

  const price = Number(settings?.inPerson?.price) || 0
  // Prix barré : seulement s'il est bien supérieur, sinon la promesse est fausse.
  const oldPrice = Number(settings?.inPerson?.oldPrice) > price ? Number(settings?.inPerson?.oldPrice) : 0

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:inset-x-auto sm:start-6 sm:bottom-6 sm:p-0
                    pointer-events-none">
      <Link
        to="/coaching-presentiel"
        className="group pointer-events-auto flex items-center justify-center gap-2.5 w-full sm:w-auto
                   rounded-full bg-academy-primary text-academy-onPrimary
                   px-4 sm:px-5 py-3.5 sm:py-3 text-[14.5px] font-bold whitespace-nowrap
                   shadow-[0_10px_30px_-8px_rgba(0,0,0,0.5)] animate-pulse-glow
                   hover:brightness-110 active:scale-[0.98] transition-all"
      >
        <CalendarDays size={17} className="shrink-0" />
        <span>Réserver ma place</span>
        {price > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-black/15 px-2 py-0.5 whitespace-nowrap">
            {oldPrice > 0 && (
              <s className="text-[10.5px] font-bold opacity-60 tabular-nums">
                {oldPrice.toLocaleString('fr-FR')} DA
              </s>
            )}
            <span className="text-[12px] font-black tabular-nums">
              {price.toLocaleString('fr-FR')} DA
            </span>
          </span>
        )}
        <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
      </Link>
    </div>
  )
}
