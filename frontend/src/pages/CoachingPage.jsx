import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, MessageCircle, CalendarDays, Clock } from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'
import { useSiteSettings } from '../context/SiteSettingsContext'

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const pad = (n) => String(n).padStart(2, '0')
const toYmd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const formatDate = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  const label = new Date(y, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function CoachingPage() {
  const { settings, loadingSettings } = useSiteSettings()
  const cfg = settings?.coaching

  const [topicId, setTopicId] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [booked, setBooked] = useState([])
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)

  const loadAvailability = () => {
    api.get('/coaching/availability').then(({ data }) => setBooked(data.booked || [])).catch(() => {})
  }
  useEffect(() => { if (cfg?.enabled) loadAvailability() }, [cfg?.enabled])

  const slots = cfg?.timeSlots || []
  const topic = (cfg?.topics || []).find(t => t.id === topicId)

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])
  const lastDay = useMemo(() => new Date(today.getTime() + (cfg?.maxDaysAhead || 30) * 86400000), [today, cfg?.maxDaysAhead])

  const isSlotTaken = (d, s) => booked.some(b => b.date === d && b.timeSlot === s)
  const isSlotPast = (d, s) => {
    const now = new Date()
    return d === toYmd(now) && s <= `${pad(now.getHours())}:${pad(now.getMinutes())}`
  }
  const isSlotUnavailable = (d, s) => isSlotTaken(d, s) || isSlotPast(d, s)
  const isDayFull = (d) => slots.length > 0 ? slots.every(s => isSlotUnavailable(d, s)) : isSlotTaken(d, '')

  const isDayAvailable = (d) => {
    if (d < today || d > lastDay) return false
    if (!(cfg?.weekdays || []).includes(d.getDay())) return false
    const s = toYmd(d)
    if ((cfg?.blockedDates || []).includes(s)) return false
    return !isDayFull(s)
  }

  const calendarDays = useMemo(() => {
    const first = new Date(month)
    const offset = (first.getDay() + 6) % 7
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))]
  }, [month])

  const canGoPrev = month > new Date(today.getFullYear(), today.getMonth(), 1)
  const canGoNext = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= lastDay

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!topicId) return setError('Choisissez un sujet.')
    if (!date) return setError('Choisissez une date dans le calendrier.')
    if (slots.length > 0 && !timeSlot) return setError('Choisissez un horaire.')
    setSubmitting(true)
    try {
      const { data } = await api.post('/coaching/book', { fullName, phone, topicId, date, timeSlot, message })
      setDone(data.booking)
    } catch (err) {
      setError(err.response?.data?.error || 'La réservation a échoué. Réessayez.')
      if (err.response?.status === 409) { setTimeSlot(''); loadAvailability() }
    } finally {
      setSubmitting(false)
    }
  }

  const whatsappUrl = done && cfg?.whatsappNumber
    ? `https://wa.me/${cfg.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Bonjour Mylta Academy, je viens de réserver un coaching en ligne :\n` +
        `• Nom : ${fullName}\n• Téléphone : ${phone}\n• Sujet : ${done.topicLabel}\n` +
        `• Date : ${formatDate(done.date)}${done.timeSlot ? ` à ${done.timeSlot}` : ''}\n` +
        (message ? `• Message : ${message}\n` : '') +
        `Réservation n°${done.id}`
      )}`
    : null

  const card = 'bg-white/70 dark:bg-academy-surfaceDark border border-academy-border rounded-2xl p-5 sm:p-6'
  const input = 'w-full bg-white dark:bg-academy-surface border border-academy-border rounded-xl px-4 py-3 text-academy-textMain outline-none focus:border-academy-primary'

  return (
    <>
      <SEOHead
        title="Coaching en ligne | Mylta Academy"
        description="Réservez une séance de coaching en ligne : intelligence artificielle, vibe coding, création de site web et landing page."
        canonicalPath="/coaching"
      />
      <div className="min-h-screen bg-transparent text-academy-textMain flex flex-col">
        <Navbar />

        <main className="flex-1 pt-28 sm:pt-36 pb-16 px-4">
          <div className="max-w-3xl mx-auto">
            {loadingSettings ? (
              <p className="text-center text-academy-textMain/60">Chargement…</p>
            ) : !cfg?.enabled ? (
              <p className="text-center text-academy-textMain/60">Le coaching en ligne n'est pas disponible pour le moment.</p>
            ) : done ? (
              <div className={`${card} text-center`}>
                <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
                <h1 className="font-display font-black text-2xl sm:text-3xl mb-2">Réservation enregistrée !</h1>
                <p className="text-academy-textMain/70 mb-1">{done.topicLabel}</p>
                <p className="font-bold mb-6">{formatDate(done.date)}{done.timeSlot ? ` à ${done.timeSlot}` : ''}</p>
                {whatsappUrl && (
                  <>
                    <p className="text-sm text-academy-textMain/60 mb-4">Dernière étape : envoyez-nous votre réservation sur WhatsApp pour la confirmer.</p>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold px-6 py-3.5 rounded-xl transition-colors">
                      <MessageCircle size={18} /> Confirmer sur WhatsApp
                    </a>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-display font-black text-3xl sm:text-5xl tracking-tight mb-3">{cfg.title}</h1>
                  <p className="text-academy-textMain/60 sm:text-lg">{cfg.subtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <section className={card}>
                    <h2 className="font-bold mb-4">1. Sur quoi voulez-vous être coaché ?</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {(cfg.topics || []).map(t => (
                        <button type="button" key={t.id} onClick={() => setTopicId(t.id)}
                                className={`text-left p-4 rounded-xl border transition-colors ${topicId === t.id ? 'border-academy-primary bg-academy-primary/10' : 'border-academy-border hover:border-academy-primary/50'}`}>
                          <span className="font-bold block">{t.label}</span>
                          {(Number(t.price) > 0 || t.duration) && (
                            <span className="text-sm text-academy-textMain/60">
                              {Number(t.price) > 0 ? `${Number(t.price).toLocaleString('fr-FR')} ${cfg.currency || 'DA'}` : ''}
                              {Number(t.price) > 0 && t.duration ? ' · ' : ''}{t.duration}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className={card}>
                    <h2 className="font-bold mb-4">2. Vos coordonnées</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input className={input} required minLength={3} maxLength={80} placeholder="Nom et prénom"
                             value={fullName} onChange={e => setFullName(e.target.value)} />
                      <input className={input} required type="tel" inputMode="tel" maxLength={20} placeholder="Téléphone WhatsApp (ex : 0555 12 34 56)"
                             value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <textarea className={`${input} mt-3`} rows={3} maxLength={500} placeholder="Votre besoin en quelques mots (facultatif)"
                              value={message} onChange={e => setMessage(e.target.value)} />
                  </section>

                  <section className={card}>
                    <h2 className="font-bold mb-4 flex items-center gap-2"><CalendarDays size={18} /> 3. Choisissez la date</h2>
                    <div className="flex items-center justify-between mb-3">
                      <button type="button" disabled={!canGoPrev} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30" aria-label="Mois précédent">
                        <ChevronLeft size={18} />
                      </button>
                      <span className="font-bold">{MONTHS[month.getMonth()]} {month.getFullYear()}</span>
                      <button type="button" disabled={!canGoNext} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30" aria-label="Mois suivant">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-academy-textMain/50 mb-1">
                      {DAYS.map(d => <span key={d}>{d}</span>)}
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
                                    : available ? 'hover:bg-academy-primary/15 border border-academy-border'
                                    : 'text-academy-textMain/25 cursor-not-allowed'}`}>
                            {d.getDate()}
                          </button>
                        )
                      })}
                    </div>

                    {date && slots.length > 0 && (
                      <div className="mt-5">
                        <p className="font-bold mb-3 flex items-center gap-2"><Clock size={16} /> {formatDate(date)}</p>
                        <div className="flex flex-wrap gap-2">
                          {slots.map(s => {
                            const taken = isSlotUnavailable(date, s)
                            return (
                              <button type="button" key={s} disabled={taken} onClick={() => setTimeSlot(s)}
                                      className={`px-4 py-2 rounded-xl border font-bold text-sm transition-colors ${
                                        timeSlot === s ? 'bg-academy-primary text-academy-onPrimary border-academy-primary'
                                        : taken ? 'border-academy-border text-academy-textMain/25 line-through cursor-not-allowed'
                                        : 'border-academy-border hover:border-academy-primary'}`}>
                                {s}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </section>

                  {topic && date && (
                    <p className="text-center text-sm text-academy-textMain/70">
                      {topic.label} · {formatDate(date)}{timeSlot ? ` à ${timeSlot}` : ''}
                      {Number(topic.price) > 0 ? ` · ${Number(topic.price).toLocaleString('fr-FR')} ${cfg.currency || 'DA'}` : ''}
                    </p>
                  )}
                  {error && <p className="text-center text-sm font-bold text-red-500">{error}</p>}

                  <button type="submit" disabled={submitting}
                          className="w-full py-4 rounded-xl bg-academy-primary hover:opacity-90 text-academy-onPrimary font-bold text-lg transition-opacity disabled:opacity-60">
                    {submitting ? 'Réservation…' : 'Réserver ma séance'}
                  </button>
                </form>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
