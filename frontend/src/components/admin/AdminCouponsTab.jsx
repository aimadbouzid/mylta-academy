import { useState, useEffect, useCallback } from 'react'
import { Ticket, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react'
import api from '../../api/axios'
import { useToast } from '../../hooks/useToast.jsx'
import { useLanguage } from '../../context/LanguageContext'

export default function AdminCouponsTab() {
  const { t } = useLanguage()
  const { success: toastSuccess, error: toastError } = useToast()
  
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [form, setForm] = useState({ code: '', discountPercent: '', maxUses: '', expiresAt: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/coupons')
      setCoupons(data)
    } catch {
      toastError('Erreur lors du chargement des coupons.')
    } finally {
      setLoading(false)
    }
  }, [toastError])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/admin/coupons', form)
      toastSuccess('Coupon créé avec succès !')
      setForm({ code: '', discountPercent: '', maxUses: '', expiresAt: '' })
      fetchCoupons()
    } catch (err) {
      toastError(err.response?.data?.error || 'Erreur lors de la création.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/admin/coupons/${id}`, { isActive: !currentStatus })
      toastSuccess('Statut modifié !')
      fetchCoupons()
    } catch {
      toastError('Erreur lors de la modification.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 sm:p-8 flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white mb-2 flex items-center gap-3">
            <Ticket className="text-blue-400" /> Gestion des Coupons
          </h2>
          <p className="text-neutral-400 text-sm">Créez des codes promotionnels pour vos étudiants.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire */}
        <div className="lg:col-span-1 bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="font-bold mb-4">Créer un code promo</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-neutral-400 mb-1.5 block">Code (ex: LANCEMENT50) *</label>
              <input type="text" required value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                     className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-400 mb-1.5 block">Réduction (%) *</label>
              <input type="number" required min="1" max="100" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })}
                     className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-400 mb-1.5 block">Limite d'utilisation</label>
              <input type="number" min="1" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })}
                     className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none" placeholder="Ex: 100" />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-400 mb-1.5 block">Date d'expiration</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                     className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors">
              {isSubmitting ? 'Création...' : 'Créer le coupon'}
            </button>
          </form>
        </div>

        {/* Liste */}
        <div className="lg:col-span-2 bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5 font-bold">Coupons existants</div>
          {loading ? (
            <div className="p-8 text-center text-neutral-400">Chargement...</div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">Aucun coupon créé.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-xs uppercase tracking-wider text-neutral-400">
                    <th className="p-4 font-semibold">Code</th>
                    <th className="p-4 font-semibold">Réduction</th>
                    <th className="p-4 font-semibold">Utilisations</th>
                    <th className="p-4 font-semibold">Expiration</th>
                    <th className="p-4 font-semibold">Statut</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {coupons.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-bold text-white">{c.code}</td>
                      <td className="p-4 text-emerald-400 font-bold">-{c.discountPercent}%</td>
                      <td className="p-4">{c.currentUses} / {c.maxUses}</td>
                      <td className="p-4 text-neutral-400">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('fr-FR') : 'Jamais'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${c.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {c.isActive ? 'ACTIF' : 'INACTIF'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => toggleStatus(c.id, c.isActive)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${c.isActive ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' : 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'}`}>
                          {c.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
