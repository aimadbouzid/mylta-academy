import { useState, useEffect, useCallback } from 'react'
import { Clapperboard, Save, Trash2, MessageCircle } from 'lucide-react'
import api from '../../api/axios'
import { useToast } from '../../hooks/useToast.jsx'
import { Fold } from './AdminInPersonTab'

const label = 'text-xs font-bold text-neutral-400 mb-1.5 block'
const input = 'w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-white/40'
const STATUS = {
  PENDING: { label: 'Acompte en attente', cls: 'bg-amber-500/20 text-amber-400' },
  CONFIRMED: { label: 'Acompte reçu', cls: 'bg-emerald-500/20 text-emerald-400' },
  CANCELLED: { label: 'Annulé', cls: 'bg-red-500/20 text-red-400' },
}
const dayLabel = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
const wa = (r) => {
  let num = r.phone.replace(/\D/g, '')
  if (num.startsWith('0')) num = '213' + num.slice(1)
  return `https://wa.me/${num}?text=${encodeURIComponent(`Bonjour ${r.fullName}, c'est Mylta Academy à propos de la formation montage vidéo du ${dayLabel(r.day)}.`)}`
}

// Formation d'un jour (samedi) : réglages et inscrits, regroupés par date.
export default function AdminExpressPanel() {
  const { success: toastSuccess, error: toastError } = useToast()
  const [cfg, setCfg] = useState(null)
  const [regs, setRegs] = useState([])

  const load = useCallback(() => {
    api.get('/admin/express/registrations').then(({ data }) => setRegs(data.registrations)).catch(() => {})
  }, [])
  useEffect(() => {
    api.get('/admin/config').then(({ data }) => setCfg({
      ...data.express,
      scheduleText: (data.express.schedule || []).map(s => `${s.time} | ${s.label}`).join('\n'),
      resultsText: (data.express.results || []).join('\n'),
      closedText: (data.express.closedDates || []).join(', '),
    })).catch(() => toastError('Erreur de chargement de la formation 1 jour.'))
    load()
  }, [load, toastError])

  const save = async (patch = {}) => {
    try {
      const { scheduleText, resultsText, closedText, ...rest } = { ...cfg, ...patch }
      const express = {
        ...rest,
        price: Math.max(0, parseInt(rest.price, 10) || 0),
        deposit: Math.max(0, parseInt(rest.deposit, 10) || 0),
        capacity: Math.max(1, parseInt(rest.capacity, 10) || 1),
        weeksAhead: Math.min(26, Math.max(1, parseInt(rest.weeksAhead, 10) || 6)),
        schedule: scheduleText.split('\n').map(l => l.split('|')).filter(p => p.length >= 2 && p[1].trim())
          .map(([time, ...lbl]) => ({ time: time.trim(), label: lbl.join('|').trim() })),
        results: resultsText.split('\n').map(x => x.trim()).filter(Boolean),
        closedDates: closedText.split(/[\s,]+/).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)),
      }
      await api.put('/admin/config', { express })
      setCfg(c => ({ ...c, ...patch }))
      window.dispatchEvent(new Event('configUpdated'))
      toastSuccess('Formation 1 jour enregistrée.')
    } catch (err) { toastError(err.response?.data?.error || "Erreur lors de l'enregistrement.") }
  }

  const setStatus = (id, status) => api.put(`/admin/in-person/registrations/${id}`, { status }).then(load).catch(() => toastError('Erreur.'))
  const remove = (id) => window.confirm('Supprimer cette inscription ?') && api.delete(`/admin/in-person/registrations/${id}`).then(load).catch(() => toastError('Erreur.'))

  if (!cfg) return null
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = regs.filter(r => r.day >= today)
  const byDay = upcoming.reduce((acc, r) => ((acc[r.day] = acc[r.day] || []).push(r), acc), {})
  const active = upcoming.filter(r => r.status !== 'CANCELLED').length

  return (
    <Fold defaultOpen title={<span className="flex items-center gap-2"><Clapperboard size={18} className="text-red-400" /> Formation 1 jour (samedi) — {active} inscrit{active > 1 ? 's' : ''}</span>}>
      <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
        <input type="checkbox" checked={!!cfg.enabled} onChange={e => save({ enabled: e.target.checked })} className="w-4 h-4" />
        Visible sur le site (accueil, menu, page /formation-1-jour)
      </label>

      {/* Inscrits par samedi */}
      {Object.keys(byDay).length === 0 ? (
        <p className="text-sm text-neutral-500">Aucune inscription à venir.</p>
      ) : Object.entries(byDay).map(([day, list]) => (
        <div key={day} className="rounded-xl border border-white/10 p-3">
          <p className="font-bold text-white capitalize">{dayLabel(day)} <span className="text-neutral-400 font-normal">· {list.filter(r => r.status !== 'CANCELLED').length} / {cfg.capacity} places</span></p>
          {list.map(r => (
            <div key={r.id} className="flex flex-wrap items-center gap-2 py-2 border-t border-white/5 text-sm">
              <span className="flex-1 min-w-[160px]"><b className="text-white">{r.fullName}</b> <span className="text-neutral-400">· {r.phone}</span>
                {r.message && <span className="block text-xs text-neutral-500">{r.message}</span>}</span>
              <select value={r.status} onChange={e => setStatus(r.id, e.target.value)}
                      className={`rounded-full px-2 py-1 text-[11px] font-bold border-0 outline-none ${STATUS[r.status]?.cls}`}>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k} className="bg-neutral-900 text-white">{v.label}</option>)}
              </select>
              <a href={wa(r)} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10"><MessageCircle size={16} /></a>
              <button onClick={() => remove(r.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      ))}

      {/* Réglages */}
      <div className="border-t border-white/5 pt-4 space-y-3">
        <div><label className={label}>Titre</label><input className={input} value={cfg.title} onChange={e => setCfg({ ...cfg, title: e.target.value })} /></div>
        <div><label className={label}>Sous-titre</label><textarea className={input} rows={2} value={cfg.subtitle} onChange={e => setCfg({ ...cfg, subtitle: e.target.value })} /></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><label className={label}>Prix (DA)</label><input type="number" min="0" className={input} value={cfg.price} onChange={e => setCfg({ ...cfg, price: e.target.value })} /></div>
          <div><label className={label}>Acompte (DA)</label><input type="number" min="0" className={input} value={cfg.deposit} onChange={e => setCfg({ ...cfg, deposit: e.target.value })} /></div>
          <div><label className={label}>Places par samedi</label><input type="number" min="1" className={input} value={cfg.capacity} onChange={e => setCfg({ ...cfg, capacity: e.target.value })} /></div>
          <div><label className={label}>Début</label><input type="time" className={input} value={cfg.startTime} onChange={e => setCfg({ ...cfg, startTime: e.target.value })} /></div>
          <div><label className={label}>Fin</label><input type="time" className={input} value={cfg.endTime} onChange={e => setCfg({ ...cfg, endTime: e.target.value })} /></div>
          <div><label className={label}>Samedis proposés</label><input type="number" min="1" max="26" className={input} value={cfg.weeksAhead} onChange={e => setCfg({ ...cfg, weeksAhead: e.target.value })} /></div>
        </div>
        <div><label className={label}>Samedis sans formation (AAAA-MM-JJ, séparés par des virgules)</label><input className={input} placeholder="2026-11-07, 2026-12-19" value={cfg.closedText} onChange={e => setCfg({ ...cfg, closedText: e.target.value })} /></div>
        <div><label className={label}>Déroulé (une ligne : heure | étape)</label><textarea className={`${input} font-mono text-sm`} rows={6} value={cfg.scheduleText} onChange={e => setCfg({ ...cfg, scheduleText: e.target.value })} /></div>
        <div><label className={label}>Vous repartez avec (une ligne par point)</label><textarea className={input} rows={3} value={cfg.resultsText} onChange={e => setCfg({ ...cfg, resultsText: e.target.value })} /></div>
        <button type="button" onClick={() => save()} className="px-5 py-2.5 rounded-xl bg-white text-black font-bold inline-flex items-center gap-2"><Save size={16} /> Enregistrer</button>
      </div>
    </Fold>
  )
}
