import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import api from '../api/axios'

// Annonce de la formation en tête de l'accueil, dessinée comme un billet :
// l'affiche en haut, puis la ligne de perforation, puis le talon qui porte le
// prix et le bouton. Un objet qu'on reconnaît au premier coup d'œil, au lieu
// d'une suite de paragraphes empilés.

// Code-barres décoratif : des barres de largeurs irrégulières, dessinées en CSS.
// Une image serait un fichier de plus à charger pour un détail purement visuel.
const BARCODE = 'repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 4px, currentColor 4px 5px, transparent 5px 9px, currentColor 9px 12px, transparent 12px 14px)'

const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1)
const hour = (t) => (t || '').replace(':', 'h')

export default function FormationAd({ inPerson }) {
  const [session, setSession] = useState(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!inPerson?.enabled) return
    api.get('/in-person/sessions')
      .then(({ data }) => setSession((data.sessions || []).find(s => s.seatsLeft > 0) || null))
      .catch(() => {})
  }, [inPerson?.enabled])

  useEffect(() => {
    if (!session) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [session])

  if (!inPerson?.enabled || !session) return null

  const [y, m, d] = session.date.split('-').map(Number)
  const days = [0, 1, 2].map(i => new Date(y, m - 1, d + i))
  const month = cap(days[2].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }))
  const price = Number(session.price) || Number(inPerson.price) || 0
  const oldPrice = Number(inPerson.oldPrice) > price ? Number(inPerson.oldPrice) : 0

  let left = Math.max(0, new Date(`${session.date}T${session.startTime || '08:30'}:00+01:00`) - now)
  const j = Math.floor(left / 86400000); left -= j * 86400000
  const h = Math.floor(left / 3600000);  left -= h * 3600000
  const mn = Math.floor(left / 60000);   left -= mn * 60000
  const sc = Math.floor(left / 1000)
  const pad = (n) => String(n).padStart(2, '0')
  const serial = `MA-${session.date.replace(/-/g, '')}-${String(session.id || 1).padStart(3, '0')}`

  return (
    <section className="section-container pt-3">
      <article className="max-w-3xl lg:max-w-none mx-auto rounded-2xl bg-academy-white text-academy-textMain border border-academy-border shadow-soft overflow-hidden">

        {/* Bandeau du billet */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-7 py-2.5 border-b border-academy-border
                        text-[9.5px] font-bold uppercase tracking-[0.18em] opacity-70">
          <span>Mylta Academy · Présentiel</span>
          <span className="hidden sm:inline opacity-70">N° {serial}</span>
          <span>{session.capacity || 10} places</span>
        </div>

        <div className="px-4 sm:px-7 pt-4 pb-5 lg:flex lg:items-start lg:justify-between lg:gap-10">
          <div className="lg:max-w-xl">
            <h2 className="font-display font-black text-[1.35rem] sm:text-[2rem] lg:text-[2.3rem] leading-[1.06] tracking-tight">
              En 3 jours, vous filmez, montez et faites travailler l'IA.
            </h2>
            <p className="mt-2 text-[13px] sm:text-[15px] opacity-70 leading-snug">
              Tout sur votre téléphone : tournage, montage, scripts, voix off et images par l'IA. Même en partant de zéro.
            </p>
          </div>

          {/* Les trois jours, en cases séparées : on lit une date, pas un nombre. */}
          <div className="mt-5 lg:mt-1 shrink-0">
            <div className="flex justify-center lg:justify-end">
              {days.map((dt, i) => (
                <div key={i} className={`px-3 sm:px-4 text-center ${i ? 'border-l border-academy-border' : ''}`}>
                  <span className="block text-[9.5px] font-bold uppercase tracking-[0.14em] opacity-55">
                    {dt.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}
                  </span>
                  <span className="block font-display font-black text-[1.9rem] sm:text-[2.4rem] leading-[1] tabular-nums">
                    {dt.getDate()}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-center lg:text-right font-bold text-[15px]">{month}</p>
            <p className="mt-0.5 text-center lg:text-right text-[12px] opacity-70">
              {hour(session.startTime)} – {hour(session.endTime)}
            </p>
            <p className="mt-0.5 text-[12px] opacity-70 flex items-center justify-center lg:justify-end gap-1.5">
              <MapPin size={13} className="shrink-0" /> {session.place || 'Camden International Institute'}
            </p>
          </div>
        </div>

        {/* La perforation : deux encoches et un pointillé, comme sur un vrai billet. */}
        <div className="relative">
          <span aria-hidden="true" className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-academy-surface" />
          <span aria-hidden="true" className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-academy-surface" />
          <div className="mx-4 sm:mx-7 border-t-2 border-dashed border-academy-textMain/20" />
        </div>

        {/* Le talon : ce qu'on détache, donc le prix et le bouton. */}
        <div className="px-4 sm:px-7 py-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
          <div className="flex-1 min-w-0">
            <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="font-display font-black text-[1.6rem] sm:text-[2.1rem] tracking-tight">
                {price.toLocaleString('fr-FR')} DA
              </span>
              {oldPrice > 0 && (
                <>
                  <span className="text-[13px] opacity-45 line-through">{oldPrice.toLocaleString('fr-FR')} DA</span>
                  <span className="text-[11px] font-black rounded px-1.5 py-0.5 bg-academy-primary text-academy-onPrimary">
                    −{Math.round((1 - price / oldPrice) * 100)} %
                  </span>
                </>
              )}
            </p>
            <p className="mt-1 text-[11.5px] opacity-65 tabular-nums">
              Commence dans {j} j {pad(h)} h {pad(mn)} min {pad(sc)} s
            </p>
          </div>
          {/* Code-barres : le détail qui fait lire « billet » avant même le texte. */}
          <div aria-hidden="true" className="hidden sm:flex flex-col items-center gap-1 shrink-0 opacity-80">
            <span className="block h-9 w-[104px]" style={{ backgroundImage: BARCODE }} />
            <span className="text-[8.5px] font-bold uppercase tracking-[0.22em] opacity-60">{serial}</span>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <span aria-hidden="true"
                  className="hidden lg:block self-stretch border-l-2 border-dashed border-academy-textMain/20" />
            <div className="w-full sm:w-auto">
              <Link to="/coaching-presentiel"
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg
                               bg-academy-primary text-academy-onPrimary px-6 py-3 text-[14px] font-bold
                               hover:opacity-90 transition-opacity">
                Réserver ma place <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <p className="mt-1.5 text-center text-[9px] font-bold uppercase tracking-[0.22em] opacity-50">
                Entrée · 1 place
              </p>
            </div>
          </div>
        </div>
      </article>
    </section>
  )
}
