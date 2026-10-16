import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Gift, Check } from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'
import { useSiteSettings } from '../context/SiteSettingsContext'

const formatDay = (s) => new Date(`${s}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

export default function ContestPage() {
  const { settings, loadingSettings } = useSiteSettings()
  const c = settings?.contest
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [prize, setPrize] = useState('')
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const open = c?.enabled && !(c.endDate && c.endDate < today)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.post('/contest/enter', { fullName, phone, city, prize, website })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.error || 'La participation a échoué. Réessayez.')
    } finally {
      setBusy(false)
    }
  }

  const input = 'w-full bg-white border border-academy-border rounded-xl px-4 py-3 text-base text-academy-textMain outline-none focus:border-academy-textMain'

  return (
    <>
      <SEOHead title={c?.title || 'Concours'} description={c?.text} canonicalPath="/concours" />
      <Navbar />
      <main className="min-h-screen bg-academy-surface pt-28 pb-16 px-4">
        <div className="max-w-md mx-auto bg-white border border-academy-border rounded-2xl shadow-sm p-5 space-y-4">
          {loadingSettings ? (
            <p className="text-center text-sm text-academy-textMain/60">Chargement…</p>
          ) : !open ? (
            <div className="text-center space-y-2">
              <h1 className="font-bold text-lg">Pas de concours en cours</h1>
              <p className="text-sm text-academy-textMain/60">Suivez-nous pour ne pas rater le prochain.</p>
              <Link to="/" className="inline-block text-sm font-bold underline">Retour à l'accueil</Link>
            </div>
          ) : done ? (
            <div className="text-center space-y-2">
              <span className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Check size={24} /></span>
              <h1 className="font-bold text-lg">Participation enregistrée 🎉</h1>
              <p className="text-sm text-academy-textMain/60">
                Bonne chance ! {c.endDate ? `Tirage au sort le ${formatDay(c.endDate)}.` : ''} Le gagnant est contacté sur WhatsApp.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <span className="mx-auto mb-2 w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center"><Gift size={20} /></span>
                <h1 className="font-display font-black text-xl leading-tight">{c.title}</h1>
                <p className="mt-1 text-sm text-academy-textMain/65">{c.text}</p>
                {c.endDate && <p className="mt-1 text-xs font-bold text-academy-textMain/60">Tirage au sort le {formatDay(c.endDate)}</p>}
              </div>

              {(c.rules || []).length > 0 && (
                <ul className="text-[13px] space-y-1 bg-academy-surface rounded-xl p-3">
                  {c.rules.map((r, i) => <li key={i} className="flex gap-2"><span className="font-black">{i + 1}.</span> {r}</li>)}
                </ul>
              )}

              <form onSubmit={submit} className="space-y-3 relative">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website}
                       onChange={e => setWebsite(e.target.value)} className="absolute -left-[9999px] w-px h-px opacity-0" />
                {(c.prizes || []).length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {c.prizes.map(p => (
                      <button type="button" key={p} onClick={() => setPrize(p)}
                              className={`rounded-xl border-2 p-2.5 text-sm font-bold transition-colors ${prize === p ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-academy-border'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
                <input className={input} placeholder="Nom et prénom" required minLength={3} maxLength={80} autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} />
                <input className={input} placeholder="Numéro WhatsApp (ex : 0555 12 34 56)" required type="tel" inputMode="tel" pattern="\+?[0-9 ]{8,20}" maxLength={20} autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                <input className={input} placeholder="Ville (facultatif)" maxLength={60} value={city} onChange={e => setCity(e.target.value)} />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button disabled={busy || ((c.prizes || []).length > 0 && !prize)} className="w-full py-3 rounded-xl bg-neutral-900 text-white font-bold disabled:opacity-40">
                  {busy ? 'Envoi…' : (c.prizes || []).length > 0 && !prize ? 'Choisissez votre lot' : 'Je participe'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </>
  )
}
