import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ArrowRight } from 'lucide-react'
import api from '../api/axios'

// « Mar. 20 → jeu. 22 oct. » : tient sur une ligne de téléphone, même avec l'étiquette du créneau.
const shortRange = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const end = new Date(y, m - 1, d + 2)
  const wd = (dt) => dt.toLocaleDateString('fr-FR', { weekday: 'short' })
  const mo = (dt) => dt.toLocaleDateString('fr-FR', { month: 'short' })
  const left = `${wd(start)} ${start.getDate()}${start.getMonth() !== end.getMonth() ? ` ${mo(start)}` : ''}`
  const label = `${left} → ${wd(end)} ${end.getDate()} ${mo(end)}`
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function NextSessionAd({ enabled, notice }) {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    if (!enabled) return
    api.get('/in-person/sessions')
      .then(({ data }) => setSessions((data.sessions || []).filter(s => s.seatsLeft > 0).slice(0, 3)))
      .catch(() => {})
  }, [enabled])

  if (!enabled || sessions.length === 0) return null

  return (
    <section className="section-container py-4">
      <Link to="/coaching-presentiel"
            className="group flex max-w-3xl mx-auto bg-white dark:bg-academy-surfaceDark border border-academy-border rounded-2xl overflow-hidden hover:border-academy-textMain/25 hover:shadow-sm transition-all">
        {/* Talon rouge, comme le ticket du concours */}
        <span className="shrink-0 flex items-center px-3 sm:px-4 bg-academy-primary text-academy-onPrimary">
          <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-black uppercase tracking-[0.25em]">Présentiel</span>
        </span>
        <span className="border-l-2 border-dashed border-academy-border" />
        <div className="flex-1 min-w-0 px-4 py-3.5 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display font-black text-[15px] sm:text-lg leading-tight text-academy-textMain">Formation de 3 jours</p>
            <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-academy-textMain text-academy-surface px-3.5 py-1.5 text-xs font-bold group-hover:opacity-90 transition-opacity">
              S'inscrire <ArrowRight size={13} />
            </span>
          </div>
          <ul className="mt-2.5 space-y-1.5">
            {sessions.map(s => (
              <li key={s.id} className="flex items-center gap-2 text-[13px] sm:text-sm font-semibold text-academy-textMain/90">
                <CalendarDays size={15} className="shrink-0 text-academy-textMain/35" />
                <span className="truncate">{shortRange(s.date)}</span>
                {s.startTime && (
                  <span className="shrink-0 ml-auto text-[10px] font-bold uppercase tracking-wider text-academy-textMain/50">
                    {Number(s.startTime.slice(0, 2)) < 12 ? 'Matin' : 'Soir'}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {notice && <p className="mt-3 pt-3 border-t border-academy-border text-[11px] sm:text-xs text-academy-textMain/50 leading-snug">{notice}</p>}
        </div>
      </Link>
    </section>
  )
}
