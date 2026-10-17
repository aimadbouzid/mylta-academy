import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

// Formulaire « Laisser un avis » : l'avis est publié tout de suite sur l'accueil.
// Réservé aux comptes, et signé du nom du compte : un avis sur la formation
// vaut par la personne qui le signe, pas par un prénom tapé au hasard.
export default function ReviewModal({ onClose, onPublished }) {
  const { user } = useAuth()
  const [role, setRole] = useState('')
  const [text, setText] = useState('')
  const [website, setWebsite] = useState('') // piège à robots
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      const { data } = await api.post('/reviews', { role, text, website })
      onPublished(data.review)
    } catch (err) {
      setError(err.response?.data?.error || "L'envoi a échoué. Réessayez.")
    } finally {
      setSending(false)
    }
  }

  const input = 'w-full rounded-xl border border-academy-border bg-white px-3.5 py-3 text-[15px] outline-none focus:border-academy-primary'

  // Portail : affiché par-dessus toute la page, même dans une section animée.
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Laisser un avis">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form onSubmit={submit} className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-black text-lg">Laisser un avis</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="w-8 h-8 rounded-full bg-academy-surface flex items-center justify-center"><X size={18} /></button>
        </div>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website}
               onChange={e => setWebsite(e.target.value)} className="absolute -left-[9999px] w-px h-px opacity-0" />
        <p className="text-[13px] text-academy-textMain/60">Publié sous le nom <span className="font-bold text-academy-textMain">{user?.name}</span>.</p>
        <input className={input} maxLength={40} placeholder="Vous êtes… (étudiant, commerçant…) — facultatif" value={role} onChange={e => setRole(e.target.value)} />
        <textarea className={input} required minLength={10} maxLength={400} rows={4} placeholder="Votre avis sur la formation" value={text} onChange={e => setText(e.target.value)} />
        <p className="text-xs text-academy-textMain/50 text-right">{text.length}/400</p>
        {error && <p className="text-sm font-bold text-red-600 text-center">{error}</p>}
        <button type="submit" disabled={sending} className="w-full py-3.5 rounded-xl bg-academy-primary text-academy-onPrimary font-bold disabled:opacity-50">
          {sending ? 'Envoi…' : 'Publier mon avis'}
        </button>
      </form>
    </div>,
    document.body
  )
}
