import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import api from '../api/axios'

// Annonce de la formation présentielle en tête de l'accueil : la promesse,
// les trois dates en grand, le compte à rebours, le prix.

const UNITS = [['jours', 86400000], ['heures', 3600000], ['min', 60000], ['sec', 1000]]
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
  const weekdays = days.map(dt => dt.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')).join(' · ')
  const month = cap(days[2].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }))
  const price = Number(session.price) || Number(inPerson.price) || 0
  const oldPrice = Number(inPerson.oldPrice) > price ? Number(inPerson.oldPrice) : 0

  let left = Math.max(0, new Date(`${session.date}T${session.startTime || '08:30'}:00+01:00`) - now)
  const countdown = UNITS.map(([u, ms]) => {
    const v = Math.floor(left / ms)
    left -= v * ms
    return [u, v]
  })

  return (
    <section className="section-container pt-4">
      <div className="max-w-3xl lg:max-w-none mx-auto rounded-2xl bg-academy-textMain text-academy-surface p-5 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">
          Formation IA & Montage Vidéo · Béjaïa · {session.capacity || 10} places
        </p>

        {/* La promesse, pas la liste des sujets. */}
        <h2 className="mt-2 font-display font-black text-[1.75rem] sm:text-5xl leading-[1.04] tracking-tight">
          En 3 jours, vous filmez, montez<br className="hidden sm:block" /> et faites travailler l'IA.
        </h2>
        <p className="mt-2.5 text-[15px] sm:text-lg opacity-70 max-w-xl">
          Tout sur votre téléphone : tournage, montage, scripts, voix off et images par l'IA. Même en partant de zéro.
        </p>

        <div className="mt-6 sm:flex sm:items-end sm:justify-between sm:gap-10">
          {/* Les dates, en grand : l'information qu'on retient. */}
          <div>
            <p className="font-display font-black text-[3.4rem] sm:text-[5rem] leading-[0.85] tracking-tight tabular-nums">
              {days.map(dt => dt.getDate()).join(' · ')}
            </p>
            <p className="mt-2 font-bold text-lg sm:text-2xl">{month}</p>
            <p className="mt-1 text-[13.5px] opacity-70">
              {weekdays} · {hour(session.startTime)} – {hour(session.endTime)}
            </p>
            <p className="mt-0.5 text-[13.5px] opacity-70 flex items-center gap-1.5">
              <MapPin size={14} className="shrink-0 opacity-70" /> {session.place || 'Camden International Institute'}
            </p>
          </div>

          <div className="mt-6 sm:mt-0 shrink-0 sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-55">Début dans</p>
            <div className="mt-1.5 flex gap-1.5 sm:justify-end">
              {countdown.map(([u, v]) => (
                <span key={u} className="flex-1 sm:flex-none sm:w-[4.3rem] rounded-lg bg-academy-surface/10 py-2 text-center">
                  <span className="block font-display font-black text-lg leading-none tabular-nums">{String(v).padStart(2, '0')}</span>
                  <span className="block text-[9px] uppercase tracking-wider opacity-55 mt-1">{u}</span>
                </span>
              ))}
            </div>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="font-display font-black text-3xl">{price.toLocaleString('fr-FR')} DA</span>
              {oldPrice > 0 && (
                <>
                  <span className="text-sm text-current/45 line-through">{oldPrice.toLocaleString('fr-FR')} DA</span>
                  <span className="text-[11px] font-black rounded px-1.5 py-0.5 bg-academy-primary text-academy-onPrimary">
                    -{Math.round((1 - price / oldPrice) * 100)}%
                  </span>
                </>
              )}
            </p>
            <Link to="/coaching-presentiel"
                  className="group mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-academy-primary text-academy-onPrimary px-6 py-3 text-[15px] font-bold hover:opacity-90 transition-opacity">
              Réserver ma place <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
