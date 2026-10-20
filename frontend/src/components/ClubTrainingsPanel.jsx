import { useCallback, useEffect, useState } from 'react'
import { GraduationCap, Pencil, Plus, Trash2, X } from 'lucide-react'
import api from '../api/axios'
import { TRAINING_TEMPLATES } from './clubTemplates'

// Les séances proposées sur la page du club. Elles étaient écrites dans le
// code : les organisateurs les modifient maintenant eux-mêmes, en ajoutent,
// et ferment celles qui sont passées sans perdre les inscrits.

const EMPTY = { title: '', text: '', date: '', active: true }

export default function ClubTrainingsPanel({ auth }) {
  const [trainings, setTrainings] = useState([])
  const [form, setForm] = useState(null)
  const [editId, setEditId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/club/trainings-admin', auth)
      setTrainings(data.trainings || [])
    } catch {
      setError('Chargement des formations impossible.')
    }
  }, [auth])

  useEffect(() => { load() }, [load])

  const openNew = () => { setForm({ ...EMPTY }); setEditId(null); setError(''); setNote('') }
  const openEdit = (t) => {
    setForm({ title: t.title, text: t.text, date: t.date, active: t.active })
    setEditId(t.id); setError(''); setNote('')
  }
  const close = () => { setForm(null); setEditId(null) }

  const save = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (editId) await api.patch(`/club/trainings-admin/${editId}`, form, auth)
      else await api.post('/club/trainings-admin', form, auth)
      close()
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Enregistrement impossible.')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (t) => {
    try {
      await api.patch(`/club/trainings-admin/${t.id}`, { active: !t.active }, auth)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Modification impossible.')
    }
  }

  const remove = async (t) => {
    if (!window.confirm(`Supprimer « ${t.title} » ?`)) return
    setError(''); setNote('')
    try {
      const { data } = await api.delete(`/club/trainings-admin/${t.id}`, auth)
      // Une formation qui a des inscrits se ferme au lieu de disparaître.
      if (data.kept) setNote(`« ${t.title} » a ${data.registered} inscrit(s) : elle a été fermée, pas supprimée, pour ne pas perdre leurs inscriptions.`)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Suppression impossible.')
    }
  }

  const input = 'w-full rounded-xl border border-academy-border bg-white dark:bg-academy-surfaceDark px-3 py-2.5 text-[14px] outline-none focus:border-academy-primary'
  const label = 'text-[12px] font-bold text-academy-textMain/60 mb-1 block'

  return (
    <section className="mt-4 rounded-2xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display font-black text-[17px]">Formations du club</h2>
          <p className="text-[13px] text-academy-textMain/60">Ce que la page du club propose à l&apos;inscription.</p>
        </div>
        <button type="button" onClick={openNew}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-academy-primary text-white px-3.5 py-2.5 text-[13px] font-bold">
          <Plus size={15} /> Ajouter
        </button>
      </div>

      {error && <p className="mt-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[13px] font-semibold text-red-700">{error}</p>}
      {note && <p className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-[13px] font-semibold text-amber-800">{note}</p>}

      {form && (
        <form onSubmit={save} className="mt-4 rounded-xl border-2 border-academy-primary/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-[15px]">{editId ? 'Modifier la formation' : 'Nouvelle formation'}</p>
            <button type="button" onClick={close} aria-label="Fermer" className="rounded-lg p-1.5 hover:bg-academy-textMain/5"><X size={16} /></button>
          </div>
          {!editId && (
            <div>
              <label className={label}>Partir d&apos;un sujet</label>
              <div className="flex flex-wrap gap-1.5">
                {TRAINING_TEMPLATES.map(t => (
                  <button type="button" key={t.id} onClick={() => setForm(f => ({ ...f, title: t.title, text: t.text }))}
                          className="rounded-full border border-academy-border px-3 py-1.5 text-[13px] font-semibold hover:border-academy-primary hover:text-academy-primary transition-colors">
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className={label}>Titre</label>
            <input className={input} required minLength={3} maxLength={100} value={form.title}
                   onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Vibe Coding" />
          </div>
          <div>
            <label className={label}>Description</label>
            <textarea className={input} rows={3} maxLength={500} value={form.text}
                      onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                      placeholder="Ce que l'étudiant va apprendre, en deux ou trois phrases." />
          </div>
          <div>
            <label className={label}>Date affichée (vide = « date bientôt annoncée »)</label>
            <input className={input} maxLength={60} value={form.date}
                   onChange={e => setForm(f => ({ ...f, date: e.target.value }))} placeholder="Samedi 7 novembre, 14h" />
          </div>
          <label className="flex items-center gap-2.5 text-[14px] font-bold cursor-pointer">
            <input type="checkbox" className="h-4 w-4 accent-academy-primary" checked={form.active}
                   onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
            Ouverte aux inscriptions
          </label>
          <button type="submit" disabled={busy}
                  className="w-full rounded-xl bg-academy-primary text-white py-3 text-[14px] font-black disabled:opacity-50">
            {busy ? 'Enregistrement…' : editId ? 'Enregistrer' : 'Ajouter la formation'}
          </button>
        </form>
      )}

      {trainings.length === 0 && !form && (
        <p className="mt-4 flex items-center gap-2 text-[14px] text-academy-textMain/60">
          <GraduationCap size={16} /> Aucune formation pour l&apos;instant.
        </p>
      )}

      {trainings.length > 0 && (
        <ul className="mt-4 space-y-2">
          {trainings.map(t => (
            <li key={t.id} className={`rounded-xl border p-3 ${t.active ? 'border-academy-border' : 'border-academy-border bg-academy-surface/60 opacity-70'}`}>
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-[15px] leading-tight">{t.title}</span>
                {!t.active && <span className="rounded-full bg-academy-textMain/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-academy-textMain/60">Fermée</span>}
              </p>
              {t.text && <p className="mt-0.5 text-[13px] text-academy-textMain/60 leading-snug line-clamp-2">{t.text}</p>}
              <p className="mt-1 text-[13px]">
                <span className="font-semibold">{t.registered} inscrit{t.registered > 1 ? 's' : ''}</span>
                <span className="text-academy-textMain/60"> · {t.date || 'date bientôt annoncée'}</span>
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button type="button" onClick={() => openEdit(t)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-academy-border px-3 py-1.5 text-[13px] font-bold"><Pencil size={13} /> Modifier</button>
                <button type="button" onClick={() => toggle(t)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-academy-border px-3 py-1.5 text-[13px] font-bold">
                  {t.active ? 'Fermer les inscriptions' : 'Rouvrir'}
                </button>
                <button type="button" onClick={() => remove(t)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 text-red-700 px-3 py-1.5 text-[13px] font-bold"><Trash2 size={13} /> Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
