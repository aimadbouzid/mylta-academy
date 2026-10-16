import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ArrowRight } from 'lucide-react'
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
            className="block max-w-3xl mx-auto rounded-xl border border-academy-border bg-academy-surfaceDark/50 p-3 sm:p-4 hover:border-academy-textMain/30 transition-colors">
        <div className="flex items-center gap-3">
          <span className="shrink-0 w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center"><CalendarDays size={18} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-academy-textMain/50">Prochaines formations · 3 jours en présentiel</p>
            <ul className="text-xs sm:text-sm font-bold text-academy-textMain space-y-0.5 mt-0.5">
              {sessions.map(s => <li key={s.id} className="truncate">{formatDate(s.date)}</li>)}
            </ul>
            {notice && <p className="text-[10px] sm:text-xs text-academy-textMain/60 mt-1">{notice}</p>}
          </div>
          <ArrowRight size={16} className="shrink-0 text-academy-textMain/50" />
        </div>
      </Link>
    </section>
  )
}
