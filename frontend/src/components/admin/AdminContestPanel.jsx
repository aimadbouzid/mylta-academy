import { useState, useEffect, useCallback } from 'react'
import { Gift, Trash2, Save, Shuffle, MessageCircle } from 'lucide-react'
import api from '../../api/axios'
import { useToast } from '../../hooks/useToast.jsx'

const panel = 'bg-neutral-900/50 border border-white/5 rounded-2xl p-6'
const label = 'text-xs font-bold text-neutral-400 mb-1.5 block'
const input = 'w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-white/40'

const waNumber = (phone) => {
  const num = phone.replace(/\D/g, '')
  return num.startsWith('0') ? '213' + num.slice(1) : num
}

// Concours « gagnez une formation » : réglages, participants et tirage au sort.
export default function AdminContestPanel() {
  const { success: toastSuccess, error: toastError } = useToast()
  const [cfg, setCfg] = useState(null)
  const [entries, setEntries] = useState([])
  const [winner, setWinner] = useState(null)

  const load = useCallback(() => {
    api.get('/admin/contest/entries').then(({ data }) => setEntries(data.entries)).catch(() => {})
  }, [])

  useEffect(() => {
    api.get('/admin/config').then(({ data }) => setCfg(data.contest)).catch(() => toastError('Erreur de chargement du concours.'))
    load()
  }, [load, toastError])

  const save = async (patch = {}) => {
    try {
      const contest = {
        ...cfg, ...patch,
        prizes: (patch.prizes ?? cfg.prizes).map(p => p.trim()).filter(Boolean),
        rules: (patch.rules ?? cfg.rules).map(p => p.trim()).filter(Boolean),
      }
      const { data } = await api.put('/admin/config', { contest })
      setCfg(data.config.contest)
      window.dispatchEvent(new Event('configUpdated'))
      toastSuccess('Concours enregistré.')
    } catch (err) { toastError(err.response?.data?.error || "Erreur lors de l'enregistrement.") }
  }

  const remove = async (id) => {
    if (!window.confirm('Supprimer ce participant ?')) return
    await api.delete(`/admin/contest/entries/${id}`).then(load).catch(() => toastError('Erreur lors de la suppression.'))
  }

  const draw = () => {
    if (!entries.length) return
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    setWinner(entries[buf[0] % entries.length])
  }

  if (!cfg) return null

  return (
    <div className={`${panel} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold flex items-center gap-2"><Gift size={18} className="text-pink-400" /> Concours — formation gratuite</h3>
        <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
          <input type="checkbox" checked={!!cfg.enabled} onChange={e => save({ enabled: e.target.checked })} className="w-4 h-4" />
          Visible sur le site (accueil + page /concours)
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className={label}>Titre</label><input className={input} value={cfg.title} onChange={e => setCfg({ ...cfg, title: e.target.value })} /></div>
        <div><label className={label}>Date du tirage (facultatif)</label><input type="date" className={input} value={cfg.endDate || ''} onChange={e => setCfg({ ...cfg, endDate: e.target.value })} /></div>
        <div className="sm:col-span-2"><label className={label}>Texte</label><textarea className={input} rows={2} value={cfg.text} onChange={e => setCfg({ ...cfg, text: e.target.value })} /></div>
        <div><label className={label}>Lots au choix (un par ligne)</label><textarea className={input} rows={3} value={(cfg.prizes || []).join('\n')} onChange={e => setCfg({ ...cfg, prizes: e.target.value.split('\n') })} /></div>
        <div><label className={label}>Règles (une par ligne)</label><textarea className={input} rows={3} value={(cfg.rules || []).join('\n')} onChange={e => setCfg({ ...cfg, rules: e.target.value.split('\n') })} /></div>
      </div>
      <button onClick={() => save()} className="px-4 py-2.5 rounded-lg bg-white text-black font-bold inline-flex items-center gap-2"><Save size={16} /> Enregistrer</button>

      <div className="border-t border-white/5 pt-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-bold">{entries.length} participant{entries.length > 1 ? 's' : ''}</p>
          <button onClick={draw} disabled={!entries.length} className="px-4 py-2 rounded-lg bg-pink-500 text-white font-bold inline-flex items-center gap-2 disabled:opacity-40"><Shuffle size={16} /> Tirer au sort</button>
        </div>
        {winner && (
          <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-3 text-sm flex flex-wrap items-center justify-between gap-2">
            <span>🎉 Gagnant : <b className="text-white">{winner.fullName}</b> · {winner.phone}{winner.prize ? ` · ${winner.prize}` : ''}</span>
            <a href={`https://wa.me/${waNumber(winner.phone)}?text=${encodeURIComponent(`Bonjour ${winner.fullName}, félicitations ! Vous avez gagné le concours Mylta Academy${winner.prize ? ` (${winner.prize})` : ''} 🎉`)}`}
               target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-bold inline-flex items-center gap-1.5"><MessageCircle size={14} /> Le prévenir</a>
          </div>
        )}
        <div className="max-h-72 overflow-y-auto">
          {entries.map(e => (
            <div key={e.id} className="flex items-center gap-3 py-2 border-t border-white/5 text-sm">
              <span className="flex-1"><b className="text-white">{e.fullName}</b> <span className="text-neutral-400">· {e.phone}{e.city ? ` · ${e.city}` : ''}{e.prize ? ` · ${e.prize}` : ''}</span></span>
              <button onClick={() => remove(e.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
