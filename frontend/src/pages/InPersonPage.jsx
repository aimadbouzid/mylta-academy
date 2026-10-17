import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle, MapPin, Clock, Users, Check, Copy } from 'lucide-react'
import Navbar from '../components/Navbar'
import TrainingLocation from '../components/TrainingLocation'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'
import { useSiteSettings } from '../context/SiteSettingsContext'
import StepIndicator from '../components/StepIndicator'
import { formatDate } from '../utils/sessionDates'
import { PAYMENT_INFO } from '../config/paymentConfig'

const STEPS = ['Formation', 'Date', 'Profil', 'Infos']

// Mêmes clés que PROFILE_LABELS côté serveur (routes/inPerson.js).
const QUESTIONS = [
  { key: 'level', title: 'Quel est votre niveau actuel ?', options: ['Débutant total', 'Intermédiaire', 'Avancé'] },
  { key: 'goal', title: 'Pourquoi souhaitez-vous suivre cette formation ?', options: ['Création de contenu perso', 'Pour mon business', 'Devenir monteur pro'] },
  { key: 'phoneType', title: 'Quel smartphone utilisez-vous ?', options: ['iPhone (iOS)', 'Android'] },
  { key: 'capcut', title: 'Avez-vous déjà utilisé CapCut ?', options: ['Oui, régulièrement', 'Juste essayé', 'Jamais'] },
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
const hours = (s) => (s.startTime ? `${hour(s.startTime)}${s.endTime ? ` – ${hour(s.endTime)}` : ''}` : '')
const money = (n, cur) => `${Number(n).toLocaleString('fr-FR')} ${cur || 'DA'}`

export default function InPersonPage() {
  const { settings, loadingSettings } = useSiteSettings()
  const cfg = settings?.inPerson
  const currency = settings?.coaching?.currency || 'DA'
  const whatsappNumber = settings?.coaching?.whatsappNumber
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
  const [isStudent, setIsStudent] = useState(false)
  const [studentCard, setStudentCard] = useState('')
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
      requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } catch (err) {
      setError(err.response?.data?.error || "L'inscription a échoué. Réessayez.")
      if (err.response?.status === 409) { loadSessions(); goTo(1) }
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
  const primaryBtn = 'w-full py-4 rounded-xl bg-academy-primary text-academy-onPrimary font-bold text-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-40'

  const PriceBox = () => (
    <div className="rounded-xl border-2 border-academy-primary/30 bg-academy-primary/5 p-4">
      {oldPrice > 0 && (
        <p className="text-xs font-black uppercase tracking-wider text-academy-primary mb-1">Offre de lancement</p>
      )}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-2xl font-black">{money(price, currency)}</span>
        {oldPrice > 0 && <span className="text-sm text-academy-textMain/45 line-through">{money(oldPrice, currency)}</span>}
        {discount > 0 && <span className="text-xs font-black text-white bg-emerald-600 rounded-full px-2 py-0.5">-{discount}%</span>}
      </div>
      {studentPrice > 0 && !studentRate && (
        <p className="mt-1 text-sm font-bold">🎓 Étudiants : {money(studentPrice, currency)} <span className="font-normal text-academy-textMain/60">(avec carte étudiante)</span></p>
      )}
      {studentRate && <p className="mt-1 text-xs font-black uppercase tracking-wider text-academy-textMain/60">Tarif étudiant</p>}
      {deposit > 0 && (
        <div className="mt-3 pt-3 border-t border-academy-primary/15 space-y-1 text-sm">
          <div className="flex justify-between gap-4"><span className="font-bold text-academy-primary">Acompte pour réserver</span><span className="font-black">{money(deposit, currency)}</span></div>
          <div className="flex justify-between gap-4 text-academy-textMain/60"><span>Reste à payer ensuite</span><span>{money(Math.max(0, price - deposit), currency)}</span></div>
        </div>
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
        description="Formation en présentiel de 3 jours : filmer, monter sur CapCut et utiliser l'IA comme un pro depuis votre smartphone. Petit groupe, places limitées."
        canonicalPath="/coaching-presentiel"
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
                <div className="text-center mb-6">
                  <p className="text-xs font-black uppercase tracking-widest text-academy-primary mb-2">Coaching présentiel</p>
                  <h1 className="font-display font-black text-3xl sm:text-5xl tracking-tight mb-2">{cfg.title}</h1>
                  <p className="text-academy-textMain/60 sm:text-lg">{cfg.subtitle}</p>
                </div>

                <StepIndicator steps={STEPS} current={step} onGo={goTo} />

                {step > 0 && (
                  <button type="button" onClick={() => goTo(step - 1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-academy-textMain/60 hover:text-academy-textMain">
                    <ArrowLeft size={16} /> Retour
                  </button>
                )}

                {/* 1. La formation */}
                {step === 0 && (
                  <section className={`${card} space-y-5`}>
                    {(cfg.infos || []).length > 0 && (
                      <ul className="grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-academy-border bg-academy-border">
                        {cfg.infos.map((info, i) => (
                          <li key={i} className="bg-white px-1.5 py-2.5 text-center text-[12px] sm:text-[13px] font-bold leading-tight flex items-center justify-center">{info}</li>
                        ))}
                      </ul>
                    )}

                    {(cfg.program || []).length > 0 && (() => {
                      // Le programme est réparti sur les 3 jours de la formation.
                      const perDay = Math.ceil(cfg.program.length / 3)
                      const days = [0, 1, 2].map(d => cfg.program.slice(d * perDay, (d + 1) * perDay)).filter(d => d.length)
                      return (
                        <div>
                          <h2 className="font-display font-black text-xl mb-3">Le programme</h2>
                          <ol className="space-y-0 border-t border-academy-border">
                            {days.map((items, d) => (
                              <li key={d} className="flex gap-4 py-3 border-b border-academy-border">
                                <div className="shrink-0 w-14 text-center">
                                  <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-academy-textMain/45">Jour</span>
                                  <span className="block font-display font-black text-2xl leading-none text-academy-primary">{d + 1}</span>
                                </div>
                                <ul className="flex-1 space-y-1.5 pt-0.5">
                                  {items.map((p, i) => (
                                    <li key={i} className="text-[14.5px] font-semibold leading-snug">{p}</li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )
                    })()}

                    {price > 0 && <PriceBox />}
                    <button type="button" onClick={() => goTo(1)} className={primaryBtn}>
                      Je réserve ma place <ArrowRight size={18} />
                    </button>
                    <p className="text-center text-sm">
                      Vous préférez à distance ? <Link to="/coaching" className="font-bold text-academy-primary underline underline-offset-2">Coaching en ligne</Link>
                    </p>
                  </section>
                )}
                {step === 0 && <div className="mt-4"><TrainingLocation /></div>}


                {/* 2. La date */}
                {step === 1 && (
                  <section className={`${card} space-y-4`}>
                    <h2 className="font-bold text-lg">Choisissez votre session</h2>
                    {cfg.datesNotice && (
                      <p className="text-[13px] leading-snug text-academy-textMain/70">{cfg.datesNotice}</p>
                    )}
                    {sessions === null ? (
                      <p className="text-sm text-academy-textMain/60">Chargement des dates…</p>
                    ) : (
                      <div className="space-y-2">
                        {sessions.length === 0 && (
                          <p className="text-sm text-academy-textMain/70 bg-academy-surface rounded-xl p-4">
                            Les prochaines dates arrivent bientôt. Inscrivez-vous : on vous prévient en premier.
                          </p>
                        )}
                        {/* Une même date revenait deux fois, matin puis après-midi : la liste
                            doublait de longueur et deux lignes voisines ne se distinguaient
                            que par leur étiquette. Une date = une ligne, ses créneaux dedans. */}
                        {Object.entries(sessions.reduce((acc, s) => ((acc[s.date] ||= []).push(s), acc), {})).map(([date, slots]) => {
                          const picked = slots.some(s => s.id === sessionId)
                          return (
                            <div key={date} className={`rounded-xl border-2 p-3 transition-colors ${picked ? 'border-academy-primary bg-academy-primary/5' : 'border-academy-border'}`}>
                              <p className="font-bold text-[15px] leading-tight">{shortRange(date)}</p>
                              <p className="text-xs text-academy-textMain/55 mt-0.5">3 jours de suite</p>
                              <div className="mt-2.5 grid grid-cols-2 gap-2">
                                {[...slots].sort((a, b) => isMorning(b) - isMorning(a)).map(s => {
                                  const full = s.seatsLeft <= 0
                                  const on = sessionId === s.id
                                  const am = isMorning(s)
                                  return (
                                    <button type="button" key={s.id} disabled={full} onClick={() => setSessionId(s.id)}
                                            className={`rounded-lg border-2 px-2.5 py-2 text-left transition-colors ${on ? 'border-academy-primary bg-white' : 'border-academy-border bg-white'} ${full ? 'opacity-50 cursor-not-allowed' : 'hover:border-academy-primary/50'}`}>
                                      <span className={`block text-[11px] font-black uppercase tracking-wide ${am ? 'text-amber-700' : 'text-indigo-700'}`}>{am ? 'Matin' : 'Après-midi'}</span>
                                      <span className="block text-[13px] font-bold">{hours(s) || '—'}</span>
                                      {full
                                        ? <span className="block text-[11px] font-bold text-red-600">Complet</span>
                                        : cfg.showSeats && <span className="block text-[11px] text-academy-textMain/55">{s.seatsLeft === 1 ? "Plus qu'1 place" : `${s.seatsLeft} places`}</span>}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                        <button type="button" onClick={() => setSessionId(null)} className={`${choice(sessionId === null, false)} !p-3`}>
                          <span className={radio(sessionId === null)} aria-hidden="true" />
                          <span>
                            <span className="font-bold block text-[15px]">{sessions.length === 0 ? 'Me prévenir des prochaines dates' : 'Aucune date ne me convient'}</span>
                            <span className="text-[13px] text-academy-textMain/60">Liste d'attente : on vous contacte dès qu'une date est fixée. Aucun paiement pour l'instant.</span>
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
                    {whatsappNumber && (
                      <div className="rounded-xl border border-academy-border bg-academy-surface/60 p-3 text-[13px]">
                        <p className="font-bold text-[14px]">Vous travaillez en semaine ?</p>
                        <p className="text-academy-textMain/70 mt-0.5">Formule week-end en 2 jours (samedi + dimanche), dans un autre lieu à Béjaïa. On organise ça ensemble sur WhatsApp.</p>
                        <a href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent("Bonjour Mylta Academy, je suis intéressé(e) par la formation IA & Montage Vidéo en week-end (samedi + dimanche).")}`}
                           target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 font-bold text-[#128C7E]">
                          <MessageCircle size={16} /> En parler sur WhatsApp
                        </a>
                      </div>
                    )}
                    <button type="button" disabled={sessions === null} onClick={() => goTo(2)} className={primaryBtn}>
                      Continuer <ArrowRight size={18} />
                    </button>
                  </section>
                )}

                {/* 3. Votre profil */}
                {step === 2 && (
                  <section className={`${card} space-y-5`}>
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
                  <form onSubmit={handleSubmit} className={`${card} space-y-4 relative`}>
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
