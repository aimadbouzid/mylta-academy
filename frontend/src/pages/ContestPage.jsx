import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  const [ticket, setTicket] = useState(null)

  useEffect(() => {
    api.get('/contest/next').then(({ data }) => setTicket(data.next)).catch(() => {})
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const open = c?.enabled && !(c.endDate && c.endDate < today)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post('/contest/enter', { fullName, phone, city, prize, website })
      if (data.ticket) setTicket(data.ticket)
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.error || 'La participation a échoué. Réessayez.')
    } finally {
      setBusy(false)
    }
  }

  const prizes = c?.prizes || []
  const ticketNo = ticket ? String(ticket).padStart(4, '0') : '····'

  return (
    <>
      <SEOHead title={c?.title || 'Concours'} description={c?.text} canonicalPath="/concours" />
      <Navbar />
      <main className="min-h-screen bg-academy-surface pt-28 pb-16 px-4">
        <div className="max-w-md mx-auto">
          {loadingSettings ? (
            <p className="text-sm text-academy-textMain/60">Chargement…</p>
          ) : !open ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-academy-textMain/50">Concours</p>
              <h1 className="mt-2 font-display font-black text-3xl leading-[1.05]">Pas de tirage en cours.</h1>
              <p className="mt-2 text-sm text-academy-textMain/60">Le prochain arrive bientôt. Suivez-nous pour ne pas le rater.</p>
              <Link to="/" className="mt-4 inline-block text-sm font-bold border-b-2 border-academy-textMain">Retour à l'accueil</Link>
            </div>
          ) : (
            <>
              {/* En-tête éditorial, aligné à gauche */}
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-academy-primary">
                Concours Mylta Academy{c.endDate ? ` · tirage le ${formatDay(c.endDate)}` : ''}
              </p>
              <h1 className="mt-2 font-display font-black text-2xl leading-tight tracking-tight">
                {c.title}
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-academy-textMain/65">{c.text}</p>

              {/* Le ticket */}
              <div className="relative mt-7 bg-white border border-academy-border rounded-2xl shadow-[0_1px_0_rgba(0,0,0,0.04)]">
                {/* Talon */}
                <div className="flex items-end justify-between px-5 pt-4 pb-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-academy-textMain/45">Ticket de participation</p>
                    <p className="font-mono text-2xl font-bold tracking-widest mt-0.5">N° {ticketNo}</p>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-academy-textMain/45 text-right leading-tight">1 ticket<br />par numéro</p>
                </div>

                {/* Perforation : deux encoches + pointillés */}
                <div className="relative h-0 border-t-2 border-dashed border-academy-border mx-4">
                  <span className="absolute -left-[1.6rem] -top-[0.7rem] w-5 h-5 rounded-full bg-academy-surface border border-academy-border" />
                  <span className="absolute -right-[1.6rem] -top-[0.7rem] w-5 h-5 rounded-full bg-academy-surface border border-academy-border" />
                </div>

                <div className="px-5 pt-4 pb-5">
                  {done ? (
                    <div className="py-6 text-center">
                      <span className="inline-block -rotate-6 border-[3px] border-academy-primary text-academy-primary rounded-md px-4 py-2 font-black uppercase tracking-[0.15em] text-sm">
                        Ticket enregistré
                      </span>
                      <p className="mt-5 text-sm text-academy-textMain/65 leading-relaxed">
                        Bonne chance, {fullName.split(' ')[0]}.{c.endDate ? ` Tirage le ${formatDay(c.endDate)}.` : ''}<br />
                        Si vous gagnez, on vous écrit sur WhatsApp.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={submit} className="space-y-4 relative">
                      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website}
                             onChange={e => setWebsite(e.target.value)} className="absolute -left-[9999px] w-px h-px opacity-0" />

                      {prizes.length > 0 && (
                        <fieldset>
                          <legend className="text-[11px] font-bold uppercase tracking-[0.15em] text-academy-textMain/50 mb-2">Votre lot</legend>
                          <div className="grid grid-cols-2 gap-2">
                            {prizes.map((p, i) => (
                              <button type="button" key={p} onClick={() => setPrize(p)}
                                      className={`text-left rounded-lg border p-3 transition-colors ${prize === p ? 'border-academy-textMain bg-academy-textMain text-academy-surface' : 'border-academy-border hover:border-academy-textMain/40'}`}>
                                <span className={`block font-mono text-[11px] ${prize === p ? 'opacity-60' : 'text-academy-textMain/40'}`}>{String(i + 1).padStart(2, '0')}</span>
                                <span className="block text-sm font-bold leading-snug mt-1">{p}</span>
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      )}

                      <div className="space-y-0 border border-academy-border rounded-lg divide-y divide-academy-border overflow-hidden">
                        {[
                          ['Nom', fullName, setFullName, { required: true, minLength: 3, maxLength: 80, autoComplete: 'name', placeholder: 'Prénom et nom' }],
                          ['WhatsApp', phone, setPhone, { required: true, type: 'tel', inputMode: 'tel', pattern: '\\+?[0-9 ]{8,20}', maxLength: 20, autoComplete: 'tel', placeholder: '0555 12 34 56' }],
                          ['Ville', city, setCity, { maxLength: 60, placeholder: 'Facultatif' }],
                        ].map(([label, value, set, props]) => (
                          <label key={label} className="flex items-center gap-3 px-3 bg-white">
                            <span className="w-20 shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] text-academy-textMain/50">{label}</span>
                            <input {...props} value={value} onChange={e => set(e.target.value)}
                                   className="flex-1 min-w-0 py-3 bg-transparent text-[15px] text-academy-textMain outline-none placeholder:text-academy-textMain/30" />
                          </label>
                        ))}
                      </div>

                      {error && <p className="text-sm text-red-600">{error}</p>}

                      <button disabled={busy || (prizes.length > 0 && !prize)}
                              className="w-full py-3.5 rounded-lg bg-academy-textMain text-academy-surface font-bold tracking-wide disabled:opacity-35 transition-opacity">
                        {busy ? 'Envoi…' : prizes.length > 0 && !prize ? 'Choisissez votre lot' : 'Valider mon ticket'}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Règlement */}
              {(c.rules || []).length > 0 && (
                <section className="mt-8">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-academy-textMain/50">Comment ça marche</h2>
                  <ol className="mt-3 divide-y divide-academy-border border-y border-academy-border">
                    {c.rules.map((r, i) => (
                      <li key={i} className="flex gap-4 py-3 text-sm leading-relaxed">
                        <span className="font-mono text-academy-textMain/40 pt-px">{String(i + 1).padStart(2, '0')}</span>
                        <span className="text-academy-textMain/80">{r}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}
