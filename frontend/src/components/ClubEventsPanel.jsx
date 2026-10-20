import { useCallback, useEffect, useState } from 'react'
import { CalendarPlus, Check, Image as ImageIcon, Pencil, Plus, Trash2, Users, X } from 'lucide-react'
import api from '../api/axios'
import { EVENT_TEMPLATES } from './clubTemplates'

// Événements du club, tenus par les organisateurs : open day, atelier,
// rencontre. Chacun porte son affiche, son déroulé heure par heure et ses
// inscriptions, avec le même billet scannable que les trois formations.

const EMPTY = {
  title: '', summary: '', date: '', startTime: '', endTime: '',
  place: '', kind: 'open-day', capacity: 0, published: false, programme: [], poster: undefined,
}

// Ce que le club organise, du plus courant au plus rare.
const KINDS = [
  ['open-day', 'Open day'],
  ['seminaire', 'Séminaire'],
  ['conference', 'Conférence'],
  ['atelier', 'Atelier'],
  ['formation', 'Formation'],
  ['autre', 'Autre'],
]
const kindLabel = (k) => (KINDS.find(([v]) => v === k) || KINDS[0])[1]

const longDate = (iso) => {
  if (!iso) return ''
  const d = new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  return d.charAt(0).toUpperCase() + d.slice(1)
}

