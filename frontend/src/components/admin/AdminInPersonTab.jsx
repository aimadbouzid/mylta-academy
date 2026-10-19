import { useState, useEffect, useCallback } from 'react'
import { Users, Plus, Trash2, Save, MessageCircle, Pencil, X, QrCode, KeyRound, Download, ChevronDown } from 'lucide-react'
import QRCode from 'qrcode'
import AdminContestPanel from './AdminContestPanel'
import AdminExpressPanel from './AdminExpressPanel'
import api from '../../api/axios'
import { useToast } from '../../hooks/useToast.jsx'

const STATUS = {
  PENDING: { label: 'Acompte en attente', cls: 'bg-amber-500/20 text-amber-400' },
  CONFIRMED: { label: 'Acompte reçu', cls: 'bg-emerald-500/20 text-emerald-400' },
  CANCELLED: { label: 'Annulé', cls: 'bg-red-500/20 text-red-400' },
}
const EMPTY_SESSION = { title: '', date: '', startTime: '09:00', endTime: '17:00', city: '', place: '', capacity: 10, price: 0, isOpen: true }

const input = 'w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none text-sm'
const panel = 'bg-neutral-900/50 border border-white/5 rounded-2xl p-4 sm:p-6'
const label = 'text-xs font-bold text-neutral-400 mb-1.5 block'

