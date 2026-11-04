import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle, MapPin, Check, Copy, ChevronDown } from 'lucide-react'
import Navbar from '../components/Navbar'
import { trackEvent } from '../lib/facebookPixel'
import TrainingLocation from '../components/TrainingLocation'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'
import { useSiteSettings } from '../context/SiteSettingsContext'
import TicketDechire from '../components/TicketDechire'
import Curriculum from '../components/Curriculum'
import { formatDate } from '../utils/sessionDates'
import { PAYMENT_INFO } from '../config/paymentConfig'
import { getSessions } from '../api/sessions'

// L'offre d'abord, puis une question par écran, puis les coordonnées : on ne
// voit jamais qu'une seule chose à faire, et la barre de progression dit
// combien il en reste.

// Le pack se vend en un bloc, mais on montre de quoi il est fait : deux
// formations, chacune avec son prix. Leur somme est le prix barré ; le pack,
// lui, reste à son prix unique.
const MODULES = [
  { title: 'Filmer & publier avec son smartphone', price: 15000 },
  { title: "Montage CapCut & l'IA au travail", price: 20000 },
]
const MODULES_TOTAL = MODULES.reduce((t, m) => t + m.price, 0)

// Mêmes clés que PROFILE_LABELS côté serveur (routes/inPerson.js).
// Deux questions, pas quatre. « Pourquoi cette formation ? » servait au
// marketing et « Avez-vous utilisé CapCut ? » redisait le niveau : chaque
// question de plus est une occasion d'abandonner avant la fin. Restent les
// deux seules qui changent la préparation de la journée.
// Le serveur accepte n'importe quel ensemble de réponses : les inscriptions
// déjà enregistrées gardent les leurs.
// « court » est le nom donné à la réponse dans le message WhatsApp, où les
// intitulés complets seraient trop longs.
const QUESTIONS = [
  { key: 'level', court: 'Niveau', title: 'Quel est votre niveau actuel ?', options: ['Débutant total', 'Intermédiaire', 'Avancé'] },
  { key: 'phoneType', court: 'Smartphone', title: 'Quel smartphone utilisez-vous ?', options: ['iPhone (iOS)', 'Android'] },
  // Le domaine dit à qui on s'adresse : c'est ce qui permet de préparer des
  // exemples qui parlent au participant plutôt qu'un cours générique.
  { key: 'domaine', court: 'Domaine', title: 'Vous travaillez dans quel domaine ?',
    options: ['Commerce / boutique', 'Création de contenu', 'Services / artisanat', 'Étudiant(e)', 'Autre'] },
]
// Deux étapes avant la réservation : les questions, puis les coordonnées.
// Une par écran faisait quatre écrans à traverser — autant d'endroits où
// l'on s'arrête.
const DERNIERE_ETAPE = 2
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
  const FAITE = 'mylta-inscription-faite'

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
      if (v.step) setStep(Math.min(Number(v.step) || 0, DERNIERE_ETAPE))
      if (v.fullName || v.phone || v.step) setReprise(true)
    } catch { /* stockage indisponible : on continue sans brouillon */ }
  }, [])

  // Le tout premier passage est sauté : il aurait enregistré le formulaire vide
  // par-dessus le brouillon qu'on vient tout juste de relire, et les réponses
  // déjà données seraient perdues.
  const brouillonPret = useRef(false)
  useEffect(() => {
    if (!brouillonPret.current) { brouillonPret.current = true; return }
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
  const allAccepted = !studentRate || !!studentCard
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
        fullName, phone, city, message, sessionId, profile, accepted: true, website,
        isStudent: studentRate, studentCard: studentRate ? studentCard : undefined,
      })
      setDone(data.registration)
      try {
        localStorage.setItem(FAITE, JSON.stringify(
          { t: Date.now(), done: data.registration, fullName, phone }))
      } catch { /* stockage indisponible : la page reste affichée, c'est déjà ça */ }

      // L'inscription est enregistrée : c'est l'évènement qui compte pour la
      // publicité. Il part ici, bien avant le départ vers WhatsApp, pour avoir
      // le temps d'arriver.
      trackEvent('CompleteRegistration', {
        content_name: 'Formation présentiel',
        // Le serveur ne renvoie pas toujours le prix : sans ce repli, la
        // conversion remonterait à 0 DA et la publicité n'aurait rien à
        // optimiser.
        value: Number(data.registration?.price) || price || 0,
        currency: 'DZD',
      })

      // Réservation payante (acompte) : intention d'achat, pas simple contact.
      trackEvent('InitiateCheckout', {
        content_name: 'Formation présentiel',
        content_type: 'product',
        value: Number(data.registration?.price) || price || 0,
        currency: 'DZD',
      })

      requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } catch (err) {
      setError(err.response?.data?.error || "L'inscription a échoué. Réessayez.")
      if (err.response?.status === 409) { loadSessions(true); goTo(0) }
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
        // Le message est écrit du point de vue du client : il annonce son
        // paiement et donne tout ce qu'il a rempli. Le numéro d'inscription
        // n'y est pas — il ne lui dit rien, et le nom suffit à le retrouver.
        (doneSession
          ? `Bonjour Mylta Academy, je viens de réserver ma place pour la ${cfg.title}.\n` +
            (deposit > 0
              ? `Je vous envoie maintenant la preuve de paiement de mon acompte de ${money(deposit, currency)}.\n`
              : '')
          : `Bonjour Mylta Academy, je souhaite être prévenu(e) des prochaines dates de la ${cfg.title}.\n`) +
        `\nMes informations :\n` +
        `• Nom : ${fullName}\n• Téléphone : ${phone}\n` +
        QUESTIONS.filter(q => profile[q.key]).map(q => `• ${q.court} : ${profile[q.key]}\n`).join('') +
        (studentRate ? `• Tarif étudiant : ${money(studentPrice, currency)} (carte étudiante envoyée sur le site)\n` : '') +
        (city ? `• Ville : ${city}\n` : '') +
        (doneSession ? `• Session : ${formatDate(doneSession.date)}${doneSession.city ? ` — ${doneSession.city}` : ''}\n` : '') +
        (message ? `\nMa question : ${message}` : '')
      )}`
    : null

  // L'inscription enregistrée, on part sur WhatsApp sans rien demander de
  // plus : c'est là que la suite se joue (reçu de l'acompte, questions). La
  // page reste derrière, avec le billet et les coordonnées de paiement.
  const whatsappLance = useRef(false)
  // « Contact » ne part qu'une fois par visite : le départ automatique et le
  // bouton mènent au même endroit, et deux évènements fausseraient le compte.
  const contactEnvoye = useRef(false)
  const envoyerContact = () => {
    if (contactEnvoye.current) return
    contactEnvoye.current = true
    trackEvent('Contact')
  }
  useEffect(() => {
    if (!done || !whatsappUrl || whatsappLance.current) return
    whatsappLance.current = true
    // L'évènement part avant la navigation, pas en même temps : un évènement
    // émis au moment où la page est quittée n'arrive pas toujours.
    const contact = setTimeout(envoyerContact, 900)
    const depart = setTimeout(() => { window.location.href = whatsappUrl }, 1800)
    return () => { clearTimeout(contact); clearTimeout(depart) }
  }, [done, whatsappUrl])

  // Le client part sur WhatsApp, puis revient : il doit retrouver son billet et
  // les coordonnées de paiement, pas la page de vente. Sans cela, il n'a plus
  // nulle part où lire le CCP sur lequel envoyer son acompte.
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(FAITE) || 'null')
      if (!v?.done || Date.now() - (v.t || 0) > 14 * 86400000) return localStorage.removeItem(FAITE)
      whatsappLance.current = true // au retour, on ne repart pas sur WhatsApp tout seul
      if (v.fullName) setFullName(v.fullName)
      if (v.phone) setPhone(v.phone)
      setDone(v.done)
    } catch { /* stockage indisponible : on affiche la page normale */ }
  }, [])

  // Une place réservée n'interdit pas d'en réserver une autre (un proche, une
  // autre session) : il faut pouvoir repartir de zéro.
  const nouvelleReservation = () => {
    try { localStorage.removeItem(FAITE) } catch { /* déjà absent */ }
    whatsappLance.current = false
    setDone(null); setStep(0); setProfile({})
    setFullName(''); setPhone(''); setCity(''); setMessage('')
  }

  const card = 'bg-white border border-academy-border rounded-2xl p-5 sm:p-6 shadow-sm'
  const input = 'w-full bg-white border border-academy-border rounded-xl px-4 py-3.5 text-base text-academy-textMain outline-none focus:border-academy-primary'
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
              <div className="space-y-5">
                {doneSession && (
                  <TicketDechire
                    titre={cfg.title}
                    date={formatDate(doneSession.date)}
                    heures={hours(doneSession)}
                    lieu={[doneSession.place || cfg.venue, doneSession.city].filter(Boolean).join(', ')}
                    nom={fullName}
                  />
                )}

                <div className={`${card} space-y-5`}>
                <div className="text-center">
                  {!doneSession && <CheckCircle2 size={52} className="mx-auto text-emerald-500 mb-3" />}
                  <h1 className="font-display font-black text-2xl sm:text-3xl mb-1">
                    {doneSession ? 'Plus qu\'une étape !' : "C'est noté !"}
                  </h1>
                  {!doneSession && <p className="text-academy-textMain/60">Inscription n°{done.id}</p>}
                </div>

                {doneSession ? (
                  <>
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
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={envoyerContact}
                     className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold px-6 py-4 rounded-xl transition-colors text-lg">
                    <MessageCircle size={20} /> {doneSession && deposit > 0 ? 'Envoyer mon reçu sur WhatsApp' : 'Confirmer sur WhatsApp'}
                  </a>
                )}

                <button type="button" onClick={nouvelleReservation}
                        className="mx-auto block text-[13px] font-bold text-academy-textMain/50 underline underline-offset-2">
                  Réserver une autre place
                </button>
                </div>
              </div>
            ) : (
              <>

                {/* Une question par écran : la barre dit où l'on en est et
                    combien il reste — sans elle, on ne sait pas si c'est long. */}
                {step > 0 && (
                  <div className="mb-5">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-academy-textMain/55">
                      <span>Étape {step} sur {DERNIERE_ETAPE}</span>
                      <span className="tabular-nums">{Math.round((step / DERNIERE_ETAPE) * 100)} %</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-academy-border">
                      <div className="h-full rounded-full bg-academy-primary transition-[width] duration-500"
                           style={{ width: `${(step / DERNIERE_ETAPE) * 100}%` }} />
                    </div>
                  </div>
                )}

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

                {/* 1. L'offre en un seul objet : le bandeau dit pourquoi ce
                    prix, le prix suit, puis les trois jours et le bouton. */}
                {step === 0 && (
                  <section key="etape-0" className="etape-entre">
                    <article className="overflow-hidden rounded-3xl border border-academy-border bg-white
                                        shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)]">

                      <div className="flex items-center justify-between gap-3 bg-academy-primary px-5 py-2.5 text-white">
                        <p className="text-[10.5px] font-black uppercase tracking-[0.18em]">Offre de lancement</p>
                        {discount > 0 && <p className="text-[13px] font-black tabular-nums">−{discount} %</p>}
                      </div>

                      {/* Le titre et les trois jours tiennent en deux lignes,
                          dans la carte : le grand bandeau mangeait l'écran. */}
                      <div className="px-5 pt-4">
                        <h1 className="font-display font-black text-[1.35rem] leading-tight">{cfg.title}</h1>
                        {headline && (
                          <p className="mt-1 text-[13px] text-academy-textMain/60">
                            {headline.days.map(d => d.num).join(' · ')} {headline.month}
                            {headline.hours ? ` · ${headline.hours}` : ''}
                          </p>
                        )}
                      </div>

                      {price > 0 && (
                        <div className="px-5 pt-4">
                          <ul className="space-y-2">
                            {MODULES.map(m => (
                              <li key={m.title} className="flex items-baseline justify-between gap-3">
                                <span className="flex items-baseline gap-2 min-w-0">
                                  <Check size={14} strokeWidth={3} className="shrink-0 translate-y-0.5 text-academy-primary" />
                                  <span className="text-[14px] font-bold leading-snug">{m.title}</span>
                                </span>
                                <span className="shrink-0 text-[13.5px] tabular-nums text-academy-textMain/50">{money(m.price, currency)}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-4 flex items-end justify-between gap-4 border-t border-dashed border-academy-border pt-4">
                            <div className="min-w-0">
                              <p className="text-[10.5px] font-black uppercase tracking-[0.16em] text-academy-textMain/45">Les deux ensemble</p>
                              <p className="mt-1 font-display font-black text-[2.05rem] sm:text-[2.6rem] leading-none tracking-tight whitespace-nowrap">{money(price, currency)}</p>
                            </div>
                            <div className="shrink-0 text-end">
                              <p className="text-[13px] tabular-nums text-academy-textMain/45 line-through">{money(MODULES_TOTAL, currency)}</p>
                              {MODULES_TOTAL > price && (
                                <p className="mt-1.5 rounded-full bg-academy-primary/10 px-2.5 py-1 text-[12px] font-black text-academy-primary">
                                  −{money(MODULES_TOTAL - price, currency)}
                                </p>
                              )}
                            </div>
                          </div>

                          {deposit > 0 && (
                            <p className="mt-3 rounded-xl bg-academy-surface px-3.5 py-2.5 text-[13px] leading-snug">
                              <b>{money(deposit, currency)}</b> d'acompte pour réserver votre place,
                              <span className="text-academy-textMain/60"> le reste sur place le premier jour.</span>
                            </p>
                          )}
                        </div>
                      )}

                      {(cfg.curriculum?.fr || []).length > 0 && (
                        <ol className="space-y-2 px-5 pt-5">
                          {(cfg.curriculum.fr).map((d, i) => (
                            <li key={i} className="flex items-center gap-3">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg
                                               bg-academy-textMain text-academy-surface font-display text-[12px] font-black">J{i + 1}</span>
                              <span className="text-[14px] font-bold leading-snug">{d.title}</span>
                            </li>
                          ))}
                        </ol>
                      )}

                      <div className="p-5">
                        <button type="button" disabled={sessions === null} onClick={() => goTo(1)} className={primaryBtn}>
                          {sessions && !selected ? 'Je veux être prévenu' : 'Je réserve ma place'} <ArrowRight size={18} />
                        </button>
                        <p className="mt-2.5 text-center text-[12px] text-academy-textMain/55">
                          {(cfg.infos || []).slice(0, 3).join(' · ')}
                        </p>
                      </div>
                    </article>
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


                {/* 2. Les trois questions, sur un seul écran. */}
                {step === 1 && (
                  <section key="etape-questions" className={`${card} etape-entre`}>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-academy-primary">
                      Avant de réserver
                    </p>
                    <h2 className="mt-1.5 font-display font-black text-[1.45rem] leading-tight">
                      Trois questions, et c'est à vous
                    </h2>
                    <p className="mt-1 text-[13px] text-academy-textMain/55">
                      Vos réponses servent à préparer la journée.
                    </p>

                    <div className="mt-5 space-y-5">
                      {QUESTIONS.map((q, i) => (
                        <div key={q.key}>
                          <h3 className="text-[14.5px] font-bold leading-snug">
                            <span className="text-academy-primary">{i + 1}.</span> {q.title}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {q.options.map(o => {
                              const choisi = profile[q.key] === o
                              return (
                                <button type="button" key={o}
                                        onClick={() => setProfile(prev => ({ ...prev, [q.key]: o }))}
                                        className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-3.5 py-2.5 text-[14px] font-bold transition-all ${
                                          choisi
                                            ? 'border-academy-primary bg-academy-primary text-white shadow-sm'
                                            : 'border-academy-border hover:border-academy-primary/40'}`}>
                                  {choisi && <Check size={13} strokeWidth={3.5} />}
                                  {o}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button type="button" disabled={!profileReady} onClick={() => goTo(DERNIERE_ETAPE)}
                            className={`${primaryBtn} mt-6`}>
                      Continuer <ArrowRight size={18} />
                    </button>
                  </section>
                )}

                {/* 3. Les coordonnées, et c'est réservé. */}
                {step === DERNIERE_ETAPE && (
                  <form key="etape-infos" onSubmit={handleSubmit} className={`${card} space-y-4 relative etape-entre`}>
                    {cfg.recapEnabled !== false && (
                      <div className="bg-academy-surface rounded-xl p-4 text-sm space-y-1">
                        <p className="font-bold">{selected ? formatDate(selected.date) : "Liste d'attente — prochaines dates"}</p>
                        {selected && (selected.city || hours(selected)) && <p className="text-academy-textMain/70">{[hours(selected), selected.city].filter(Boolean).join(' · ')}</p>}
                      </div>
                    )}

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
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-academy-primary">Dernière étape</p>
                      <h2 className="mt-1 font-display font-black text-[1.5rem] leading-tight">Où peut-on vous joindre ?</h2>
                    </div>
                    {/* Un libellé au-dessus de chaque champ : dans un simple
                        placeholder, l'intitulé disparaît dès qu'on écrit. */}
                    <label className="block">
                      <span className="mb-1.5 block text-[12.5px] font-bold">Nom et prénom</span>
                      <input className={input} required minLength={3} maxLength={80} autoComplete="name" placeholder="Ex : Amine Belkacem"
                             value={fullName} onChange={e => setFullName(e.target.value)} />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[12.5px] font-bold">Numéro WhatsApp</span>
                      <input className={input} required type="tel" inputMode="tel" autoComplete="tel" maxLength={20} pattern="\+?[0-9 ]{8,20}"
                             title="Exemple : 0555 12 34 56" placeholder="0555 12 34 56"
                             value={phone} onChange={e => setPhone(e.target.value)} />
                      <span className="mt-1.5 block text-[12px] text-academy-textMain/55">C'est là qu'on confirmera votre place.</span>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[12.5px] font-bold">
                        Ville <span className="font-medium text-academy-textMain/45">· facultatif</span>
                      </span>
                      <input className={input} maxLength={60} autoComplete="address-level2" placeholder="Béjaïa"
                             value={city} onChange={e => setCity(e.target.value)} />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[12.5px] font-bold">
                        Une question ? <span className="font-medium text-academy-textMain/45">· facultatif</span>
                      </span>
                      <textarea className={input} rows={2} maxLength={500}
                                value={message} onChange={e => setMessage(e.target.value)} />
                    </label>

                    {error && <p className="text-center text-sm font-bold text-red-600">{error}</p>}

                    <button type="submit" disabled={submitting || !allAccepted || !profileReady} className={primaryBtn}>
                      {submitting ? 'Inscription…' : selected ? 'Réserver ma place' : 'Je veux être prévenu'}
                    </button>
                  </form>
                )}

                {error && step !== DERNIERE_ETAPE && <p className="mt-4 text-center text-sm font-bold text-red-600">{error}</p>}
                {step > 0 && (
                  <div className="mt-4">
                    <button type="button" onClick={() => setShowPlace(v => !v)}
                            className="w-full flex items-center justify-between gap-2 rounded-xl border border-academy-border bg-white px-4 py-3 text-left">
                      <span className="flex items-center gap-2 min-w-0">
                        <MapPin size={18} className="text-academy-primary shrink-0" />
                        <span className="min-w-0">
                          <span className="block text-[13px] font-bold">Lieu : {cfg.venue || 'Camden School'}</span>
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
