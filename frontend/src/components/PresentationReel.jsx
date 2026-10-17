import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../context/SiteSettingsContext'

// Présentation animée du hero (remplace la vidéo du logo) : convention Mylta × Camden,
// la formation, l'itinéraire depuis la gare routière, le programme, puis la réservation.
// Tout est en HTML/SVG animé : léger, net sur tous les écrans, textes repris des réglages.

const SCENE_MS = [4200, 4200, 5600, 5200, 5200]
const ROUTE = 'M286 34 L262 62 L232 112 L204 160 L178 204 L160 170 L146 136'
const money = (n) => `${Number(n).toLocaleString('fr-FR')} DA`

export default function PresentationReel() {
  const { settings } = useSiteSettings()
  const cfg = settings?.inPerson || {}
  const [scene, setScene] = useState(0)
  const [paused, setPaused] = useState(false)
  const motionRef = useRef(null)
  const [dot, setDot] = useState(false)

  // L'animation SVG suit l'horloge du document : le point n'est monté qu'au départ
  // du trajet, puis lancé à la main, à chaque passage sur la carte.
  useEffect(() => {
    setDot(false)
    if (scene !== 2) return
    const t = setTimeout(() => setDot(true), 500)
    return () => clearTimeout(t)
  }, [scene])
  useEffect(() => {
    if (dot) motionRef.current?.beginElement?.()
  }, [dot])

  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => setScene(s => (s + 1) % SCENE_MS.length), SCENE_MS[scene])
    return () => clearTimeout(t)
  }, [scene, paused])

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

  return (
    <div
      className="reel relative w-full aspect-video rounded-2xl overflow-hidden shadow-soft-lg select-none cursor-pointer text-white"
      style={{ containerType: 'inline-size', background: 'radial-gradient(120% 90% at 50% 40%, #7f1d1d 0%, #3b0a0a 55%, #120303 100%)' }}
      onClick={() => setScene(s => (s + 1) % SCENE_MS.length)}
      role="img"
      aria-label="Présentation : convention Mylta Academy et Camden International Institute, formation IA et montage vidéo en présentiel à Béjaïa, itinéraire depuis la gare routière, programme et tarifs."
    >
      <style>{`
        .reel .in { opacity: 0; animation: reel-in .7s cubic-bezier(.2,.8,.2,1) forwards; }
        .reel .from-l { opacity: 0; animation: reel-l .8s cubic-bezier(.2,.8,.2,1) forwards; }
        .reel .from-r { opacity: 0; animation: reel-r .8s cubic-bezier(.2,.8,.2,1) forwards; }
        .reel .pop { opacity: 0; animation: reel-pop .6s cubic-bezier(.3,1.5,.5,1) forwards; }
        .reel .stamp { opacity: 0; animation: reel-stamp .5s cubic-bezier(.3,1.6,.5,1) forwards; }
        .reel .draw { stroke-dasharray: 420; stroke-dashoffset: 420; animation: reel-draw 2.6s .5s ease-in-out forwards; }
        .reel .bar { transform-origin: left; animation: reel-bar linear forwards; }
        .reel .zoom { animation: reel-zoom 6s ease-out forwards; }
        @keyframes reel-in { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
        @keyframes reel-l { from { opacity: 0; transform: translateX(-30px) } to { opacity: 1; transform: none } }
        @keyframes reel-r { from { opacity: 0; transform: translateX(30px) } to { opacity: 1; transform: none } }
        @keyframes reel-pop { from { opacity: 0; transform: scale(.4) } to { opacity: 1; transform: none } }
        @keyframes reel-stamp { from { opacity: 0; transform: rotate(-8deg) scale(1.8) } to { opacity: 1; transform: rotate(-8deg) scale(1) } }
        @keyframes reel-draw { to { stroke-dashoffset: 0 } }
        @keyframes reel-bar { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        @keyframes reel-zoom { from { transform: scale(1.08) } to { transform: scale(1) } }
        @media (prefers-reduced-motion: reduce) {
          .reel .in, .reel .from-l, .reel .from-r, .reel .pop, .reel .stamp, .reel .zoom { animation: none; opacity: 1; transform: none }
          .reel .stamp { transform: rotate(-8deg) }
          .reel .draw { animation: none; stroke-dashoffset: 0 }
        }
      `}</style>

      {/* Barres de progression façon « story » */}
      <div className="absolute top-[3cqw] inset-x-[4cqw] z-20 flex gap-[1cqw]">
        {SCENE_MS.map((ms, i) => (
          <span key={i} className="h-[0.6cqw] min-h-[2px] flex-1 rounded-full bg-white/25 overflow-hidden">
            <span
              key={i === scene ? `on-${scene}` : 'off'}
              className={`block h-full bg-white ${i === scene ? 'bar' : ''}`}
              style={i === scene ? { animationDuration: `${ms}ms`, animationPlayState: paused ? 'paused' : 'running' } : { transform: `scaleX(${i < scene ? 1 : 0})` }}
            />
          </span>
        ))}
      </div>

      <div key={scene} className="absolute inset-0 flex items-center justify-center px-[7cqw] pt-[6cqw] pb-[5cqw]">
        {scene === 0 && (
          <div className="w-full text-center">
            <div className="flex items-center justify-center gap-[4cqw]">
              <img src="/logo-wordmark-white.png" alt="Mylta Academy" className="from-l h-[7cqw] w-auto" />
              <span className="pop text-[6cqw] font-light text-white/70" style={{ animationDelay: '.5s' }}>×</span>
              <span className="from-r bg-white rounded-[1.6cqw] p-[1cqw]" style={{ animationDelay: '.25s' }}>
                <img src="/camden-logo.jpg" alt="Camden International Institute" className="h-[10cqw] w-auto" />
              </span>
            </div>
            <p className="in mt-[4cqw] text-[2.4cqw] font-bold uppercase tracking-[0.35em] text-white/70" style={{ animationDelay: '.9s' }}>Convention de partenariat</p>
            <span className="stamp inline-block mt-[2cqw] border-[0.45cqw] border-white rounded-[1cqw] px-[2.4cqw] py-[0.6cqw] text-[3cqw] font-black uppercase tracking-[0.2em]" style={{ animationDelay: '1.5s' }}>Signée</span>
          </div>
        )}

        {scene === 1 && (
          <div className="w-full">
            <p className="in text-[2.4cqw] font-bold uppercase tracking-[0.3em] text-red-200">En présentiel · Béjaïa</p>
            <h3 className="in mt-[1.5cqw] font-display font-black text-[7.2cqw] leading-[1.02] tracking-tight" style={{ animationDelay: '.15s' }}>
              {cfg.title || 'Formation IA & Montage Vidéo'}
            </h3>
            <div className="mt-[3cqw] flex flex-wrap gap-[1.4cqw]">
              {['3 jours', 'Petit groupe', '100 % smartphone', 'Chez Camden'].map((c, i) => (
                <span key={c} className="in rounded-full border border-white/30 bg-white/10 px-[2.2cqw] py-[0.8cqw] text-[2.6cqw] font-semibold" style={{ animationDelay: `${0.5 + i * 0.15}s` }}>{c}</span>
              ))}
            </div>
          </div>
        )}

        {scene === 2 && (
          <div className="w-full h-full flex items-center gap-[3cqw]">
            <div className="zoom relative flex-[1.35] rounded-[1.6cqw] overflow-hidden bg-[#f4f1ea]">
              <svg viewBox="0 0 360 230" className="block w-full h-auto">
                <path d="M300 230 C318 190 330 150 338 110 C344 80 352 50 360 30" fill="none" stroke="#bcd7ea" strokeWidth="16" strokeLinecap="round" />
                <path d="M296 22 L262 62 L232 112 L204 160 L172 220" fill="none" stroke="#e2dccf" strokeWidth="11" strokeLinecap="round" />
                <path d="M178 204 L160 170 L140 124 L128 96" fill="none" stroke="#e2dccf" strokeWidth="9" strokeLinecap="round" />
                <path d="M246 92 L200 100 L160 106 L110 112" fill="none" stroke="#e2dccf" strokeWidth="7" strokeLinecap="round" />
                <text x="222" y="150" fontSize="10" fontWeight="700" fill="#9b917e" transform="rotate(-58 222 150)">N12</text>
                <path className="draw" d={ROUTE} fill="none" stroke="#b91c1c" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                {dot && (
                  <circle r="7" fill="#b91c1c" stroke="#fff" strokeWidth="2.5">
                    <animateMotion ref={motionRef} dur="2.6s" begin="indefinite" fill="freeze" path={ROUTE} />
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
              <p className="in text-[2.2cqw] font-bold uppercase tracking-[0.25em] text-red-200">Itinéraire</p>
              <p className="in mt-[1cqw] text-[3.4cqw] font-black leading-tight" style={{ animationDelay: '.2s' }}>Gare routière</p>
              <p className="in text-[2.6cqw] text-white/60 leading-tight" style={{ animationDelay: '.35s' }}>↓</p>
              <p className="in text-[3.4cqw] font-black leading-tight" style={{ animationDelay: '.5s' }}>Camden</p>
              <p className="in mt-[2cqw] text-[2.4cqw] text-white/80 leading-snug" style={{ animationDelay: '1.6s' }}>
                Voiture : 4 min<br />À pied : 21 min
              </p>
            </div>
          </div>
        )}

        {scene === 3 && (
          <div className="w-full">
            <p className="in text-[2.4cqw] font-bold uppercase tracking-[0.3em] text-red-200">Au programme</p>
            <ol className="mt-[2.4cqw] grid grid-cols-2 gap-x-[3cqw] gap-y-[1.6cqw]">
              {program.map((p, i) => (
                <li key={i} className="in flex items-baseline gap-[1.4cqw] border-b border-white/15 pb-[1cqw]" style={{ animationDelay: `${0.2 + i * 0.22}s` }}>
                  <span className="font-mono text-[2.2cqw] text-red-200">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[3cqw] font-bold leading-tight">{p}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {scene === 4 && (
          <div className="w-full text-center">
            <p className="in text-[2.4cqw] font-bold uppercase tracking-[0.3em] text-red-200">Offre de lancement</p>
            <p className="pop mt-[1.5cqw] font-display font-black text-[9cqw] leading-none" style={{ animationDelay: '.2s' }}>{price ? money(price) : 'Places limitées'}</p>
            {oldPrice > 0 && <p className="in mt-[1cqw] text-[3cqw] text-white/55 line-through" style={{ animationDelay: '.5s' }}>{money(oldPrice)}</p>}
            {studentPrice > 0 && <p className="in mt-[1cqw] text-[3cqw] font-bold" style={{ animationDelay: '.7s' }}>Étudiants : {money(studentPrice)}</p>}
            <Link to="/coaching-presentiel" onClick={e => e.stopPropagation()}
                  className="in inline-block mt-[3cqw] rounded-full bg-white text-[#7f1d1d] px-[4cqw] py-[1.6cqw] text-[3cqw] font-black" style={{ animationDelay: '1s' }}>
              Je réserve ma place
            </Link>
            <p className="in mt-[2cqw] text-[2.2cqw] tracking-[0.2em] text-white/50" style={{ animationDelay: '1.3s' }}>myltaacademy.com</p>
          </div>
        )}
      </div>
    </div>
  )
}
