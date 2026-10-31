import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle, MapPin, Clock, Users, Check, Copy, Sun, Sunset, ChevronDown } from 'lucide-react'
import Navbar from '../components/Navbar'
import { trackEvent } from '../lib/facebookPixel'
import TrainingLocation from '../components/TrainingLocation'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'
import { useSiteSettings } from '../context/SiteSettingsContext'
import StepIndicator from '../components/StepIndicator'
import Curriculum from '../components/Curriculum'
import { formatDate } from '../utils/sessionDates'
import { PAYMENT_INFO } from '../config/paymentConfig'
import { getSessions } from '../api/sessions'

const STEPS = ['Formation', 'Date', 'Profil', 'Infos']

// Mêmes clés que PROFILE_LABELS côté serveur (routes/inPerson.js).
// Deux questions, pas quatre. « Pourquoi cette formation ? » servait au
// marketing et « Avez-vous utilisé CapCut ? » redisait le niveau : chaque
// question de plus est une occasion d'abandonner avant la fin. Restent les
// deux seules qui changent la préparation de la journée.
// Le serveur accepte n'importe quel ensemble de réponses : les inscriptions
// déjà enregistrées gardent les leurs.
const QUESTIONS = [
  { key: 'level', title: 'Quel est votre niveau actuel ?', options: ['Débutant total', 'Intermédiaire', 'Avancé'] },
  { key: 'phoneType', title: 'Quel smartphone utilisez-vous ?', options: ['iPhone (iOS)', 'Android'] },
]
const CONDITIONS = [
  'Je suis disponible pendant toute la durée de la formation.',
  "Je comprends que l'acompte est obligatoire pour réserver ma place.",
  "Je m'engage à respecter les horaires.",
]

// Photo de carte étudiante : réduite à 1200 px en JPEG (léger, compatible iPhone) avant l'envoi.
const compressPhoto = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    const scale = Math.min(1, 1200 / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(url)
    resolve(canvas.toDataURL('image/jpeg', 0.7))
  }
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')) }
  img.src = url
})

const hour = (t) => (t ? t.replace(':', 'h') : '')
const isMorning = (s) => !s.startTime || s.startTime < '12:00'
// « Mar. 20 → jeu. 22 oct. » : début et fin des 3 jours, lisible d'un coup d'œil.
const shortRange = (date) => {
  const [y, m, d] = date.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const end = new Date(y, m - 1, d + 2)
  const day = (dt) => dt.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
  const month = (dt) => dt.toLocaleDateString('fr-FR', { month: 'short' })
  const label = `${day(start)}${start.getMonth() === end.getMonth() ? '' : ` ${month(start)}`} → ${day(end)} ${month(end)}`
  return label.charAt(0).toUpperCase() + label.slice(1)
}
const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1)
const hours = (s) => (s.startTime ? `${hour(s.startTime)}${s.endTime ? ` – ${hour(s.endTime)}` : ''}` : '')
const money = (n, cur) => `${Number(n).toLocaleString('fr-FR')} ${cur || 'DA'}`

