import { useState, useEffect } from 'react'
import { MessageSquare, EyeOff, Eye, Trash2 } from 'lucide-react'
import api from '../../api/axios'
import { useToast } from '../../hooks/useToast.jsx'

// Avis laissés par les visiteurs : publiés directement, à masquer ou supprimer ici.
export default function AdminReviewsPanel() {
  const { error: toastError } = useToast()
  const [reviews, setReviews] = useState(null)

  useEffect(() => {
    api.get('/admin/reviews').then(({ data }) => setReviews(data.reviews)).catch(() => toastError('Erreur de chargement des avis.'))
  }, [toastError])

  const setStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/admin/reviews/${id}`, { status })
      setReviews(rs => rs.map(r => r.id === id ? data.review : r))
    } catch { toastError('Erreur.') }
  }
  const remove = async (id) => {
    if (!window.confirm('Supprimer cet avis ?')) return
    try {
      await api.delete(`/admin/reviews/${id}`)
      setReviews(rs => rs.filter(r => r.id !== id))
    } catch { toastError('Erreur.') }
  }

  return (
    <div className="mt-6 bg-neutral-900/50 border border-white/5 rounded-2xl p-5 sm:p-6">
      <h3 className="font-bold text-white flex items-center gap-2 mb-1"><MessageSquare size={18} className="text-red-400" /> Avis des visiteurs</h3>
      <p className="text-xs text-neutral-400 mb-4">Publiés tout de suite sur l'accueil. Masquez ou supprimez ceux qui ne conviennent pas.</p>
      {reviews === null ? (
        <p className="text-sm text-neutral-400">Chargement…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-neutral-400">Aucun avis pour l'instant.</p>
      ) : (
        <ul className="space-y-2">
          {reviews.map(r => (
            <li key={r.id} className={`rounded-xl border border-white/10 p-3 ${r.status === 'HIDDEN' ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">{r.fullName}{r.role ? <span className="font-normal text-neutral-400"> · {r.role}</span> : null}</p>
                  <p className="text-sm text-neutral-300 mt-1 break-words">{r.text}</p>
                  <p className="text-[11px] text-neutral-500 mt-1">{new Date(r.createdAt).toLocaleString('fr-FR')}{r.status === 'HIDDEN' ? ' · masqué' : ''}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button type="button" title={r.status === 'HIDDEN' ? 'Publier' : 'Masquer'} onClick={() => setStatus(r.id, r.status === 'HIDDEN' ? 'PUBLISHED' : 'HIDDEN')}
                          className="p-2 rounded-lg text-neutral-300 hover:bg-white/10">{r.status === 'HIDDEN' ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                  <button type="button" title="Supprimer" onClick={() => remove(r.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><Trash2 size={16} /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
