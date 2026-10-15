import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, MessageCircle, MapPin, Clock, Users, Check } from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'
import { useSiteSettings } from '../context/SiteSettingsContext'

const formatDate = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  const label = new Date(y, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}
const hour = (t) => (t ? t.replace(':', 'h') : '')
const hours = (s) => (s.startTime ? `${hour(s.startTime)}${s.endTime ? ` – ${hour(s.endTime)}` : ''}` : '')
const money = (n, cur) => `${Number(n).toLocaleString('fr-FR')} ${cur || 'DA'}`

export default function InPersonPage() {
  const { settings, loadingSettings } = useSiteSettings()
  const cfg = settings?.inPerson
  const currency = settings?.coaching?.currency || 'DA'
  const whatsappNumber = settings?.coaching?.whatsappNumber
  const formRef = useRef(null)

  const [sessions, setSessions] = useState(null)
  const [sessionId, setSessionId] = useState(null) // null = liste d'attente
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  const loadSessions = () => {
    api.get('/in-person/sessions')
      .then(({ data }) => {
        setSessions(data.sessions || [])
        const firstFree = (data.sessions || []).find(s => s.seatsLeft > 0)
        setSessionId(id => id ?? firstFree?.id ?? null)
      })
      .catch(() => setSessions([]))
  }
  useEffect(() => { if (cfg?.enabled) loadSessions() }, [cfg?.enabled])

  const selected = sessions?.find(s => s.id === sessionId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data } = await api.post('/in-person/register', { fullName, phone, city, message, sessionId })
      setDone(data.registration)
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
    } catch (err) {
      setError(err.response?.data?.error || "L'inscription a échoué. Réessayez.")
      if (err.response?.status === 409 || err.response?.status === 400) loadSessions()
    } finally {
      setSubmitting(false)
    }
  }

  const doneSession = done?.session
  const whatsappUrl = done && whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Bonjour Mylta Academy, je viens de m'inscrire au coaching présentiel :\n` +
        `• Nom : ${fullName}\n• Téléphone : ${phone}\n` +
        (city ? `• Ville : ${city}\n` : '') +
        (doneSession
          ? `• Session : ${formatDate(doneSession.date)}${doneSession.startTime ? ` à ${hour(doneSession.startTime)}` : ''}${doneSession.city ? ` — ${doneSession.city}` : ''}\n`
          : `• Liste d'attente : prévenez-moi des prochaines dates\n`) +
        (message ? `• Message : ${message}\n` : '') +
        `Inscription n°${done.id}`
      )}`
    : null

  const card = 'bg-white border border-academy-border rounded-2xl p-5 sm:p-6 shadow-sm'
  const input = 'w-full bg-white border border-academy-border rounded-xl px-4 py-3.5 text-base text-academy-textMain outline-none focus:border-academy-primary'
  const choice = (active, disabled) => `w-full text-left rounded-xl border-2 p-4 flex items-start gap-3 transition-colors ${
    disabled ? 'border-academy-border opacity-50 cursor-not-allowed'
    : active ? 'border-academy-primary bg-academy-primary/5' : 'border-academy-border hover:border-academy-primary/40'}`
  const radio = (active) => `mt-1 w-4 h-4 rounded-full border-2 shrink-0 ${active ? 'border-academy-primary bg-academy-primary shadow-[inset_0_0_0_3px_white]' : 'border-academy-textMain/30'}`

  return (
    <>
      <SEOHead
        title="Coaching présentiel | Mylta Academy"
        description="Formation en petit groupe, sur place : apprendre l'IA, écrire et créer des vidéos avec l'IA, créer son site sans savoir coder."
        canonicalPath="/coaching-presentiel"
      />
      <div className="min-h-screen bg-transparent text-academy-textMain flex flex-col">
        <Navbar />

        <main className="flex-1 pt-28 sm:pt-36 pb-16 px-4">
          <div className="max-w-2xl mx-auto">
            {loadingSettings ? (
              <p className="text-center text-academy-textMain/60">Chargement…</p>
            ) : !cfg?.enabled ? (
              <p className="text-center text-academy-textMain/60">Le coaching présentiel n'est pas disponible pour le moment.</p>
            ) : done ? (
              <div className={`${card} text-center`}>
                <CheckCircle2 size={52} className="mx-auto text-emerald-500 mb-3" />
                <h1 className="font-display font-black text-2xl sm:text-3xl mb-1">
                  {doneSession ? "Vous êtes inscrit !" : "C'est noté !"}
                </h1>
                <p className="text-academy-textMain/60 mb-5">Inscription n°{done.id}</p>
                <div className="text-left bg-academy-surface rounded-xl p-4 mb-6 text-sm space-y-1.5">
                  {doneSession ? (
                    <>
                      <p className="font-bold">{doneSession.title || cfg.title}</p>
                      <p>{formatDate(doneSession.date)}{hours(doneSession) ? ` · ${hours(doneSession)}` : ''}</p>
                      {(doneSession.city || doneSession.place) && <p>{[doneSession.place, doneSession.city].filter(Boolean).join(', ')}</p>}
                      {doneSession.price > 0 && <p className="font-bold">{money(doneSession.price, currency)}</p>}
                    </>
                  ) : (
                    <p>Vous êtes sur la liste d'attente : on vous prévient en premier dès que les prochaines dates sont fixées.</p>
                  )}
                </div>
                {whatsappUrl && (
                  <>
                    <p className="text-sm text-academy-textMain/60 mb-3">Dernière étape : envoyez-nous ce message sur WhatsApp pour confirmer.</p>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                       className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold px-6 py-4 rounded-xl transition-colors text-lg">
                      <MessageCircle size={20} /> Confirmer sur WhatsApp
                    </a>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                <div className="text-center mb-2">
                  <h1 className="font-display font-black text-3xl sm:text-5xl tracking-tight mb-2">{cfg.title}</h1>
                  <p className="text-academy-textMain/60 sm:text-lg">{cfg.subtitle}</p>
                  <p className="mt-3 text-sm">
                    Vous préférez à distance ? <Link to="/coaching" className="font-bold text-academy-primary underline underline-offset-2">Coaching en ligne</Link>
                  </p>
                </div>

                {(cfg.program || []).length > 0 && (
                  <section className={card}>
                    <h2 className="font-bold text-lg mb-4">Ce que vous allez apprendre</h2>
                    <ol className="space-y-3">
                      {cfg.program.map((p, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="w-7 h-7 rounded-full bg-academy-primary/10 text-academy-primary font-black text-sm flex items-center justify-center shrink-0">{i + 1}</span>
                          <span className="pt-0.5">{p}</span>
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

                {(cfg.infos || []).length > 0 && (
                  <section className={card}>
                    <h2 className="font-bold text-lg mb-3">Bon à savoir</h2>
                    <ul className="space-y-2">
                      {cfg.infos.map((info, i) => (
                        <li key={i} className="flex gap-2.5"><Check size={18} className="text-emerald-600 shrink-0 mt-0.5" /> {info}</li>
                      ))}
                    </ul>
                  </section>
                )}

                <form ref={formRef} onSubmit={handleSubmit} className={`${card} space-y-4`}>
                  <h2 className="font-bold text-lg">Choisissez votre session</h2>

                  {sessions === null ? (
                    <p className="text-sm text-academy-textMain/60">Chargement des dates…</p>
                  ) : (
                    <div className="space-y-2.5">
                      {sessions.length === 0 && (
                        <p className="text-sm text-academy-textMain/70 bg-academy-surface rounded-xl p-4">
                          Les prochaines dates arrivent bientôt. Inscrivez-vous ci-dessous : on vous prévient en premier.
                        </p>
                      )}
                      {sessions.map(s => {
                        const full = s.seatsLeft <= 0
                        return (
                          <button type="button" key={s.id} disabled={full} onClick={() => setSessionId(s.id)} className={choice(sessionId === s.id, full)}>
                            <span className={radio(sessionId === s.id)} aria-hidden="true" />
                            <span className="flex-1 space-y-1">
                              <span className="font-bold block">{formatDate(s.date)}</span>
                              {s.title && <span className="block text-sm font-semibold">{s.title}</span>}
                              <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-academy-textMain/65">
                                {hours(s) && <span className="inline-flex items-center gap-1"><Clock size={14} /> {hours(s)}</span>}
                                {(s.city || s.place) && <span className="inline-flex items-center gap-1"><MapPin size={14} /> {[s.place, s.city].filter(Boolean).join(', ')}</span>}
                                <span className={`inline-flex items-center gap-1 font-bold ${full ? 'text-red-600' : s.seatsLeft <= 3 ? 'text-amber-600' : ''}`}>
                                  <Users size={14} /> {full ? 'Complet' : s.seatsLeft === 1 ? 'Plus qu\'1 place' : `${s.seatsLeft} places restantes`}
                                </span>
                              </span>
                            </span>
                            {s.price > 0 && <span className="font-black whitespace-nowrap">{money(s.price, currency)}</span>}
                          </button>
                        )
                      })}
                      <button type="button" onClick={() => setSessionId(null)} className={choice(sessionId === null, false)}>
                        <span className={radio(sessionId === null)} aria-hidden="true" />
                        <span>
                          <span className="font-bold block">{sessions.length === 0 ? 'Me prévenir des prochaines dates' : 'Aucune date ne me convient'}</span>
                          <span className="text-sm text-academy-textMain/60">Je m'inscris sur la liste d'attente, vous me contactez dès qu'une date est fixée.</span>
                        </span>
                      </button>
                    </div>
                  )}

                  <h2 className="font-bold text-lg pt-2">Vos coordonnées</h2>
                  <input className={input} required minLength={3} maxLength={80} autoComplete="name" placeholder="Votre nom et prénom"
                         value={fullName} onChange={e => setFullName(e.target.value)} />
                  <input className={input} required type="tel" inputMode="tel" autoComplete="tel" maxLength={20} pattern="\+?[0-9 ]{8,20}"
                         title="Exemple : 0555 12 34 56" placeholder="Votre numéro WhatsApp (ex : 0555 12 34 56)"
                         value={phone} onChange={e => setPhone(e.target.value)} />
                  <input className={input} maxLength={60} autoComplete="address-level2" placeholder="Votre ville (facultatif)"
                         value={city} onChange={e => setCity(e.target.value)} />
                  <textarea className={input} rows={3} maxLength={500} placeholder="Une question ou un projet en tête ? (facultatif)"
                            value={message} onChange={e => setMessage(e.target.value)} />

                  {error && <p className="text-center text-sm font-bold text-red-600">{error}</p>}

                  <button type="submit" disabled={submitting || sessions === null}
                          className="w-full py-4 rounded-xl bg-academy-primary text-academy-onPrimary font-bold text-lg transition-opacity hover:opacity-90 disabled:opacity-40">
                    {submitting ? 'Inscription…' : selected ? "Je m'inscris à cette session" : 'Je veux être prévenu'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