export default function InPersonPage() {
  const { settings, loadingSettings } = useSiteSettings()
  const cfg = settings?.inPerson
  const currency = settings?.coaching?.currency || 'DA'
  const whatsappNumber = settings?.inPerson?.whatsappNumber || settings?.coaching?.whatsappNumber
  const topRef = useRef(null)

  const [step, setStep] = useState(0)
  const [sessions, setSessions] = useState(null)
  const [sessionId, setSessionId] = useState(null) // null = liste d'attente
  const [profile, setProfile] = useState({})
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [message, setMessage] = useState('')
  const [accepted, setAccepted] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)
  const [showPlace, setShowPlace] = useState(false)
  const [copied, setCopied] = useState('')
  const [reprise, setReprise] = useState(false)

  const loadSessions = (rafraichir = false) => {
    getSessions(rafraichir)
      .then((list) => {
        const data = { sessions: list }
        setSessions(data.sessions || [])
        const firstFree = (data.sessions || []).find(s => s.seatsLeft > 0)
        setSessionId(id => id ?? firstFree?.id ?? null)
      })
      .catch(() => setSessions([]))
  }
  useEffect(() => { if (cfg?.enabled) loadSessions() }, [cfg?.enabled])

  const selected = sessions?.find(s => s.id === sessionId)

  // En-tête : les trois jours de la prochaine session ouverte, avec l'horaire.
  const headlineSession = selected || sessions?.find(x => x.seatsLeft > 0) || sessions?.[0]
  const headline = (() => {
    if (!headlineSession?.date) return null
    const [y, m, d] = headlineSession.date.split('-').map(Number)
    const days = [0, 1, 2].map(i => {
      const dt = new Date(y, m - 1, d + i)
      return { num: dt.getDate(), weekday: dt.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '') }
    })
    const last = new Date(y, m - 1, d + 2)
    const month = cap(last.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }))
    return { days, month, hours: hours(headlineSession) || '' }
  })()
  const [isStudent, setIsStudent] = useState(false)
  const [studentCard, setStudentCard] = useState('')

  const BROUILLON = 'mylta-inscription'

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(BROUILLON) || 'null')
      if (!v || Date.now() - (v.t || 0) > 30 * 86400000) return localStorage.removeItem(BROUILLON)
      if (v.fullName) setFullName(v.fullName)
      if (v.phone) setPhone(v.phone)
      if (v.city) setCity(v.city)
      if (v.message) setMessage(v.message)
      if (v.profile) setProfile(v.profile)
      if (v.sessionId) setSessionId(v.sessionId)
      if (v.isStudent) setIsStudent(true)
      if (v.step) setStep(Math.min(Number(v.step) || 0, 3))
      if (v.fullName || v.phone || v.step) setReprise(true)
    } catch { /* stockage indisponible : on continue sans brouillon */ }
  }, [])

  useEffect(() => {
    if (done) return
    try {
      localStorage.setItem(BROUILLON, JSON.stringify(
        { t: Date.now(), step, sessionId, profile, fullName, phone, city, message, isStudent }))
    } catch { /* quota ou navigation privée : tant pis, ce n'est qu'un confort */ }
  }, [done, step, sessionId, profile, fullName, phone, city, message, isStudent])

  useEffect(() => { if (done) { try { localStorage.removeItem(BROUILLON) } catch { /* rien à nettoyer */ } } }, [done])

  const effacerBrouillon = () => {
    try { localStorage.removeItem(BROUILLON) } catch { /* déjà absent */ }
    setFullName(''); setPhone(''); setCity(''); setMessage('')
    setProfile({}); setIsStudent(false); setReprise(false); setStep(0)
  }
  const studentPrice = Number(cfg?.studentPrice) || 0
  const studentRate = isStudent && studentPrice > 0
  const price = studentRate ? studentPrice : (Number(selected?.price) || Number(cfg?.price) || 0)
  const deposit = Number(cfg?.deposit) || 0
  const oldPrice = Number(cfg?.oldPrice) > price ? Number(cfg.oldPrice) : 0
  const discount = oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0
  const [website, setWebsite] = useState('') // piège à robots
  const allAccepted = (!selected || accepted.length === CONDITIONS.length) && (!studentRate || !!studentCard)
  const profileReady = QUESTIONS.every(q => profile[q.key])

  const goTo = (n) => {
    setError('')
    setStep(n)
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data } = await api.post('/in-person/register', {
        fullName, phone, city, message, sessionId, profile, accepted: accepted.length === CONDITIONS.length, website,
        isStudent: studentRate, studentCard: studentRate ? studentCard : undefined,
      })
      setDone(data.registration)

      // Réservation payante (acompte) : intention d'achat, pas simple contact.
      trackEvent('InitiateCheckout', {
        content_name: 'Formation présentiel',
        content_type: 'product',
        value: Number(data.registration?.price) || 0,
        currency: 'DZD',
      })

      requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } catch (err) {
      setError(err.response?.data?.error || "L'inscription a échoué. Réessayez.")
      if (err.response?.status === 409) { loadSessions(true); goTo(1) }
    } finally {
      setSubmitting(false)
    }
  }

  const copy = (key, value) => {
    navigator.clipboard?.writeText(value).then(() => { setCopied(key); setTimeout(() => setCopied(''), 1500) }).catch(() => {})
  }

  const doneSession = done?.session
  const whatsappUrl = done && whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
        (doneSession
          ? `Bonjour Mylta Academy, je viens de réserver ma place pour la ${cfg.title} et je vous envoie le reçu de mon acompte de ${money(deposit, currency)}.\n`
          : `Bonjour Mylta Academy, je souhaite être prévenu(e) des prochaines dates de la ${cfg.title}.\n`) +
        `• Nom : ${fullName}\n• Téléphone : ${phone}\n` +
        (studentRate ? `• Tarif étudiant : ${money(studentPrice, currency)} (carte étudiante envoyée sur le site)\n` : '') +
        (city ? `• Ville : ${city}\n` : '') +
        (doneSession ? `• Session : ${formatDate(doneSession.date)}${doneSession.city ? ` — ${doneSession.city}` : ''}\n` : '') +
        `Inscription n°${done.id}`
      )}`
    : null

  const card = 'bg-white border border-academy-border rounded-2xl p-5 sm:p-6 shadow-sm'
  const input = 'w-full bg-white border border-academy-border rounded-xl px-4 py-3.5 text-base text-academy-textMain outline-none focus:border-academy-primary'
  const choice = (active, disabled) => `w-full text-left rounded-xl border-2 p-4 flex items-start gap-3 transition-colors ${
    disabled ? 'border-academy-border opacity-50 cursor-not-allowed'
    : active ? 'border-academy-primary bg-academy-primary/5' : 'border-academy-border hover:border-academy-primary/40'}`
  const radio = (active) => `mt-1 w-4 h-4 rounded-full border-2 shrink-0 ${active ? 'border-academy-primary bg-academy-primary shadow-[inset_0_0_0_3px_white]' : 'border-academy-textMain/30'}`
  const primaryBtn = 'sticky bottom-3 z-20 w-full py-4 rounded-xl bg-academy-primary text-academy-onPrimary font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-black/15 transition-opacity hover:opacity-90 disabled:opacity-40'

  // Prix : un bloc sobre, à filets, comme l'en-tête — pas de carte colorée.
  const PriceBox = () => (
    <div className="border-y-2 border-academy-textMain py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-academy-textMain/50">
        {oldPrice > 0 ? 'Offre de lancement' : studentRate ? 'Tarif étudiant' : 'Prix de la formation'}
      </p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="font-display font-black text-3xl tracking-tight">{money(price, currency)}</span>
        {oldPrice > 0 && <span className="text-sm text-academy-textMain/45 line-through">{money(oldPrice, currency)}</span>}
        {discount > 0 && <span className="text-[11px] font-black text-academy-surface bg-academy-textMain rounded px-1.5 py-0.5">-{discount}%</span>}
      </div>
      {studentPrice > 0 && !studentRate && (
        <p className="mt-1 text-[13.5px]">
          <b>Étudiants : {money(studentPrice, currency)}</b> <span className="text-academy-textMain/55">avec la carte étudiante</span>
        </p>
      )}
      {deposit > 0 && (
        <dl className="mt-3 pt-3 border-t border-academy-border space-y-1.5 text-[13.5px]">
          <div className="flex justify-between gap-4">
            <dt className="font-bold">Acompte pour réserver</dt>
            <dd className="font-black tabular-nums">{money(deposit, currency)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-academy-textMain/60">
            <dt>Reste à payer ensuite</dt>
            <dd className="tabular-nums">{money(Math.max(0, price - deposit), currency)}</dd>
          </div>
        </dl>
      )}
    </div>
  )

  const paymentLines = [
    PAYMENT_INFO.ccp && ['CCP', PAYMENT_INFO.ccp],
    PAYMENT_INFO.barid && ['BaridiMob (RIP)', PAYMENT_INFO.barid],
    PAYMENT_INFO.redotpay && ['RedotPay', PAYMENT_INFO.redotpay],
  ].filter(Boolean)

  return (
    <>
      <SEOHead
        title={`${cfg?.title || 'Coaching présentiel'} | Mylta Academy`}
        description="Les 12, 13 et 14 novembre à Béjaïa : filmer, monter sur CapCut et faire travailler l'IA depuis votre smartphone. 3 jours en présentiel, 10 places."
        canonicalPath="/coaching-presentiel"
        ogImage="/og-formation.png"
      />
      <div className="min-h-screen bg-transparent text-academy-textMain flex flex-col">
        <Navbar />

        <main className="flex-1 pt-28 sm:pt-36 pb-28 sm:pb-16 px-4">
          <div ref={topRef} className="max-w-2xl mx-auto scroll-mt-28">
            {loadingSettings ? (
              <p className="text-center text-academy-textMain/60">Chargement…</p>
            ) : !cfg?.enabled ? (
              <p className="text-center text-academy-textMain/60">Le coaching présentiel n'est pas disponible pour le moment.</p>
            ) : done ? (
              <div className={`${card} space-y-5`}>
                <div className="text-center">
                  <CheckCircle2 size={52} className="mx-auto text-emerald-500 mb-3" />
                  <h1 className="font-display font-black text-2xl sm:text-3xl mb-1">
                    {doneSession ? 'Plus qu\'une étape !' : "C'est noté !"}
                  </h1>
                  <p className="text-academy-textMain/60">Inscription n°{done.id}</p>
                </div>

                {doneSession ? (
                  <>
                    <div className="bg-academy-surface rounded-xl p-4 text-sm space-y-1">
                      <p className="font-bold">{formatDate(doneSession.date)}{hours(doneSession) ? ` · ${hours(doneSession)}` : ''}</p>
                      {(doneSession.city || doneSession.place) && <p>{[doneSession.place, doneSession.city].filter(Boolean).join(', ')}</p>}
                    </div>
                    {deposit > 0 && (
                      <div>
                        <h2 className="font-bold text-lg mb-1">Payez l'acompte de {money(deposit, currency)}</h2>
                        <p className="text-sm text-academy-textMain/65 mb-3">Votre place est réservée dès réception de l'acompte. Envoyez-le sur l'un de ces comptes au nom de <strong>{PAYMENT_INFO.nom}</strong> :</p>
                        <div className="space-y-2">
                          {paymentLines.map(([label, value]) => (
                            <button type="button" key={label} onClick={() => copy(label, value)}
                                    className="w-full flex items-center justify-between gap-3 rounded-xl border border-academy-border p-3 text-left hover:border-academy-primary/40">
                              <span><span className="block text-xs font-bold text-academy-textMain/55">{label}</span><span className="font-mono font-bold">{value}</span></span>
                              <span className="text-xs font-bold text-academy-primary inline-flex items-center gap-1">{copied === label ? 'Copié ✓' : <><Copy size={14} /> Copier</>}</span>
                            </button>
                          ))}
                        </div>
                        <p className="text-sm text-academy-textMain/65 mt-3">Ensuite, envoyez la photo du reçu sur WhatsApp :</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-academy-textMain/70">Vous êtes sur la liste d'attente : on vous prévient en premier dès que la prochaine date est fixée. Aucun paiement pour l'instant.</p>
                )}

                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                     className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold px-6 py-4 rounded-xl transition-colors text-lg">
                    <MessageCircle size={20} /> {doneSession && deposit > 0 ? 'Envoyer mon reçu sur WhatsApp' : 'Confirmer sur WhatsApp'}
                  </a>
                )}
              </div>
            ) : (
              <>
                <header className="mb-6">
                  {/* Le formateur à côté du titre : on réserve trois jours avec
                      quelqu'un, pas avec un programme. Un visage change la
                      lecture de la page bien plus qu'un argument de plus. */}
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-academy-primary">
                        Formation présentielle · {(cfg.venueAddress || '').split(',').pop().trim() || 'Béjaïa'}
                      </p>
                      <h1 className="mt-1.5 font-display font-black text-[1.75rem] sm:text-[2.75rem] leading-[1.03] tracking-tight">{cfg.title}</h1>
                      <p className="mt-2 text-[14px] sm:text-[17px] text-academy-textMain/65 leading-snug max-w-xl">{cfg.subtitle}</p>
                    </div>

                    <figure className="shrink-0 w-[92px] sm:w-[150px]">
                      <img src="/formateur.jpg" alt="Le formateur de Mylta Academy"
                           width="534" height="900" decoding="async"
                           className="w-full aspect-[3/4] object-cover rounded-2xl border border-academy-border shadow-soft" />
                      <figcaption className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-academy-textMain/45 text-center">
                        Votre formateur
                      </figcaption>
                    </figure>
                  </div>

                  {/* Les trois jours, l'horaire et le lieu : l'essentiel avant tout le reste. */}
                  {headline && (
                    <div className="mt-5 border-y-2 border-academy-textMain py-4">
                      <ol className="flex gap-2">
                        {headline.days.map(d => (
                          <li key={d.num} className="flex-1 text-center rounded-lg bg-academy-textMain text-academy-surface py-2">
                            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">{d.weekday}</span>
                            <span className="block font-display font-black text-2xl leading-none mt-0.5">{d.num}</span>
                          </li>
                        ))}
                      </ol>
                      <p className="mt-2.5 font-bold text-[15px]">{headline.month}</p>
                      <p className="text-[13.5px] text-academy-textMain/65">
                        {headline.hours}{cfg.venue ? ` · ${cfg.venue}` : ''}
                      </p>
                    </div>
                  )}
                </header>

                <StepIndicator steps={STEPS} current={step} onGo={goTo} />

                {reprise && !done && (
                  <p className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-academy-border bg-academy-primary/5 px-3 py-2 text-[13px]">
                    <span className="font-bold">On a gardé vos réponses.</span>
                    <span className="text-academy-textMain/60">Vous reprenez où vous vous étiez arrêté.</span>
                    <button type="button" onClick={effacerBrouillon}
                            className="font-bold text-academy-primary underline underline-offset-2">Tout effacer</button>
                  </p>
                )}

                {step > 0 && (
                  <button type="button" onClick={() => goTo(step - 1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-academy-textMain/60 hover:text-academy-textMain">
                    <ArrowLeft size={16} /> Retour
                  </button>
                )}

                {/* 1. La formation */}
                {step === 0 && (
                  <section key="etape-0" className={`${card} space-y-5 etape-entre`}>
                    {/* Le contenu présenté comme un forfait : la liste cochée dit
                        « voilà tout ce que vous avez pour ce prix », là où une
                        suite de mots séparés par des points se survolait sans
                        rien retenir. Les premières entrées viennent des réglages,
                        les deux dernières sont les promesses de l'offre. */}
                    <div className="rounded-2xl border-2 border-academy-textMain overflow-hidden">
                      <p className="px-4 py-2 bg-academy-textMain text-academy-surface text-[10px] font-black uppercase tracking-[0.18em]">
                        Tout est compris
                      </p>
                      {/* Deux colonnes dès le téléphone : les mentions sont courtes.
                          Les deux promesses, plus longues, prennent la ligne entière. */}
                      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 p-3.5">
                        {[...(cfg.infos || []), 'Suivi gratuit après la formation', 'Certificat Mylta Academy'].map((item, i, tab) => {
                          const phare = i >= tab.length - 2
                          return (
                            <li key={item} className={`flex items-start gap-2 text-[13px] leading-snug ${phare ? 'col-span-2' : ''}`}>
                              <Check size={14} strokeWidth={3}
                                     className={`mt-[3px] shrink-0 ${phare ? 'text-academy-primary' : 'text-academy-textMain/35'}`} />
                              <span className={phare ? 'font-bold' : 'font-medium text-academy-textMain/75'}>{item}</span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>

                    {/* Le programme, en couleur : c'est ce qu'on achète, il doit se voir
                        tout de suite. Le détail complet reste juste en dessous. */}
                    {(cfg.curriculum?.fr || []).length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-academy-textMain/50">
                          Le programme, jour par jour
                        </p>
                        <ol className="mt-2 space-y-1.5">
                          {(cfg.curriculum.fr).map((d, i) => (
                            <li key={i} className="flex items-center gap-3 rounded-lg bg-academy-primary/10 border-l-4 border-academy-primary py-2 px-3">
                              <span className="shrink-0 font-display font-black text-[15px] text-academy-primary leading-none">J{i + 1}</span>
                              <span className="text-[14.5px] font-bold leading-snug">{d.title}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Un formateur par métier : c'est ce qui change tout sur trois jours. */}
                    {(cfg.coaches || []).length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-academy-textMain/50">
                          {cfg.coaches.length} coachs, un par spécialité
                        </p>
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {cfg.coaches.map((c, i) => (
                            <li key={i} className="rounded-full border border-academy-border bg-academy-surface
                                                   dark:bg-white/[0.04] px-3 py-1.5 text-[13px] font-bold">
                              {c.role}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {price > 0 && <PriceBox />}
                    <button type="button" onClick={() => goTo(1)} className={primaryBtn}>
                      Je réserve ma place <ArrowRight size={18} />
                    </button>
                    {settings?.coaching?.enabled && (
                      <p className="text-center text-sm">
                        Vous préférez à distance ? <Link to="/coaching" className="font-bold text-academy-primary underline underline-offset-2">Coaching en ligne</Link>
                      </p>
                    )}
                  </section>
                )}
                {/* Le détail est replié : la première étape doit tenir sur un
                    écran et répondre à « c'est quoi, quand, combien ». Qui veut
                    le programme complet ou le lieu les ouvre lui-même. */}
                {step === 0 && (
                  <details className={`${card} mt-4 group/det`}>
                    <summary className="flex items-center justify-between gap-3 cursor-pointer list-none
                                        font-bold text-[15px] marker:hidden">
                      Le programme en détail
                      <ChevronDown size={18} className="shrink-0 text-academy-textMain/40 transition-transform group-open/det:rotate-180" />
                    </summary>
                    <div className="mt-4">
                      <Curriculum curriculum={cfg.curriculum} />
                    </div>
                  </details>
                )}
                {step === 0 && (
                  <details className={`${card} mt-4 group/det`}>
                    <summary className="flex items-center justify-between gap-3 cursor-pointer list-none
                                        font-bold text-[15px] marker:hidden">
                      Où ça se passe
                      <ChevronDown size={18} className="shrink-0 text-academy-textMain/40 transition-transform group-open/det:rotate-180" />
                    </summary>
                    <div className="mt-4"><TrainingLocation /></div>
                  </details>
                )}


                {/* 2. La date */}
                {step === 1 && (
                  <section key="etape-1" className={`${card} space-y-4 etape-entre`}>
                    <h2 className="font-bold text-lg">Choisissez votre session</h2>
                    {sessions === null ? (
                      <p className="text-sm text-academy-textMain/60">Chargement des dates…</p>
                    ) : (
                      <div className="space-y-2">
                        {sessions.length === 0 && (
                          <p className="text-sm text-academy-textMain/70 bg-academy-surface rounded-xl p-4">
                            Les prochaines dates arrivent bientôt. Inscrivez-vous : on vous prévient en premier.
                          </p>
                        )}
                        {/* Un créneau = une carte, réservable seule : le visiteur choisit
                            d'un seul geste la date ET le moment de la journée. */}
                        {[...sessions]
                          .sort((a, b) => a.date.localeCompare(b.date) || isMorning(b) - isMorning(a))
                          .map((s, i) => {
                            const full = s.seatsLeft <= 0
                            const on = sessionId === s.id
                            const am = isMorning(s)
                            return (
                              <button type="button" key={s.id} disabled={full} onClick={() => setSessionId(s.id)}
                                      className={`w-full text-left rounded-xl border-2 p-3 transition-colors ${on ? 'border-academy-primary bg-academy-primary/5' : 'border-academy-border'} ${full ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <div className="flex items-start justify-between gap-3">
                                  <span className="min-w-0">
                                    {/* Numéro de session : un repère à citer au téléphone ou sur
                                        WhatsApp, là où « la formation du 20 » prête à confusion
                                        entre le matin et le soir. */}
                                    <span className="block text-[11px] font-black uppercase tracking-[0.12em] text-academy-primary">Formation n° {i + 1}</span>
                                    <span className="block font-bold text-[15px] leading-tight mt-0.5">{shortRange(s.date)}</span>
                                    <span className="block text-xs text-academy-textMain/55 mt-0.5">3 jours de suite</span>
                                  </span>
                                  <span className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-black uppercase tracking-wide ${am ? 'bg-amber-50 text-amber-900' : 'bg-indigo-50 text-indigo-900'}`}>
                                    {am ? <Sun size={13} /> : <Sunset size={13} />} {am ? 'Matin' : 'Soir'}
                                  </span>
                                </div>
                                <span className="block mt-2 text-[13px] font-bold">{hours(s) || '—'}</span>
                                {full
                                  ? <span className="block text-[11px] font-bold text-red-600">Complet</span>
                                  : cfg.showSeats && <span className="block text-[11px] text-academy-textMain/60">{s.seatsLeft === 1 ? "Plus qu'1 place" : `${s.seatsLeft} places`}</span>}
                              </button>
                            )
                          })}
                        <button type="button" onClick={() => setSessionId(null)} className={`${choice(sessionId === null, false)} !p-3`}>
                          <span className={radio(sessionId === null)} aria-hidden="true" />
                          <span>
                            <span className="font-bold block text-[15px]">{sessions.length === 0 ? 'Me prévenir des prochaines dates' : 'Aucune date ne me convient'}</span>
                          </span>
                        </button>
                      </div>
                    )}
                    {/* Le tarif étudiant se décidait seulement à la dernière étape : on le
                        propose dès le choix de la date, là où le visiteur compare les prix. */}
                    {studentPrice > 0 && (
                      <label className="flex items-center gap-3 rounded-xl border border-academy-border bg-academy-surface/60 p-3 cursor-pointer">
                        <input type="checkbox" checked={isStudent} onChange={e => setIsStudent(e.target.checked)}
                               className="w-5 h-5 shrink-0 accent-academy-primary" />
                        <span className="text-[13px]">
                          <span className="font-bold text-[14px] block">🎓 Je suis étudiant(e) — {money(studentPrice, currency)}</span>
                          <span className="text-academy-textMain/65">Photo de votre carte étudiante demandée à la dernière étape.</span>
                        </span>
                      </label>
                    )}
                    <button type="button" disabled={sessions === null} onClick={() => goTo(2)} className={primaryBtn}>
                      Continuer <ArrowRight size={18} />
                    </button>
                  </section>
                )}

                {/* 3. Votre profil */}
                {step === 2 && (
                  <section key="etape-2" className={`${card} space-y-5 etape-entre`}>
                    {/* Entre le choix de la date et les questions, le visiteur perd
                        de vue ce qu'il réserve : la date et le lieu restent donc
                        sous ses yeux. Le programme, lui, a déjà été vu deux fois
                        à l'étape précédente. L'admin peut masquer ce bloc. */}
                    {cfg.recapEnabled !== false && selected && (
                      <div className="rounded-xl border border-academy-border bg-academy-surface/60 p-4 space-y-3">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-wider text-academy-textMain/50">Votre session</p>
                          <p className="font-bold text-[15px] mt-0.5">{formatDate(selected.date)}{hours(selected) ? ` · ${hours(selected)}` : ''}</p>
                        </div>
                        {(cfg.venue || cfg.venueAddress) && (
                          <div className="flex items-start gap-2">
                            <MapPin size={15} className="mt-0.5 shrink-0 text-academy-primary" />
                            <p className="text-[13px] leading-snug">
                              {cfg.venue && <span className="font-bold block">{cfg.venue}</span>}
                              {cfg.venueAddress && <span className="text-academy-textMain/65">{cfg.venueAddress}</span>}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {QUESTIONS.map(q => (
                      <div key={q.key}>
                        <h2 className="font-bold text-[15px] mb-2">{q.title}</h2>
                        <div className="flex flex-wrap gap-1.5">
                          {q.options.map(o => (
                            <button type="button" key={o} onClick={() => setProfile(p => ({ ...p, [q.key]: o }))}
                                    className={`h-9 px-3 rounded-full border text-xs font-semibold whitespace-nowrap transition-colors ${profile[q.key] === o ? 'border-academy-primary bg-academy-primary text-academy-onPrimary' : 'border-academy-border bg-white text-academy-textMain/80 hover:border-academy-primary/50'}`}>
                              {o}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button type="button" disabled={!profileReady} onClick={() => goTo(3)} className={primaryBtn}>
                      Continuer <ArrowRight size={18} />
                    </button>
                  </section>
                )}

                {/* 4. Vos infos + conditions */}
                {step === 3 && (
                  <form key="etape-3" onSubmit={handleSubmit} className={`${card} space-y-4 relative etape-entre`}>
                    <div className="bg-academy-surface rounded-xl p-4 text-sm space-y-1">
                      <p className="font-bold">{selected ? formatDate(selected.date) : "Liste d'attente — prochaines dates"}</p>
                      {selected && (selected.city || hours(selected)) && <p className="text-academy-textMain/70">{[hours(selected), selected.city].filter(Boolean).join(' · ')}</p>}
                    </div>
                    {selected && studentPrice > 0 && (
                      <div className="space-y-2">
                        <h2 className="font-bold">Votre tarif</h2>
                        <div className="grid grid-cols-2 gap-2">
                          {[[false, 'Normal', Number(selected?.price) || Number(cfg?.price) || 0], [true, 'Étudiant', studentPrice]].map(([student, label, amount]) => (
                            <button type="button" key={label} onClick={() => setIsStudent(student)}
                                    className={`rounded-xl border-2 p-2.5 text-left transition-colors ${isStudent === student ? 'border-academy-primary bg-academy-primary/5' : 'border-academy-border'}`}>
                              <span className="block text-xs font-bold text-academy-textMain/60">{label}</span>
                              <span className="block font-black">{money(amount, currency)}</span>
                            </button>
                          ))}
                        </div>
                        {isStudent && (
                          <label className="flex items-center gap-3 rounded-xl border border-dashed border-academy-border p-3 cursor-pointer">
                            {studentCard
                              ? <img src={studentCard} alt="Carte étudiante" className="w-16 h-12 object-cover rounded-md" />
                              : <span className="w-16 h-12 rounded-md bg-academy-surface flex items-center justify-center text-xl">🎓</span>}
                            <span className="text-sm">
                              <span className="font-bold block">{studentCard ? 'Carte ajoutée ✓ (toucher pour changer)' : 'Photo de votre carte étudiante *'}</span>
                              <span className="text-xs text-academy-textMain/60">Obligatoire pour le tarif étudiant. Prenez-la en photo.</span>
                            </span>
                            <input type="file" accept="image/*" capture="environment" className="hidden"
                                   onChange={e => { const f = e.target.files?.[0]; if (f) compressPhoto(f).then(setStudentCard).catch(() => setError('Photo illisible, réessayez.')) }} />
                          </label>
                        )}
                      </div>
                    )}
                    {selected && price > 0 && <PriceBox />}

                    <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website}
                           onChange={e => setWebsite(e.target.value)} className="absolute -left-[9999px] w-px h-px opacity-0" />
                    <h2 className="font-bold text-lg">Vos coordonnées</h2>
                    <input className={input} required minLength={3} maxLength={80} autoComplete="name" placeholder="Votre nom et prénom"
                           value={fullName} onChange={e => setFullName(e.target.value)} />
                    <input className={input} required type="tel" inputMode="tel" autoComplete="tel" maxLength={20} pattern="\+?[0-9 ]{8,20}"
                           title="Exemple : 0555 12 34 56" placeholder="Votre numéro WhatsApp (ex : 0555 12 34 56)"
                           value={phone} onChange={e => setPhone(e.target.value)} />
                    <input className={input} maxLength={60} autoComplete="address-level2" placeholder="Votre ville (facultatif)"
                           value={city} onChange={e => setCity(e.target.value)} />
                    <textarea className={input} rows={2} maxLength={500} placeholder="Une question ? (facultatif)"
                              value={message} onChange={e => setMessage(e.target.value)} />

                    {selected && (
                      <div className="space-y-2">
                        <h2 className="font-bold">Conditions de participation</h2>
                        {CONDITIONS.map((c, i) => {
                          const on = accepted.includes(i)
                          return (
                            <button type="button" key={i} onClick={() => setAccepted(a => on ? a.filter(x => x !== i) : [...a, i])}
                                    className={`w-full text-left rounded-lg border p-3 flex items-center gap-3 transition-colors ${on ? 'border-academy-primary bg-academy-primary/5' : 'border-academy-border'}`}>
                              <span className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center ${on ? 'bg-academy-primary border-academy-primary text-academy-onPrimary' : 'border-academy-textMain/30'}`}>
                                {on && <Check size={14} strokeWidth={3} />}
                              </span>
                              <span className="text-[13px] font-semibold leading-snug">{c}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {error && <p className="text-center text-sm font-bold text-red-600">{error}</p>}

                    <button type="submit" disabled={submitting || !allAccepted} className={primaryBtn}>
                      {submitting ? 'Inscription…' : selected ? 'Réserver ma place' : 'Je veux être prévenu'}
                    </button>
                  </form>
                )}

                {error && step !== 3 && <p className="mt-4 text-center text-sm font-bold text-red-600">{error}</p>}
                {step > 0 && (
                  <div className="mt-4">
                    <button type="button" onClick={() => setShowPlace(v => !v)}
                            className="w-full flex items-center justify-between gap-2 rounded-xl border border-academy-border bg-white px-4 py-3 text-left">
                      <span className="flex items-center gap-2 min-w-0">
                        <MapPin size={18} className="text-academy-primary shrink-0" />
                        <span className="min-w-0">
                          <span className="block text-[13px] font-bold">Lieu : Camden International Institute</span>
                          <span className="block text-xs text-academy-textMain/60">Bir Slam, Béjaïa · à 4 min de la gare routière</span>
                        </span>
                      </span>
                      <span className="shrink-0 text-[13px] font-bold text-academy-primary">{showPlace ? 'Masquer' : 'Voir le lieu'}</span>
                    </button>
                    {showPlace && <div className="mt-3"><TrainingLocation /></div>}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
