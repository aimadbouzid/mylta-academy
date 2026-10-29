import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import api from '../api/axios'

// Pub de la formation présentielle en haut du fil d'accueil : la date, le prix
// et le nombre de jours restants, pour donner envie de réserver tout de suite.

const MONTHS = ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

// « 12 → 14 novembre » : la formation dure trois jours de suite.
function range(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const end = new Date(y, m - 1, d + 2)
  const sameMonth = end.getMonth() === m - 1
  const month = new Date(y, m - 1, d).toLocaleDateString('fr-FR', { month: 'long' })
  return sameMonth
    ? `${d} → ${end.getDate()} ${month}`
    : `${d} ${MONTHS[m - 1]} → ${end.getDate()} ${MONTHS[end.getMonth()]}`
}

const daysLeft = (iso) => Math.ceil((new Date(`${iso}T08:00:00+01:00`) - Date.now()) / 86400000)

export default function FormationAd({ inPerson }) {
  const [session, setSession] = useState(null)

  useEffect(() => {
    if (!inPerson?.enabled) return
    api.get('/in-person/sessions')
      .then(({ data }) => setSession((data.sessions || []).find(s => s.seatsLeft > 0) || null))
      .catch(() => {})
  }, [inPerson?.enabled])

  if (!inPerson?.enabled || !session) return null
  const left = daysLeft(session.date)
  const price = Number(session.price) || Number(inPerson.price) || 0

  return (
    <section className="section-container pt-4">
      <Link to="/coaching-presentiel"
            className="group relative flex max-w-3xl lg:max-w-none mx-auto bg-white border-2 border-academy-primary rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        <span className="shrink-0 flex flex-col items-center justify-center px-2.5 sm:px-3 bg-academy-primary text-academy-onPrimary">
          <span className="font-display font-black text-xl leading-none">{session.date.slice(8, 10)}</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.1em]">{MONTHS[Number(session.date.slice(5, 7)) - 1]}</span>
        </span>
        <span className="border-l-2 border-dashed border-academy-border" />
        <span className="flex-1 min-w-0 flex items-center justify-between gap-3 px-4 py-3.5">
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-academy-primary">
              Formation présentielle · {range(session.date)}
            </span>
            <span className="block font-display font-black text-sm sm:text-base leading-tight text-academy-textMain mt-0.5">
              Filmer, monter et utiliser l'IA sur smartphone
            </span>
            <span className="block text-xs text-academy-textMain/55 mt-0.5">
              3 jours chez Camden, Béjaïa · {price.toLocaleString('fr-FR')} DA
              {left > 0 && left <= 30 && <> · <b className="text-academy-primary">plus que {left} j</b></>}
            </span>
          </span>
          <span className="shrink-0 inline-flex items-center gap-1.5 btn-glow [--glow:rgb(200_40_40_/_0.55)] rounded-lg bg-academy-primary text-academy-onPrimary px-3 py-1.5 text-[13px] font-bold group-hover:opacity-90 transition-opacity">
            Réserver <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </span>
      </Link>
    </section>
  )
}
