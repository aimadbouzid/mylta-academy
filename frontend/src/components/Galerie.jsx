import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ReelPlayer from './ReelPlayer'
import { GALERIE } from '../data/galerie'

// Ce qui se passe vraiment en formation : les vidéos tournées sur place et les
// montages des participants. Tout est muet et démarre seul, comme un fil.

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
          Des images filmées et montées au téléphone, pendant les trois jours. Aucune caméra, aucun ordinateur.
        </p>

        <div className="mt-5 flex gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-1">
          {GALERIE.map(item => (
            <article key={item.src} className="snap-start shrink-0 w-[180px] sm:w-[220px]">
              <div className="rounded-xl overflow-hidden border border-academy-border bg-black aspect-[9/16]">
                {item.type === 'video' ? (
                  <ReelPlayer src={item.src} poster={item.poster} className="w-full h-full" />
                ) : (
                  <img src={item.src} alt={item.alt || ''} loading="lazy" decoding="async"
                       className="w-full h-full object-cover" />
                )}
              </div>
              {item.label && (
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-academy-textMain/50">{item.label}</p>
              )}
            </article>
          ))}
        </div>

        <Link to="/coaching-presentiel"
              className="group mt-5 inline-flex items-center gap-2 text-sm font-bold text-academy-textMain border-b-2 border-academy-textMain hover:text-academy-primary hover:border-academy-primary transition-colors">
          Je veux savoir filmer comme ça <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
