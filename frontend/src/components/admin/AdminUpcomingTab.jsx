import { useState, useEffect } from 'react'
import { Clock, Plus, Trash2, Save, ChevronUp, ChevronDown } from 'lucide-react'
import api from '../../api/axios'
import { useToast } from '../../hooks/useToast.jsx'

const input = 'w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none text-sm'
const label = 'text-xs font-bold text-neutral-400 mb-1.5 block'
const panel = 'bg-neutral-900/50 border border-white/5 rounded-2xl p-6'

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const EMPTY = { id: '', title: '', category: '', level: 'Débutant', duration: '', price: 3000, oldPrice: 5000, description: '', program: [], included: [] }

// Dans le formulaire, programme et « inclus » s'éditent une ligne par élément.
const toForm = (c) => ({ ...EMPTY, ...c, programText: (c.program || []).join('\n'), includedText: (c.included || []).join('\n') })
const fromForm = ({ programText, includedText, ...c }, taken) => {
  let id = c.id || slugify(c.title) || `formation-${Date.now()}`
  while (taken.has(id)) id = `${id}-2`
  taken.add(id)
  return {
    ...c,
    id,
    price: Math.max(0, parseInt(c.price, 10) || 0),
    oldPrice: Math.max(0, parseInt(c.oldPrice, 10) || 0),
    program: programText.split('\n').map(x => x.trim()).filter(Boolean),
    included: includedText.split('\n').map(x => x.trim()).filter(Boolean),
  }
}

export default function AdminUpcomingTab() {
  const { success: toastSuccess, error: toastError } = useToast()
  const [courses, setCourses] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/admin/config')
      .then(({ data }) => setCourses((data.upcomingCourses || []).map(toForm)))
      .catch(() => toastError('Erreur lors du chargement.'))
  }, [toastError])

  const update = (i, patch) => setCourses(cs => cs.map((c, j) => j === i ? { ...c, ...patch } : c))
  const move = (i, dir) => setCourses(cs => {
    const next = [...cs]
    const j = i + dir
    if (j < 0 || j >= next.length) return cs
    ;[next[i], next[j]] = [next[j], next[i]]
    return next
  })

  const save = async () => {
    const valid = courses.filter(c => c.title.trim())
    const taken = new Set()
    const upcomingCourses = valid.map(c => fromForm(c, taken))
    setSaving(true)
    try {
      const { data } = await api.put('/admin/config', { upcomingCourses })
      setCourses((data.config.upcomingCourses || []).map(toForm))
      window.dispatchEvent(new Event('configUpdated'))
      toastSuccess('Formations à venir enregistrées.')
    } catch (err) {
      toastError(err.response?.data?.error || "Erreur lors de l'enregistrement.")
    } finally {
      setSaving(false)
    }
  }

  if (!courses) return <div className="p-8 text-center text-neutral-400">Chargement...</div>

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/20 rounded-2xl p-6 sm:p-8">
        <h2 className="font-display font-bold text-2xl text-white mb-2 flex items-center gap-3"><Clock className="text-red-400" /> Formations à venir</h2>
        <p className="text-neutral-400 text-sm">Affichées avec le badge « Bientôt » sur l'accueil et la page Formations. Le visiteur voit la fiche en cliquant sur « Détails ».</p>
      </div>

      {courses.map((c, i) => (
        <div key={i} className={`${panel} space-y-4`}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-white truncate">{c.title || 'Nouvelle formation'}</h3>
            <div className="flex items-center gap-1 shrink-0">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Monter" className="p-2 rounded-lg text-neutral-300 hover:bg-white/10 disabled:opacity-30"><ChevronUp size={16} /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === courses.length - 1} title="Descendre" className="p-2 rounded-lg text-neutral-300 hover:bg-white/10 disabled:opacity-30"><ChevronDown size={16} /></button>
              <button type="button" onClick={() => window.confirm('Retirer cette formation à venir ?') && setCourses(cs => cs.filter((_, j) => j !== i))}
                      title="Supprimer" className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><Trash2 size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2 sm:col-span-4"><label className={label}>Titre *</label><input className={input} value={c.title} onChange={e => update(i, { title: e.target.value })} /></div>
            <div><label className={label}>Catégorie</label><input className={input} placeholder="IA" value={c.category} onChange={e => update(i, { category: e.target.value })} /></div>
            <div><label className={label}>Niveau</label><input className={input} placeholder="Débutant" value={c.level} onChange={e => update(i, { level: e.target.value })} /></div>
            <div><label className={label}>Durée (facultatif)</label><input className={input} placeholder="6 h de vidéo" value={c.duration} onChange={e => update(i, { duration: e.target.value })} /></div>
            <div><label className={label}>Image (URL, facultatif)</label><input className={input} placeholder="/logo-128.png" value={c.image || ''} onChange={e => update(i, { image: e.target.value })} /></div>
            <div><label className={label}>Prix barré (DA)</label><input type="number" min="0" className={input} value={c.oldPrice} onChange={e => update(i, { oldPrice: e.target.value })} /></div>
            <div><label className={label}>Prix (DA)</label><input type="number" min="0" className={input} value={c.price} onChange={e => update(i, { price: e.target.value })} /></div>
            <div className="col-span-2 sm:col-span-4"><label className={label}>Description courte</label><textarea className={input} rows={2} value={c.description} onChange={e => update(i, { description: e.target.value })} /></div>
            <div className="col-span-2"><label className={label}>Programme (un module par ligne)</label><textarea className={input} rows={6} value={c.programText} onChange={e => update(i, { programText: e.target.value })} /></div>
            <div className="col-span-2"><label className={label}>Inclus (un élément par ligne)</label><textarea className={input} rows={6} value={c.includedText} onChange={e => update(i, { includedText: e.target.value })} /></div>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => setCourses(cs => [...cs, toForm(EMPTY)])}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 font-bold">
          <Plus size={16} /> Ajouter une formation
        </button>
        <button type="button" onClick={save} disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-colors disabled:opacity-60">
          <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}
