import { useEffect, useState } from 'react'

// Compte à rebours jusqu'au début de la formation (heure d'Algérie, UTC+1).
const UNITS = [['j', 86400000], ['h', 3600000], ['min', 60000], ['s', 1000]]

export default function SessionCountdown({ date, startTime = '08:30', label = 'La formation commence dans' }) {
  const target = date ? new Date(`${date}T${startTime}:00+01:00`).getTime() : null
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!target) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [target])

  if (!target || target <= now) return null
  let left = target - now

  return (
    <div className="rounded-xl border border-academy-border bg-academy-surface px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-academy-textMain/50">{label}</p>
      <div className="mt-1.5 flex gap-2">
        {UNITS.map(([u, ms]) => {
          const v = Math.floor(left / ms)
          left -= v * ms
          return (
            <span key={u} className="flex-1 rounded-lg bg-white dark:bg-academy-surfaceDark border border-academy-border py-1.5 text-center">
              <span className="block font-display font-black text-xl leading-none tabular-nums">{String(v).padStart(2, '0')}</span>
              <span className="block text-[9px] uppercase tracking-wider text-academy-textMain/45 mt-0.5">{u}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
