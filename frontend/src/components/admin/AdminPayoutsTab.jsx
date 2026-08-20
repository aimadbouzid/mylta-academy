import { useState, useEffect, useCallback } from 'react'
import { CreditCard, CheckCircle, XCircle, ShieldCheck, ExternalLink } from 'lucide-react'
import api from '../../api/axios'
import { useToast } from '../../hooks/useToast.jsx'

export default function AdminPayoutsTab() {
  const { success: toastSuccess, error: toastError } = useToast()

  const [payouts, setPayouts] = useState([])
  const [identities, setIdentities] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPayouts = useCallback(async () => {
    setLoading(true)
    try {
      const [payoutsRes, identitiesRes] = await Promise.all([
        api.get('/admin/payouts'),
        api.get('/admin/identities?status=PENDING'),
      ])
      setPayouts(payoutsRes.data.payouts || [])
      setIdentities(identitiesRes.data.instructors || [])
    } catch {
      toastError('Erreur lors du chargement des demandes de retrait.')
    } finally {
      setLoading(false)
    }
  }, [toastError])

  useEffect(() => {
    fetchPayouts()
  }, [fetchPayouts])

  const handleVerifyIdentity = async (id, name) => {
    if (!confirm(`Confirmer que le document correspond bien à « ${name} » ?\n\nCe formateur pourra ensuite demander des retraits.`)) return
    try {
      await api.put(`/admin/identities/${id}/verify`)
      toastSuccess('Identité vérifiée.')
      fetchPayouts()
    } catch (err) {
      toastError(err.response?.data?.error || 'Erreur.')
    }
  }

  const handleRejectIdentity = async (id) => {
    const reason = prompt('Motif du refus (communiqué au formateur) :')
    if (reason === null) return
    if (!reason.trim()) return toastError('Un motif est requis.')
    try {
      await api.put(`/admin/identities/${id}/reject`, { reason })
      toastSuccess('Identité refusée.')
      fetchPayouts()
    } catch (err) {
      toastError(err.response?.data?.error || 'Erreur.')
    }
  }

  const handleApprove = async (id) => {
    if (!confirm('Confirmer le transfert de fonds pour ce retrait ?')) return
    try {
      await api.put(`/admin/payouts/${id}/complete`)
      toastSuccess('Retrait marqué comme payé !')
      fetchPayouts()
    } catch (err) {
      toastError(err.response?.data?.error || 'Erreur.')
    }
  }

  const handleReject = async (id) => {
    const reason = prompt('Raison du rejet (le montant sera remboursé au formateur) :')
    if (reason === null) return // Annulé
    try {
      await api.put(`/admin/payouts/${id}/reject`, { reason })
      toastSuccess('Retrait rejeté et remboursé.')
      fetchPayouts()
    } catch (err) {
      toastError(err.response?.data?.error || 'Erreur.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white mb-2 flex items-center gap-3">
            <CreditCard className="text-emerald-400" /> Demandes de Retraits
          </h2>
          <p className="text-neutral-400 text-sm">Gérez les paiements des formateurs (CCP, BaridiMob).</p>
        </div>
      </div>

      {/* Identités à vérifier — préalable obligatoire aux retraits */}
      {identities.length > 0 && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-blue-500/20">
            <h3 className="font-bold text-white flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-blue-400" />
              Identités à vérifier
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">
                {identities.length}
              </span>
            </h3>
            <p className="text-neutral-400 text-xs mt-1.5">
              Vérifiez que le document correspond au nom déclaré avant d'autoriser les versements.
            </p>
          </div>
          <div className="divide-y divide-blue-500/10">
            {identities.map(i => (
              <div key={i.id} className="p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm">{i.identityFullName}</p>
                  <p className="text-neutral-400 text-xs mt-0.5">
                    {i.name || '—'} · {i.email}
                  </p>
                  <p className="text-neutral-500 text-[11px] mt-1">
                    Soumis le {i.identitySubmittedAt ? new Date(i.identitySubmittedAt).toLocaleString('fr-FR') : '—'}
                    {' · '}Solde : {(i.instructorBalance || 0).toLocaleString('fr-DZ')} DA
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {i.identityDocPath && (
                    <a href={`/${i.identityDocPath}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-500/50 text-blue-300 hover:bg-blue-500/10 flex items-center gap-1.5">
                      <ExternalLink size={13} /> Voir la pièce
                    </a>
                  )}
                  <button onClick={() => handleVerifyIdentity(i.id, i.identityFullName)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                    Valider
                  </button>
                  <button onClick={() => handleRejectIdentity(i.id)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10">
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-400">Chargement...</div>
        ) : payouts.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">Aucune demande de retrait.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-xs uppercase tracking-wider text-neutral-400">
                  <th className="p-4 font-semibold">Référence</th>
                  <th className="p-4 font-semibold">Formateur</th>
                  <th className="p-4 font-semibold">Montant</th>
                  <th className="p-4 font-semibold">Méthode</th>
                  <th className="p-4 font-semibold">Détails Compte</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Statut</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {payouts.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-mono text-xs text-neutral-400">{p.reference}</td>
                    <td className="p-4">
                      <p className="font-bold text-white">{p.instructor?.name || p.instructor?.email}</p>
                      {/* Nom légal figé au moment de la demande — à confronter au compte destinataire */}
                      {p.identityFullName && (
                        <p className="text-[11px] text-blue-300/70 mt-0.5">Identité : {p.identityFullName}</p>
                      )}
                    </td>
                    <td className="p-4 font-bold text-emerald-400">{p.amount.toLocaleString('fr-DZ')} DA</td>
                    <td className="p-4 font-semibold text-amber-400">{p.method}</td>
                    <td className="p-4 text-neutral-300">{p.accountInfo}</td>
                    <td className="p-4 text-neutral-500">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4">
                      {p.status === 'PENDING' && <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">EN ATTENTE</span>}
                      {p.status === 'COMPLETED' && <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">PAYÉ</span>}
                      {p.status === 'REJECTED' && <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">REJETÉ</span>}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {p.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleApprove(p.id)} className="text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                            Payer
                          </button>
                          <button onClick={() => handleReject(p.id)} className="text-xs font-bold px-3 py-1.5 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10">
                            Rejeter
                          </button>
                        </>
                      )}
                      {/* Trace de qui a traité la demande et quand */}
                      {p.status !== 'PENDING' && (
                        <div className="text-neutral-500 text-[11px] leading-relaxed">
                          {p.processedAt && <p>{new Date(p.processedAt).toLocaleString('fr-FR')}</p>}
                          {p.processedBy && <p className="text-neutral-600">par {p.processedBy}</p>}
                          {p.notes && <p className="text-neutral-600 italic mt-0.5">{p.notes}</p>}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
