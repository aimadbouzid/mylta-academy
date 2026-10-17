import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Copy, MapPin, MessageCircle, Navigation } from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { PAYMENT_INFO } from '../config/paymentConfig'

// Formation accélérée d'un jour (chaque samedi) chez Viga Center, Béjaïa.

const money = (n) => `${Number(n).toLocaleString('fr-FR')} DA`
const hour = (t) => (t || '').replace(':', 'h')
const dayLabel = (iso, opts = { weekday: 'long', day: 'numeric', month: 'long' }) => {
  const s = new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', opts)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Trajet réel (Google Maps) : la N12 vers le sud, puis demi-tour à droite sur le
// boulevard des Frères Ouakouche jusqu'à Viga Center.
const ROUTE = 'M300 34 L292 52 L276 58 L256 112 L236 168 L214 212 L190 186 L150 138 L112 96'
const DIRECTIONS = (mode) =>
  `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent('Gare Routière de Béjaïa')}&destination=${encodeURIComponent('Viga Center Bejaia')}&travelmode=${mode}`

function useCountdown(target) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  if (!target) return null
  const ms = Math.max(0, target - now)
  return { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 }
}

export default function ExpressPage() {
  const { settings, loadingSettings } = useSiteSettings()
  const cfg = settings?.express
  const whatsappNumber = settings?.coaching?.whatsappNumber
  const bookRef = useRef(null)

  const [days, setDays] = useState(null)
  const [day, setDay] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)
  const [copied, setCopied] = useState('')
  const [mode, setMode] = useState('driving')

  const loadDays = () => api.get('/in-person/express/days')
    .then(({ data }) => {
      setDays(data.days)
      setDay(d => d || data.days.find(x => x.seatsLeft > 0)?.day || '')
    })
    .catch(() => setDays([]))
  useEffect(() => { if (cfg?.enabled) loadDays() }, [cfg?.enabled])

  // Compte à rebours jusqu'au début de la prochaine session (heure d'Alger, UTC+1).
  const nextStart = useMemo(() => {
    const first = days?.find(d => d.seatsLeft > 0)?.day || days?.[0]?.day
    return first ? new Date(`${first}T${cfg?.startTime || '09:00'}:00+01:00`).getTime() : null
  }, [days, cfg?.startTime])
  const cd = useCountdown(nextStart)

  const scrollToBook = () => bookRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post('/in-person/express/register', { fullName, phone, day, message, website })
      setDone(data.registration)
      requestAnimationFrame(() => bookRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } catch (err) {
      setError(err.response?.data?.error || "L'inscription a échoué. Réessayez.")
      if (err.response?.status === 409) loadDays()
    } finally {
      setBusy(false)
    }
  }

  const copy = (key, value) => navigator.clipboard?.writeText(value)
    .then(() => { setCopied(key); setTimeout(() => setCopied(''), 1500) }).catch(() => {})

  if (loadingSettings) return <><Navbar /><main className="min-h-screen pt-32 text-center text-sm text-academy-textMain/60">Chargement…</main></>
  if (!cfg?.enabled) {
    return (
      <><Navbar />
        <main className="min-h-screen pt-32 px-4 text-center">
          <h1 className="font-bold text-xl">Formation indisponible pour le moment</h1>
          <Link to="/" className="mt-3 inline-block text-sm font-bold border-b-2 border-academy-textMain">Retour à l'accueil</Link>
        </main>
      </>
    )
  }

  const price = Number(cfg.price) || 0
  const deposit = Number(cfg.deposit) || 0
  const schedule = cfg.schedule || []
  const payAccounts = [
    PAYMENT_INFO.ccp && ['CCP', PAYMENT_INFO.ccp],
    PAYMENT_INFO.barid && ['BaridiMob (RIP)', PAYMENT_INFO.barid],
    PAYMENT_INFO.redotpay && ['RedotPay', PAYMENT_INFO.redotpay],
  ].filter(Boolean)
  const whatsappUrl = done && whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Bonjour Mylta Academy, je viens de réserver la formation « ${cfg.title} » du ${dayLabel(done.day)} (${hour(cfg.startTime)}–${hour(cfg.endTime)}) et je vous envoie le reçu de mon acompte de ${money(deposit)}.\n• Nom : ${fullName}\n• Téléphone : ${phone}\nInscription n°${done.id}`
      )}`
    : null

  const input = 'w-full bg-white border border-academy-border rounded-xl px-4 py-3 text-base text-academy-textMain outline-none focus:border-academy-textMain'

  return (
    <>
      <SEOHead
        title={`${cfg.title} — chaque samedi à Béjaïa`}
        description={`${cfg.subtitle} ${hour(cfg.startTime)}–${hour(cfg.endTime)}, ${money(price)}, chez ${cfg.place}.`}
        canonicalPath="/formation-1-jour"
      />
      <Navbar />
      <style>{`
        .xp-in { opacity: 0; animation: xp-in .8s cubic-bezier(.2,.8,.2,1) forwards; }
        @keyframes xp-in { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: none } }
        .xp-draw { stroke-dasharray: 520; stroke-dashoffset: 520; animation: xp-draw 2.8s .4s ease-in-out forwards; }
        @keyframes xp-draw { to { stroke-dashoffset: 0 } }
        .xp-pulse { animation: xp-pulse 1.8s ease-out infinite; transform-origin: center; transform-box: fill-box; }
        @keyframes xp-pulse { 0% { opacity: .7; transform: scale(1) } 100% { opacity: 0; transform: scale(2.6) } }
        @media (prefers-reduced-motion: reduce) { .xp-in { animation: none; opacity: 1 } .xp-draw { animation: none; stroke-dashoffset: 0 } .xp-pulse { animation: none; opacity: 0 } }
      `}</style>

      <main className="min-h-screen bg-academy-surface pt-24 pb-20">
        {/* ── En-tête ── */}
        <section className="px-4">
          <div className="max-w-3xl mx-auto relative overflow-hidden rounded-3xl text-white px-5 py-8 sm:px-10 sm:py-12"
               style={{ background: 'radial-gradient(120% 100% at 15% 0%, #991b1b 0%, #450a0a 50%, #0c0303 100%)' }}>
            <div aria-hidden="true" className="absolute -right-16 -top-16 w-64 h-64 rounded-full border border-white/10" />
            <div aria-hidden="true" className="absolute -right-4 -top-4 w-40 h-40 rounded-full border border-white/10" />

            <p className="xp-in text-[11px] font-bold uppercase tracking-[0.25em] text-red-200">
              Nouveau · Chaque samedi · {hour(cfg.startTime)}–{hour(cfg.endTime)}
            </p>
            <h1 className="xp-in mt-3 font-display font-black text-[2.15rem] sm:text-6xl leading-[0.98] tracking-tight" style={{ animationDelay: '.1s' }}>
              Filmez.<br />Montez.<br /><span className="text-red-300">Repartez avec votre vidéo.</span>
            </h1>
            <p className="xp-in mt-4 max-w-lg text-[15px] sm:text-lg text-white/75 leading-relaxed" style={{ animationDelay: '.25s' }}>{cfg.subtitle}</p>

            <dl className="xp-in mt-6 grid grid-cols-3 border-y border-white/15 divide-x divide-white/15" style={{ animationDelay: '.4s' }}>
              {[['4 h', 'de pratique'], [money(price), 'la formation'], ['1 vidéo', 'finie le jour même']].map(([v, l]) => (
                <div key={l} className="py-3 text-center">
                  <dt className="font-display font-black text-xl sm:text-3xl leading-none">{v}</dt>
                  <dd className="mt-1 text-[10px] sm:text-xs uppercase tracking-wider text-white/55">{l}</dd>
                </div>
              ))}
            </dl>

            {cd && (
              <div className="xp-in mt-5" style={{ animationDelay: '.55s' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Prochaine session dans</p>
                <div className="mt-1.5 flex gap-2 font-mono">
                  {[[cd.d, 'j'], [cd.h, 'h'], [cd.m, 'min'], [cd.s, 's']].map(([v, u]) => (
                    <span key={u} className="min-w-[3.6rem] rounded-lg bg-white/10 border border-white/10 px-2 py-1.5 text-center">
                      <span className="block text-xl font-bold leading-none tabular-nums">{String(v).padStart(2, '0')}</span>
                      <span className="block text-[9px] uppercase tracking-wider text-white/50 mt-0.5">{u}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button type="button" onClick={scrollToBook}
                    className="xp-in mt-7 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#7f1d1d] px-7 py-3.5 font-black" style={{ animationDelay: '.7s' }}>
              Réserver mon samedi <ArrowRight size={18} />
            </button>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4">
          {/* ── Déroulé de la matinée ── */}
          <section className="mt-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-academy-primary">Le déroulé</p>
            <h2 className="mt-1 font-display font-black text-2xl sm:text-3xl tracking-tight">Votre matinée, heure par heure</h2>
            <ol className="mt-5 relative">
              <span aria-hidden="true" className="absolute left-[61.5px] top-3 bottom-3 w-px bg-academy-border" />
              {schedule.map((s, i) => {
                const last = i === schedule.length - 1
                return (
                  <li key={i} className="relative flex items-start gap-4 pb-5 last:pb-0">
                    <span className="w-10 shrink-0 pt-0.5 text-right font-mono text-sm font-bold tabular-nums text-academy-textMain/60">{hour(s.time)}</span>
                    <span className={`relative z-10 mt-1.5 w-3 h-3 shrink-0 rounded-full ring-4 ring-academy-surface ${last ? 'bg-academy-primary' : 'bg-academy-textMain'}`} />
                    <span className={`flex-1 text-[15px] leading-snug ${last ? 'font-black text-academy-primary' : 'font-semibold'}`}>{s.label}</span>
                  </li>
                )
              })}
              <li className="relative flex items-start gap-4 pt-1">
                <span className="w-10 shrink-0 text-right font-mono text-sm font-bold tabular-nums text-academy-textMain/60">{hour(cfg.endTime)}</span>
                <span className="relative z-10 mt-1 w-3 h-3 shrink-0 rounded-full ring-4 ring-academy-surface bg-academy-border" />
                <span className="flex-1 text-sm text-academy-textMain/60">Fin de la formation</span>
              </li>
            </ol>
          </section>

          {/* ── Résultat ── */}
          {(cfg.results || []).length > 0 && (
            <section className="mt-10">
              <h2 className="font-display font-black text-2xl tracking-tight">Vous repartez avec</h2>
              <ul className="mt-4 grid sm:grid-cols-3 gap-px rounded-xl overflow-hidden border border-academy-border bg-academy-border">
                {cfg.results.map((r, i) => (
                  <li key={i} className="bg-white p-4 flex gap-3 items-start">
                    <span className="font-mono text-xs font-bold text-academy-primary pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[14.5px] font-bold leading-snug">{r}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Lieu + itinéraire ── */}
          <section className="mt-10 bg-white border border-academy-border rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-5 flex items-center gap-4">
              <img src="/viga-logo.jpg" alt="Viga Center — Learning & Coaching" width="72" height="72" loading="lazy"
                   className="w-16 h-16 sm:w-[72px] sm:h-[72px] object-contain shrink-0 rounded-xl border border-academy-border bg-white" />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-academy-primary">Lieu de la formation</p>
                <p className="font-display font-black text-lg leading-tight">{cfg.place}</p>
                <p className="mt-0.5 text-sm text-academy-textMain/65 flex gap-1"><MapPin size={15} className="shrink-0 mt-0.5" /> {cfg.address}</p>
              </div>
            </div>

            <div className="relative bg-[#f4f1ea] border-y border-academy-border">
              <svg viewBox="0 0 360 230" className="block w-full h-auto" role="img"
                   aria-label="Trajet de la gare routière de Béjaïa à Viga Center : 3 minutes en voiture, 16 minutes à pied">
                {/* Oued Soummam */}
                <path d="M330 230 C322 196 318 150 326 110 C334 74 352 46 360 30" fill="none" stroke="#bcd7ea" strokeWidth="18" strokeLinecap="round" />
                <text x="334" y="176" fontSize="9" fill="#5b8db0" fontStyle="italic" transform="rotate(-80 334 176)">Oued Soummam</text>
                {/* Rues */}
                <path d="M306 20 L292 52 L276 58 L256 112 L236 168 L214 212 L206 230" fill="none" stroke="#e2dccf" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M214 212 L190 186 L150 138 L96 76 L80 58" fill="none" stroke="#e2dccf" strokeWidth="10" strokeLinecap="round" />
                <path d="M150 138 L230 120" fill="none" stroke="#e2dccf" strokeWidth="6" strokeLinecap="round" />
                <path d="M120 170 L190 186" fill="none" stroke="#e2dccf" strokeWidth="6" strokeLinecap="round" />
                <text x="262" y="150" fontSize="10" fontWeight="700" fill="#9b917e" transform="rotate(-68 262 150)">N12</text>
                <text x="130" y="128" fontSize="9" fontWeight="700" fill="#9b917e" transform="rotate(49 130 128)">Bd Frères Ouakouche</text>
                {/* Trajet */}
                <path key={mode} className="xp-draw" d={ROUTE} fill="none" stroke="#b91c1c" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle r="7" fill="#b91c1c" stroke="#fff" strokeWidth="2.5">
                  <animateMotion dur="3.2s" repeatCount="indefinite" path={ROUTE} />
                </circle>
                {/* Gare routière */}
                <circle cx="300" cy="34" r="11" fill="#1f2937" stroke="#fff" strokeWidth="2.5" />
                <text x="300" y="38" fontSize="11" fontWeight="800" fill="#fff" textAnchor="middle">G</text>
                <rect x="200" y="12" width="88" height="20" rx="10" fill="#fff" />
                <text x="244" y="26" fontSize="11" fontWeight="800" fill="#1f2937" textAnchor="middle">Gare routière</text>
                {/* Viga Center */}
                <circle className="xp-pulse" cx="112" cy="84" r="9" fill="#b91c1c" />
                <path d="M112 100 C112 100 97 83 97 73 A15 15 0 0 1 127 73 C127 83 112 100 112 100 Z" fill="#b91c1c" stroke="#fff" strokeWidth="2" />
                <circle cx="112" cy="73" r="5.5" fill="#fff" />
                <rect x="10" y="62" width="80" height="22" rx="11" fill="#b91c1c" />
                <text x="50" y="77.5" fontSize="11.5" fontWeight="800" fill="#fff" textAnchor="middle">Viga Center</text>
              </svg>
              <div className="flex gap-1.5 px-3 pb-3">
                {[['driving', 'Voiture · 3 min'], ['walking', 'À pied · 16 min']].map(([m, l]) => (
                  <button key={m} type="button" onClick={() => setMode(m)}
                          className={`rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${mode === m ? 'bg-neutral-900 text-white' : 'bg-white/95 text-neutral-800'}`}>{l}</button>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <ol className="space-y-1.5 text-[14px]">
                <li className="flex gap-2.5"><span className="font-mono text-xs font-bold text-academy-primary pt-0.5">01</span> Depuis la gare routière, prenez la N12 vers le sud.</li>
                <li className="flex gap-2.5"><span className="font-mono text-xs font-bold text-academy-primary pt-0.5">02</span> À l'arrêt de bus Cité Remla, prenez à droite le boulevard des Frères Ouakouche.</li>
                <li className="flex gap-2.5"><span className="font-mono text-xs font-bold text-academy-primary pt-0.5">03</span> Continuez sur le boulevard jusqu'à Viga Center (1,2 km au total).</li>
              </ol>
              <a href={DIRECTIONS(mode)} target="_blank" rel="noopener noreferrer"
                 className="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900 text-white font-bold text-sm">
                <Navigation size={16} /> Ouvrir l'itinéraire dans Google Maps
              </a>
            </div>
          </section>

          {/* ── Réservation ── */}
          <section ref={bookRef} className="mt-10 scroll-mt-24">
            {done ? (
              <div className="bg-white border border-academy-border rounded-2xl p-5 space-y-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">Inscription n°{done.id}</p>
                  <h2 className="mt-1 font-display font-black text-2xl">Votre place est presque réservée</h2>
                  <p className="mt-1 text-sm text-academy-textMain/65">{dayLabel(done.day)} · {hour(cfg.startTime)}–{hour(cfg.endTime)} · {cfg.place}</p>
                </div>
                {deposit > 0 && (
                  <div className="rounded-xl bg-academy-surface p-4">
                    <p className="font-bold">Payez l'acompte de {money(deposit)}</p>
                    <p className="text-sm text-academy-textMain/65 mt-0.5 mb-3">La place est confirmée dès réception. Au nom de <strong>{PAYMENT_INFO.nom}</strong> :</p>
                    <div className="space-y-2">
                      {payAccounts.map(([label, value]) => (
                        <button key={label} type="button" onClick={() => copy(label, value)}
                                className="w-full flex items-center justify-between gap-3 rounded-lg bg-white border border-academy-border px-3 py-2.5 text-left">
                          <span><span className="block text-[11px] font-bold uppercase tracking-wider text-academy-textMain/50">{label}</span><span className="font-mono font-bold">{value}</span></span>
                          {copied === label ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} className="text-academy-textMain/40" />}
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-academy-textMain/55">Reste à payer sur place : {money(Math.max(0, price - deposit))}</p>
                  </div>
                )}
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                     className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-bold py-3.5 rounded-xl">
                    <MessageCircle size={20} /> Envoyer mon reçu sur WhatsApp
                  </a>
                )}
              </div>
            ) : (
              <form onSubmit={submit} className="bg-white border border-academy-border rounded-2xl p-5 space-y-4 relative">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website}
                       onChange={e => setWebsite(e.target.value)} className="absolute -left-[9999px] w-px h-px opacity-0" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-academy-primary">Réservation</p>
                  <h2 className="mt-1 font-display font-black text-2xl">Choisissez votre samedi</h2>
                </div>

                {days === null ? (
                  <p className="text-sm text-academy-textMain/60">Chargement des dates…</p>
                ) : days.length === 0 ? (
                  <p className="text-sm rounded-xl bg-academy-surface p-3">Pas de date ouverte pour le moment. Écrivez-nous sur WhatsApp.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {days.map(d => {
                      const full = d.seatsLeft <= 0
                      const active = day === d.day
                      return (
                        <button key={d.day} type="button" disabled={full} onClick={() => setDay(d.day)}
                                className={`rounded-xl border-2 p-3 text-left transition-colors ${full ? 'opacity-40 cursor-not-allowed border-academy-border'
                                  : active ? 'border-academy-textMain bg-academy-textMain text-academy-surface' : 'border-academy-border hover:border-academy-textMain/40'}`}>
                          <span className="block text-[11px] font-bold uppercase tracking-wider opacity-60">Samedi</span>
                          <span className="block font-black text-lg leading-tight">{dayLabel(d.day, { day: 'numeric', month: 'short' })}</span>
                          <span className="block text-xs mt-0.5 opacity-70">{full ? 'Complet' : `${hour(cfg.startTime)}–${hour(cfg.endTime)}`}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                <input className={input} placeholder="Nom et prénom" required minLength={3} maxLength={80} autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} />
                <input className={input} placeholder="Numéro WhatsApp (ex : 0555 12 34 56)" required type="tel" inputMode="tel" pattern="\+?[0-9 ]{8,20}" maxLength={20} autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                <textarea className={input} rows={2} maxLength={500} placeholder="Une question ? (facultatif)" value={message} onChange={e => setMessage(e.target.value)} />

                <div className="rounded-xl border border-academy-border divide-y divide-academy-border text-sm">
                  <div className="flex justify-between px-4 py-2.5"><span className="font-bold">Formation (4 h)</span><span className="font-black">{money(price)}</span></div>
                  {deposit > 0 && <div className="flex justify-between px-4 py-2.5"><span>Acompte pour réserver</span><span className="font-bold">{money(deposit)}</span></div>}
                  {deposit > 0 && <div className="flex justify-between px-4 py-2.5 text-academy-textMain/60"><span>Le jour même</span><span>{money(Math.max(0, price - deposit))}</span></div>}
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                <button disabled={busy || !day} className="w-full py-3.5 rounded-xl bg-academy-primary text-academy-onPrimary font-black text-lg disabled:opacity-40 inline-flex items-center justify-center gap-2">
                  {busy ? 'Envoi…' : <>Je réserve ma place <ArrowRight size={18} /></>}
                </button>
                <p className="text-center text-xs text-academy-textMain/55">{Number(cfg.capacity) || 12} places par samedi · places limitées</p>
              </form>
            )}
          </section>
        </div>
      </main>
    </>
  )
}
