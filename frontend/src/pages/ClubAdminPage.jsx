import { useEffect, useState } from 'react'
import { Lock, RefreshCw, Users } from 'lucide-react'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'

// Espace des organisateurs du club scientifique : un mot de passe partagé,
// et rien d'autre que les inscrits aux trois formations. Volontairement séparé
// du tableau de bord de l'académie, que les organisateurs n'ont pas à voir.

const KEY = 'clubOrganizerToken'

const phoneFr = (p) => String(p).replace(/(\d{2})(?=\d)/g, '$1 ').trim()
const when = (iso) => new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function ClubAdminPage() {
  const [token, setToken] = useState(() => { try { return localStorage.getItem(KEY) || '' } catch { return '' } })
  const [password, setPassword] = useState('')
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async (t) => {
    setError('')
    try {
      const { data } = await api.get('/club/registrations', { headers: { Authorization: `Bearer ${t}` } })
      setData(data)
    } catch (err) {
      if (err.response?.status === 401) {
        setToken('')
        try { localStorage.removeItem(KEY) } catch { /* navigation privée */ }
      }
      setError(err.response?.data?.error || 'Chargement impossible.')
    }
  }

  useEffect(() => { if (token) load(token) }, [token])

  const signIn = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post('/club/access', { password })
      try { localStorage.setItem(KEY, data.token) } catch { /* navigation privée */ }
      setToken(data.token)
      setPassword('')
    } catch (err) {
      setError(err.response?.data?.error || 'Connexion impossible.')
    } finally {
      setBusy(false)
    }
  }

  const signOut = () => {
    try { localStorage.removeItem(KEY) } catch { /* navigation privée */ }
    setToken('')
    setData(null)
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-academy-surface flex items-center justify-center p-5">
        <SEOHead title="Espace organisateurs — Club scientifique" noindex />
        <form onSubmit={signIn} className="w-full max-w-sm rounded-2xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-academy-primary/10 text-academy-primary"><Lock size={22} /></span>
          <h1 className="mt-3 font-display font-black text-xl">Espace organisateurs</h1>
          <p className="mt-1 text-[13px] text-academy-textMain/60">Inscriptions aux formations du club scientifique.</p>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus
                 placeholder="Mot de passe"
                 className="mt-5 w-full rounded-xl border border-academy-border bg-academy-surface px-4 py-3 text-[15px] outline-none focus:border-academy-primary transition-colors" />
          {error && <p className="mt-3 text-[13px] font-semibold text-red-600">{error}</p>}
          <button type="submit" disabled={busy}
                  className="mt-4 w-full rounded-xl bg-academy-textMain text-academy-surface py-3 text-[15px] font-bold disabled:opacity-50">
            {busy ? 'Vérification…' : 'Entrer'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-academy-surface">
      <SEOHead title="Espace organisateurs — Club scientifique" noindex />
      <main className="section-container py-10 max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-black text-2xl tracking-tight">Inscriptions</h1>
            <p className="mt-1 text-[14px] text-academy-textMain/60">Club scientifique — Université de Béjaïa</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => load(token)} title="Actualiser"
                    className="rounded-xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-2.5"><RefreshCw size={16} /></button>
            <button type="button" onClick={signOut}
                    className="rounded-xl border border-academy-border bg-white dark:bg-academy-surfaceDark px-3.5 py-2.5 text-[13px] font-bold">Quitter</button>
          </div>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[14px] font-semibold text-red-700">{error}</p>}
        {!data ? <p className="mt-6 text-sm text-academy-textMain/60">Chargement…</p> : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {data.counts.map(c => (
                <div key={c.slug} className="rounded-2xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-5">
                  <p className="text-[12px] font-black uppercase tracking-[0.12em] text-academy-primary">{c.title}</p>
                  <p className="mt-1.5 font-display font-black text-4xl tabular-nums">{c.count}</p>
                  <p className="text-[13px] text-academy-textMain/55">{c.count > 1 ? 'inscrits' : 'inscrit'}</p>
                </div>
              ))}
            </div>

            <p className="mt-5 flex items-center gap-2 text-[14px] font-bold text-academy-textMain/70">
              <Users size={16} className="text-academy-primary" /> {data.total} inscription{data.total > 1 ? 's' : ''} au total
            </p>

            <div className="mt-3 overflow-x-auto rounded-2xl border border-academy-border bg-white dark:bg-academy-surfaceDark">
              <table className="w-full text-left text-[14px]">
                <thead className="border-b border-academy-border text-[12px] uppercase tracking-wide text-academy-textMain/50">
                  <tr>
                    <th className="px-4 py-3 font-bold">Nom</th>
                    <th className="px-4 py-3 font-bold">Téléphone</th>
                    <th className="px-4 py-3 font-bold">Formation</th>
                    <th className="px-4 py-3 font-bold">Inscrit le</th>
                  </tr>
                </thead>
                <tbody>
                  {data.registrations.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-academy-textMain/55">Aucune inscription pour l'instant.</td></tr>
                  )}
                  {data.registrations.map(r => (
                    <tr key={r.id} className="border-b border-academy-border/60 last:border-0">
                      <td className="px-4 py-3 font-semibold">{r.firstName} {r.lastName}</td>
                      <td className="px-4 py-3 tabular-nums"><a href={`tel:${r.phone}`} className="hover:text-academy-primary">{phoneFr(r.phone)}</a></td>
                      <td className="px-4 py-3">{data.counts.find(c => c.slug === r.training)?.title || r.training}</td>
                      <td className="px-4 py-3 text-academy-textMain/60">{when(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
