import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useSiteSettings } from '../context/SiteSettingsContext'

// Premier écran du visiteur : la question qu'il se pose vraiment en arrivant,
// « laquelle des trois ? ». Reposée à chaque visite, mais une seule fois par
// visite : sessionStorage se vide quand l'onglet se ferme, donc le visiteur ne
// la revoit pas en naviguant d'une page à l'autre.
const SEEN = 'mylta_welcome_seen'

export default function WelcomeChoice() {
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const choices = [
    settings?.coaching?.enabled && { to: '/coaching', label: 'Coaching en ligne', note: 'En visio, 7 j / 7' },
    settings?.inPerson?.enabled && { to: '/coaching-presentiel', label: 'Formation 3 jours', note: 'À Béjaïa, en petit groupe' },
    settings?.express?.enabled && { to: '/formation-1-jour', label: 'Montage vidéo en 1 jour', note: 'Un samedi, vidéo terminée' },
  ].filter(Boolean)

  useEffect(() => {
    if (choices.length < 2) return
    try { if (sessionStorage.getItem(SEEN)) return } catch { return }
    const t = setTimeout(() => setOpen(true), 1200)
    return () => clearTimeout(t)
  }, [choices.length])

  const close = () => {
    setOpen(false)
    try { sessionStorage.setItem(SEEN, '1') } catch { /* navigation privée : on repropose plus tard */ }
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Choisissez votre formation">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div className="relative w-full max-w-[18rem] bg-white rounded-2xl p-4">
        <h2 className="font-display font-black text-lg text-academy-textMain">Choisissez votre formation</h2>
        <p className="mt-0.5 text-xs text-academy-textMain/60">Trois façons d'apprendre. Laquelle vous va ?</p>
        <div className="mt-3 space-y-1.5">
          {choices.map(c => (
            <button type="button" key={c.to} onClick={() => { close(); navigate(c.to) }}
                    className="w-full rounded-lg border-2 border-academy-border p-2.5 text-left hover:border-academy-primary transition-colors">
              <span className="block font-bold text-sm text-academy-textMain">{c.label}</span>
              <span className="block text-xs text-academy-textMain/60">{c.note}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={close} className="mt-2 w-full py-2 text-[13px] font-bold text-academy-textMain/60 hover:text-academy-textMain">
          Annuler
        </button>
      </div>
    </div>,
    document.body
  )
}
