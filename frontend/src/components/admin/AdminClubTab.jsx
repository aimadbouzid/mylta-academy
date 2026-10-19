import { useState, useEffect, useCallback } from 'react'
import { Users, Search, Check, X } from 'lucide-react'
import api from '../../api/axios'
import { useToast } from '../../hooks/useToast.jsx'

// Le club remplace l'achat à l'unité : c'est l'appartenance au club qui ouvre
// les formations, et c'est ici qu'on décide qui en fait partie.
export default function AdminClubTab() {
  const { success: toastSuccess, error: toastError } = useToast()
  const [users, setUsers] = useState([])
  const [count, setCount] = useState(0)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const fetchUsers = useCallback(async (search = '') => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/club', { params: search ? { q: search } : {} })
      setUsers(data.users || [])
      setCount(data.membersCount || 0)
    } catch {
      toastError('Erreur lors du chargement des comptes.')
    } finally {
      setLoading(false)
    }
  }, [toastError])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const toggle = async (u) => {
    setBusyId(u.id)
    try {
      const { data } = await api.put(`/admin/club/${u.id}`, { isClubMember: !u.isClubMember })
      setUsers(list => list.map(x => (x.id === u.id ? { ...x, ...data.user } : x)))
      setCount(c => c + (data.user.isClubMember ? 1 : -1))
      toastSuccess(data.user.isClubMember ? `${u.name || u.email} est membre du club.` : `${u.name || u.email} n'est plus membre.`)
    } catch (err) {
      toastError(err.response?.data?.error || 'Modification impossible.')
    } finally {
      setBusyId(null)
    }
  }

  const input = 'w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none text-sm'

  return (
    <div className="space-y-5">
      <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-4 sm:p-6 space-y-4">
        <h3 className="font-display font-bold text-xl text-white flex items-center gap-3">
          <Users className="text-emerald-400" size={22} /> Membres du club
        </h3>
        <p className="text-sm text-neutral-400">
          Les formations ne se vendent plus à l&apos;unité : seuls les membres y ont accès. Les achats faits
          avant le passage au club restent valables pour leur cours.
        </p>
        <p className="text-sm font-bold text-white">{count} membre{count > 1 ? 's' : ''} sur {users.length} compte{users.length > 1 ? 's' : ''} affiché{users.length > 1 ? 's' : ''}</p>

        <form onSubmit={e => { e.preventDefault(); fetchUsers(q) }} className="flex gap-2">
          <input className={input} value={q} onChange={e => setQ(e.target.value)} placeholder="Chercher un nom ou un e-mail" />
          <button type="submit" className="shrink-0 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm flex items-center gap-2">
            <Search size={15} /> Chercher
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-400">Chargement…</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-neutral-400">Aucun compte ne correspond.</p>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className={`flex items-center gap-3 rounded-xl border p-3 ${u.isClubMember ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/5 bg-neutral-900/50'}`}>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white text-sm truncate">{u.name || '—'}</p>
                <p className="text-xs text-neutral-400 truncate">{u.email}</p>
                {u.isClubMember && u.clubSince && (
                  <p className="text-[11px] text-emerald-400 mt-0.5">
                    Membre depuis le {new Date(u.clubSince).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
              <button type="button" onClick={() => toggle(u)} disabled={busyId === u.id}
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${u.isClubMember ? 'bg-red-500/15 text-red-300 hover:bg-red-500/25' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}>
                {u.isClubMember ? <><X size={14} /> Retirer</> : <><Check size={14} /> Ajouter</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
