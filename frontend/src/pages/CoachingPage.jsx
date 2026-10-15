import { useState, useEffect, useMemo, useRef } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle, CalendarPlus, Clock, Video, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'
import { useSiteSettings } from '../context/SiteSettingsContext'

const STEPS = ['Sujet', 'Formule', 'Date', 'Vos infos']
const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé']
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const pad = (n) => String(n).padStart(2, '0')
const toYmd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fromYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const formatDate = (s) => {
  const label = fromYmd(s).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}
const money = (n, cur) => `${Number(n).toLocaleString('fr-FR')} ${cur || 'DA'}`

// Durée d'une séance en minutes, lue dans « 30 min », « 1 h », « 3 × 1 h »…
const sessionMinutes = (duration = '') => {
  const h = duration.match(/(\d+(?:[.,]\d+)?)\s*h/i)
  if (h) return Math.round(parseFloat(h[1].replace(',', '.')) * 60)
  const m = duration.match(/(\d+)\s*min/i)
  return m ? Number(m[1]) : 60
}

export default function CoachingPage() {
  const { settings, loadingSettings } = useSiteSettings()
  const cfg = settings?.coaching
  const topRef = useRef(null)

  const [step, setStep] = useState(0)
  const [topicId, setTopicId] = useState('')
  const [formatId, setFormatId] = useState('')
  const [channel, setChannel] = useState('')
  const [level, setLevel] = useState('')
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [booked, setBooked] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  const loadAvailability = () => {
    api.get('/coaching/availability').then(({ data }) => setBooked(data.booked || [])).catch(() => {})
  }
  useEffect(() => { if (cfg?.enabled) loadAvailability() }, [cfg?.enabled])

  const topics = cfg?.topics || []
  const formats = cfg?.formats || []
  const channels = cfg?.channels || []
  const slots = cfg?.timeSlots || []
  const topic = topics.find(t => t.id === topicId)
  // Sujets regroupés par filière, dans l'ordre où elles apparaissent.
  const topicGroups = useMemo(() => {
    const groups = new Map()
    for (const t of topics) {
      const key = t.category || ''
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(t)
    }
    return [...groups.entries()]
  }, [topics])
  const format = formats.find(f => f.id === formatId)
  const price = Number(format?.price) || Number(topic?.price) || 0

  const isSlotTaken = (d, s) => booked.some(b => b.date === d && b.timeSlot === s)
  const isSlotPast = (d, s) => {
    const now = new Date()
    return d === toYmd(now) && s <= `${pad(now.getHours())}:${pad(now.getMinutes())}`
  }
  const isSlotFree = (d, s) => !isSlotTaken(d, s) && !isSlotPast(d, s)

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])
  const lastDay = cfg?.bookUntil ? fromYmd(cfg.bookUntil) : new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  const isDayAvailable = (d) => {
    if (!cfg || d < today || d > lastDay) return false
    if (!(cfg.weekdays || []).includes(d.getDay())) return false
    const s = toYmd(d)
    if ((cfg.blockedDates || []).includes(s)) return false
    return slots.length > 0 ? slots.some(sl => isSlotFree(s, sl)) : !isSlotTaken(s, '')
  }

  const calendarDays = useMemo(() => {
    const offset = (month.getDay() + 6) % 7
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))]
  }, [month])
  const canPrev = month > new Date(today.getFullYear(), today.getMonth(), 1)
  const canNext = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= lastDay

  const goTo = (n) => {
    setError('')
    setStep(n)
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  // En arrivant sur l'étape Date, le premier jour libre est présélectionné.
  useEffect(() => {
    if (step !== 2 || date || !cfg) return
    for (let i = 0; i < 120; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)
      if (isDayAvailable(d)) {
        setDate(toYmd(d))
        setMonth(new Date(d.getFullYear(), d.getMonth(), 1))
        return
      }
    }
  }, [step, date, cfg, booked])

  const step1Ready = (formats.length === 0 || formatId) && (channels.length === 0 || channel)
  const step2Ready = date && (slots.length === 0 || timeSlot)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data } = await api.post('/coaching/book', { fullName, phone, topicId, formatId, channel, level, date, timeSlot, message })
      setDone(data.booking)
      requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } catch (err) {
      setError(err.response?.data?.error || 'La réservation a échoué. Réessayez.')
      if (err.response?.status === 409) { setTimeSlot(''); loadAvailability(); goTo(2) }
    } finally {
      setSubmitting(false)
    }
  }

  const summaryLines = (b) => [
    ['Sujet', b.topicLabel],
    b.formatLabel && ['Formule', b.formatLabel],
    b.channel && ['Où', b.channel],
    b.level && ['Niveau', b.level],
    ['Date', `${formatDate(b.date)}${b.timeSlot ? ` à ${b.timeSlot}` : ''}`],
    b.price > 0 && ['Tarif', money(b.price, cfg?.currency)],
  ].filter(Boolean)

  const whatsappUrl = done && cfg?.whatsappNumber
    ? `https://wa.me/${cfg.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Bonjour Mylta Academy, je viens de réserver un coaching en ligne :\n` +
        `• Nom : ${fullName}\n• Téléphone : ${phone}\n` +
        summaryLines(done).map(([k, v]) => `• ${k} : ${v}`).join('\n') + '\n' +
        (message ? `• Message : ${message}\n` : '') +
        `Réservation n°${done.id}`
      )}`
    : null

  const calendarUrl = useMemo(() => {
    if (!done) return null
    const base = done.date.replace(/-/g, '')
    let dates
    if (done.timeSlot) {
      const [h, m] = done.timeSlot.split(':').map(Number)
      const start = new Date(2000, 0, 1, h, m)
      const end = new Date(start.getTime() + sessionMinutes(format?.duration) * 60000)
      const t = (x) => `${pad(x.getHours())}${pad(x.getMinutes())}00`
      dates = `${base}T${t(start)}/${base}T${t(end)}`
    } else {
      const next = fromYmd(done.date); next.setDate(next.getDate() + 1)
      dates = `${base}/${toYmd(next).replace(/-/g, '')}`
    }
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Coaching Mylta Academy — ${done.topicLabel}`,
      dates,
      ctz: 'Africa/Algiers',
      details: summaryLines(done).map(([k, v]) => `${k} : ${v}`).join('\n'),
    })
    return `https://calendar.google.com/calendar/render?${params}`
  }, [done])

  const card = 'bg-white border border-academy-border rounded-2xl p-5 sm:p-6 shadow-sm'
  const input = 'w-full bg-white border border-academy-border rounded-xl px-4 py-3.5 text-base text-academy-textMain outline-none focus:border-academy-primary'
  const choice = (active) => `text-left rounded-xl border-2 transition-colors ${active ? 'border-academy-primary bg-academy-primary/5' : 'border-academy-border hover:border-academy-primary/40'}`
  const chip = (active) => `px-4 py-2.5 rounded-full border-2 text-sm font-bold transition-colors ${active ? 'border-academy-primary bg-academy-primary text-academy-onPrimary' : 'border-academy-border hover:border-academy-primary/40'}`
  const primaryBtn = 'w-full py-4 rounded-xl bg-academy-primary text-academy-onPrimary font-bold text-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40'

  return (
    <>
      <SEOHead
        title="Coaching en ligne | Mylta Academy"
        description="Réservez une séance de coaching en ligne en intelligence artificielle et vibe coding : outils IA, automatisation, créer une app ou un site avec l'IA."
        canonicalPath="/coaching"
      />
      <div className="min-h-screen bg-transparent text-academy-textMain flex flex-col">
        <Navbar />

        <main className="flex-1 pt-28 sm:pt-36 pb-16 px-4">
          <div ref={topRef} className="max-w-2xl mx-auto scroll-mt-28">
            {loadingSettings ? (
              <p className="text-center text-academy-textMain/60">Chargement…</p>
            ) : !cfg?.enabled ? (
              <p className="text-center text-academy-textMain/60">Le coaching en ligne n'est pas disponible pour le moment.</p>
            ) : done ? (
              <div className={`${card} text-center`}>
                <CheckCircle2 size={52} className="mx-auto text-emerald-500 mb-3" />
                <h1 className="font-display font-black text-2xl sm:text-3xl mb-1">C'est réservé !</h1>
                <p className="text-academy-textMain/60 mb-5">Réservation n°{done.id}</p>
                <dl className="text-left bg-academy-surface rounded-xl p-4 mb-6 space-y-2 text-sm">
                  {summaryLines(done).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4"><dt className="text-academy-textMain/55">{k}</dt><dd className="font-bold text-right">{v}</dd></div>
                  ))}
                </dl>
                {whatsappUrl && (
                  <>
                    <p className="text-sm text-academy-textMain/60 mb-3">Dernière étape : confirmez sur WhatsApp, on vous répond rapidement.</p>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                       className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold px-6 py-4 rounded-xl transition-colors text-lg">
                      <MessageCircle size={20} /> Confirmer sur WhatsApp
                    </a>
                  </>
                )}
                {calendarUrl && (
                  <a href={calendarUrl} target="_blank" rel="noopener noreferrer"
                     className="mt-3 w-full inline-flex items-center justify-center gap-2 border-2 border-academy-border font-bold px-6 py-3 rounded-xl hover:border-academy-primary/40 transition-colors">
                    <CalendarPlus size={18} /> Ajouter à mon agenda
                  </a>
                )}
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h1 className="font-display font-black text-3xl sm:text-5xl tracking-tight mb-2">{cfg.title}</h1>
                  <p className="text-academy-textMain/60 sm:text-lg">{cfg.subtitle}</p>
                </div>

                {/* Progression */}
                <ol className="grid grid-cols-4 gap-2 mb-6">
                  {STEPS.map((label, i) => (
                    <li key={label}>
                      <button type="button" disabled={i > step} onClick={() => goTo(i)} className="w-full text-left disabled:cursor-default">
                        <span className={`block h-1.5 rounded-full mb-1.5 ${i <= step ? 'bg-academy-primary' : 'bg-academy-border'}`} />
                        <span className={`text-xs font-bold ${i === step ? 'text-academy-textMain' : 'text-academy-textMain/45'}`}>{i + 1}. {label}</span>
                      </button>
                    </li>
                  ))}
                </ol>

                {step > 0 && (
                  <button type="button" onClick={() => goTo(step - 1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-academy-textMain/60 hover:text-academy-textMain">
                    <ArrowLeft size={16} /> Retour
                  </button>
                )}

                {/* 1. Sujet */}
                {step === 0 && (
                  <section className={card}>
                    <h2 className="font-bold text-lg mb-5">Sur quoi voulez-vous être coaché ?</h2>
                    <div className="space-y-6">
                      {topicGroups.map(([category, items]) => (
                        <div key={category || 'autres'}>
                          {category && <h3 className="text-xs font-black uppercase tracking-widest text-academy-primary mb-2.5">{category}</h3>}
                          <div className="grid sm:grid-cols-2 gap-2.5">
                            {items.map(t => (
                              <button type="button" key={t.id} onClick={() => { setTopicId(t.id); goTo(1) }}
                                      className={`${choice(topicId === t.id)} p-4 flex items-start gap-3`}>
                                <span className={`mt-1 w-4 h-4 rounded-full border-2 shrink-0 ${topicId === t.id ? 'border-academy-primary bg-academy-primary shadow-[inset_0_0_0_3px_white]' : 'border-academy-textMain/30'}`} aria-hidden="true" />
                                <span>
                                  <span className="font-bold block">{t.label}</span>
                                  {t.description && <span className="text-sm text-academy-textMain/60 leading-snug">{t.description}</span>}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 2. Formule, canal, niveau */}
                {step === 1 && (
                  <section className={`${card} space-y-6`}>
                    {formats.length > 0 && (
                      <div>
                        <h2 className="font-bold text-lg mb-3">Choisissez votre formule</h2>
                        <div className="space-y-3">
                          {formats.map(f => (
                            <button type="button" key={f.id} onClick={() => setFormatId(f.id)}
                                    className={`${choice(formatId === f.id)} w-full p-4 flex items-center justify-between gap-4`}>
                              <span>
                                <span className="font-bold block">{f.label}{f.duration ? <span className="font-medium text-academy-textMain/55"> · {f.duration}</span> : null}</span>
                                {f.description && <span className="text-sm text-academy-textMain/60">{f.description}</span>}
                              </span>
                              {Number(f.price) > 0 && <span className="font-black whitespace-nowrap">{money(f.price, cfg.currency)}</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {channels.length > 0 && (
                      <div>
                        <h2 className="font-bold mb-3 flex items-center gap-2"><Video size={18} /> Où se passe la séance ?</h2>
                        <div className="flex flex-wrap gap-2">
                          {channels.map(c => (
                            <button type="button" key={c} onClick={() => setChannel(c)} className={chip(channel === c)}>{c}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h2 className="font-bold mb-3">Votre niveau <span className="font-medium text-academy-textMain/50">(facultatif)</span></h2>
                      <div className="flex flex-wrap gap-2">
                        {LEVELS.map(l => (
                          <button type="button" key={l} onClick={() => setLevel(level === l ? '' : l)} className={chip(level === l)}>{l}</button>
                        ))}
                      </div>
                    </div>

                    <button type="button" disabled={!step1Ready} onClick={() => goTo(2)} className={primaryBtn}>
                      Choisir la date <ArrowRight size={18} />
                    </button>
                  </section>
                )}

                {/* 3. Date & heure */}
                {step === 2 && (
                  <section className={`${card} space-y-6`}>
                    <div>
                      <h2 className="font-bold text-lg mb-3">Quel jour ?</h2>
                      <div className="flex items-center justify-between mb-3">
                        <button type="button" disabled={!canPrev} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                                className="p-2 rounded-lg border border-academy-border disabled:opacity-30" aria-label="Mois précédent">
                          <ChevronLeft size={18} />
                        </button>
                        <span className="font-bold">{MONTHS[month.getMonth()]} {month.getFullYear()}</span>
                        <button type="button" disabled={!canNext} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                                className="p-2 rounded-lg border border-academy-border disabled:opacity-30" aria-label="Mois suivant">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-academy-textMain/45 mb-1">
                        {WEEKDAYS.map(w => <span key={w}>{w}</span>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((d, i) => {
                          if (!d) return <span key={`e${i}`} />
                          const s = toYmd(d)
                          const available = isDayAvailable(d)
                          return (
                            <button type="button" key={s} disabled={!available} onClick={() => { setDate(s); setTimeSlot('') }}
                                    className={`aspect-square rounded-lg text-sm font-bold transition-colors ${
                                      date === s ? 'bg-academy-primary text-academy-onPrimary'
                                      : available ? 'border border-academy-border hover:border-academy-primary'
                                      : 'text-academy-textMain/20 cursor-not-allowed'}`}>
                              {d.getDate()}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {date && slots.length > 0 && (
                      <div>
                        <h2 className="font-bold mb-3 flex flex-wrap items-center gap-2"><Clock size={18} /> À quelle heure ? <span className="font-medium text-academy-textMain/55">{formatDate(date)}</span></h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {slots.map(s => {
                            const free = isSlotFree(date, s)
                            return (
                              <button type="button" key={s} disabled={!free} onClick={() => setTimeSlot(s)}
                                      className={`py-3 rounded-xl border-2 font-bold transition-colors ${
                                        timeSlot === s ? 'border-academy-primary bg-academy-primary text-academy-onPrimary'
                                        : free ? 'border-academy-border hover:border-academy-primary/40'
                                        : 'border-academy-border text-academy-textMain/25 line-through cursor-not-allowed'}`}>
                                {s}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <button type="button" disabled={!step2Ready} onClick={() => goTo(3)} className={primaryBtn}>
                      Continuer <ArrowRight size={18} />
                    </button>
                  </section>
                )}

                {/* 4. Coordonnées + récapitulatif */}
                {step === 3 && (
                  <form onSubmit={handleSubmit} className={`${card} space-y-4`}>
                    <div className="bg-academy-surface rounded-xl p-4 text-sm space-y-1.5">
                      <p className="font-bold">{topic?.label}</p>
                      {format && <p className="text-academy-textMain/70">{format.label}{format.duration ? ` · ${format.duration}` : ''}{channel ? ` · ${channel}` : ''}</p>}
                      <p className="text-academy-textMain/70">{formatDate(date)}{timeSlot ? ` à ${timeSlot}` : ''}</p>
                      <p className="font-black">{price > 0 ? money(price, cfg.currency) : 'Tarif confirmé sur WhatsApp'}</p>
                    </div>

                    <h2 className="font-bold text-lg">Vos coordonnées</h2>
                    <input className={input} required minLength={3} maxLength={80} autoComplete="name" placeholder="Nom et prénom"
                           value={fullName} onChange={e => setFullName(e.target.value)} />
                    <input className={input} required type="tel" inputMode="tel" autoComplete="tel" maxLength={20} pattern="\+?[0-9 ]{8,20}"
                           title="Exemple : 0555 12 34 56" placeholder="Numéro WhatsApp (ex : 0555 12 34 56)"
                           value={phone} onChange={e => setPhone(e.target.value)} />
                    <textarea className={input} rows={3} maxLength={500} placeholder="Votre besoin en quelques mots (facultatif)"
                              value={message} onChange={e => setMessage(e.target.value)} />

                    {error && <p className="text-center text-sm font-bold text-red-600">{error}</p>}

                    <button type="submit" disabled={submitting} className={primaryBtn}>
                      {submitting ? 'Réservation…' : 'Réserver ma séance'}
                    </button>
                  </form>
                )}

                {error && step !== 3 && <p className="mt-4 text-center text-sm font-bold text-red-600">{error}</p>}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
