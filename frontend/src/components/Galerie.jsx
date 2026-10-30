import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ReelPlayer from './ReelPlayer'
import { GALERIE } from '../data/galerie'

// Ce qui se passe vraiment en formation : les vidéos tournées sur place, les
// photos de l'atelier et nos montages CapCut. Tout est muet.
// Trois barres qui défilent doucement, en sens alterné, comme un fil de reels.
// Le doigt reprend la main dès qu'on touche, et le défilement repart après.

const ROWS = 3
const SPEED = 0.017  // pixels par milliseconde, soit ~17 px/s : on a le temps de regarder

// Une barre sur trois, en gardant l'ordre : chaque ligne reste mélangée.
const rows = Array.from({ length: ROWS }, (_, r) => GALERIE.filter((_, i) => i % ROWS === r))

function Row({ items, reverse }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Le défilement automatique s'arrête hors écran, au doigt, et quand
    // l'onglet passe à l'arrière-plan : sinon il consomme pour rien.
    let raf = 0, paused = false, onScreen = false, last = 0
    // La largeur est mesurée à part : la relire à chaque image forcerait le
    // navigateur à recalculer la mise en page soixante fois par seconde.
    let max = 0
    const mesurer = () => { max = el.scrollWidth - el.clientWidth }
    const hold = () => { paused = true }
    const release = () => { paused = false }
    // Avancer au temps écoulé, pas à l'image : la vitesse reste la même que
    // l'écran affiche 60 ou 120 images par seconde, et un à-coup ne saute pas.
    const tick = (t) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(t - last, 50)
      last = t
      if (paused || !onScreen || document.hidden || max <= 0) return
      const next = el.scrollLeft + (reverse ? -SPEED : SPEED) * dt
      el.scrollLeft = next < 0 ? max : next > max ? 0 : next
    }
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting })
    io.observe(el)
    mesurer()
    window.addEventListener('resize', mesurer)
    if (reverse) el.scrollLeft = max
    raf = requestAnimationFrame(tick)
    const events = ['pointerdown', 'touchstart', 'mouseenter']
    const outs = ['pointerup', 'touchend', 'mouseleave']
    events.forEach(e => el.addEventListener(e, hold, { passive: true }))
    outs.forEach(e => el.addEventListener(e, release, { passive: true }))
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', mesurer)
      events.forEach(e => el.removeEventListener(e, hold))
      outs.forEach(e => el.removeEventListener(e, release))
    }
  }, [reverse])

  return (
    <div ref={ref} className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
      {items.map(item => (
        <article key={item.src} className="shrink-0 w-[150px] sm:w-[190px]">
          <div className="rounded-xl overflow-hidden border border-academy-border bg-black aspect-[9/16]">
            {item.type === 'video' ? (
              <ReelPlayer src={item.src} poster={item.poster} className="w-full h-full" />
            ) : (
              <img src={item.src} alt={item.alt || ''} loading="lazy" decoding="async"
                   className="w-full h-full object-cover" />
            )}
          </div>
          {item.label && (
            <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-academy-textMain/50">{item.label}</p>
          )}
        </article>
      ))}
    </div>
  )
}

export default function Galerie() {
  if (!GALERIE.length) return null

  return (
    <section className="py-8 lg:py-12 border-t border-academy-border">
      <div className="section-container">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-academy-primary">Tourné pendant la formation</p>
        <h2 className="mt-1 font-display font-black text-2xl sm:text-3xl tracking-tight text-academy-textMain">
          Ce que font nos étudiants
        </h2>
        <p className="mt-1.5 text-[15px] text-academy-textMain/60 max-w-xl">
          Filmé et monté au téléphone, pendant les trois jours. Aucune caméra, aucun ordinateur.
        </p>
      </div>

      {/* Les barres débordent volontairement de la colonne : on sent qu'il y en a plus. */}
      <div className="mt-5 space-y-3 ps-4 sm:ps-6 lg:ps-8">
        {rows.map((items, i) => <Row key={i} items={items} reverse={i === 1} />)}
      </div>

      <div className="section-container">
        <Link to="/coaching-presentiel"
              className="group mt-5 inline-flex items-center gap-2 text-sm font-bold text-academy-textMain border-b-2 border-academy-textMain hover:text-academy-primary hover:border-academy-primary transition-colors">
          Je veux savoir filmer comme ça <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
