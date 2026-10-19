import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, CalendarDays, MapPin, Coins, Monitor, Users } from 'lucide-react'
import api from '../api/axios'

// Accueil : les trois façons de se former, en bandeaux larges. Chaque carte
// porte sa couleur et, si le fichier existe, une photo au fond à droite.
// Les photos vivent dans public/cards/ ; sans elles, le dégradé suffit.

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

function Card({ ModeIcon, mode, aside, title, text, facts, next, nextLabel = 'Prochaine', to, cta,
                surface, ink, soft, chip, button, divider, image, badge, overlay }) {
  return (
    <Link to={to} className={`group relative block overflow-hidden rounded-2xl ${surface}`}>
      {/* La photo occupe la moitié droite sur grand écran, tout le fond sur
          téléphone : le dégradé garde le texte lisible dans les deux cas. */}
      {image && (
        <span aria-hidden="true" className="absolute inset-y-0 right-0 w-full sm:w-3/5 bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }} />
      )}
      <span aria-hidden="true" className={`absolute inset-0 ${overlay}`} />

      <div className="relative p-3.5 sm:p-4 sm:max-w-[60%]">
        <p className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${chip}`}>
            <ModeIcon size={13} /> {mode}
          </span>
          {aside && <span className={`text-[11px] font-black uppercase tracking-[0.14em] ${soft}`}>{aside}</span>}
          {/* Sur téléphone, ce badge passait à la ligne et rallongeait la carte. */}
          {badge && <span className={`hidden sm:inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] ${chip} bg-transparent`}>{badge}</span>}
        </p>

        <h3 className={`mt-1.5 font-display font-black text-lg sm:text-xl leading-[1.1] tracking-tight ${ink}`}>{title}</h3>
        {text && <p className={`mt-1 text-[13px] leading-snug ${soft}`}>{text}</p>}

        <dl className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          {facts.map(([label, value, Icon], i) => (
            <span key={label} className="inline-flex items-center gap-3">
              {i > 0 && <span aria-hidden="true" className={`h-4 w-px ${divider}`} />}
              <span className="inline-flex items-center gap-1.5">
                <Icon size={15} className={soft} aria-hidden="true" />
                <dt className="sr-only">{label}</dt>
                <dd className={`font-bold text-[13px] ${ink}`}>{value}</dd>
              </span>
            </span>
          ))}
        </dl>

        {next && <p className={`mt-1 text-xs ${soft}`}>{nextLabel} : <span className={`font-semibold ${ink}`}>{next}</span></p>}

        <span className={`mt-2.5 inline-flex self-start items-center justify-center gap-1.5 btn-glow rounded-lg px-3.5 py-2 text-[13px] font-bold transition-opacity group-hover:opacity-90 ${button}`}>
          {cta} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
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
    <Card key="online" ModeIcon={Monitor} mode="En ligne"
          surface="bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950" ink="text-white" soft="text-white/70" divider="bg-white/25"
          chip="border border-white/30 text-white" button="bg-white text-neutral-950"
          image="/cards/coaching.jpg"
          overlay="bg-gradient-to-r from-neutral-950/95 via-neutral-950/45 to-transparent"
          title={coaching.title || 'Coaching en ligne'}
          facts={[['Durée', coaching.formats?.[0]?.duration || '2h30', Clock], ['Quand', '7 j / 7', CalendarDays]]}
          to="/coaching" cta="Choisir mon pack" />
  )
  if (inPerson?.enabled) cards.push(
    <Card key="3j" ModeIcon={Users} mode="Présentiel" aside="3 jours"
          surface="bg-gradient-to-br from-[#e8554d] via-academy-primary to-[#5e0f0f]" ink="text-white" soft="text-white/75" divider="bg-white/25"
          chip="border border-white/40 text-white" button="bg-white text-academy-primary"
          image="/cards/presentiel.jpg"
          overlay="bg-gradient-to-r from-[#5e0f0f]/85 via-[#5e0f0f]/25 to-transparent"
          title={inPerson.title || 'Formation en présentiel'}
          facts={[['Lieu', 'Camden', MapPin], ['Prix', inPerson.price ? money(inPerson.price) : '—', Coins]]}
          next={session ? `${range3(session.date)}${session.startTime ? (Number(session.startTime.slice(0, 2)) < 12 ? ' · matin' : ' · soir') : ''}` : inPerson.datesNotice ? 'dates bientôt annoncées' : null}
          to="/coaching-presentiel" cta="Voir les dates" />
  )
  if (express?.enabled) cards.push(
    <Card key="1j" ModeIcon={Users} mode="Présentiel" aside="chaque samedi" badge="Nouveau"
          surface="bg-gradient-to-br from-[#0d1842] via-[#1e3a8a] to-[#2f6fe4]" ink="text-white" soft="text-white/70" divider="bg-white/25"
          chip="border border-white/40 text-white" button="bg-white text-[#13245c]"
          image="/cards/express.jpg"
          overlay="bg-gradient-to-r from-[#0d1842]/95 via-[#0d1842]/40 to-transparent"
          title="Montage vidéo en 1 jour"
          facts={[['Horaires', `${hourShort(express.startTime)}–${hourShort(express.endTime)}`, Clock], ['Lieu', 'Viga Center', MapPin], ['Prix', money(express.price), Coins]]}
          next={saturday ? short(saturday, { weekday: 'long', day: 'numeric', month: 'long' }) : null}
          to="/formation-1-jour" cta="Réserver mon samedi" />
  )
  if (!cards.length) return null

  return (
    <section className="section-container py-8 lg:py-12">
      <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-academy-textMain">Choisissez votre façon d'apprendre</h2>
      <div className="mt-4 space-y-2.5 sm:space-y-3">{cards}</div>
    </section>
  )
}
