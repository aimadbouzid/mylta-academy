import { useState, useEffect, useMemo, useRef } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle, CalendarPlus, Clock, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'
import { useSiteSettings } from '../context/SiteSettingsContext'
import StepIndicator from '../components/StepIndicator'

const STEPS = ['Sujet', 'Date', 'Infos']
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

// Durée d'une séance en minutes : « 2h30 », « 1 h », « 45 min »…
const sessionMinutes = (duration = '') => {
  const h = duration.match(/(\d+)\s*h\s*(\d+)?/i)
  if (h) return Number(h[1]) * 60 + Number(h[2] || 0)
  const m = duration.match(/(\d+)\s*min/i)
  return m ? Number(m[1]) : 60
}

export default function CoachingPage() {
  const { settings, loadingSettings } = useSiteSettings()
  const cfg = settings?.coaching
  const topRef = useRef(null)

  const [step, setStep] = useState(0)
  const [topicId, setTopicId] = useState('')
  const [participants, setParticipants] = useState(null) // choisi par le client, rien d'imposé
  const [formatId, setFormatId] = useState('')
  const [channel, setChannel] = useState('')
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [companions, setCompanions] = useState([]) // amis inscrits avec le client
  const [message, setMessage] = useState('')
  const [booked, setBooked] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)
  const [website, setWebsite] = useState('') // piège à robots

  const loadAvailability = () => {
    api.get('/coaching/availability').then(({ data }) => setBooked(data.booked || [])).catch(() => {})
  }
  useEffect(() => { if (cfg?.enabled) loadAvailability() }, [cfg?.enabled])

  const topics = cfg?.topics || []
  const formats = cfg?.formats || []
  const channels = cfg?.channels || []
  const slots = cfg?.timeSlots || []

  // Une seule formule : choisie d'office, le client n'a rien à décider.
  useEffect(() => { if (formats.length === 1) setFormatId(formats[0].id) }, [formats])

  const topic = topics.find(t => t.id === topicId)
  const format = formats.find(f => f.id === formatId)
  const price = Number(format?.price) || Number(topic?.price) || 0
  const duration = format?.duration || (formats.length === 1 ? formats[0].duration : '')

  const topicGroups = useMemo(() => {
    const groups = new Map()
    for (const t of topics) {
      const key = t.category || ''
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(t)
    }
    return [...groups.entries()]
  }, [topics])

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

  // En arrivant sur le choix du jour, le premier jour libre est déjà sélectionné.
  useEffect(() => {
    if (step !== 1 || date || !cfg) return
    for (let i = 0; i < 120; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)
      if (isDayAvailable(d)) {
        setDate(toYmd(d))
        setMonth(new Date(d.getFullYear(), d.getMonth(), 1))
        return
      }
    }
  }, [step, date, cfg, booked])

  const dateReady = date && (slots.length === 0 || timeSlot)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (formats.length > 1 && !formatId) return setError('Choisissez une formule.')
    if (channels.length > 0 && !channel) return setError('Choisissez comment faire l\'appel vidéo.')
    setSubmitting(true)
    try {
      const { data } = await api.post('/coaching/book', { fullName, phone, topicId, formatId, channel, date, timeSlot, message, website, participants: people, companions: companions.slice(0, (people || 1) - 1) })
      setDone(data.booking)
      requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } catch (err) {
      setError(err.response?.data?.error || 'La réservation a échoué. Réessayez.')
      if (err.response?.status === 409) { setTimeSlot(''); loadAvailability(); goTo(1) }
    } finally {
      setSubmitting(false)
    }
  }

  const maxPeople = Math.max(1, Number(cfg?.maxParticipants) || 1)
  // Une seule formule possible (individuel uniquement) : rien à choisir.
  const people = maxPeople === 1 ? 1 : participants
  // La dernière option, à partir de 4, représente un groupe (4 personnes et plus).
  const isGroup = (n) => n >= 4 && n === maxPeople
  const peopleLabel = (n) => (n <= 1 ? 'Individuel' : isGroup(n) ? `En groupe (${n} personnes et +)` : `${n} personnes`)

  const summaryLines = (b) => [
    ['Pack', b.topicLabel],
    ['Participants', peopleLabel(b.participants || 1)],
    ['Jour', `${formatDate(b.date)}${b.timeSlot ? ` à ${b.timeSlot.replace(':', 'h')}` : ''}`],
    duration && ['Durée', duration],
    b.channel && ['Appel vidéo', b.channel],
    b.price > 0 && ['Prix', money(b.price, cfg?.currency)],
  ].filter(Boolean)

  const whatsappUrl = done && cfg?.whatsappNumber
    ? `https://wa.me/${cfg.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Bonjour Mylta Academy, je viens de réserver une séance de coaching :\n` +
        `• Nom : ${fullName}\n• Téléphone : ${phone}\n` +
        (done.companions || []).map((f, i) => `• Ami ${i + 1} : ${f.fullName} — ${f.phone}\n`).join('') +
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
      const end = new Date(start.getTime() + sessionMinutes(duration) * 60000)
      const t = (x) => `${pad(x.getHours())}${pad(x.getMinutes())}00`
      const endBase = end.getDate() !== start.getDate()
        ? toYmd(new Date(fromYmd(done.date).getTime() + 86400000)).replace(/-/g, '')
        : base
      dates = `${base}T${t(start)}/${endBase}T${t(end)}`
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
  const radio = (active) => `mt-1 w-4 h-4 rounded-full border-2 shrink-0 ${active ? 'border-academy-primary bg-academy-primary shadow-[inset_0_0_0_3px_white]' : 'border-academy-textMain/30'}`
  const primaryBtn = 'w-full py-4 rounded-xl bg-academy-primary text-academy-onPrimary font-bold text-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40'

  return (
    <>
      <SEOHead
        title="Coaching en ligne | Mylta Academy"
        description="Réservez une séance de coaching en ligne de 2h30 : apprendre à utiliser l'IA, faire des vidéos et des textes avec l'IA, créer votre site ou votre application sans savoir coder."
        canonicalPath="/coaching"
      />
      <div className="min-h-screen bg-transparent text-academy-textMain flex flex-col">
        <Navbar />

        <main className="flex-1 pt-28 sm:pt-36 pb-28 sm:pb-16 px-4">
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
                    <p className="text-sm text-academy-textMain/60 mb-3">Dernière étape : envoyez-nous ce message sur WhatsApp pour confirmer.</p>
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
                  <p className="text-xs font-black uppercase tracking-widest text-academy-primary mb-2">Coaching en ligne</p>
                  <h1 className="font-display font-black text-3xl sm:text-5xl tracking-tight mb-2">{cfg.title}</h1>
                  <p className="text-academy-textMain/60 sm:text-lg">{cfg.subtitle}</p>
                </div>

                <StepIndicator steps={STEPS} current={step} onGo={goTo} />

                {step > 0 && (
                  <button type="button" onClick={() => goTo(step - 1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-academy-textMain/60 hover:text-academy-textMain">
                    <ArrowLeft size={16} /> Retour
                  </button>
                )}

                {/* 1. Sujet */}
                {step === 0 && (
                  <section className={`${card} space-y-5`}>
                    {(cfg.infos || []).length > 0 && (
                      <ul className="grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-academy-border bg-academy-border">
                        {cfg.infos.map((info, i) => (
                          <li key={i} className="bg-white px-1.5 py-2.5 text-center text-[12px] sm:text-[13px] font-bold leading-tight flex items-center justify-center">{info}</li>
                        ))}
                      </ul>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h2 className="font-bold text-lg">Choisissez votre pack</h2>
                        <p className="text-[13px] text-academy-textMain/60">Touchez le pack qui vous intéresse pour le sélectionner.</p>
                      </div>
                      {topicGroups.map(([category, items]) => (
                        <div key={category || 'autres'}>
                          {category && <h3 className="font-bold text-sm text-academy-primary mb-2">{category}</h3>}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {items.map(t => {
                              const active = topicId === t.id
                              return (
                                <button type="button" key={t.id} onClick={() => setTopicId(t.id)}
                                        className={`relative rounded-xl border px-2.5 py-2 min-h-[48px] text-left shadow-sm transition-colors ${active ? 'border-academy-primary bg-academy-primary/5 ring-1 ring-academy-primary' : 'border-academy-border bg-white hover:border-academy-primary/40'}`}>
                                  <span className="block text-[12px] sm:text-[13px] font-bold leading-snug pr-5">{t.label}</span>
                                  {t.description && <span className="block mt-0.5 text-[10.5px] sm:text-xs text-academy-textMain/60 leading-snug">{t.description}</span>}
                                  <span className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center ${active ? 'bg-academy-primary text-academy-onPrimary' : 'border-2 border-academy-border bg-white'}`}>
                                    {active && <Check size={11} strokeWidth={3} />}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {maxPeople > 1 && (
                      <div>
                        <h2 className="font-bold text-[15px] mb-2">Comment voulez-vous travailler ?</h2>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.from({ length: maxPeople }, (_, i) => i + 1).map(n => (
                            <button type="button" key={n} onClick={() => setParticipants(n)}
                                    className={`h-9 px-3.5 rounded-full border text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors ${participants === n ? 'border-academy-primary bg-academy-primary text-academy-onPrimary' : 'border-academy-border bg-white text-academy-textMain/80 hover:border-academy-primary/50'}`}>
                              {n === 1 ? 'Individuel' : isGroup(n) ? 'En groupe' : `À ${n}`}
                              {n === 1 && (
                                <span className={`text-[10px] font-black uppercase tracking-wide rounded px-1 py-px ${participants === 1 ? 'bg-white/20' : 'bg-emerald-100 text-emerald-700'}`}>Recommandé</span>
                              )}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-academy-textMain/55 mt-1.5">
                          {participants === null
                            ? 'Choisissez la formule qui vous convient.'
                            : participants === 1
                              ? 'Le coach se concentre à 100 % sur votre projet : c’est la formule la plus efficace.'
                              : 'Avec des amis ou des collègues, dans le même appel vidéo.'}
                        </p>
                      </div>
                    )}

                    <div className="rounded-xl border-2 border-academy-primary/30 bg-academy-primary/5 p-4">
                      <p className="text-xs font-black uppercase tracking-wider text-academy-primary mb-1">Votre séance</p>
                      <p className="text-xl font-black">{duration ? `${duration} en appel vidéo` : 'En appel vidéo'}</p>
                      {people && <p className="text-sm font-semibold mt-0.5">{peopleLabel(people)}</p>}
                      <p className="text-sm text-academy-textMain/60 mt-1">
                        {price > 0 ? money(price, cfg.currency) : 'Le prix vous est donné sur WhatsApp après la réservation.'}
                      </p>
                    </div>

                    <button type="button" disabled={!topicId || !people} onClick={() => goTo(1)} className={primaryBtn}>
                      {!topicId ? 'Choisissez un pack' : !people ? 'Choisissez votre formule' : 'Choisir ma date'} <ArrowRight size={18} />
                    </button>
                    {settings?.inPerson?.enabled && (
                      <p className="text-center text-sm">
                        Vous préférez sur place, en groupe ? <Link to="/coaching-presentiel" className="font-bold text-academy-primary underline underline-offset-2">Coaching présentiel</Link>
                      </p>
                    )}
                  </section>
                )}

                {/* 2. Jour et heure */}
                {step === 1 && (
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
                        <h2 className="font-bold mb-1 flex flex-wrap items-center gap-2"><Clock size={18} /> À quelle heure ?</h2>
                        <p className="text-sm text-academy-textMain/60 mb-3">{formatDate(date)}{duration ? ` — la séance dure ${duration}` : ''}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map(s => {
                            const free = isSlotFree(date, s)
                            return (
                              <button type="button" key={s} disabled={!free} onClick={() => setTimeSlot(s)}
                                      className={`py-2.5 rounded-lg border-2 text-sm font-bold transition-colors ${
                                        timeSlot === s ? 'border-academy-primary bg-academy-primary text-academy-onPrimary'
                                        : free ? 'border-academy-border hover:border-academy-primary/40'
                                        : 'border-academy-border text-academy-textMain/25 line-through cursor-not-allowed'}`}>
                                {s.replace(':', 'h')}
                              </button>
                            )
                          })}
                        </div>
                        {booked.some(b => b.date === date && b.reason === 'presentiel') && (
                          <p className="mt-2 text-xs text-academy-textMain/60">Les horaires barrés ne sont pas disponibles : le coach anime une formation présentielle ce jour-là.</p>
                        )}
                      </div>
                    )}

                    <button type="button" disabled={!dateReady} onClick={() => goTo(2)} className={primaryBtn}>
                      Continuer <ArrowRight size={18} />
                    </button>
                  </section>
                )}

                {/* 3. Coordonnées + récapitulatif */}
                {step === 2 && (
                  <form onSubmit={handleSubmit} className={`${card} space-y-4 relative`}>
                    <div className="bg-academy-surface rounded-xl p-4 text-sm space-y-1.5">
                      <p className="font-bold">{topic?.label}</p>
                      <p className="text-academy-textMain/70">{peopleLabel(people || 1)}</p>
                      <p className="text-academy-textMain/70">{formatDate(date)}{timeSlot ? ` à ${timeSlot.replace(':', 'h')}` : ''}{duration ? ` · ${duration}` : ''}</p>
                      <p className="font-black">{price > 0 ? money(price, cfg.currency) : 'Le prix vous sera donné sur WhatsApp'}</p>
                    </div>

                    {formats.length > 1 && (
                      <div className="space-y-2">
                        <h2 className="font-bold">Quelle formule ?</h2>
                        {formats.map(f => (
                          <button type="button" key={f.id} onClick={() => setFormatId(f.id)}
                                  className={`${choice(formatId === f.id)} w-full p-4 flex items-start gap-3`}>
                            <span className={radio(formatId === f.id)} aria-hidden="true" />
                            <span className="flex-1">
                              <span className="font-bold">{f.label}{f.duration ? ` · ${f.duration}` : ''}</span>
                              {f.description && <span className="block text-sm text-academy-textMain/60">{f.description}</span>}
                            </span>
                            {Number(f.price) > 0 && <span className="font-black whitespace-nowrap">{money(f.price, cfg.currency)}</span>}
                          </button>
                        ))}
                      </div>
                    )}

                    {channels.length > 0 && (
                      <div>
                        <h2 className="font-bold mb-2">Comment faire l'appel vidéo ?</h2>
                        <div className="flex flex-wrap gap-2">
                          {channels.map(c => (
                            <button type="button" key={c} onClick={() => setChannel(c)} className={chip(channel === c)}>{c}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website}
                           onChange={e => setWebsite(e.target.value)} className="absolute -left-[9999px] w-px h-px opacity-0" />
                    <h2 className="font-bold text-lg">Vos coordonnées</h2>
                    <input className={input} required minLength={3} maxLength={80} autoComplete="name" placeholder="Votre nom et prénom"
                           value={fullName} onChange={e => setFullName(e.target.value)} />
                    <input className={input} required type="tel" inputMode="tel" autoComplete="tel" maxLength={20} pattern="\+?[0-9 ]{8,20}"
                           title="Exemple : 0555 12 34 56" placeholder="Votre numéro WhatsApp (ex : 0555 12 34 56)"
                           value={phone} onChange={e => setPhone(e.target.value)} />
                    {Array.from({ length: (people || 1) - 1 }, (_, i) => {
                      const f = companions[i] || { fullName: '', phone: '' }
                      const set = (patch) => setCompanions(cs => { const next = [...cs]; next[i] = { ...f, ...patch }; return next })
                      return (
                        <div key={i} className="space-y-2 pt-1">
                          <h3 className="font-bold">{people === 2 ? 'Votre ami(e)' : `Ami(e) n°${i + 1}`}</h3>
                          <input className={input} required minLength={3} maxLength={80} placeholder="Nom et prénom de votre ami(e)"
                                 value={f.fullName} onChange={e => set({ fullName: e.target.value })} />
                          <input className={input} required type="tel" inputMode="tel" maxLength={20} pattern="\+?[0-9 ]{8,20}"
                                 title="Exemple : 0555 12 34 56" placeholder="Son numéro WhatsApp"
                                 value={f.phone} onChange={e => set({ phone: e.target.value })} />
                        </div>
                      )
                    })}
                    <textarea className={input} rows={3} maxLength={500} placeholder="Expliquez-nous en quelques mots ce que vous voulez faire (facultatif)"
                              value={message} onChange={e => setMessage(e.target.value)} />

                    {error && <p className="text-center text-sm font-bold text-red-600">{error}</p>}

                    <button type="submit" disabled={submitting} className={primaryBtn}>
                      {submitting ? 'Réservation…' : 'Réserver ma séance'}
                    </button>
                  </form>
                )}

                {error && step !== 2 && <p className="mt-4 text-center text-sm font-bold text-red-600">{error}</p>}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
