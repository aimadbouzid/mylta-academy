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

// Nombre de vignettes montées d'emblée, puis ajoutées à chaque approche de la
// fin. Les 116 vignettes de la galerie étaient toutes créées au chargement,
// avec leurs observateurs : lourd à l'ouverture sur un téléphone modeste,
// alors que personne ne voit plus de cinq vignettes à la fois.
const LOT = 15

function Row({ items }) {
  const ref = useRef(null)
  const [ends, setEnds] = useState({ start: true, end: false })
  const [limite, setLimite] = useState(LOT)
  const visibles = items.slice(0, limite)

  // Les flèches n'apparaissent que là où il reste quelque chose à voir.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      setEnds({
        start: el.scrollLeft <= 8,
        end: el.scrollLeft >= el.scrollWidth - el.clientWidth - 8,
      })
      // On approche de la fin : on prépare le lot suivant avant d'y arriver.
      if (el.scrollLeft > el.scrollWidth - el.clientWidth - 700) {
        setLimite(l => (l >= items.length ? l : l + LOT))
      }
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [items.length])

  // Au premier passage à l'écran, la rangée glisse puis revient : le geste dit
  // « ça se fait glisser » mieux qu'une phrase, et il ne se produit qu'une fois.
  //
  // L'animation est en CSS, sur le contenu de la rangée, et non en JavaScript
  // sur la position de défilement : l'accroche « obligatoire » annule tout
  // défilement programmé, et une animation CSS reste fluide même quand le fil
  // principal est occupé à décoder les vidéos.
  const [montrerGeste, setMontrerGeste] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    let fait = false
    const verifier = () => {
      if (fait) return
      const r = el.getBoundingClientRect()
      if (r.bottom < 0 || r.top > window.innerHeight * 0.85) return
      if (el.scrollWidth <= el.clientWidth + 20) return
      fait = true
      window.removeEventListener('scroll', verifier)
      setMontrerGeste(true)
    }

    verifier()
    window.addEventListener('scroll', verifier, { passive: true })
    return () => window.removeEventListener('scroll', verifier)
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
        <div className={`flex gap-3 ${montrerGeste ? 'geste-glisser' : ''}`}>
        {visibles.map(item => (
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
      </div>

      <style>{`
        @keyframes geste-glisser { 0%, 12%, 100% { transform: translateX(0) } 48% { transform: translateX(-56px) } }
        .geste-glisser { animation: geste-glisser 1.5s cubic-bezier(.4,0,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .geste-glisser { animation: none } }
      `}</style>

      {/* Le contenu s'efface sur le bord droit : la rangée continue visiblement
          au-delà de l'écran, au lieu de s'arrêter net sur une vignette coupée. */}
      <span aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 right-0 w-10 transition-opacity duration-300
                        bg-gradient-to-l from-academy-surface to-transparent
                        ${ends.end ? 'opacity-0' : 'opacity-100'}`} />

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
        <p className="mt-3 inline-flex items-center gap-2 rounded-full
                      bg-academy-primary text-academy-onPrimary px-3.5 py-2
                      text-[12.5px] font-bold shadow-soft">
          <Hand size={14} className="shrink-0 animate-swipe" />
          Faites glisser pour voir les autres
          <ChevronRight size={14} className="shrink-0 animate-swipe" />
        </p>

        {/* Le geste, montré plutôt qu'écrit : la main et la flèche avancent
            doucement vers la droite, en boucle. */}
        <style>{`
          @keyframes swipe-hint { 0%, 60%, 100% { transform: translateX(0) } 30% { transform: translateX(4px) } }
          .animate-swipe { animation: swipe-hint 1.8s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) { .animate-swipe { animation: none } }
        `}</style>
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
