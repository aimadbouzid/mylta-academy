import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { formatDate } from '../utils/sessionDates'

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
            className="group block max-w-3xl mx-auto bg-white border border-academy-border rounded-xl px-4 py-3.5 hover:border-academy-textMain/30 transition-colors">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-academy-primary">Présentiel · 3 jours</p>
          <span className="text-sm font-bold text-academy-textMain border-b-2 border-academy-textMain group-hover:border-academy-primary group-hover:text-academy-primary transition-colors">S'inscrire</span>
        </div>
        <ul className="mt-2 divide-y divide-academy-border">
          {sessions.map(s => (
            <li key={s.id} className="py-1.5 text-[13px] sm:text-sm font-bold text-academy-textMain truncate">{formatDate(s.date)}</li>
          ))}
        </ul>
        {notice && <p className="mt-1.5 text-[11px] sm:text-xs text-academy-textMain/55 leading-snug">{notice}</p>}
      </Link>
    </section>
  )
}
