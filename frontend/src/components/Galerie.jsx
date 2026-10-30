import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Hand } from 'lucide-react'
import ReelPlayer from './ReelPlayer'
import { GALERIE } from '../data/galerie'

// Ce qui se passe vraiment en formation : les vidéos tournées sur place, les
// photos de l'atelier et nos montages CapCut. Tout est muet au départ.
//
// Le défilement est MANUEL. Les trois barres avançaient toutes seules en
// écrivant `scrollLeft` soixante fois par seconde : à chaque écriture le
// navigateur recalcule la position de plus de cent vignettes, pendant que les
// vidéos se décodent. C'est ce qui saccadait toute la page, y compris les
// sections voisines. Au doigt, le navigateur gère le défilement lui-même, sur
// son propre fil d'exécution : c'est fluide même avec les vidéos qui jouent.

const ROWS = 3

// Une barre sur trois, en gardant l'ordre : chaque ligne reste mélangée.
const rows = Array.from({ length: ROWS }, (_, r) => GALERIE.filter((_, i) => i % ROWS === r))

function Row({ items }) {
  const ref = useRef(null)
  const [ends, setEnds] = useState({ start: true, end: false })

  // Les flèches n'apparaissent que là où il reste quelque chose à voir.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setEnds({
      start: el.scrollLeft <= 8,
      end: el.scrollLeft >= el.scrollWidth - el.clientWidth - 8,
    })
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])

  const nudge = (dir) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: 'smooth' })
  }

  return (
    <div className="relative group/row">
      <div ref={ref}
           className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 snap-x snap-mandatory
                      overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        {items.map(item => (
          <article key={item.src} className="shrink-0 w-[118px] sm:w-[150px] snap-start">
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

      {/* Flèches à la souris : au doigt, on fait simplement glisser. */}
      {['start', 'end'].map(side => (
        <button
          key={side}
          type="button"
          onClick={() => nudge(side === 'start' ? -1 : 1)}
          aria-label={side === 'start' ? 'Voir les précédentes' : 'Voir les suivantes'}
          className={`hidden lg:grid place-items-center absolute top-[38%] z-10 w-9 h-9 rounded-full
                      bg-academy-white/90 border border-academy-border shadow-soft backdrop-blur
                      text-academy-textMain transition-opacity
                      opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100
                      ${side === 'start' ? 'left-1' : 'right-5'}
                      ${ends[side] ? 'pointer-events-none !opacity-0' : ''}`}
        >
          {side === 'start' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
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
        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-academy-border
                      bg-academy-surface dark:bg-white/[0.04] px-3 py-1.5
                      text-[12px] font-bold text-academy-textMain/60">
          <Hand size={13} className="shrink-0" />
          Faites glisser pour voir les autres
        </p>
      </div>

      {/* Les barres débordent volontairement de la colonne : on sent qu'il y en a plus. */}
      <div className="mt-5 space-y-3 ps-4 sm:ps-6 lg:ps-8">
        {rows.map((items, i) => <Row key={i} items={items} />)}
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
