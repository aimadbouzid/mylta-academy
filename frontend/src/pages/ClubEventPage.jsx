import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { ArrowLeft, CalendarDays, Check, Clock, Download, MapPin, QrCode, Users } from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'

// Un événement du club : open day, atelier, rencontre. Affiche, déroulé de la
// journée, et inscription qui rend un billet à scanner à l'entrée — le même
// mécanisme que les trois formations.

const longDate = (iso) => {
  if (!iso) return ''
  const d = new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  return d.charAt(0).toUpperCase() + d.slice(1)
}
const hour = (t) => (t || '').replace(':', 'h')

export default function ClubEventPage() {
  const { slug } = useParams()
  const [event, setEvent] = useState(null)
  const [missing, setMissing] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [club, setClub] = useState('')
  const [groups, setGroups] = useState([])
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [already, setAlready] = useState(false)
  const [qr, setQr] = useState('')

  useEffect(() => {
    api.get(`/club/events/${slug}`)
      .then(({ data }) => setEvent(data.event))
      .catch(() => setMissing(true))
    api.get('/club/groups').then(({ data }) => setGroups(data.groups || [])).catch(() => {})
  }, [slug])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post(`/club/events/${slug}/register`, { firstName, lastName, phone, club, website })
      // Le QR se dessine dans le navigateur : rien à charger depuis le serveur.
      setQr(data.qr ? await QRCode.toDataURL(data.qr, { width: 520, margin: 1, color: { dark: '#111214', light: '#ffffff' } }) : '')
      setAlready(Boolean(data.already))
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.error || "L'inscription a échoué. Réessayez.")
    } finally {
      setBusy(false)
    }
  }

  const input = 'w-full rounded-xl border border-academy-border bg-white dark:bg-academy-surfaceDark px-3.5 py-3 text-[15px] outline-none focus:border-academy-primary'

  if (missing) {
    return (
      <div className="min-h-screen bg-academy-surface text-academy-textMain">
        <Navbar />
        <main className="section-container pt-28 pb-20 text-center">
          <p className="font-display font-black text-2xl">Événement introuvable</p>
          <p className="mt-2 text-academy-textMain/60">Il a peut-être été retiré ou n'est pas encore publié.</p>
          <Link to="/club" className="mt-5 inline-flex items-center gap-1.5 font-bold text-academy-primary">
            <ArrowLeft size={16} /> Revenir au club
          </Link>
        </main>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-academy-surface text-academy-textMain">
        <Navbar />
        <main className="section-container pt-28 pb-20"><p className="text-academy-textMain/60">Chargement…</p></main>
      </div>
    )
  }

  const full = event.seatsLeft === 0

  return (
    <div className="min-h-screen bg-academy-surface text-academy-textMain">
      <SEOHead title={`${event.title} | Club scientifique — Mylta Academy`} description={event.summary} />
      <Navbar />

      <main className="section-container pt-24 sm:pt-28 pb-20 max-w-3xl">
        <Link to="/club" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-academy-textMain/60 hover:text-academy-primary">
          <ArrowLeft size={15} /> Club scientifique
        </Link>

        {event.poster && (
          <img src={event.poster} alt={event.title} loading="lazy"
               className="mt-4 w-full rounded-2xl border border-academy-border object-cover max-h-80" />
        )}

        <h1 className="mt-5 font-display font-black text-3xl sm:text-4xl leading-[1.1] tracking-tight">{event.title}</h1>
        {event.summary && <p className="mt-2 text-[15px] text-academy-textMain/70 leading-snug">{event.summary}</p>}

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-semibold text-academy-textMain/75">
          <span className="flex items-center gap-1.5"><CalendarDays size={16} className="text-academy-primary" /> {longDate(event.date)}</span>
          {event.startTime && (
            <span className="flex items-center gap-1.5">
              <Clock size={16} className="text-academy-primary" />
              {hour(event.startTime)}{event.endTime ? ` – ${hour(event.endTime)}` : ''}
            </span>
          )}
          {event.place && <span className="flex items-center gap-1.5"><MapPin size={16} className="text-academy-primary" /> {event.place}</span>}
          {event.seatsLeft !== null && (
            <span className="flex items-center gap-1.5">
              <Users size={16} className="text-academy-primary" />
              {full ? 'Complet' : `${event.seatsLeft} place${event.seatsLeft > 1 ? 's' : ''} restante${event.seatsLeft > 1 ? 's' : ''}`}
            </span>
          )}
        </div>

        {event.programme.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display font-black text-xl">Au programme</h2>
            <ol className="mt-3 space-y-2">
              {event.programme.map((item, i) => (
                <li key={i} className="flex gap-3 rounded-xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-3">
                  <span className="shrink-0 font-black text-[13px] text-academy-primary w-14">{hour(item.time) || '—'}</span>
                  <span className="text-[14px] leading-snug">{item.label}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {done ? (
          <div className="mt-8 rounded-2xl border-2 border-green-600/30 bg-green-50 p-5 sm:p-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white"><Check size={26} /></span>
            <h2 className="mt-3 font-display font-black text-xl">{already ? 'Vous êtes déjà inscrit' : 'Inscription enregistrée'}</h2>
            <p className="mt-1.5 text-[15px] text-academy-textMain/70">Votre place à « {event.title} » est réservée.</p>

            {qr && (
              <div className="mt-5 rounded-2xl bg-white border border-academy-border p-5">
                <p className="flex items-center justify-center gap-1.5 text-[12px] font-black uppercase tracking-[0.12em] text-academy-primary">
                  <QrCode size={14} /> Votre billet d'entrée
                </p>
                <img src={qr} alt="QR code d'entrée" className="mx-auto mt-3 w-44 sm:w-52 h-auto" />
                <p className="mt-3 text-[13px] text-academy-textMain/65 leading-snug">
                  Gardez-le : <strong className="font-bold text-academy-textMain">faites une capture d'écran</strong> ou enregistrez l'image.
                  Il sera scanné à l'entrée.
                </p>
                <a href={qr} download={`billet-${event.slug}.png`}
                   className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-academy-border px-4 py-2 text-[13px] font-bold hover:border-academy-textMain/40 transition-colors">
                  <Download size={14} /> Enregistrer l'image
                </a>
              </div>
            )}
          </div>
        ) : full ? (
          <p className="mt-8 rounded-2xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-5 text-center font-bold">
            Toutes les places sont prises pour cet événement.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-8 rounded-2xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-5 sm:p-6">
            <h2 className="font-display font-black text-xl">Réserver ma place</h2>
            <p className="mt-1 text-[13px] text-academy-textMain/60">Gratuit, sans compte ni paiement.</p>

            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website}
                   onChange={e => setWebsite(e.target.value)} className="absolute -left-[9999px] w-px h-px opacity-0" />

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <input className={input} required minLength={2} maxLength={40} placeholder="Prénom" value={firstName} onChange={e => setFirstName(e.target.value)} />
              <input className={input} required minLength={2} maxLength={40} placeholder="Nom" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
            <input className={`${input} mt-2.5`} required type="tel" placeholder="Numéro de téléphone" value={phone} onChange={e => setPhone(e.target.value)} />

            {groups.length > 0 && (
              <select className={`${input} mt-2.5`} value={club} onChange={e => setClub(e.target.value)}>
                <option value="">Votre club (facultatif)</option>
                {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            )}

            {error && <p className="mt-3 text-sm font-bold text-red-600">{error}</p>}

            <button type="submit" disabled={busy}
                    className="mt-5 w-full rounded-xl bg-academy-primary text-white py-3.5 text-[15px] font-black disabled:opacity-50">
              {busy ? 'Inscription…' : 'Je réserve ma place'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
