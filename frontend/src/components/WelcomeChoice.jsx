import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useSiteSettings } from '../context/SiteSettingsContext'
import api from '../api/axios'
import { getSessions } from '../api/sessions'

// Premier écran du visiteur : la question qu'il se pose vraiment en arrivant,
// « laquelle des trois ? ». Posée une fois, puis plus avant quatre heures : le
// visiteur qui revient dans la journée n'est pas repris par la manche, celui
// qui revient le lendemain se la voit reposer.
const SEEN = 'mylta_welcome_seen'
const REPEAT_MS = 4 * 60 * 60 * 1000

export default function WelcomeChoice() {
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  // 'choices' → 'notify' (laisser ses coordonnées) → 'done'
  const [view, setView] = useState('choices')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  // null tant qu'on ne sait pas s'il reste des dates présentielles.
  const [hasDates, setHasDates] = useState(null)

  const welcome = settings?.welcome || {}
  const notifyEnabled = welcome.notifyEnabled !== false

  // Annoncer « 3 jours » sans aucune date ouverte envoie le visiteur sur une
  // page qui n'a rien à lui vendre : on le dit avant qu'il clique.
  useEffect(() => {
    if (!settings?.inPerson?.enabled) return
    getSessions()
      .then(list => setHasDates(list.some(x => x.seatsLeft > 0)))
      .catch(() => setHasDates(true))
  }, [settings?.inPerson?.enabled])

  const choices = [
    settings?.coaching?.enabled && { to: '/coaching', label: 'Coaching en ligne', note: 'En visio, 7 j / 7' },
    settings?.inPerson?.enabled && {
      to: '/coaching-presentiel',
      label: 'Formation 3 jours',
      note: hasDates === false ? 'Dates bientôt annoncées' : 'À Béjaïa, en petit groupe',
    },
    settings?.express?.enabled && { to: '/formation-1-jour', label: 'Montage vidéo en 1 jour', note: 'Un samedi, vidéo terminée' },
  ].filter(Boolean)

  useEffect(() => {
    if (welcome.enabled === false) return
    if (choices.length < 2) return
    try {
      const last = Number(localStorage.getItem(SEEN))
      if (last && Date.now() - last < REPEAT_MS) return
    } catch { return }
    const t = setTimeout(() => setOpen(true), 1200)
    return () => clearTimeout(t)
  }, [choices.length, welcome.enabled])

  const close = () => {
    setOpen(false)
    try { localStorage.setItem(SEEN, String(Date.now())) } catch { /* navigation privée : on repropose plus tard */ }
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Sans session choisie, l'inscription vaut liste d'attente : c'est exactement
  // « prévenez-moi de la prochaine formation ».
  const notifyMe = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      await api.post('/in-person/register', {
        fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        phone: phone.trim(),
        sessionId: null,
        message: 'Souhaite être prévenu de la prochaine formation (message d\'accueil).',
      })
      setView('done')
    } catch (err) {
      setError(err.response?.data?.error || "L'envoi a échoué. Réessayez.")
    } finally {
      setSending(false)
    }
  }

  if (!open) return null

  const input = 'w-full rounded-lg border border-academy-border px-3 py-2 text-sm outline-none focus:border-academy-primary'

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Choisissez votre formation">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div className="relative w-full max-w-[18rem] bg-white rounded-2xl p-4">
        {view === 'choices' && (
          <>
            <h2 className="font-display font-black text-lg text-academy-textMain">{welcome.title || 'Choisissez votre formation'}</h2>
            {(welcome.subtitle ?? "Trois façons d'apprendre. Laquelle vous va ?") && (
              <p className="mt-0.5 text-xs text-academy-textMain/60">{welcome.subtitle ?? "Trois façons d'apprendre. Laquelle vous va ?"}</p>
            )}
            <div className="mt-3 space-y-1.5">
              {choices.map(c => (
                <button type="button" key={c.to} onClick={() => { close(); navigate(c.to) }}
                        className="w-full rounded-lg border-2 border-academy-border p-2.5 text-left hover:border-academy-primary transition-colors">
                  <span className="block font-bold text-sm text-academy-textMain">{c.label}</span>
                  <span className="block text-xs text-academy-textMain/60">{c.note}</span>
                </button>
              ))}
              {/* Aucune des trois ne tombe au bon moment : plutôt que de perdre
                  ce visiteur, on lui prend ses coordonnées pour la prochaine. */}
              {notifyEnabled && <button type="button" onClick={() => setView('notify')}
                      className="w-full rounded-lg border-2 border-dashed border-academy-border p-2.5 text-left hover:border-academy-primary transition-colors">
                <span className="block font-bold text-sm text-academy-textMain">Me prévenir de la prochaine</span>
                <span className="block text-xs text-academy-textMain/60">Laissez votre numéro, on vous écrit</span>
              </button>}
            </div>
            <button type="button" onClick={close} className="mt-2 w-full py-2 text-[13px] font-bold text-academy-textMain/60 hover:text-academy-textMain">
              Annuler
            </button>
          </>
        )}

        {view === 'notify' && (
          <form onSubmit={notifyMe}>
            <h2 className="font-display font-black text-lg text-academy-textMain">On vous prévient</h2>
            <p className="mt-0.5 text-xs text-academy-textMain/60">Dès qu'une date est fixée, on vous écrit sur WhatsApp.</p>
            <div className="mt-3 space-y-1.5">
              <input className={input} required minLength={2} maxLength={40} placeholder="Prénom" value={firstName} onChange={e => setFirstName(e.target.value)} />
              <input className={input} required minLength={2} maxLength={40} placeholder="Nom" value={lastName} onChange={e => setLastName(e.target.value)} />
              <input className={input} required type="tel" placeholder="Numéro de téléphone" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            {error && <p className="mt-2 text-xs font-bold text-red-600">{error}</p>}
            <button type="submit" disabled={sending} className="mt-3 w-full py-2.5 rounded-lg bg-academy-primary text-academy-onPrimary text-sm font-bold disabled:opacity-50">
              {sending ? 'Envoi…' : 'Prévenez-moi'}
            </button>
            <button type="button" onClick={() => setView('choices')} className="mt-1 w-full py-2 text-[13px] font-bold text-academy-textMain/60 hover:text-academy-textMain">
              Retour
            </button>
          </form>
        )}

        {view === 'done' && (
          <>
            <h2 className="font-display font-black text-lg text-academy-textMain">C'est noté</h2>
            <p className="mt-1 text-[13px] text-academy-textMain/70">On vous prévient dès que la prochaine formation est programmée.</p>
            <button type="button" onClick={close} className="mt-3 w-full py-2.5 rounded-lg bg-academy-textMain text-academy-surface text-sm font-bold">
              Fermer
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
