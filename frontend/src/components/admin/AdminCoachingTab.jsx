import { useState, useEffect, useCallback } from 'react'
import { CalendarDays, Plus, Trash2, Save, MessageCircle } from 'lucide-react'
import api from '../../api/axios'
import { useToast } from '../../hooks/useToast.jsx'

const WEEKDAYS = [
  { v: 6, label: 'Sam' }, { v: 0, label: 'Dim' }, { v: 1, label: 'Lun' }, { v: 2, label: 'Mar' },
  { v: 3, label: 'Mer' }, { v: 4, label: 'Jeu' }, { v: 5, label: 'Ven' },
]
const STATUS = {
  PENDING: { label: 'En attente', cls: 'bg-amber-500/20 text-amber-400' },
  CONFIRMED: { label: 'Confirmée', cls: 'bg-emerald-500/20 text-emerald-400' },
  CANCELLED: { label: 'Annulée', cls: 'bg-red-500/20 text-red-400' },
}

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `sujet-${Date.now()}`
const input = 'w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none text-sm'
const panel = 'bg-neutral-900/50 border border-white/5 rounded-2xl p-6'

export default function AdminCoachingTab() {
  const { success: toastSuccess, error: toastError } = useToast()
  const [cfg, setCfg] = useState(null)
  const [bookings, setBookings] = useState([])
  const [saving, setSaving] = useState(false)
  const [newSlot, setNewSlot] = useState('')
  const [newBlocked, setNewBlocked] = useState('')
  const [newChannel, setNewChannel] = useState('')

  const load = useCallback(async () => {
    try {
      const [{ data: config }, { data: list }] = await Promise.all([
        api.get('/admin/config'),
        api.get('/admin/coaching-bookings'),
      ])
      setCfg(config.coaching)
      setBookings(list)
    } catch {
      toastError('Erreur lors du chargement du coaching.')
    }
  }, [toastError])

  useEffect(() => { load() }, [load])

  const set = (patch) => setCfg(c => ({ ...c, ...patch }))
  const setTopic = (i, patch) => set({ topics: cfg.topics.map((t, j) => j === i ? { ...t, ...patch } : t) })
  const setFormat = (i, patch) => set({ formats: (cfg.formats || []).map((f, j) => j === i ? { ...f, ...patch } : f) })

  const save = async () => {
    const topics = cfg.topics
      .filter(t => t.label.trim())
      .map(t => ({ ...t, id: t.id || slugify(t.label), price: Math.max(0, parseInt(t.price, 10) || 0) }))
    if (topics.length === 0) return toastError('Ajoutez au moins un sujet.')
    const formats = (cfg.formats || [])
      .filter(f => f.label.trim())
      .map(f => ({ ...f, id: f.id || slugify(f.label), price: Math.max(0, parseInt(f.price, 10) || 0) }))
    setSaving(true)
    try {
      const coaching = { ...cfg, topics, formats, infos: (cfg.infos || []).map(x => x.trim()).filter(Boolean) }
      const { data } = await api.put('/admin/config', { coaching })
      setCfg(data.config.coaching)
      window.dispatchEvent(new Event('configUpdated'))
      toastSuccess('Réglages du coaching enregistrés.')
    } catch (err) {
      toastError(err.response?.data?.error || "Erreur lors de l'enregistrement.")
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (id, status) => {
    try {
      await api.put(`/admin/coaching-bookings/${id}`, { status })
      setBookings(b => b.map(x => x.id === id ? { ...x, status } : x))
    } catch {
      toastError('Erreur lors de la modification.')
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Supprimer définitivement cette réservation ?')) return
    try {
      await api.delete(`/admin/coaching-bookings/${id}`)
      setBookings(b => b.filter(x => x.id !== id))
    } catch {
      toastError('Erreur lors de la suppression.')
    }
  }

  const waLink = (b) => {
    let num = b.phone.replace(/\D/g, '')
    if (num.startsWith('0')) num = '213' + num.slice(1)
    return `https://wa.me/${num}?text=${encodeURIComponent(`Bonjour ${b.fullName}, c'est Mylta Academy à propos de votre coaching « ${b.topicLabel} » du ${b.date}${b.timeSlot ? ` à ${b.timeSlot}` : ''}.`)}`
  }

  if (!cfg) return <div className="p-8 text-center text-neutral-400">Chargement...</div>

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white mb-2 flex items-center gap-3">
            <CalendarDays className="text-emerald-400" /> Coaching en ligne
          </h2>
          <p className="text-neutral-400 text-sm">Sujets, prix, jours et horaires — et les réservations reçues.</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
          <input type="checkbox" checked={cfg.enabled} onChange={e => set({ enabled: e.target.checked })} className="w-4 h-4" />
          Section visible sur le site
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${panel} space-y-4`}>
          <h3 className="font-bold">Textes et contact</h3>
          <div>
            <label className="text-xs font-bold text-neutral-400 mb-1.5 block">Titre</label>
            <input className={input} value={cfg.title} onChange={e => set({ title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-400 mb-1.5 block">Sous-titre</label>
            <textarea className={input} rows={2} value={cfg.subtitle} onChange={e => set({ subtitle: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-neutral-400 mb-1.5 block">WhatsApp (ex : 213795103743)</label>
              <input className={input} value={cfg.whatsappNumber} onChange={e => set({ whatsappNumber: e.target.value.replace(/\D/g, '') })} />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-400 mb-1.5 block">Devise</label>
              <input className={input} value={cfg.currency} onChange={e => set({ currency: e.target.value })} />
            </div>
          </div>
        </div>

        <div className={`${panel} space-y-4`}>
          <h3 className="font-bold">Disponibilités</h3>
          <div>
            <label className="text-xs font-bold text-neutral-400 mb-1.5 block">Jours ouverts</label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map(d => {
                const on = cfg.weekdays.includes(d.v)
                return (
                  <button key={d.v} type="button"
                          onClick={() => set({ weekdays: on ? cfg.weekdays.filter(x => x !== d.v) : [...cfg.weekdays, d.v] })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${on ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'border-white/10 text-neutral-500'}`}>
                    {d.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-400 mb-1.5 block">Horaires (vide = la personne choisit seulement la date)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {cfg.timeSlots.map(s => (
                <span key={s} className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold">
                  {s}
                  <button type="button" onClick={() => set({ timeSlots: cfg.timeSlots.filter(x => x !== s) })} className="text-red-400">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="time" className={input} value={newSlot} onChange={e => setNewSlot(e.target.value)} />
              <button type="button" onClick={() => { if (newSlot && !cfg.timeSlots.includes(newSlot)) set({ timeSlots: [...cfg.timeSlots, newSlot].sort() }); setNewSlot('') }}
                      className="px-3 rounded-xl bg-white/10 hover:bg-white/15"><Plus size={16} /></button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-neutral-400 mb-1.5 block">Réservable jusqu'au</label>
              <input type="date" className={input} value={cfg.bookUntil || ''} onChange={e => set({ bookUntil: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-400 mb-1.5 block">Bloquer une date</label>
              <div className="flex gap-2">
                <input type="date" className={input} value={newBlocked} onChange={e => setNewBlocked(e.target.value)} />
                <button type="button" onClick={() => { if (newBlocked && !cfg.blockedDates.includes(newBlocked)) set({ blockedDates: [...cfg.blockedDates, newBlocked].sort() }); setNewBlocked('') }}
                        className="px-3 rounded-xl bg-white/10 hover:bg-white/15"><Plus size={16} /></button>
              </div>
            </div>
          </div>
          {cfg.blockedDates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {cfg.blockedDates.map(d => (
                <span key={d} className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 rounded-lg px-2.5 py-1 text-xs font-bold">
                  {d}
                  <button type="button" onClick={() => set({ blockedDates: cfg.blockedDates.filter(x => x !== d) })} className="text-red-400">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={panel}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Sujets</h3>
          <button type="button" onClick={() => set({ topics: [...cfg.topics, { id: '', category: cfg.topics[cfg.topics.length - 1]?.category || '', label: '', description: '', price: 0, duration: '' }] })}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15">
            <Plus size={14} /> Ajouter un sujet
          </button>
        </div>
        <div className="space-y-2">
          <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-bold text-neutral-500 px-1">
            <span className="col-span-3">Filière</span><span className="col-span-3">Sujet</span><span className="col-span-4">Description courte</span><span className="col-span-1">Prix*</span>
          </div>
          {cfg.topics.map((t, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input className={`${input} col-span-12 sm:col-span-3`} list="coaching-categories" placeholder="Intelligence artificielle" value={t.category || ''} onChange={e => setTopic(i, { category: e.target.value })} />
              <input className={`${input} col-span-12 sm:col-span-3`} placeholder="Nom du sujet" value={t.label} onChange={e => setTopic(i, { label: e.target.value })} />
              <input className={`${input} col-span-12 sm:col-span-4`} placeholder="Ex : ChatGPT, outils IA…" value={t.description || ''} onChange={e => setTopic(i, { description: e.target.value })} />
              <input type="number" min="0" className={`${input} col-span-10 sm:col-span-1`} value={t.price} onChange={e => setTopic(i, { price: e.target.value })} />
              <button type="button" onClick={() => set({ topics: cfg.topics.filter((_, j) => j !== i) })}
                      className="col-span-2 sm:col-span-1 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-500/10"><Trash2 size={16} /></button>
            </div>
          ))}
          <datalist id="coaching-categories">
            {[...new Set(cfg.topics.map(t => t.category).filter(Boolean))].map(c => <option key={c} value={c} />)}
          </datalist>
          <p className="text-xs text-neutral-500 px-1">* Prix du sujet utilisé seulement si la formule choisie n'a pas de prix. 0 = non affiché.</p>
        </div>

        <div className="flex items-center justify-between mt-8 mb-4">
          <div>
            <h3 className="font-bold">Formules (durée et prix)</h3>
            <p className="text-xs text-neutral-500">Une seule formule : le client n'a rien à choisir. Plusieurs : il choisit à la dernière étape.</p>
          </div>
          <button type="button" onClick={() => set({ formats: [...(cfg.formats || []), { id: '', label: '', duration: '', price: 0, description: '' }] })}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15">
            <Plus size={14} /> Ajouter une formule
          </button>
        </div>
        <div className="space-y-2">
          <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-bold text-neutral-500 px-1">
            <span className="col-span-3">Formule</span><span className="col-span-2">Durée</span><span className="col-span-2">Prix (0 = sur WhatsApp)</span><span className="col-span-4">Description</span>
          </div>
          {(cfg.formats || []).map((f, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input className={`${input} col-span-12 sm:col-span-3`} placeholder="Séance complète" value={f.label} onChange={e => setFormat(i, { label: e.target.value })} />
              <input className={`${input} col-span-6 sm:col-span-2`} placeholder="1 h" value={f.duration} onChange={e => setFormat(i, { duration: e.target.value })} />
              <input type="number" min="0" className={`${input} col-span-6 sm:col-span-2`} value={f.price} onChange={e => setFormat(i, { price: e.target.value })} />
              <input className={`${input} col-span-10 sm:col-span-4`} placeholder="Ce que comprend la formule" value={f.description || ''} onChange={e => setFormat(i, { description: e.target.value })} />
              <button type="button" onClick={() => set({ formats: cfg.formats.filter((_, j) => j !== i) })}
                      className="col-span-2 sm:col-span-1 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-500/10"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>

        <h3 className="font-bold mt-8">Personnes par séance</h3>
        <p className="text-xs text-neutral-500 mb-3">Choix proposés : Individuel (recommandé), À 2, À 3… La dernière valeur, à partir de 4, s'affiche « En groupe ». 1 = individuel uniquement.</p>
        <input type="number" min="1" max="20" className={`${input} max-w-[120px]`} value={cfg.maxParticipants ?? 1}
               onChange={e => set({ maxParticipants: Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)) })} />

        <h3 className="font-bold mt-8">Étiquettes en haut de la page</h3>
        <p className="text-xs text-neutral-500 mb-3">Textes très courts (ex : « 2h30 », « Débutants OK »), affichés en grille de 3.</p>
        <div className="grid grid-cols-3 gap-2 max-w-xl mb-2">
          {(cfg.infos || []).map((info, i) => (
            <div key={i} className="flex gap-1">
              <input className={input} maxLength={24} value={info} onChange={e => set({ infos: cfg.infos.map((x, j) => j === i ? e.target.value : x) })} />
              <button type="button" onClick={() => set({ infos: cfg.infos.filter((_, j) => j !== i) })} className="px-2 rounded-lg text-red-400 hover:bg-red-500/10">×</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => set({ infos: [...(cfg.infos || []), ''] })} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15">
          <Plus size={14} /> Ajouter une étiquette
        </button>

        <h3 className="font-bold mt-8">Moyen d'appel vidéo</h3>
        <p className="text-xs text-neutral-500 mb-3">Laisser vide : vous convenez du moyen (WhatsApp, Meet…) avec le client sur WhatsApp. Sinon, il choisit dans cette liste.</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {(cfg.channels || []).map(c => (
            <span key={c} className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold">
              {c}
              <button type="button" onClick={() => set({ channels: cfg.channels.filter(x => x !== c) })} className="text-red-400">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 max-w-sm">
          <input className={input} placeholder="Ex : Google Meet" value={newChannel} onChange={e => setNewChannel(e.target.value)} />
          <button type="button" onClick={() => { const c = newChannel.trim(); if (c && !(cfg.channels || []).includes(c)) set({ channels: [...(cfg.channels || []), c] }); setNewChannel('') }}
                  className="px-3 rounded-xl bg-white/10 hover:bg-white/15"><Plus size={16} /></button>
        </div>
        <button type="button" onClick={save} disabled={saving}
                className="mt-6 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-colors disabled:opacity-60">
          <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer les réglages'}
        </button>
      </div>

      <div className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 font-bold">Réservations ({bookings.length})</div>
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">Aucune réservation pour le moment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-white/5 text-xs uppercase tracking-wider text-neutral-400">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Client</th>
                  <th className="p-4 font-semibold">Sujet</th>
                  <th className="p-4 font-semibold">Statut</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-white/[0.02] align-top">
                    <td className="p-4 whitespace-nowrap font-bold text-white">{b.date}{b.timeSlot ? ` · ${b.timeSlot}` : ''}</td>
                    <td className="p-4">
                      <div className="font-bold text-white">{b.fullName}</div>
                      <div className="text-neutral-400">{b.phone}</div>
                      {b.message && <div className="text-neutral-500 text-xs mt-1 max-w-xs">{b.message}</div>}
                    </td>
                    <td className="p-4 text-neutral-300">
                      <div className="font-bold text-white">{b.topicLabel}</div>
                      <div className="text-xs text-neutral-400">{[b.participants > 1 ? (b.participants >= 4 && b.participants === (cfg.maxParticipants || 0) ? 'En groupe (4+)' : `${b.participants} personnes`) : 'Individuel', b.formatLabel, b.channel, b.level].filter(Boolean).join(' · ')}</div>
                      {b.price > 0 && <div className="text-xs text-emerald-400 font-bold">{b.price.toLocaleString('fr-FR')} {cfg.currency}</div>}
                    </td>
                    <td className="p-4">
                      <select value={b.status} onChange={e => setStatus(b.id, e.target.value)}
                              className={`rounded-full px-2 py-1 text-[11px] font-bold border-0 outline-none ${STATUS[b.status]?.cls}`}>
                        {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k} className="bg-neutral-900 text-white">{v.label}</option>)}
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <a href={waLink(b)} target="_blank" rel="noopener noreferrer" title="Écrire sur WhatsApp"
                           className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10"><MessageCircle size={16} /></a>
                        <button onClick={() => remove(b.id)} title="Supprimer" className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><Trash2 size={16} /></button>
                      </div>
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
