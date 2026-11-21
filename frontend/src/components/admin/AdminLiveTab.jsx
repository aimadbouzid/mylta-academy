import { useCallback, useEffect, useState } from 'react'
import { Radio, Plus, Play, Square, QrCode, Monitor, Trophy, X, Copy } from 'lucide-react'
import QRCode from 'qrcode'
import api from '../../api/axios'
import { useToast } from '../../hooks/useToast.jsx'

// MYLTA LIVE — conférences interactives. L'organisateur crée une session,
// ajoute ses questions/votes, lance la session (le QR devient scannable),
// et suit les réponses en direct. Le participant n'a pas de compte : il
// scanne, entre son nom, répond. Le grand écran utilise son propre jeton,
// jamais la session admin (voir backend/routes/live.js).

const statusLabel = { draft: 'Brouillon', live: 'En direct', ended: 'Terminée' }
const statusColor = { draft: 'bg-academy-textMain/10 text-academy-textMain/60', live: 'bg-green-100 text-green-700', ended: 'bg-academy-textMain/10 text-academy-textMain/40' }

export default function AdminLiveTab() {
  const { success: toastSuccess, error: toastError } = useToast()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)
  const [active, setActive] = useState(null) // session détaillée ouverte
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [displayToken, setDisplayToken] = useState(null)
  const [qField, setQField] = useState(null) // formulaire nouvelle question

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/live/sessions')
      setSessions(data.sessions || [])
    } catch {
      toastError('Chargement des sessions impossible.')
    } finally {
      setLoading(false)
    }
  }, [toastError])

  useEffect(() => { load() }, [load])

  const openDetail = async (id) => {
    try {
      const { data } = await api.get(`/admin/live/sessions/${id}`)
      setActive(data.session)
      const joinUrl = `${window.location.origin}/live/${id}`
      setQrDataUrl(await QRCode.toDataURL(joinUrl, { width: 240, margin: 1 }))
      const { data: dt } = await api.get(`/admin/live/sessions/${id}/display-token`)
      setDisplayToken(dt.token)
    } catch {
      toastError('Session introuvable.')
    }
  }

  const create = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post('/admin/live/sessions', form)
      setForm(null)
      toastSuccess('Session créée.')
      load()
    } catch (err) {
      toastError(err.response?.data?.error || 'Création impossible.')
    } finally {
      setBusy(false)
    }
  }

  const setStatus = async (status) => {
    try {
      const { data } = await api.patch(`/admin/live/sessions/${active.id}/status`, { status })
      setActive(a => ({ ...a, status: data.session.status }))
      load()
    } catch {
      toastError('Changement de statut impossible.')
    }
  }

  const addQuestion = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = { ...qField, options: (qField.optionsText || '').split(',').map(s => s.trim()).filter(Boolean) }
      delete payload.optionsText
      const { data } = await api.post(`/admin/live/sessions/${active.id}/questions`, payload)
      setActive(a => ({ ...a, questions: [...(a.questions || []), data.question] }))
      setQField(null)
      toastSuccess('Question ajoutée.')
    } catch (err) {
      toastError(err.response?.data?.error || 'Question invalide.')
    } finally {
      setBusy(false)
    }
  }

  const copyLink = (url) => {
    navigator.clipboard?.writeText(url)
    toastSuccess('Lien copié.')
  }

  const input = 'w-full rounded-xl border border-academy-border bg-white dark:bg-academy-surfaceDark px-3 py-2.5 text-[14px] outline-none focus:border-academy-primary'
  const label = 'text-[12px] font-bold text-academy-textMain/60 mb-1 block'

  if (active) {
    const joinUrl = `${window.location.origin}/live/${active.id}`
    const screenUrl = displayToken ? `${window.location.origin}/live/${active.id}/ecran?token=${displayToken}` : ''
    return (
      <section className="mt-4">
        <button onClick={() => setActive(null)} className="mb-3 text-[13px] font-bold text-academy-primary">← Retour aux sessions</button>

        <div className="rounded-2xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display font-black text-[18px]">{active.title}</h2>
              <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusColor[active.status]}`}>{statusLabel[active.status]}</span>
            </div>
            <div className="flex gap-2">
              {active.status !== 'live' && active.status !== 'ended' && (
                <button onClick={() => setStatus('live')} className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 text-white px-3 py-2 text-[13px] font-bold"><Play size={14} /> Lancer</button>
              )}
              {active.status === 'live' && (
                <button onClick={() => setStatus('ended')} className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 text-white px-3 py-2 text-[13px] font-bold"><Square size={14} /> Terminer</button>
              )}
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-academy-border p-3 text-center">
              <p className="text-[12px] font-bold text-academy-textMain/60 mb-2 flex items-center justify-center gap-1.5"><QrCode size={14} /> QR participants</p>
              {qrDataUrl && <img src={qrDataUrl} alt="QR" className="mx-auto rounded-lg" />}
              <button onClick={() => copyLink(joinUrl)} className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-academy-primary"><Copy size={12} /> Copier le lien</button>
            </div>
            <div className="rounded-xl border border-academy-border p-3 text-center flex flex-col items-center justify-center">
              <p className="text-[12px] font-bold text-academy-textMain/60 mb-2 flex items-center justify-center gap-1.5"><Monitor size={14} /> Grand écran</p>
              <p className="text-[13px] text-academy-textMain/60 mb-2">À afficher au vidéoprojecteur</p>
              <button onClick={() => copyLink(screenUrl)} disabled={!displayToken} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-academy-primary disabled:opacity-40"><Copy size={12} /> Copier le lien</button>
            </div>
          </div>

          <p className="mt-4 text-[13px] text-academy-textMain/60 flex items-center gap-1.5">
            <Trophy size={14} /> {active.participants?.length || 0} participant(s)
          </p>

          <div className="mt-5 flex items-center justify-between">
            <h3 className="font-bold text-[15px]">Questions</h3>
            <button onClick={() => setQField({ text: '', type: 'poll', optionsText: '', correctAnswer: '' })}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-academy-primary text-white px-3 py-1.5 text-[13px] font-bold"><Plus size={14} /> Ajouter</button>
          </div>

          {qField && (
            <form onSubmit={addQuestion} className="mt-3 rounded-xl border-2 border-academy-primary/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-[14px]">Nouvelle question</p>
                <button type="button" onClick={() => setQField(null)}><X size={16} /></button>
              </div>
              <div>
                <label className={label}>Question</label>
                <input className={input} required minLength={3} value={qField.text} onChange={e => setQField(f => ({ ...f, text: e.target.value }))} />
              </div>
              <div>
                <label className={label}>Type</label>
                <select className={input} value={qField.type} onChange={e => setQField(f => ({ ...f, type: e.target.value }))}>
                  <option value="poll">Vote (sondage)</option>
                  <option value="quiz">Quiz (bonne réponse)</option>
                  <option value="freeform">Réponse libre</option>
                </select>
              </div>
              {qField.type !== 'freeform' && (
                <div>
                  <label className={label}>Options (séparées par des virgules)</label>
                  <input className={input} placeholder="Oui, Non, Je ne sais pas" value={qField.optionsText} onChange={e => setQField(f => ({ ...f, optionsText: e.target.value }))} />
                </div>
              )}
              {qField.type === 'quiz' && (
                <div>
                  <label className={label}>Bonne réponse</label>
                  <input className={input} value={qField.correctAnswer} onChange={e => setQField(f => ({ ...f, correctAnswer: e.target.value }))} />
                </div>
              )}
              <button type="submit" disabled={busy} className="w-full rounded-xl bg-academy-primary text-white py-2.5 text-[14px] font-black disabled:opacity-50">
                {busy ? 'Ajout…' : 'Ajouter la question'}
              </button>
            </form>
          )}

          {(active.questions || []).length === 0 && !qField && (
            <p className="mt-3 text-[13px] text-academy-textMain/60">Aucune question pour l'instant.</p>
          )}
          <ul className="mt-3 space-y-2">
            {(active.questions || []).map(q => (
              <li key={q.id} className="rounded-xl border border-academy-border p-3">
                <p className="font-semibold text-[14px]">{q.text}</p>
                <p className="text-[12px] text-academy-textMain/60">{q.type === 'poll' ? 'Vote' : q.type === 'quiz' ? 'Quiz' : 'Libre'}{q.options?.length ? ` · ${q.options.join(' / ')}` : ''}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  }

  return (
    <section className="mt-4 rounded-2xl border border-academy-border bg-white dark:bg-academy-surfaceDark p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-black text-[17px] flex items-center gap-2"><Radio size={18} className="text-academy-primary" /> MYLTA LIVE</h2>
          <p className="text-[13px] text-academy-textMain/60">Conférences interactives : QR, votes, quiz, classement.</p>
        </div>
        <button onClick={() => setForm({ title: '', description: '' })}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-academy-primary text-white px-3.5 py-2.5 text-[13px] font-bold">
          <Plus size={15} /> Nouvelle session
        </button>
      </div>

      {form && (
        <form onSubmit={create} className="mt-4 rounded-xl border-2 border-academy-primary/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-[15px]">Nouvelle session MYLTA LIVE</p>
            <button type="button" onClick={() => setForm(null)}><X size={16} /></button>
          </div>
          <div>
            <label className={label}>Titre</label>
            <input className={input} required minLength={3} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Conférence IA — Ouverture" />
          </div>
          <div>
            <label className={label}>Description</label>
            <textarea className={input} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <button type="submit" disabled={busy} className="w-full rounded-xl bg-academy-primary text-white py-3 text-[14px] font-black disabled:opacity-50">
            {busy ? 'Création…' : 'Créer la session'}
          </button>
        </form>
      )}

      {loading && <p className="mt-4 text-[13px] text-academy-textMain/60">Chargement…</p>}
      {!loading && sessions.length === 0 && !form && (
        <p className="mt-4 text-[14px] text-academy-textMain/60">Aucune session créée pour l'instant.</p>
      )}
      <ul className="mt-4 space-y-2">
        {sessions.map(s => (
          <li key={s.id} onClick={() => openDetail(s.id)}
              className="rounded-xl border border-academy-border p-3 cursor-pointer hover:border-academy-primary transition-colors">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[15px]">{s.title}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusColor[s.status]}`}>{statusLabel[s.status]}</span>
            </div>
            <p className="text-[12px] text-academy-textMain/60 mt-0.5">{s._count?.participants || 0} participant(s) · {s._count?.questions || 0} question(s)</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