export default function ClubEventsPanel({ auth, compress }) {
  const [events, setEvents] = useState([])
  const [form, setForm] = useState(null) // null = aucun formulaire ouvert
  const [editId, setEditId] = useState(null)
  const [posterPreview, setPosterPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [seen, setSeen] = useState(null) // inscriptions ouvertes

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/club/events-admin/all', auth)
      setEvents(data.events || [])
    } catch {
      setError('Chargement des événements impossible.')
    }
  }, [auth])

  useEffect(() => { load() }, [load])

  const openNew = () => { setForm({ ...EMPTY }); setEditId(null); setPosterPreview(''); setError('') }
  const useTemplate = (t) => setForm(f => ({
    ...(f || EMPTY),
    kind: t.kind, title: t.title, summary: t.summary,
    startTime: t.startTime, endTime: t.endTime,
    programme: t.programme.map(p => ({ ...p })),
  }))
  const openEdit = (ev) => {
    setForm({
      title: ev.title, summary: ev.summary, date: ev.date, startTime: ev.startTime,
      endTime: ev.endTime, place: ev.place, kind: ev.kind || 'open-day', capacity: ev.capacity,
      published: ev.published, programme: ev.programme || [], poster: undefined,
    })
    setEditId(ev.id)
    setPosterPreview(ev.poster || '')
    setError('')
  }
  const close = () => { setForm(null); setEditId(null); setPosterPreview('') }

  const pickPoster = async (file) => {
    if (!file) return
    try {
      const dataUrl = await compress(file, 1000)
      setForm(f => ({ ...f, poster: dataUrl }))
      setPosterPreview(dataUrl)
    } catch {
      setError('Affiche illisible. Essayez une autre image.')
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity) || 0,
        programme: form.programme.filter(p => p.label.trim()),
      }
      if (payload.poster === undefined) delete payload.poster
      if (editId) await api.patch(`/club/events-admin/${editId}`, payload, auth)
      else await api.post('/club/events-admin', payload, auth)
      close()
      load()
    } catch (err) {
      setError(err.response?.data?.error || "Enregistrement impossible.")
    } finally {
      setBusy(false)
    }
  }

  const remove = async (ev) => {
    // Supprimer efface aussi les inscrits : on le dit avant, pas après.
    const sure = window.confirm(`Supprimer « ${ev.title} » ?\n\n${ev.registered} inscription(s) seront effacées avec lui.`)
    if (!sure) return
    try {
      await api.delete(`/club/events-admin/${ev.id}`, auth)
      load()
    } catch {
      setError('Suppression impossible.')
    }
  }

  const openRegistrations = async (ev) => {
    try {
      const { data } = await api.get(`/club/events-admin/${ev.id}/registrations`, auth)
      setSeen({ event: ev, ...data })
    } catch {
      setError('Chargement des inscriptions impossible.')
    }
  }

  const input = 'w-full rounded-xl border border-academy-border bg-white dark:bg-academy-surfaceDark px-3 py-2.5 text-[14px] outline-none focus:border-academy-primary'
  const label = 'text-[12px] font-bold text-academy-textMain/60 mb-1 block'

  return (
    <section className="mt-4 rounded-2xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display font-black text-[17px]">Événements</h2>
          <p className="text-[13px] text-academy-textMain/60">Open days, ateliers, rencontres. Publiés sur la page du club.</p>
        </div>
        <button type="button" onClick={openNew}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-academy-primary text-white px-3.5 py-2.5 text-[13px] font-bold">
          <Plus size={15} /> Nouveau
        </button>
      </div>

      {error && <p className="mt-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[13px] font-semibold text-red-700">{error}</p>}

      {form && (
        <form onSubmit={save} className="mt-4 rounded-xl border-2 border-academy-primary/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-[15px]">{editId ? "Modifier l'événement" : 'Nouvel événement'}</p>
            <button type="button" onClick={close} aria-label="Fermer" className="rounded-lg p-1.5 hover:bg-academy-textMain/5"><X size={16} /></button>
          </div>

          {/* Partir d'une page blanche décourage : on propose des formats
              courants, déjà remplis, qu'il reste à ajuster. */}
          {!editId && (
            <div>
              <label className={label}>Partir d&apos;un modèle</label>
              <div className="flex flex-wrap gap-1.5">
                {EVENT_TEMPLATES.map(t => (
                  <button type="button" key={t.id} onClick={() => useTemplate(t)} title={t.hint}
                          className="rounded-full border border-academy-border px-3 py-1.5 text-[13px] font-semibold hover:border-academy-primary hover:text-academy-primary transition-colors">
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[12px] text-academy-textMain/55">
                Le modèle remplit le titre, le résumé, les horaires et le programme. Tout reste modifiable.
              </p>
            </div>
          )}

          <div>
            <label className={label}>Titre</label>
            <input className={input} required minLength={3} maxLength={100} value={form.title}
                   onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Open Day Intelligence Artificielle" />
          </div>

          <div>
            <label className={label}>Résumé (une ou deux phrases)</label>
            <textarea className={input} rows={2} maxLength={300} value={form.summary}
                      onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={label}>Date</label>
              <input className={input} required type="date" value={form.date}
                     onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className={label}>Début</label>
              <input className={input} type="time" value={form.startTime}
                     onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
            </div>
            <div>
              <label className={label}>Fin</label>
              <input className={input} type="time" value={form.endTime}
                     onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className={label}>Nature</label>
            <select className={input} value={form.kind} onChange={e => setForm(f => ({ ...f, kind: e.target.value }))}>
              {KINDS.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>Lieu</label>
              <input className={input} maxLength={120} value={form.place}
                     onChange={e => setForm(f => ({ ...f, place: e.target.value }))} placeholder="Amphi 3, Targa Ouzemmour" />
            </div>
            <div>
              <label className={label}>Places (0 = sans limite)</label>
              <input className={input} type="number" min="0" max="5000" value={form.capacity}
                     onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className={label}>Affiche</label>
            <label className="flex items-center gap-3 rounded-xl border border-dashed border-academy-border p-3 cursor-pointer">
              {posterPreview
                ? <img src={posterPreview} alt="" className="h-14 w-20 rounded-lg object-cover" />
                : <span className="flex h-14 w-20 items-center justify-center rounded-lg bg-academy-textMain/5"><ImageIcon size={18} /></span>}
              <span className="text-[13px] font-semibold">{posterPreview ? "Changer l'affiche" : 'Ajouter une affiche'}</span>
              <input type="file" accept="image/*" className="hidden"
                     onChange={e => pickPoster(e.target.files?.[0])} />
            </label>
          </div>

          <div>
            <label className={label}>Programme de la journée</label>
            <div className="space-y-2">
              {form.programme.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input className={`${input} w-24 shrink-0`} type="time" value={item.time}
                         onChange={e => setForm(f => ({ ...f, programme: f.programme.map((p, j) => j === i ? { ...p, time: e.target.value } : p) }))} />
                  <input className={input} maxLength={120} value={item.label} placeholder="Accueil des participants"
                         onChange={e => setForm(f => ({ ...f, programme: f.programme.map((p, j) => j === i ? { ...p, label: e.target.value } : p) }))} />
                  <button type="button" aria-label="Retirer la ligne"
                          onClick={() => setForm(f => ({ ...f, programme: f.programme.filter((_, j) => j !== i) }))}
                          className="shrink-0 rounded-lg border border-academy-border px-2.5"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, programme: [...f.programme, { time: '', label: '' }] }))}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-academy-border px-3 py-1.5 text-[13px] font-bold">
              <Plus size={14} /> Ajouter une étape
            </button>
          </div>

          <label className="flex items-center gap-2.5 text-[14px] font-bold cursor-pointer">
            <input type="checkbox" className="h-4 w-4 accent-academy-primary" checked={form.published}
                   onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
            Publier sur la page du club
          </label>

          <button type="submit" disabled={busy}
                  className="w-full rounded-xl bg-academy-primary text-white py-3 text-[14px] font-black disabled:opacity-50">
            {busy ? 'Enregistrement…' : editId ? 'Enregistrer les modifications' : "Créer l'événement"}
          </button>
        </form>
      )}

      {events.length === 0 && !form && (
        <p className="mt-4 flex items-center gap-2 text-[14px] text-academy-textMain/60">
          <CalendarPlus size={16} /> Aucun événement pour l&apos;instant.
        </p>
      )}

      {events.length > 0 && (
        <ul className="mt-4 space-y-2">
          {events.map(ev => (
            <li key={ev.id} className="rounded-xl border border-academy-border p-3">
              <div className="flex items-start gap-3">
                {ev.poster
                  ? <img src={ev.poster} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                  : <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-academy-textMain/5 text-[11px] font-bold text-academy-textMain/40">Sans affiche</span>}
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[15px] leading-tight">{ev.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${ev.published ? 'bg-green-100 text-green-700' : 'bg-academy-textMain/10 text-academy-textMain/60'}`}>
                      {ev.published ? 'Publié' : 'Brouillon'}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[13px] text-academy-textMain/60">
                    {kindLabel(ev.kind)} · {longDate(ev.date)}{ev.startTime ? ` · ${ev.startTime.replace(':', 'h')}` : ''}{ev.place ? ` · ${ev.place}` : ''}
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold">
                    {ev.registered} inscrit{ev.registered > 1 ? 's' : ''}
                    {ev.seatsLeft !== null && <span className="font-normal text-academy-textMain/60"> · {ev.seatsLeft} place{ev.seatsLeft > 1 ? 's' : ''} restante{ev.seatsLeft > 1 ? 's' : ''}</span>}
                  </p>
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button type="button" onClick={() => openEdit(ev)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-academy-border px-3 py-1.5 text-[13px] font-bold"><Pencil size={13} /> Modifier</button>
                <button type="button" onClick={() => openRegistrations(ev)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-academy-border px-3 py-1.5 text-[13px] font-bold"><Users size={13} /> Inscrits</button>
                <button type="button" onClick={() => remove(ev)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 text-red-700 px-3 py-1.5 text-[13px] font-bold"><Trash2 size={13} /> Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {seen && (
        <div className="mt-4 rounded-xl border border-academy-border p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-[15px]">{seen.event.title} — {seen.total} inscrit{seen.total > 1 ? 's' : ''}, {seen.present} présent{seen.present > 1 ? 's' : ''}</p>
            <button type="button" onClick={() => setSeen(null)} aria-label="Fermer" className="rounded-lg p-1.5 hover:bg-academy-textMain/5"><X size={16} /></button>
          </div>
          {seen.registrations.length === 0 ? (
            <p className="mt-2 text-[13px] text-academy-textMain/60">Personne pour l&apos;instant.</p>
          ) : (
            <ul className="mt-2 divide-y divide-academy-border">
              {seen.registrations.map(r => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0">
                    <span className="block font-semibold text-[14px] truncate">{r.firstName} {r.lastName}</span>
                    <a href={`tel:${r.phone}`} className="block text-[13px] tabular-nums text-academy-textMain/60">{r.phone}</a>
                  </span>
                  {r.checkedInAt && <span className="shrink-0 inline-flex items-center gap-1 text-[12px] font-bold text-green-700"><Check size={13} /> Présent</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
