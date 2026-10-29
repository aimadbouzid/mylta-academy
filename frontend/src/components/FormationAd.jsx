import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import api from '../api/axios'

// Annonce de la formation présentielle en tête de l'accueil : les trois jours,
// le compte à rebours jusqu'au début, le lieu et le prix.

const UNITS = [['jours', 86400000], ['h', 3600000], ['min', 60000], ['s', 1000]]
const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1)

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
  const days = [0, 1, 2].map(i => {
    const dt = new Date(y, m - 1, d + i)
    return { num: dt.getDate(), weekday: dt.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '') }
  })
  const month = cap(new Date(y, m - 1, d + 2).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }))
  const price = Number(session.price) || Number(inPerson.price) || 0
  const hour = (t) => (t || '').replace(':', 'h')

  let left = Math.max(0, new Date(`${session.date}T${session.startTime || '08:30'}:00+01:00`) - now)
  const countdown = UNITS.map(([u, ms]) => {
    const v = Math.floor(left / ms)
    left -= v * ms
    return [u, v]
  })

  return (
    <section className="section-container pt-4">
      <div className="max-w-3xl lg:max-w-none mx-auto rounded-2xl bg-academy-textMain text-academy-surface overflow-hidden">
        <div className="p-5 sm:p-7">
          <div className="sm:flex sm:items-start sm:justify-between sm:gap-8">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">
                Formation présentielle · Béjaïa
              </p>
              <h2 className="mt-1.5 font-display font-black text-2xl sm:text-4xl leading-[1.05] tracking-tight">
                Filmer, monter et utiliser l'IA sur smartphone
              </h2>

              <ol className="mt-4 flex gap-2 max-w-xs">
                {days.map(day => (
                  <li key={day.num} className="flex-1 text-center rounded-lg bg-academy-surface/10 py-2">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.12em] opacity-60">{day.weekday}</span>
                    <span className="block font-display font-black text-xl leading-none mt-0.5">{day.num}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-2 text-[13.5px] opacity-75">
                {month} · {hour(session.startTime)} – {hour(session.endTime)}
              </p>
              <p className="mt-0.5 text-[13.5px] opacity-75 flex items-center gap-1.5">
                <MapPin size={14} className="shrink-0 opacity-70" /> {session.place || 'Camden International Institute'}
              </p>
            </div>

            {/* Compte à rebours jusqu'au premier jour */}
            <div className="mt-5 sm:mt-0 shrink-0 sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-55">Il reste</p>
              <div className="mt-1.5 flex gap-1.5 sm:justify-end">
                {countdown.map(([u, v]) => (
                  <span key={u} className="w-[4.1rem] rounded-lg bg-academy-surface/10 py-2 text-center">
                    <span className="block font-display font-black text-xl leading-none tabular-nums">{String(v).padStart(2, '0')}</span>
                    <span className="block text-[9px] uppercase tracking-wider opacity-55 mt-1">{u}</span>
                  </span>
                ))}
              </div>
              <p className="mt-3 font-display font-black text-2xl">{price.toLocaleString('fr-FR')} DA</p>
            </div>
          </div>

          <Link to="/coaching-presentiel"
                className="group mt-5 inline-flex items-center gap-2 rounded-lg bg-academy-primary text-academy-onPrimary px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity">
            Réserver ma place <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
