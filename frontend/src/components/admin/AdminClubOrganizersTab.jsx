import { useCallback, useEffect, useState } from 'react'
import { KeyRound, Plus, ShieldCheck, Trash2, UserPlus, X } from 'lucide-react'
import api from '../../api/axios'
import { useToast } from '../../hooks/useToast.jsx'

// Comptes des organisateurs du club scientifique de l'université. Leur accès
// se limite à /club/admin : inscriptions, événements et pointage du club.
// Rien de l'académie — ni élèves, ni paiements, ni réglages.

// Un mot de passe proposé ici évite les « dounia2024 » tapés à la hâte.
const suggest = () => {
  const alphabet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const values = crypto.getRandomValues(new Uint32Array(16))
  return Array.from(values, n => alphabet[n % alphabet.length]).join('')
}

const since = (iso) => (iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : null)

export default function AdminClubOrganizersTab() {
  const { success: toastSuccess, error: toastError } = useToast()
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)
  const [resetFor, setResetFor] = useState(null)
  const [secret, setSecret] = useState('')
  const [busy, setBusy] = useState(false)
  // Le mot de passe ne se relit jamais : on le montre une fois, ici.
  const [issued, setIssued] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/club-organizers')
      setOrganizers(data.organizers || [])
    } catch {
      toastError('Chargement des organisateurs impossible.')
    } finally {
      setLoading(false)
    }
  }, [toastError])

  useEffect(() => { load() }, [load])

  const create = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { data } = await api.post('/admin/club-organizers', form)
      setIssued({ name: data.organizer.name, login: data.organizer.login, password: form.password })
      setForm(null)
      load()
    } catch (err) {
      toastError(err.response?.data?.error || 'Création impossible.')
    } finally {
      setBusy(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await api.put(`/admin/club-organizers/${resetFor.id}`, { password: secret })
      setIssued({ name: resetFor.name, login: resetFor.login, password: secret })
      setResetFor(null)
      setSecret('')
    } catch (err) {
      toastError(err.response?.data?.error || 'Changement impossible.')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (o) => {
    try {
      const { data } = await api.put(`/admin/club-organizers/${o.id}`, { active: !o.active })
      setOrganizers(list => list.map(x => (x.id === o.id ? data.organizer : x)))
      toastSuccess(data.organizer.active ? `${o.name} a de nouveau accès.` : `Accès retiré à ${o.name}.`)
    } catch (err) {
      toastError(err.response?.data?.error || 'Modification impossible.')
    }
  }

  const remove = async (o) => {
    if (!window.confirm(`Supprimer définitivement le compte de ${o.name} ?`)) return
    try {
      await api.delete(`/admin/club-organizers/${o.id}`)
      load()
    } catch (err) {
      toastError(err.response?.data?.error || 'Suppression impossible.')
    }
  }

  const input = 'w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none text-sm'
  const label = 'text-xs font-bold text-neutral-400 mb-1.5 block'

  return (
    <div className="space-y-5">
      <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display font-bold text-xl text-white flex items-center gap-3">
              <ShieldCheck className="text-sky-400" size={22} /> Organisateurs du club université
            </h3>
            <p className="mt-1 text-sm text-neutral-400">
              Leur compte ouvre <span className="font-mono text-neutral-300">/club/admin</span> : inscriptions aux trois
              formations, événements et pointage à l&apos;entrée. Rien du reste du site.
            </p>
          </div>
          <button type="button" onClick={() => { setForm({ name: '', login: '', password: suggest() }); setIssued(null) }}
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 rounded-xl font-bold text-sm transition-colors">
            <UserPlus size={16} /> Nouveau
          </button>
        </div>

        {issued && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
            <p className="font-bold text-white">Accès de {issued.name}</p>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex gap-2"><dt className="text-neutral-400 w-28">Adresse</dt><dd className="font-mono text-neutral-200">/club/admin</dd></div>
              <div className="flex gap-2"><dt className="text-neutral-400 w-28">Identifiant</dt><dd className="font-mono text-neutral-200">{issued.login}</dd></div>
              <div className="flex gap-2"><dt className="text-neutral-400 w-28">Mot de passe</dt><dd className="font-mono text-white select-all">{issued.password}</dd></div>
            </dl>
            <p className="mt-2.5 text-[13px] text-emerald-200/80">
              Notez-le maintenant : il ne se relit nulle part ensuite. Transmettez-le de vive voix ou par un message
              qu&apos;elle seule lit, jamais dans un groupe.
            </p>
            <button type="button" onClick={() => setIssued(null)}
                    className="mt-3 rounded-lg border border-white/20 px-3 py-1.5 text-[13px] font-bold">J&apos;ai noté</button>
          </div>
        )}

        {form && (
          <form onSubmit={create} className="rounded-xl border-2 border-sky-500/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-bold text-white">Nouvel organisateur</p>
              <button type="button" onClick={() => setForm(null)} aria-label="Fermer" className="rounded-lg p-1.5 hover:bg-white/5"><X size={16} /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={label}>Nom affiché</label>
                <input className={input} required minLength={3} maxLength={60} value={form.name}
                       onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Sadeli Dounia" />
              </div>
              <div>
                <label className={label}>Identifiant de connexion</label>
                <input className={input} required pattern="[a-zA-Z0-9._\-]{3,30}" value={form.login}
                       onChange={e => setForm(f => ({ ...f, login: e.target.value.toLowerCase() }))} placeholder="dounia" />
              </div>
            </div>
            <div>
              <label className={label}>Mot de passe (12 caractères minimum)</label>
              <div className="flex gap-2">
                <input className={`${input} font-mono`} required minLength={12} value={form.password}
                       onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setForm(f => ({ ...f, password: suggest() }))}
                        className="shrink-0 rounded-xl border border-white/10 px-3 text-[13px] font-bold">Autre</button>
              </div>
            </div>
            <button type="submit" disabled={busy}
                    className="w-full rounded-xl bg-sky-600 hover:bg-sky-500 py-3 font-bold text-sm transition-colors disabled:opacity-60">
              {busy ? 'Création…' : 'Créer le compte'}
            </button>
          </form>
        )}

        {resetFor && (
          <form onSubmit={resetPassword} className="rounded-xl border-2 border-amber-500/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-bold text-white">Nouveau mot de passe pour {resetFor.name}</p>
              <button type="button" onClick={() => { setResetFor(null); setSecret('') }} aria-label="Fermer" className="rounded-lg p-1.5 hover:bg-white/5"><X size={16} /></button>
            </div>
            <div className="flex gap-2">
              <input className={`${input} font-mono`} required minLength={12} value={secret}
                     onChange={e => setSecret(e.target.value)} placeholder="12 caractères minimum" />
              <button type="button" onClick={() => setSecret(suggest())}
                      className="shrink-0 rounded-xl border border-white/10 px-3 text-[13px] font-bold">Proposer</button>
            </div>
            <button type="submit" disabled={busy}
                    className="w-full rounded-xl bg-amber-600 hover:bg-amber-500 py-3 font-bold text-sm transition-colors disabled:opacity-60">
              {busy ? 'Changement…' : 'Remplacer le mot de passe'}
            </button>
          </form>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-neutral-400">Chargement…</p>
      ) : organizers.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-neutral-400"><Plus size={16} /> Aucun organisateur pour l&apos;instant.</p>
      ) : (
        <div className="space-y-2">
          {organizers.map(o => (
            <div key={o.id} className={`rounded-xl border p-3 ${o.active ? 'border-white/5 bg-neutral-900/50' : 'border-white/5 bg-neutral-900/30 opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm truncate">
                    {o.name}
                    {!o.active && <span className="ml-2 rounded-full bg-red-500/15 text-red-300 px-2 py-0.5 text-[10px] font-black uppercase">Accès retiré</span>}
                  </p>
                  <p className="text-xs text-neutral-400 font-mono">{o.login}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {o.lastSeenAt ? `Dernière connexion le ${since(o.lastSeenAt)}` : 'Jamais connecté'}
                  </p>
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button type="button" onClick={() => { setResetFor(o); setSecret(suggest()); setIssued(null) }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[13px] font-bold"><KeyRound size={13} /> Mot de passe</button>
                <button type="button" onClick={() => toggle(o)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[13px] font-bold">
                  {o.active ? 'Retirer l’accès' : 'Redonner l’accès'}
                </button>
                <button type="button" onClick={() => remove(o)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 text-red-300 px-3 py-1.5 text-[13px] font-bold"><Trash2 size={13} /> Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
