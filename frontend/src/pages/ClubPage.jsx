import { useEffect, useState } from 'react'
import { CalendarClock, Check, GraduationCap, MapPin } from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'

// Formations gratuites données au club scientifique de l'université de Béjaïa
// (Targa Ouzemmour). Le visiteur choisit une formation, laisse son nom et son
// numéro : l'inscription est enregistrée aussitôt, sans compte ni paiement.

export default function ClubPage() {
  const [trainings, setTrainings] = useState(null)
  const [picked, setPicked] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')

  useEffect(() => {
    api.get('/club/trainings')
      .then(({ data }) => setTrainings(data.trainings || []))
      .catch(() => setTrainings([]))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.post('/club/register', { firstName, lastName, phone, training: picked, website })
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
    setError('')
  }

  const field = 'w-full rounded-xl border border-academy-border bg-white dark:bg-academy-surfaceDark px-4 py-3 text-[15px] outline-none focus:border-academy-primary transition-colors'

  return (
    <div className="min-h-screen bg-academy-surface">
      <SEOHead title="Formations gratuites — Club scientifique, Université de Béjaïa"
               description="Trois formations gratuites au club scientifique de l'université de Béjaïa (Targa Ouzemmour) : Vibe Coding, Partenariat & clients, Filmer & monter au smartphone. Inscription en une minute." />
      <Navbar />

      <main className="section-container pt-28 pb-16 max-w-3xl mx-auto">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-academy-primary">Club scientifique · Université de Béjaïa</p>
        <h1 className="mt-2 font-display font-black text-3xl sm:text-4xl leading-[1.1] tracking-tight">Trois formations gratuites, à Targa Ouzemmour</h1>
        <p className="mt-3 text-[15px] text-academy-textMain/70 leading-relaxed">
          En partenariat avec le club scientifique de l'université de Béjaïa, j'anime trois
          formations ouvertes aux étudiants. L'entrée est libre et l'inscription gratuite :
          il suffit de laisser votre nom et votre numéro pour réserver votre place.
        </p>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold text-academy-textMain/70">
          <span className="flex items-center gap-1.5"><MapPin size={15} className="text-academy-primary" /> Université de Béjaïa — Targa Ouzemmour</span>
          <span className="flex items-center gap-1.5"><GraduationCap size={15} className="text-academy-primary" /> Gratuit, ouvert aux étudiants</span>
        </div>

        {done ? (
          <div className="mt-8 rounded-2xl border-2 border-green-600/30 bg-green-50 p-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white"><Check size={26} /></span>
            <h2 className="mt-3 font-display font-black text-xl">Inscription enregistrée</h2>
            <p className="mt-1.5 text-[15px] text-academy-textMain/70">
              Votre place à « {done} » est réservée. On vous prévient par téléphone dès que la date est fixée.
            </p>
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
      </main>
    </div>
  )
}