const waLink = (r, extra = '') => {
  let num = r.phone.replace(/\D/g, '')
  if (num.startsWith('0')) num = '213' + num.slice(1)
  return `https://wa.me/${num}?text=${encodeURIComponent(`Bonjour ${r.fullName}, c'est Mylta Academy à propos du coaching présentiel${extra}.`)}`
}
const fmtDate = (s) => new Date(`${s}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

// Section repliable : garde la page courte sur téléphone, l'essentiel reste ouvert.
export function Fold({ title, children, defaultOpen = false }) {
  return (
    <details open={defaultOpen} className="group bg-neutral-900/50 border border-white/5 rounded-2xl">
      <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none flex items-center justify-between gap-3 px-4 sm:px-6 py-4 font-bold">
        {title}
        <ChevronDown size={18} className="shrink-0 text-neutral-500 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 sm:px-6 pb-5 space-y-4">{children}</div>
    </details>
  )
}

function ListEditor({ title, items, onChange, placeholder }) {
  return (
    <div>
      <p className={label}>{title}</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input className={input} value={item} placeholder={placeholder} onChange={e => onChange(items.map((x, j) => j === i ? e.target.value : x))} />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="px-3 rounded-xl text-red-400 hover:bg-red-500/10"><Trash2 size={15} /></button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...items, ''])} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15">
          <Plus size={14} /> Ajouter une ligne
        </button>
      </div>
    </div>
  )
}

export default function AdminInPersonTab() {
  const { success: toastSuccess, error: toastError } = useToast()
  const [cfg, setCfg] = useState(null)
  const [sessions, setSessions] = useState([])
  const [waitlist, setWaitlist] = useState([])
  const [form, setForm] = useState(EMPTY_SESSION)
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/in-person')
      setSessions(data.sessions)
      setWaitlist(data.waitlist)
    } catch {
      toastError('Erreur lors du chargement des sessions.')
    }
  }, [toastError])

  useEffect(() => {
    api.get('/admin/config').then(({ data }) => {
      setCfg(data.inPerson)
      setForm(f => ({ ...f, price: data.inPerson.price ?? f.price }))
    }).catch(() => toastError('Erreur lors du chargement des réglages.'))
    loadData()
  }, [loadData, toastError])

  const saveTexts = async () => {
    setBusy(true)
    try {
      const inPerson = {
        ...cfg,
        price: Math.max(0, parseInt(cfg.price, 10) || 0),
        deposit: Math.max(0, parseInt(cfg.deposit, 10) || 0),
        studentPrice: Math.max(0, parseInt(cfg.studentPrice, 10) || 0),
        oldPrice: Math.max(0, parseInt(cfg.oldPrice, 10) || 0),
        program: cfg.program.filter(p => p.trim()),
        infos: cfg.infos.filter(p => p.trim()),
      }
      const { data } = await api.put('/admin/config', { inPerson })
      setCfg(data.config.inPerson)
      window.dispatchEvent(new Event('configUpdated'))
      toastSuccess('Page présentiel enregistrée.')
    } catch (err) {
      toastError(err.response?.data?.error || "Erreur lors de l'enregistrement.")
    } finally {
      setBusy(false)
    }
  }

  const toggleEnabled = async (enabled) => {
    try {
      const { data } = await api.put('/admin/config', { inPerson: { enabled } })
      setCfg(c => ({ ...c, enabled: data.config.inPerson.enabled }))
      window.dispatchEvent(new Event('configUpdated'))
    } catch { toastError('Erreur lors de la modification.') }
  }

  const saveSession = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = { ...form, capacity: Number(form.capacity), price: Number(form.price) || 0 }
      if (editingId) await api.put(`/admin/in-person/sessions/${editingId}`, payload)
      else await api.post('/admin/in-person/sessions', payload)
      toastSuccess(editingId ? 'Session modifiée.' : 'Session créée.')
      setForm({ ...EMPTY_SESSION, price: cfg.price ?? 0 })
      setEditingId(null)
      loadData()
    } catch (err) {
      toastError(err.response?.data?.error || "Erreur lors de l'enregistrement de la session.")
    } finally {
      setBusy(false)
    }
  }

  const editSession = (s) => {
    setEditingId(s.id)
    setForm({ title: s.title, date: s.date, startTime: s.startTime, endTime: s.endTime, city: s.city, place: s.place, capacity: s.capacity, price: s.price, isOpen: s.isOpen })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleOpen = async (s) => {
    try {
      await api.put(`/admin/in-person/sessions/${s.id}`, { isOpen: !s.isOpen })
      loadData()
    } catch { toastError('Erreur lors de la modification.') }
  }

  const deleteSession = async (s) => {
    if (!window.confirm('Supprimer cette session ? Ses inscrits passeront en liste d\'attente.')) return
    try {
      await api.delete(`/admin/in-person/sessions/${s.id}`)
      loadData()
    } catch { toastError('Erreur lors de la suppression.') }
  }

  const updateRegistration = async (id, data) => {
    try {
      await api.put(`/admin/in-person/registrations/${id}`, data)
      loadData()
    } catch { toastError('Erreur lors de la modification.') }
  }

  const deleteRegistration = async (id) => {
    if (!window.confirm('Supprimer définitivement cette inscription ?')) return
    try {
      await api.delete(`/admin/in-person/registrations/${id}`)
      loadData()
    } catch { toastError('Erreur lors de la suppression.') }
  }

  // ── QR d'inscription sur place + comptes des participants ──
  const [qrImage, setQrImage] = useState('')
  const [created, setCreated] = useState(null) // { r, login, password } : affiché une seule fois
  const joinUrl = cfg?.joinCode ? `${window.location.origin}/rejoindre?code=${cfg.joinCode}` : ''
  useEffect(() => {
    if (!joinUrl) { setQrImage(''); return }
    QRCode.toDataURL(joinUrl, { width: 512, margin: 2 }).then(setQrImage).catch(() => setQrImage(''))
  }, [joinUrl])

  const setJoinCode = async (disable) => {
    if (!disable && cfg.joinCode && !window.confirm("Générer un nouveau QR ? L'ancien ne marchera plus.")) return
    try {
      const { data } = await api.post('/admin/in-person/join-code', { disable })
      setCfg(c => ({ ...c, joinCode: data.joinCode }))
      toastSuccess(disable ? 'QR code désactivé.' : 'Nouveau QR code prêt.')
    } catch { toastError('Erreur lors de la génération du QR code.') }
  }

  const createAccount = async (r, reset = false) => {
    try {
      const { data } = await api.post(`/admin/in-person/registrations/${r.id}/account${reset ? '?reset=1' : ''}`)
      setCreated({ r, ...data.account })
    } catch (err) {
      if (err.response?.data?.exists && window.confirm(`${r.fullName} a déjà un compte. Générer un nouveau mot de passe ?`)) return createAccount(r, true)
      if (!err.response?.data?.exists) toastError(err.response?.data?.error || 'Erreur lors de la création du compte.')
    }
  }

  const activeCount = (s) => s.registrations.filter(r => r.status !== 'CANCELLED').length

  if (!cfg) return <div className="p-8 text-center text-neutral-400">Chargement...</div>

  const RegistrationRow = ({ r, extra }) => (
    <div className="flex flex-wrap items-center gap-3 py-2.5 border-t border-white/5 text-sm">
      <div className="flex-1 min-w-[180px]">
        <span className="font-bold text-white">{r.fullName}</span>
        <span className="text-neutral-400"> · {r.phone}{r.city ? ` · ${r.city}` : ''}</span>
        {r.isStudent && <span className="ml-2 text-[11px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">🎓 Étudiant</span>}
        {r.studentCard && <a href={r.studentCard} target="_blank" rel="noopener noreferrer" className="ml-2 text-[11px] font-bold text-sky-300 underline">Voir la carte</a>}
        {r.profile && <div className="text-xs text-neutral-400 mt-0.5">{r.profile}</div>}
        {r.message && <div className="text-xs text-neutral-500 mt-0.5">{r.message}</div>}
      </div>
      {extra}
      <button onClick={() => createAccount(r)} title="Créer son accès à la plateforme" className="px-2 py-1 rounded-lg text-[11px] font-bold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 inline-flex items-center gap-1"><KeyRound size={13} /> Accès (identifiant + mot de passe)</button>
      <select value={r.status} onChange={e => updateRegistration(r.id, { status: e.target.value })}
              className={`rounded-full px-2 py-1 text-[11px] font-bold border-0 outline-none ${STATUS[r.status]?.cls}`}>
        {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k} className="bg-neutral-900 text-white">{v.label}</option>)}
      </select>
      <a href={waLink(r)} target="_blank" rel="noopener noreferrer" title="Écrire sur WhatsApp" className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10"><MessageCircle size={16} /></a>
      <button onClick={() => deleteRegistration(r.id)} title="Supprimer" className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><Trash2 size={16} /></button>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-white mb-1 flex items-center gap-3"><Users className="text-amber-400" /> Coaching présentiel</h2>
          <p className="text-neutral-400 text-sm">Créez vos sessions quand vous avez la date. En attendant, les visiteurs s'inscrivent en liste d'attente.</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
          <input type="checkbox" checked={cfg.enabled} onChange={e => toggleEnabled(e.target.checked)} className="w-4 h-4" />
          Section visible sur le site
        </label>
      </div>

      <AdminExpressPanel />

      {created && (
        <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm space-y-2">
          <div className="flex justify-between items-start gap-3">
            <p className="font-bold text-white">{created.reset ? 'Nouveau mot de passe pour' : 'Compte créé pour'} {created.r.fullName} — notez-le, il ne sera plus affiché.</p>
            <button onClick={() => setCreated(null)} className="text-neutral-400 hover:text-white"><X size={16} /></button>
          </div>
          <p>Identifiant : <b className="font-mono text-white">{created.login}</b> · Mot de passe : <b className="font-mono text-white">{created.password}</b></p>
          <a href={waLink(created.r, `. Voici votre accès à la plateforme ${window.location.origin} — identifiant : ${created.login}, mot de passe : ${created.password}`)}
             target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] text-white font-bold"><MessageCircle size={15} /> Lui envoyer sur WhatsApp</a>
        </div>
      )}

      {/* Sessions */}
      <Fold key={editingId || 'new'} defaultOpen={!!editingId} title={editingId ? 'Modifier la session' : '+ Ajouter une session'}>
      <form onSubmit={saveSession} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">{editingId ? 'Modifier la session' : 'Nouvelle session'}</h3>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ ...EMPTY_SESSION, price: cfg.price ?? 0 }) }} className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-white">
              <X size={14} /> Annuler la modification
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="col-span-2"><label className={label}>Titre (facultatif)</label><input className={input} placeholder="Ex : Formation IA — Alger" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div className="col-span-2 sm:col-span-1"><label className={label}>Date *</label><input type="date" required className={input} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          <div className="col-span-1"><label className={label}>Places max *</label><input type="number" min="1" required className={input} value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} /></div>
          <div><label className={label}>Début</label><input type="time" className={input} value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></div>
          <div><label className={label}>Fin</label><input type="time" className={input} value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></div>
          <div><label className={label}>Ville</label><input className={input} placeholder="Alger" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
          <div><label className={label}>Prix (DA)</label><input type="number" min="0" className={input} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
          <div className="col-span-2 sm:col-span-4"><label className={label}>Lieu / adresse</label><input className={input} placeholder="Nom de la salle, adresse" value={form.place} onChange={e => setForm({ ...form, place: e.target.value })} /></div>
        </div>
        <button type="submit" disabled={busy} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-colors disabled:opacity-60">
          <Save size={16} /> {editingId ? 'Enregistrer la session' : 'Créer la session'}
        </button>
      </form>
      </Fold>

      <div className="space-y-4">
        {sessions.length === 0 && <div className={`${panel} text-center text-neutral-500`}>Aucune session pour le moment.</div>}
        {sessions.map(s => (
          <div key={s.id} className={panel}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold text-white">{fmtDate(s.date)}{s.startTime ? ` · ${s.startTime}${s.endTime ? `–${s.endTime}` : ''}` : ''}</p>
                <p className="text-sm text-neutral-400">{[s.title, s.place, s.city].filter(Boolean).join(' · ') || 'Lieu à préciser'}{s.price > 0 ? ` · ${s.price.toLocaleString('fr-FR')} DA` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${activeCount(s) >= s.capacity ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'}`}>
                  {activeCount(s)} / {s.capacity} places
                </span>
                <button onClick={() => toggleOpen(s)} className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${s.isOpen ? 'border-emerald-500/50 text-emerald-400' : 'border-neutral-500/50 text-neutral-400'}`}>
                  {s.isOpen ? 'Inscriptions ouvertes' : 'Inscriptions fermées'}
                </button>
                <button onClick={() => editSession(s)} title="Modifier" className="p-2 rounded-lg text-neutral-300 hover:bg-white/10"><Pencil size={16} /></button>
                <button onClick={() => deleteSession(s)} title="Supprimer" className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><Trash2 size={16} /></button>
              </div>
            </div>
            {s.registrations.length > 0 && (
              <div className="mt-3">
                {s.registrations.map(r => <RegistrationRow key={r.id} r={r} />)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Liste d'attente */}
      <div className={panel}>
        <h3 className="font-bold mb-1">Liste d'attente ({waitlist.length})</h3>
        <p className="text-xs text-neutral-500 mb-2">Personnes à prévenir dès qu'une date est fixée. Vous pouvez les placer dans une session.</p>
        {waitlist.length === 0 ? (
          <p className="text-sm text-neutral-500 py-2">Personne pour le moment.</p>
        ) : waitlist.map(r => (
          <RegistrationRow key={r.id} r={r} extra={sessions.length > 0 && (
            <select value="" onChange={e => e.target.value && updateRegistration(r.id, { sessionId: Number(e.target.value) })}
                    className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white">
              <option value="">Placer dans…</option>
              {sessions.map(s => <option key={s.id} value={s.id}>{fmtDate(s.date)}{s.city ? ` · ${s.city}` : ''}</option>)}
            </select>
          )} />
        ))}
      </div>

      {/* QR code d'inscription sur place */}
      <Fold title={<span className="flex items-center gap-2"><QrCode size={18} /> QR code d'inscription sur place</span>}>
        <p className="text-sm text-neutral-400">Montrez ce QR aux participants : en le scannant, ils entrent leur nom et leur téléphone et reçoivent tout de suite leur identifiant et mot de passe. Sans ce QR, personne ne peut créer de compte par ce moyen. Générez-en un nouveau après chaque session.</p>
        {qrImage ? (
          <div className="flex flex-wrap items-start gap-4">
            <img src={qrImage} alt="QR code d'inscription" className="w-40 h-40 rounded-xl bg-white p-1" />
            <div className="space-y-2 text-sm">
              <a href={qrImage} download="qr-inscription-mylta.png" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 font-bold"><Download size={15} /> Télécharger</a>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setJoinCode(false)} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 font-bold">Nouveau QR</button>
                <button onClick={() => setJoinCode(true)} className="px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 font-bold">Désactiver</button>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => setJoinCode(false)} className="px-4 py-2.5 rounded-lg bg-white text-black font-bold inline-flex items-center gap-2"><QrCode size={16} /> Générer le QR code</button>
        )}
      </Fold>

      {/* Textes de la page */}
      <Fold title="Textes, prix et options">
        <div><label className={label}>Titre</label><input className={input} value={cfg.title} onChange={e => setCfg({ ...cfg, title: e.target.value })} /></div>
        <div><label className={label}>Sous-titre</label><textarea className={input} rows={2} value={cfg.subtitle} onChange={e => setCfg({ ...cfg, subtitle: e.target.value })} /></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
          <div><label className={label}>Prix barré (0 = aucun)</label><input type="number" min="0" className={input} value={cfg.oldPrice ?? 0} onChange={e => setCfg({ ...cfg, oldPrice: e.target.value })} /></div>
          <div><label className={label}>Prix de la formation (DA)</label><input type="number" min="0" className={input} value={cfg.price ?? 0} onChange={e => setCfg({ ...cfg, price: e.target.value })} /></div>
          <div><label className={label}>Tarif étudiant (0 = aucun)</label><input type="number" min="0" className={input} value={cfg.studentPrice ?? 0} onChange={e => setCfg({ ...cfg, studentPrice: e.target.value })} /></div>
          <div><label className={label}>Acompte pour réserver (DA)</label><input type="number" min="0" className={input} value={cfg.deposit ?? 0} onChange={e => setCfg({ ...cfg, deposit: e.target.value })} /></div>
        </div>
        <div><label className={label}>Message sur les dates (vide = aucun)</label><textarea className={input} rows={2} value={cfg.datesNotice || ''} onChange={e => setCfg({ ...cfg, datesNotice: e.target.value })} /></div>
        <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
          <input type="checkbox" checked={!!cfg.showSeats} onChange={e => setCfg({ ...cfg, showSeats: e.target.checked })} className="w-4 h-4" />
          Afficher le nombre de places restantes (« il reste 7 places »)
        </label>
        <p className="text-xs text-neutral-500 -mt-2">Le prix d'une session, s'il est renseigné, remplace ce prix par défaut. Pensez à indiquer « Acompte reçu » quand un inscrit vous envoie son reçu.</p>
        <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
          <input type="checkbox" checked={cfg.recapEnabled !== false} onChange={e => setCfg({ ...cfg, recapEnabled: e.target.checked })} className="w-4 h-4" />
          Rappeler programme, date et lieu après le choix de la date
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className={label}>Lieu de la formation</label><input className={input} value={cfg.venue || ''} onChange={e => setCfg({ ...cfg, venue: e.target.value })} /></div>
          <div><label className={label}>Adresse du lieu</label><input className={input} value={cfg.venueAddress || ''} onChange={e => setCfg({ ...cfg, venueAddress: e.target.value })} /></div>
        </div>
        <ListEditor title="Ce que vous allez apprendre (programme)" items={cfg.program} placeholder="Un point du programme" onChange={program => setCfg({ ...cfg, program })} />
        <ListEditor title="Bon à savoir" items={cfg.infos} placeholder="Une information pratique" onChange={infos => setCfg({ ...cfg, infos })} />
        <button type="button" onClick={saveTexts} disabled={busy} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-colors disabled:opacity-60">
          <Save size={16} /> Enregistrer la page
        </button>
      </Fold>

      <AdminContestPanel />
    </div>
  )
}
