import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import api from '../api/axios'

// Accueil : une seule section qui présente les trois façons de se former,
// chacune repérée par une barre d'accent.

const money = (n) => `${Number(n).toLocaleString('fr-FR')} DA`
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const short = (iso, opts) => cap(new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', opts))
const range3 = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  const end = new Date(y, m - 1, d + 2)
  const endIso = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
  return `${short(iso, { weekday: 'short', day: 'numeric' })} → ${short(endIso, { weekday: 'short', day: 'numeric', month: 'short' }).toLowerCase()}`
}
const hourShort = (t) => (t || '').replace(/^0/, '').replace(':00', 'h').replace(':', 'h')

function Card({ kicker, title, text, facts, next, nextLabel = 'Prochaine', to, cta, accent, accentText, button, badge, solid, surface = 'bg-white dark:bg-academy-surfaceDark border-academy-border' }) {
  const [mode, ...rest] = kicker.split(' · ')
  // solid : carte entièrement colorée, textes en blanc.
  const ink = solid ? 'text-white' : 'text-academy-textMain'
  const soft = solid ? 'text-white/75' : 'text-academy-textMain/60'
  return (
    <Link to={to} className={`group flex flex-col overflow-hidden border rounded-2xl ${solid ? 'hover:shadow-lg hover:shadow-blue-600/25' : 'hover:border-academy-textMain/30 hover:shadow-sm'} transition-all ${surface}`}>
      {/* Chaque formation porte sa couleur, du bandeau jusqu'au bouton : les
          trois cartes se ressemblaient trop pour se distinguer d'un coup d'œil. */}
      <span aria-hidden="true" className={`block h-1.5 w-full ${accent}`} />
      <div className="flex flex-1 flex-col p-5 lg:p-6">
      {/* Le mode — en ligne ou présentiel — décide si la formation est
          accessible au visiteur : il doit se lire d'un coup d'œil. */}
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em]">
        {/* « En ligne » ou « Présentiel » sur fond plein : c'est ce mot qui dit
            au visiteur s'il doit se déplacer, il ne peut pas se lire comme une
            surtitre discrète. */}
        <span className={`rounded-md px-2 py-1 leading-none ${button}`}>{mode}</span>
        {rest.length > 0 && <span className={solid ? 'text-white/70' : 'text-academy-textMain/50'}>{rest.join(' · ')}</span>}
        {badge && <span className={`ml-auto shrink-0 rounded-full border px-2 py-0.5 text-[10px] tracking-[0.1em] ${solid ? 'border-white/40 text-white' : `border-current ${accentText}`}`}>{badge}</span>}
      </p>
      <h3 className={`mt-1 font-display font-black text-2xl sm:text-[26px] leading-[1.1] lg:min-h-[2.2em] tracking-tight ${ink}`}>{title}</h3>
      <p className={`mt-1.5 text-[13px] lg:text-sm ${soft} leading-snug lg:min-h-[2.75em]`}>{text}</p>

      <dl className="mt-3 lg:mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] lg:text-sm">
        {facts.map(([k, v], i) => (
          <span key={k} className="inline-flex items-center gap-2">
            {i > 0 && <span aria-hidden="true" className={solid ? 'text-white/40' : 'text-academy-textMain/25'}>·</span>}
            <dt className="sr-only">{k}</dt>
            <dd className={`font-bold ${ink}`}>{v}</dd>
          </span>
        ))}
      </dl>

      {next && <p className={`mt-2 text-[13px] lg:text-sm ${soft}`}>{nextLabel} : <span className={`font-semibold ${solid ? 'text-white' : 'text-academy-textMain/80'}`}>{next}</span></p>}

      <span className="mt-auto pt-4 lg:pt-5">
        <span className={`flex w-full items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-[13px] font-semibold shadow-sm group-hover:opacity-90 transition-opacity ${button}`}>
          {cta} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </span>
      </span>
      </div>
    </Link>
  )
}

export default function FormationsHub({ coaching, inPerson, express }) {
  const [session, setSession] = useState(null)
  const [saturday, setSaturday] = useState(null)

  useEffect(() => {
    if (!inPerson?.enabled) return
    api.get('/in-person/sessions')
      .then(({ data }) => setSession((data.sessions || []).find(s => s.seatsLeft > 0) || null))
      .catch(() => {})
  }, [inPerson?.enabled])
  useEffect(() => {
    if (!express?.enabled) return
    api.get('/in-person/express/days')
      .then(({ data }) => setSaturday((data.days || []).find(d => d.seatsLeft > 0)?.day || null))
      .catch(() => {})
  }, [express?.enabled])

  const cards = []
  if (coaching?.enabled) cards.push(
    <Card key="online" accent="bg-academy-textMain" accentText="text-academy-textMain" button="bg-academy-textMain text-academy-surface" kicker="En ligne · depuis chez vous"
          title={coaching.title || 'Coaching en ligne'}
          text="Un coach en visio pour apprendre l'IA ou créer votre site. Seul ou avec vos amis."
          facts={[['Durée', coaching.formats?.[0]?.duration || '2h30'], ['Format', 'Visio'], ['Quand', '7 j / 7']]}
          nextLabel="Au choix" next={`${(coaching.topics || []).length} packs`}
          to="/coaching" cta="Choisir mon pack" />
  )
  if (inPerson?.enabled) cards.push(
    <Card key="3j" accent="bg-academy-primary" accentText="text-academy-primary" button="bg-academy-primary text-white" kicker="Présentiel · 3 jours"
          title={inPerson.title || 'Formation en présentiel'}
          text={`En petit groupe chez Camden, à Béjaïa.${Number(inPerson.studentPrice) > 0 ? ` Étudiants : ${money(inPerson.studentPrice)}.` : ''}`}
          facts={[['Durée', '3 jours'], ['Lieu', 'Camden'], ['Prix', inPerson.price ? money(inPerson.price) : '—']]}
          next={session ? `${range3(session.date)}${session.startTime ? (Number(session.startTime.slice(0, 2)) < 12 ? ' · matin' : ' · soir') : ''}` : inPerson.datesNotice ? 'dates bientôt annoncées' : null}
          to="/coaching-presentiel" cta="Voir les dates" />
  )
  if (express?.enabled) cards.push(
    <Card key="1j" solid accent="bg-white/25" accentText="text-white" button="bg-white text-blue-700" kicker="Présentiel · chaque samedi"
          badge="Nouveau" surface="bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-600 shadow-md shadow-blue-600/20"
          title="Montage vidéo en 1 jour"
          text="On filme, on monte, vous repartez avec votre vidéo terminée le jour même."
          facts={[['Horaires', `${hourShort(express.startTime)}–${hourShort(express.endTime)}`], ['Lieu', 'Viga Center'], ['Prix', money(express.price)]]}
          next={saturday ? short(saturday, { weekday: 'long', day: 'numeric', month: 'long' }) : null}
          to="/formation-1-jour" cta="Réserver mon samedi" />
  )
  if (!cards.length) return null

  return (
    <section className="section-container py-8 lg:py-12">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-academy-primary">Avec un formateur, en direct</p>
      <h2 className="mt-1 font-display font-black text-2xl sm:text-3xl tracking-tight text-academy-textMain">Choisissez votre façon d'apprendre</h2>
      <div className="mt-5 grid gap-3 sm:gap-4 md:grid-cols-3">{cards}</div>
    </section>
  )
}
