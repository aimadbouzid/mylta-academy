import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../context/SiteSettingsContext'

// Présentation animée du hero (remplace la vidéo du logo) : convention Mylta × Camden,
// la formation, l'itinéraire depuis la gare routière, le programme, puis la réservation.
// Tout est en HTML/SVG animé : léger, net sur tous les écrans, textes repris des réglages.
// Le mouvement suit les codes du motion design : révélations par masque, entrées avec
// flou de vitesse, caméra qui respire, grain et vignette, balayage entre les scènes.

// Scènes et durées. La séquence du samedi chez Viga Center n'entre dans la
// séquence que si la formation d'un jour est activée dans les réglages.
const DUR = { convention: 4800, formation: 4800, route: 6200, programme: 5800, viga: 5600, offre: 6000 }
const ROUTE = 'M286 34 L262 62 L232 112 L204 160 L178 204 L160 170 L146 136'
const money = (n) => `${Number(n).toLocaleString('fr-FR')} DA`
const hour = (t) => (t || '').replace(/^0/, '').replace(':00', 'h').replace(':', 'h')
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")`

// Compteur qui monte sur le prix : le chiffre s'installe au lieu d'apparaître d'un bloc.
function useCountUp(target, active, ms = 1100) {
  const [value, setValue] = useState(target)
  useEffect(() => {
    if (!active || !target || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }
    let raf, start
    const step = (t) => {
      start ??= t
      const p = Math.min(1, (t - start) / ms)
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, active, ms])
  return value
}

export default function PresentationReel() {
  const { settings } = useSiteSettings()
  const cfg = settings?.inPerson || {}
  const xp = settings?.express || {}
  const scenes = useMemo(
    () => ['convention', 'formation', 'route', 'programme', ...(xp.enabled ? ['viga'] : []), 'offre'],
    [xp.enabled],
  )
  const [scene, setScene] = useState(0)
  const [paused, setPaused] = useState(false)
  const motionRef = useRef(null)
  const [dot, setDot] = useState(false)
  const step = scene % scenes.length
  const act = scenes[step]
  const blue = act === 'viga'

  // L'animation SVG suit l'horloge du document : le point n'est monté qu'au départ
  // du trajet, puis lancé à la main, à chaque passage sur la carte.
  useEffect(() => {
    setDot(false)
    if (act !== 'route') return
    const t = setTimeout(() => setDot(true), 500)
    return () => clearTimeout(t)
  }, [act])
  useEffect(() => {
    if (dot) motionRef.current?.beginElement?.()
  }, [dot])

  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => setScene(s => (s + 1) % scenes.length), DUR[act])
    return () => clearTimeout(t)
  }, [act, paused, scenes.length])

  // Hors de l'écran ou onglet masqué : on met en pause (batterie, et la scène ne défile pas pour rien).
  useEffect(() => {
    const onVis = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const program = (cfg.program || []).slice(0, 6)
  const price = Number(cfg.price) || 0
  const oldPrice = Number(cfg.oldPrice) > price ? Number(cfg.oldPrice) : 0
  const studentPrice = Number(cfg.studentPrice) || 0
  const shownPrice = useCountUp(price, act === 'offre')
  const xpHours = [xp.startTime, xp.endTime].map(hour).filter(Boolean).join(' – ')
  const titleWords = (cfg.title || 'Formation IA & Montage Vidéo').split(' ')

  return (
    <div
      className="reel relative w-full aspect-video rounded-2xl overflow-hidden shadow-soft-lg select-none cursor-pointer text-white"
      style={{ containerType: 'inline-size', background: 'radial-gradient(120% 90% at 50% 40%, #7f1d1d 0%, #3b0a0a 55%, #120303 100%)' }}
      onClick={() => setScene(s => (s + 1) % scenes.length)}
      role="img"
      aria-label={`Présentation : convention Mylta Academy et Camden International Institute, formation IA et montage vidéo en présentiel à Béjaïa, itinéraire depuis la gare routière, programme et tarifs.${xp.enabled ? ' Également la formation d\'un jour, chaque samedi chez Viga Center.' : ''}`}
    >
      <style>{`
        .reel { --e: cubic-bezier(.16,1,.3,1); --eb: cubic-bezier(.34,1.56,.64,1); }
        /* Révélation par masque : le bloc est découpé, le texte monte derrière. */
        .reel .rv { overflow: hidden; padding-bottom: .09em; margin-bottom: -.09em; }
        .reel .rv > span { display: block; opacity: 0; transform: translateY(115%); animation: ae-rise .95s var(--e) forwards; }
        .reel .fx { opacity: 0; animation: ae-fx .85s var(--e) forwards; }
        .reel .pop { opacity: 0; animation: ae-pop .7s var(--eb) forwards; }
        .reel .slam { opacity: 0; animation: ae-slam .6s cubic-bezier(.2,.9,.2,1) forwards; }
        .reel .ring { opacity: 0; animation: ae-ring .9s ease-out forwards; }
        .reel .wipe { clip-path: inset(0 100% 0 0); animation: ae-wipe .9s var(--e) forwards; }
        .reel .draw { stroke-dasharray: 420; stroke-dashoffset: 420; animation: ae-draw 2.4s .45s cubic-bezier(.65,0,.35,1) forwards; }
        .reel .bar { transform-origin: left; animation: ae-bar linear forwards; }
        .reel .push { animation: ae-push 7s cubic-bezier(.25,.6,.3,1) forwards; }
        .reel .glow { animation: ae-glow 9s ease-in-out infinite alternate; }
        .reel .grain { animation: ae-grain .7s steps(4) infinite; }
        .reel .cut { animation: ae-cut .8s cubic-bezier(.7,0,.25,1) forwards; }
        .reel .shine { animation: ae-shine 2.6s 1.4s ease-in-out infinite; }
        @keyframes ae-rise  { to { opacity: 1; transform: none } }
        @keyframes ae-fx    { from { opacity: 0; transform: translateY(18px) scale(.97); filter: blur(7px) } to { opacity: 1; transform: none; filter: blur(0) } }
        @keyframes ae-pop   { from { opacity: 0; transform: scale(.5) } to { opacity: 1; transform: none } }
        @keyframes ae-slam  { 0% { opacity: 0; transform: rotate(-11deg) scale(2.3); filter: blur(10px) } 55% { opacity: 1; filter: blur(0) } 100% { opacity: 1; transform: rotate(-7deg) scale(1) } }
        @keyframes ae-ring  { 0% { opacity: .7; transform: scale(.35) } 100% { opacity: 0; transform: scale(2.8) } }
        @keyframes ae-wipe  { to { clip-path: inset(0 0 0 0) } }
        @keyframes ae-draw  { to { stroke-dashoffset: 0 } }
        @keyframes ae-bar   { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        @keyframes ae-push  { from { transform: scale(1.07) } to { transform: scale(1) } }
        @keyframes ae-glow  { from { transform: translate3d(-5%,-3%,0) scale(1) } to { transform: translate3d(5%,4%,0) scale(1.18) } }
        @keyframes ae-grain { 0% { transform: translate(0,0) } 25% { transform: translate(-2%,1%) } 50% { transform: translate(1%,-2%) } 75% { transform: translate(-1%,-1%) } 100% { transform: translate(0,0) } }
        @keyframes ae-cut   { from { transform: translateX(-130%) skewX(-14deg) } to { transform: translateX(130%) skewX(-14deg) } }
        @keyframes ae-shine { 0%,55% { transform: translateX(-140%) } 100% { transform: translateX(140%) } }
        @media (prefers-reduced-motion: reduce) {
          .reel .rv > span, .reel .fx, .reel .pop, .reel .slam, .reel .push, .reel .glow, .reel .grain, .reel .shine {
            animation: none; opacity: 1; transform: none; filter: none;
          }
          .reel .slam { transform: rotate(-7deg) }
          .reel .ring, .reel .cut { display: none }
          .reel .wipe { animation: none; clip-path: none }
          .reel .draw { animation: none; stroke-dashoffset: 0 }
        }
      `}</style>

      {/* La séquence du samedi chez Viga bascule l'image en bleu : le fond et les
          halos ont un jumeau bleu posé par-dessus, révélé en fondu. */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-700"
           style={{ opacity: blue ? 1 : 0, background: 'radial-gradient(120% 90% at 50% 40%, #1e3a8a 0%, #0b1f4d 55%, #020717 100%)' }} />

      {/* Caméra : halos qui dérivent lentement derrière la scène. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="glow absolute -inset-[25%] transition-opacity duration-700" style={{ opacity: blue ? 0 : 1, background: 'radial-gradient(38% 38% at 32% 34%, rgba(220,38,38,.45), transparent 70%), radial-gradient(34% 34% at 74% 72%, rgba(248,113,113,.22), transparent 70%)' }} />
        <div className="glow absolute -inset-[25%] transition-opacity duration-700" style={{ opacity: blue ? 1 : 0, background: 'radial-gradient(38% 38% at 32% 34%, rgba(37,99,235,.5), transparent 70%), radial-gradient(34% 34% at 74% 72%, rgba(125,211,252,.22), transparent 70%)' }} />
      </div>
      {/* Grain argentique + vignette : la texture d'une image filmée, pas d'un aplat. */}
      <div className="grain absolute -inset-[6%] opacity-[0.13] mix-blend-overlay pointer-events-none" style={{ backgroundImage: GRAIN }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(100% 78% at 50% 45%, transparent 42%, rgba(0,0,0,.6) 100%)' }} />

      {/* Barres de progression façon « story » */}
      <div className="absolute top-[3cqw] inset-x-[4cqw] z-20 flex gap-[1cqw]">
        {scenes.map((s, i) => (
          <span key={s} className="h-[0.5cqw] min-h-[2px] flex-1 rounded-full bg-white/20 overflow-hidden">
            <span
              key={i === step ? `on-${step}` : 'off'}
              className={`block h-full bg-white ${i === step ? 'bar' : ''}`}
              style={i === step ? { animationDuration: `${DUR[s]}ms`, animationPlayState: paused ? 'paused' : 'running' } : { transform: `scaleX(${i < step ? 1 : 0})` }}
            />
          </span>
        ))}
      </div>

      {/* Balayage de lumière qui couvre la coupe entre deux scènes. */}
      <div key={`cut-${step}`} className="cut absolute inset-y-0 -inset-x-[35%] z-30 pointer-events-none"
           style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.06) 35%, rgba(255,255,255,.2) 50%, rgba(255,255,255,.06) 65%, transparent)' }} />

      <div key={step} className="push absolute inset-0 flex items-center justify-center px-[7cqw] pt-[6cqw] pb-[5cqw]">
        {act === 'convention' && (
          <div className="w-full text-center">
            <div className="flex items-center justify-center gap-[4cqw]">
              <span className="rv inline-block align-bottom"><span style={{ animationDelay: '.05s' }}><img src="/logo-wordmark-white.png" alt="Mylta Academy" className="h-[7cqw] w-auto" /></span></span>
              <span className="pop text-[6cqw] font-extralight text-white/60" style={{ animationDelay: '.5s' }}>×</span>
              <span className="rv inline-block align-bottom"><span style={{ animationDelay: '.22s' }}><span className="block bg-white rounded-[1.6cqw] p-[1cqw]"><img src="/camden-logo.jpg" alt="Camden International Institute" className="h-[10cqw] w-auto" /></span></span></span>
            </div>
            <span className="rv inline-block align-bottom mt-[4cqw]"><span className="text-[2.4cqw] font-bold uppercase tracking-[0.35em] text-white/70" style={{ animationDelay: '.9s' }}>Convention de partenariat</span></span>
            <span className="relative inline-block mt-[2cqw]">
              <span className="ring absolute inset-0 rounded-[1cqw] border-[0.4cqw] border-white" style={{ animationDelay: '1.45s' }} />
              <span className="slam inline-block border-[0.45cqw] border-white rounded-[1cqw] px-[2.4cqw] py-[0.6cqw] text-[3cqw] font-black uppercase tracking-[0.2em]" style={{ animationDelay: '1.35s' }}>Signée</span>
            </span>
          </div>
        )}

        {act === 'formation' && (
          <div className="w-full">
            <span className="rv inline-block align-bottom"><span className="text-[2.4cqw] font-bold uppercase tracking-[0.3em] text-red-200">En présentiel · Béjaïa</span></span>
            <h3 className="mt-[1.5cqw] font-display font-black text-[7.2cqw] leading-[1.04] tracking-tight flex flex-wrap gap-x-[2cqw]">
              {titleWords.map((w, i) => (
                <span key={i} className="rv inline-block align-bottom"><span style={{ animationDelay: `${0.18 + i * 0.09}s` }}>{w}</span></span>
              ))}
            </h3>
            <span className="wipe block mt-[2.4cqw] h-[0.35cqw] w-[22cqw] rounded-full bg-red-300/70" style={{ animationDelay: `${0.3 + titleWords.length * 0.09}s` }} />
            <div className="mt-[2.6cqw] flex flex-wrap gap-[1.4cqw]">
              {['3 jours', 'Petit groupe', '100 % smartphone', 'Chez Camden'].map((c, i) => (
                <span key={c} className="pop rounded-full border border-white/30 bg-white/10 px-[2.2cqw] py-[0.8cqw] text-[2.6cqw] font-semibold" style={{ animationDelay: `${0.75 + i * 0.12}s` }}>{c}</span>
              ))}
            </div>
          </div>
        )}

        {act === 'route' && (
          <div className="w-full h-full flex items-center gap-[3cqw]">
            <div className="wipe relative flex-[1.35] rounded-[1.6cqw] overflow-hidden bg-[#f4f1ea]">
              <svg viewBox="0 0 360 230" className="block w-full h-auto">
                <path d="M300 230 C318 190 330 150 338 110 C344 80 352 50 360 30" fill="none" stroke="#bcd7ea" strokeWidth="16" strokeLinecap="round" />
                <path d="M296 22 L262 62 L232 112 L204 160 L172 220" fill="none" stroke="#e2dccf" strokeWidth="11" strokeLinecap="round" />
                <path d="M178 204 L160 170 L140 124 L128 96" fill="none" stroke="#e2dccf" strokeWidth="9" strokeLinecap="round" />
                <path d="M246 92 L200 100 L160 106 L110 112" fill="none" stroke="#e2dccf" strokeWidth="7" strokeLinecap="round" />
                <text x="222" y="150" fontSize="10" fontWeight="700" fill="#9b917e" transform="rotate(-58 222 150)">N12</text>
                <path className="draw" d={ROUTE} fill="none" stroke="#b91c1c" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                {dot && (
                  <circle r="7" fill="#b91c1c" stroke="#fff" strokeWidth="2.5">
                    <animateMotion ref={motionRef} dur="2.4s" begin="indefinite" fill="freeze" path={ROUTE} />
                  </circle>
                )}
                <circle cx="286" cy="34" r="10" fill="#1f2937" stroke="#fff" strokeWidth="2.5" />
                <text x="286" y="38" fontSize="10" fontWeight="800" fill="#fff" textAnchor="middle">G</text>
                <path d="M146 136 C146 136 132 120 132 110 A14 14 0 0 1 160 110 C160 120 146 136 146 136 Z" fill="#b91c1c" stroke="#fff" strokeWidth="2" />
                <circle cx="146" cy="110" r="5" fill="#fff" />
                <rect x="190" y="10" width="86" height="20" rx="10" fill="#fff" />
                <text x="233" y="24" fontSize="11" fontWeight="800" fill="#1f2937" textAnchor="middle">Gare routière</text>
                <rect x="44" y="100" width="80" height="22" rx="11" fill="#b91c1c" />
                <text x="84" y="115.5" fontSize="12" fontWeight="800" fill="#fff" textAnchor="middle">Camden</text>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="rv inline-block align-bottom"><span className="text-[2.2cqw] font-bold uppercase tracking-[0.25em] text-red-200">Itinéraire</span></span>
              <span className="rv inline-block align-bottom mt-[1cqw]"><span className="text-[3.4cqw] font-black leading-tight" style={{ animationDelay: '.22s' }}>Gare routière</span></span>
              <p className="fx text-[2.6cqw] text-white/60 leading-tight" style={{ animationDelay: '.4s' }}>↓</p>
              <span className="rv inline-block align-bottom"><span className="text-[3.4cqw] font-black leading-tight" style={{ animationDelay: '.55s' }}>Camden</span></span>
              <p className="fx mt-[2cqw] text-[2.4cqw] text-white/80 leading-snug" style={{ animationDelay: '1.7s' }}>
                Voiture : 4 min<br />À pied : 21 min
              </p>
            </div>
          </div>
        )}

        {act === 'programme' && (
          <div className="w-full">
            <span className="rv inline-block align-bottom"><span className="text-[2.4cqw] font-bold uppercase tracking-[0.3em] text-red-200">Au programme</span></span>
            <ol className="mt-[2.4cqw] grid grid-cols-2 gap-x-[3cqw] gap-y-[1.6cqw]">
              {program.map((p, i) => (
                <li key={i} className="wipe flex items-baseline gap-[1.4cqw] border-b border-white/15 pb-[1cqw]" style={{ animationDelay: `${0.2 + i * 0.16}s` }}>
                  <span className="font-mono text-[2.2cqw] text-red-200">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[3cqw] font-bold leading-tight">{p}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {act === 'viga' && (
          <div className="w-full">
            <div className="flex items-center gap-[3cqw]">
              <span className="rv inline-block align-bottom shrink-0"><span><span className="block bg-white rounded-[1.4cqw] p-[0.9cqw]"><img src="/viga-logo.jpg" alt="Viga Center" className="h-[8cqw] w-auto" /></span></span></span>
              <div className="min-w-0">
                <span className="rv inline-block align-bottom"><span className="text-[2.3cqw] font-bold uppercase tracking-[0.3em] text-sky-200" style={{ animationDelay: '.18s' }}>Nouveau · chaque samedi</span></span>
                <span className="rv inline-block align-bottom"><span className="font-display font-black text-[4.6cqw] leading-[1.05] tracking-tight" style={{ animationDelay: '.34s' }}>{xp.title || 'Montage vidéo au smartphone, en un jour'}</span></span>
              </div>
            </div>
            <div className="mt-[2.8cqw] grid grid-cols-3 gap-[1.4cqw]">
              {[['Horaires', xpHours || '4 heures'], ['Lieu', 'Viga Center'], ['Prix', xp.price ? money(xp.price) : 'Places limitées']].map(([k, v], i) => (
                <div key={k} className="fx rounded-[1.2cqw] border border-white/25 bg-white/10 px-[2cqw] py-[1.3cqw]" style={{ animationDelay: `${0.6 + i * 0.14}s` }}>
                  <p className="text-[1.9cqw] font-bold uppercase tracking-[0.2em] text-sky-200/80">{k}</p>
                  <p className="mt-[0.3cqw] text-[2.9cqw] font-black leading-tight">{v}</p>
                </div>
              ))}
            </div>
            <Link to="/formation-1-jour" onClick={e => e.stopPropagation()}
                  className="pop relative inline-block overflow-hidden mt-[2.6cqw] rounded-full bg-white text-[#0b2a6b] px-[3.6cqw] py-[1.4cqw] text-[2.7cqw] font-black" style={{ animationDelay: '1.1s' }}>
              Réserver mon samedi
              <span className="shine absolute inset-y-0 -left-1/3 w-1/3 pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(11,42,107,.18), transparent)' }} />
            </Link>
          </div>
        )}

        {act === 'offre' && (
          <div className="w-full text-center">
            <span className="rv inline-block align-bottom"><span className="text-[2.4cqw] font-bold uppercase tracking-[0.3em] text-red-200">Offre de lancement</span></span>
            <p className="fx mt-[1.5cqw] font-display font-black text-[9cqw] leading-none tabular-nums" style={{ animationDelay: '.2s' }}>
              {price ? money(shownPrice) : 'Places limitées'}
            </p>
            {oldPrice > 0 && <p className="fx mt-[1cqw] text-[3cqw] text-white/55 line-through" style={{ animationDelay: '.55s' }}>{money(oldPrice)}</p>}
            {studentPrice > 0 && <p className="fx mt-[1cqw] text-[3cqw] font-bold" style={{ animationDelay: '.75s' }}>Étudiants : {money(studentPrice)}</p>}
            <Link to="/coaching-presentiel" onClick={e => e.stopPropagation()}
                  className="pop relative inline-block overflow-hidden mt-[3cqw] rounded-full bg-white text-[#7f1d1d] px-[4cqw] py-[1.6cqw] text-[3cqw] font-black" style={{ animationDelay: '1.05s' }}>
              Je réserve ma place
              <span className="shine absolute inset-y-0 -left-1/3 w-1/3 pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(127,29,29,.18), transparent)' }} />
            </Link>
            <p className="fx mt-[2cqw] text-[2.2cqw] tracking-[0.2em] text-white/50" style={{ animationDelay: '1.4s' }}>myltaacademy.com</p>
          </div>
        )}
      </div>
    </div>
  )
}
