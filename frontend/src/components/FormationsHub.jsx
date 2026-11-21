import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, CalendarDays, MapPin, Coins, Monitor, Users } from 'lucide-react'
import api from '../api/axios'
import { getSessions } from '../api/sessions'

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
                surface, ink, soft, chip, button, divider, image, badge, overlay, spine, tray }) {
  return (
    <Link to={to} className={`group relative block overflow-hidden rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-300 ${surface}`}>
      {/* La photo tient la moitié droite du bandeau ; le dégradé la recouvre
          côté texte pour garder le titre lisible. */}
      {image && (
        <span aria-hidden="true" className="absolute inset-y-0 right-0 w-full sm:w-3/5 bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }} />
      )}
      <span aria-hidden="true" className={`absolute inset-0 ${overlay}`} />
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${spine}`} />

      {/* Sur grand écran le bandeau se lit en deux temps : qui et quoi à
          gauche, les chiffres et l'action à droite. Tout tassé à gauche, la
          moitié droite restait vide. */}
      <div className="relative pl-5 pr-4 py-4 sm:pl-6 sm:pr-5 sm:py-5 sm:max-w-[60%] lg:max-w-none lg:flex lg:items-center lg:justify-between lg:gap-10 lg:pl-8 lg:pr-7 lg:py-7">
        <div className="lg:min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${chip}`}>
              <ModeIcon size={13} /> {mode}
            </span>
            {aside && <span className={`text-[11px] font-black uppercase tracking-[0.14em] ${soft}`}>{aside}</span>}
            {/* Sur téléphone, ce badge passait à la ligne et rallongeait la carte. */}
            {badge && <span className={`hidden sm:inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] ${chip}`}>{badge}</span>}
          </p>

          <h3 className={`mt-2 font-display font-black text-xl sm:text-2xl lg:text-[28px] leading-[1.08] tracking-tight ${ink}`}>{title}</h3>
          {text && <p className={`mt-1 text-[13px] leading-snug ${soft}`}>{text}</p>}
          {next && <p className={`mt-1.5 text-[13px] ${soft}`}>{nextLabel} : <span className={`font-semibold ${ink}`}>{next}</span></p>}
        </div>

        <div className="lg:flex lg:shrink-0 lg:items-center lg:gap-6">
          <dl className={`mt-3 lg:mt-0 inline-flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl px-3.5 py-2.5 ${tray}`}>
            {facts.map(([label, value, Icon], i) => (
              <span key={label} className="inline-flex items-center gap-3">
                {i > 0 && <span aria-hidden="true" className={`h-4 w-px ${divider}`} />}
                <span className="inline-flex items-center gap-1.5">
                  <Icon size={15} className={soft} aria-hidden="true" />
                  <dt className="sr-only">{label}</dt>
                  <dd className={`font-bold text-sm lg:text-[15px] ${ink}`}>{value}</dd>
                </span>
              </span>
            ))}
          </dl>

          <span className={`mt-3 lg:mt-0 inline-flex shrink-0 items-center justify-center gap-2 btn-glow rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition-opacity group-hover:opacity-90 ${button}`}>
            {cta} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function FormationsHub({ coaching, inPerson, express }) {
  const [session, setSession] = useState(null)
  const [saturday, setSaturday] = useState(null)

  useEffect(() => {
    if (!inPerson?.enabled) return
    getSessions()
      .then(list => setSession(list.find(s => s.seatsLeft > 0) || null))
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
          surface="bg-white dark:bg-academy-surfaceDark border-2 border-academy-textMain/15 hover:border-academy-textMain/40"
          ink="text-academy-textMain" soft="text-academy-textMain/60" divider="bg-academy-textMain/15"
          chip="bg-academy-textMain text-academy-surface" button="bg-academy-textMain text-academy-surface"
          spine="bg-academy-textMain" tray="bg-academy-textMain/[0.04]"
          image="/cards/coaching.jpg"
          overlay="bg-gradient-to-r from-white via-white/85 to-transparent dark:from-academy-surfaceDark dark:via-academy-surfaceDark/85"
          title={coaching.title || 'Coaching en ligne'}
          facts={[['Durée', coaching.formats?.[0]?.duration || '2h30', Clock], ['Quand', '7 j / 7', CalendarDays]]}
          to="/coaching" cta="Choisir mon pack" />
  )
  if (inPerson?.enabled) cards.push(
    <Card key="3j" ModeIcon={Users} mode="Présentiel" aside="3 jours"
          surface="bg-white dark:bg-academy-surfaceDark border-2 border-academy-primary/30 hover:border-academy-primary"
          ink="text-academy-textMain" soft="text-academy-textMain/60" divider="bg-academy-textMain/15"
          chip="bg-academy-primary text-white" button="bg-academy-primary text-white"
          spine="bg-academy-primary" tray="bg-academy-primary/[0.06]"
          image="/cards/presentiel.jpg"
          overlay="bg-gradient-to-r from-white via-white/85 to-transparent dark:from-academy-surfaceDark dark:via-academy-surfaceDark/85"
          title={inPerson.title || 'Formation en présentiel'}
          facts={[['Lieu', 'Camden', MapPin], ['Prix', inPerson.price ? money(inPerson.price) : '—', Coins]]}
          next={session ? `${range3(session.date)}${session.startTime ? (Number(session.startTime.slice(0, 2)) < 12 ? ' · matin' : ' · soir') : ''}` : inPerson.datesNotice ? 'dates bientôt annoncées' : null}
          to="/coaching-presentiel" cta="Voir les dates" />
  )
  if (express?.enabled) cards.push(
    <Card key="1j" ModeIcon={Users} mode="Présentiel" aside="chaque samedi" badge="Nouveau"
          surface="bg-white dark:bg-academy-surfaceDark border-2 border-[#2f6fe4]/30 hover:border-[#2f6fe4]"
          ink="text-academy-textMain" soft="text-academy-textMain/60" divider="bg-academy-textMain/15"
          chip="bg-[#2f6fe4] text-white" button="bg-[#2f6fe4] text-white"
          spine="bg-[#2f6fe4]" tray="bg-[#2f6fe4]/[0.07]"
          image="/cards/express.jpg"
          overlay="bg-gradient-to-r from-white via-white/85 to-transparent dark:from-academy-surfaceDark dark:via-academy-surfaceDark/85"
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
