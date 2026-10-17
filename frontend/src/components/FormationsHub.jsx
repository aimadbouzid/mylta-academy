import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Video, MapPin, Clapperboard } from 'lucide-react'
import api from '../api/axios'

// Accueil : une seule section qui présente les trois façons de se former,
// chacune reconnaissable à sa bande du haut (noire, rouge, clap).

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

const BANDS = {
  dark: { className: 'bg-neutral-900' },
  red: { className: 'bg-academy-primary' },
  slate: { style: { background: 'repeating-linear-gradient(-45deg, #111 0 12px, #fff 12px 24px)' }, className: 'border-b-2 border-neutral-900' },
}

function Card({ band, Icon, kicker, title, text, facts, next, nextLabel = 'Prochaine', to, cta, accent }) {
  const b = BANDS[band]
  return (
    <Link to={to} className="group flex flex-col bg-white dark:bg-academy-surfaceDark border border-academy-border rounded-2xl overflow-hidden hover:border-academy-textMain/30 hover:shadow-sm transition-all">
      <div aria-hidden="true" className={`h-3 ${b.className || ''}`} style={b.style} />
      <div className="flex-1 flex flex-col p-4 sm:p-5">
        <p className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${accent}`}>
          <Icon size={13} /> {kicker}
        </p>
        <h3 className="mt-1.5 font-display font-black text-xl leading-tight text-academy-textMain">{title}</h3>
        <p className="mt-1 text-[13px] text-academy-textMain/60 leading-snug">{text}</p>

        <dl className="mt-3 grid grid-cols-3 gap-px rounded-lg overflow-hidden border border-academy-border bg-academy-border">
          {facts.map(([k, v]) => (
            <div key={k} className="bg-white dark:bg-academy-surfaceDark px-2.5 py-2">
              <dt className="text-[9px] font-bold uppercase tracking-[0.15em] text-academy-textMain/45">{k}</dt>
              <dd className="font-bold text-[13px] leading-tight text-academy-textMain">{v}</dd>
            </div>
          ))}
        </dl>

        {next && <p className="mt-3 text-[13px] text-academy-textMain/70"><span className="font-bold text-academy-textMain">{nextLabel} : </span>{next}</p>}

        <span className="mt-auto pt-4 inline-flex self-start items-center gap-1.5 text-sm font-bold border-b-2 border-academy-textMain text-academy-textMain group-hover:text-academy-primary group-hover:border-academy-primary transition-colors">
          {cta} <ArrowRight size={15} />
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
    <Card key="online" band="dark" Icon={Video} accent="text-academy-textMain" kicker="En ligne · depuis chez vous"
          title={coaching.title || 'Coaching en ligne'}
          text="Un coach en visio pour apprendre l'IA ou créer votre site. Seul ou avec vos amis."
          facts={[['Durée', coaching.formats?.[0]?.duration || '2h30'], ['Format', 'Visio'], ['Quand', '7 j / 7']]}
          nextLabel="Au choix" next={`${(coaching.topics || []).length} packs`}
          to="/coaching" cta="Choisir mon pack" />
  )
  if (inPerson?.enabled) cards.push(
    <Card key="3j" band="red" Icon={MapPin} accent="text-academy-primary" kicker="Présentiel · 3 jours"
          title={inPerson.title || 'Formation en présentiel'}
          text={`En petit groupe chez Camden, à Béjaïa.${Number(inPerson.studentPrice) > 0 ? ` Étudiants : ${money(inPerson.studentPrice)}.` : ''}`}
          facts={[['Durée', '3 jours'], ['Lieu', 'Camden'], ['Prix', inPerson.price ? money(inPerson.price) : '—']]}
          next={session ? `${range3(session.date)}${session.startTime ? (Number(session.startTime.slice(0, 2)) < 12 ? ' · matin' : ' · après-midi') : ''}` : inPerson.datesNotice ? 'dates bientôt annoncées' : null}
          to="/coaching-presentiel" cta="Voir les dates" />
  )
  if (express?.enabled) cards.push(
    <Card key="1j" band="slate" Icon={Clapperboard} accent="text-academy-primary" kicker="Nouveau · chaque samedi"
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
