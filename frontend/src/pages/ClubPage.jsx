import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { ArrowRight, CalendarClock, CalendarDays, Check, Download, GraduationCap, MapPin, QrCode, Users } from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'

// Formations gratuites données au club scientifique de l'université de Béjaïa
// (Targa Ouzemmour). Le visiteur choisit une formation, laisse son nom et son
// numéro : l'inscription est enregistrée aussitôt, sans compte ni paiement.

const KIND = { 'open-day': 'Open day', seminaire: 'Séminaire', conference: 'Conférence', atelier: 'Atelier', formation: 'Formation', autre: '' }

const longDate = (iso) => {
  if (!iso) return ''
  const d = new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  return d.charAt(0).toUpperCase() + d.slice(1)
}

export default function ClubPage() {
  const [trainings, setTrainings] = useState(null)
  const [groups, setGroups] = useState([])
  const [club, setClub] = useState('')
  const [picked, setPicked] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const [already, setAlready] = useState(false)
  const [qr, setQr] = useState('')
  const [events, setEvents] = useState([])

  useEffect(() => {
    api.get('/club/events')
      .then(({ data }) => setEvents(data.events || []))
      .catch(() => setEvents([]))
    api.get('/club/trainings')
      .then(({ data }) => setTrainings(data.trainings || []))
      .catch(() => setTrainings([]))
    api.get('/club/groups')
      .then(({ data }) => setGroups(data.groups || []))
      .catch(() => setGroups([]))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post('/club/register', { firstName, lastName, phone, training: picked, club, website })
      // Le QR code se dessine ici, dans le navigateur : rien à télécharger
      // depuis le serveur, et il s'affiche même avec une connexion lente.
      const image = data.qr ? await QRCode.toDataURL(data.qr, { width: 520, margin: 1, color: { dark: '#111214', light: '#ffffff' } }) : ''
      setQr(image)
      setAlready(Boolean(data.already))
      setDone(trainings.find(t => t.slug === picked)?.title || '')
    } catch (err) {
      setError(err.response?.data?.error || "L'inscription a échoué. Réessayez.")
    } finally {
      setBusy(false)
    }
  }

  // Après une inscription, on repart d'un formulaire vide : beaucoup
  // s'inscrivent aux trois formations à la suite.
  const again = () => {
    setDone('')
    setPicked('')
    setClub('')
    setQr('')
    setAlready(false)
    setError('')
  }

  const field = 'w-full rounded-xl border border-academy-border bg-white dark:bg-academy-surfaceDark px-4 py-3 text-[15px] outline-none focus:border-academy-primary transition-colors'

  return (
    <div className="min-h-screen bg-academy-surface">
      <SEOHead title="Formations gratuites — Club scientifique, Université de Béjaïa"
               description="Formations et événements gratuits du club scientifique de l'université de Béjaïa (Targa Ouzemmour). Inscription en une minute." />
      <Navbar />

      <main className="section-container pt-28 pb-16 max-w-3xl mx-auto">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-academy-primary">Club scientifique · Université de Béjaïa</p>
        <h1 className="mt-2 font-display font-black text-3xl sm:text-4xl leading-[1.1] tracking-tight">Formations gratuites, à Targa Ouzemmour</h1>
        <p className="mt-3 text-[15px] text-academy-textMain/70 leading-relaxed">
          En partenariat avec le club scientifique de l'université de Béjaïa, j'anime des
          formations ouvertes aux étudiants. L'entrée est libre et l'inscription gratuite :
          il suffit de laisser votre nom et votre numéro pour réserver votre place.
        </p>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold text-academy-textMain/70">
          <span className="flex items-center gap-1.5"><MapPin size={15} className="text-academy-primary" /> Université de Béjaïa — Targa Ouzemmour</span>
          <span className="flex items-center gap-1.5"><GraduationCap size={15} className="text-academy-primary" /> Gratuit, ouvert aux étudiants</span>
        </div>

        {done ? (
          <div className="mt-8 rounded-2xl border-2 border-green-600/30 bg-green-50 p-5 sm:p-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white"><Check size={26} /></span>
            <h2 className="mt-3 font-display font-black text-xl">{already ? 'Vous êtes déjà inscrit' : 'Inscription enregistrée'}</h2>
            <p className="mt-1.5 text-[15px] text-academy-textMain/70">
              Votre place à « {done} » est réservée. On vous prévient par téléphone dès que la date est fixée.
            </p>

            {/* Le billet d'entrée : l'organisateur le scanne à la porte.
                Une capture d'écran suffit, le réseau n'est pas garanti sur place. */}
            {qr && (
              <div className="mt-5 rounded-2xl bg-white border border-academy-border p-5">
                <p className="flex items-center justify-center gap-1.5 text-[12px] font-black uppercase tracking-[0.12em] text-academy-primary">
                  <QrCode size={14} /> Votre billet d'entrée
                </p>
                <img src={qr} alt="QR code d'entrée" className="mx-auto mt-3 w-44 sm:w-52 h-auto" />
                <p className="mt-3 text-[13px] text-academy-textMain/65 leading-snug">
                  Gardez-le : <strong className="font-bold text-academy-textMain">faites une capture d'écran</strong> ou enregistrez l'image.
                  Il sera scanné à l'entrée de la formation.
                </p>
                <a href={qr} download={`billet-${done.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`}
                   className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-academy-border px-4 py-2 text-[13px] font-bold hover:border-academy-textMain/40 transition-colors">
                  <Download size={14} /> Enregistrer l'image
                </a>
              </div>
            )}

            <button type="button" onClick={again}
                    className="mt-4 rounded-xl bg-academy-textMain text-academy-surface px-5 py-2.5 text-sm font-bold">
              M'inscrire à une autre formation
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8">
            <h2 className="font-display font-black text-xl">1. Choisissez votre formation</h2>
            <div className="mt-3 grid gap-2.5">
              {trainings === null && <p className="text-sm text-academy-textMain/60">Chargement…</p>}
              {trainings?.map(t => (
                <button type="button" key={t.slug} onClick={() => setPicked(t.slug)}
                        className={`w-full text-left rounded-xl border-2 p-4 transition-colors ${picked === t.slug ? 'border-academy-primary bg-academy-primary/5' : 'border-academy-border bg-white dark:bg-academy-surfaceDark'}`}>
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block font-display font-black text-[17px] leading-tight">{t.title}</span>
                      <span className="block mt-1 text-[13px] text-academy-textMain/65 leading-snug">{t.text}</span>
                    </span>
                    <span className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 ${picked === t.slug ? 'border-academy-primary bg-academy-primary' : 'border-academy-border'}`} />
                  </span>
                  <span className="mt-2 flex items-center gap-1.5 text-[12px] font-bold text-academy-textMain/55">
                    <CalendarClock size={13} /> {t.date || 'Date bientôt annoncée'}
                  </span>
                </button>
              ))}
            </div>

            <h2 className="mt-7 font-display font-black text-xl">2. Vos coordonnées</h2>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              <input className={field} placeholder="Prénom" value={firstName} onChange={e => setFirstName(e.target.value)} required minLength={2} maxLength={40} />
              <input className={field} placeholder="Nom" value={lastName} onChange={e => setLastName(e.target.value)} required minLength={2} maxLength={40} />
            </div>
            <input className={`${field} mt-2.5`} type="tel" inputMode="tel" placeholder="Numéro de téléphone — ex. 06 12 34 56 78"
                   value={phone} onChange={e => setPhone(e.target.value)} required />

            {/* Les clubs sont créés par les organisateurs : la question
                n'apparaît que s'il y en a au moins un à proposer. */}
            {groups.length > 0 && (
              <>
                <h2 className="mt-7 font-display font-black text-xl">3. Votre club</h2>
                <div className="mt-3 grid gap-2 grid-cols-2 sm:grid-cols-3">
                  {groups.map(g => (
                    <button type="button" key={g.id} onClick={() => setClub(g.name)}
                            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition-colors ${club === g.name ? 'border-academy-primary bg-academy-primary/5' : 'border-academy-border bg-white dark:bg-academy-surfaceDark'}`}>
                      {g.logo
                        ? <img src={g.logo} alt="" className="h-12 w-12 rounded-lg object-cover" loading="lazy" />
                        : <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-academy-textMain/[0.06] text-[15px] font-black text-academy-textMain/50">{g.name.slice(0, 2).toUpperCase()}</span>}
                      <span className="text-[13px] font-bold leading-tight">{g.name}</span>
                    </button>
                  ))}
                  <button type="button" onClick={() => setClub('Aucun')}
                          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 text-center transition-colors ${club === 'Aucun' ? 'border-academy-primary bg-academy-primary/5' : 'border-academy-border bg-white dark:bg-academy-surfaceDark'}`}>
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-academy-textMain/[0.06] text-academy-textMain/40"><Users size={20} /></span>
                    <span className="text-[13px] font-bold leading-tight">Aucun club</span>
                  </button>
                </div>
              </>
            )}

            {/* Piège à robots : invisible pour un humain, rempli par les scripts. */}
            <input type="text" value={website} onChange={e => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off"
                   className="absolute left-[-9999px] h-0 w-0 opacity-0" aria-hidden="true" />

            {error && <p className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[14px] font-semibold text-red-700">{error}</p>}

            <button type="submit" disabled={busy || !picked}
                    className="mt-5 w-full rounded-xl bg-academy-primary text-white py-3.5 text-[15px] font-black disabled:opacity-50 disabled:cursor-not-allowed">
              {busy ? 'Inscription…' : picked ? 'Je réserve ma place' : 'Choisissez une formation'}
            </button>
            <p className="mt-2.5 text-center text-[12px] text-academy-textMain/50">
              Gratuit, sans paiement ni création de compte. Votre numéro sert uniquement à vous prévenir de la date.
            </p>
          </form>
        )}

        {/* Ce que le club organise en plus des trois formations : open days,
            ateliers, rencontres. Rien ne s'affiche tant qu'il n'y a rien. */}
        {events.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display font-black text-2xl tracking-tight">Prochains événements</h2>
            <div className="mt-4 space-y-3">
              {events.map(ev => (
                <Link key={ev.slug} to={`/club/evenement/${ev.slug}`}
                      className="group flex gap-4 rounded-2xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-4 hover:border-academy-primary/50 transition-colors">
                  {ev.poster && (
                    <img src={ev.poster} alt="" loading="lazy" aria-hidden="true"
                         className="hidden sm:block w-28 h-20 shrink-0 rounded-xl object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-bold text-academy-textMain/60">
                      {KIND[ev.kind] && <span className="text-academy-primary">{KIND[ev.kind]}</span>}
                      <span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-academy-primary" /> {longDate(ev.date)}</span>
                      {ev.startTime && <span>{ev.startTime.replace(':', 'h')}</span>}
                      {ev.place && <span className="truncate">{ev.place}</span>}
                    </p>
                    <p className="mt-1 font-display font-black text-lg leading-tight">{ev.title}</p>
                    {ev.summary && <p className="mt-0.5 text-[13px] text-academy-textMain/60 leading-snug line-clamp-2">{ev.summary}</p>}
                    <span className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-bold text-academy-primary">
                      {ev.seatsLeft === 0 ? 'Complet' : 'Voir et réserver'} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Qui anime : un visage et un parcours valent mieux qu'un nom seul,
            pour des étudiants qui s'inscrivent à une formation gratuite. */}
        <section className="mt-12 rounded-2xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <img src="/aimad-bouzidi.webp" alt="Aimad Bouzidi" width="160" height="160" loading="lazy"
                 className="w-28 h-28 sm:w-40 sm:h-40 shrink-0 rounded-2xl object-cover object-top mx-auto sm:mx-0" />
            <div className="min-w-0 text-center sm:text-left">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-academy-primary">Votre formateur</p>
              <h2 className="mt-1 font-display font-black text-2xl leading-tight">Aimad Bouzidi</h2>
              <p className="mt-1 text-[14px] font-semibold text-academy-textMain/75">
                Filmmaker · Fondateur de Mylta Academy et Mylta Creative · Créateur de contenu sur l'intelligence artificielle
              </p>
              <p className="mt-3 text-[14px] text-academy-textMain/65 leading-relaxed">
                Je forme depuis Béjaïa à la vidéo au smartphone, à l'IA et au web. Plus de 170 personnes
                sont déjà passées par mes formations, en ligne et en présentiel, et Mylta Academy est
                partenaire du Camden International Institute. Ces trois séances au club scientifique
                reprennent, gratuitement, ce que j'enseigne le reste de l'année.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
