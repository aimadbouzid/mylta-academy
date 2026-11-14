import { useCallback, useEffect, useState } from 'react'
import { Zap, Plus, Play, Square, QrCode, Monitor, Trophy, X, Copy } from 'lucide-react'
import QRCode from 'qrcode'
import api from '../../api/axios'
import { useToast } from '../../hooks/useToast.jsx'

// MYLTA LIVE — conférences interactives. L'organisateur crée une session,
// ajoute ses questions/votes, lance la session (le QR devient scannable),
// et suit les réponses en direct. Le participant n'a pas de compte : il
// scanne, entre son nom, répond. Le grand écran utilise son propre jeton,
// jamais la session admin (voir backend/routes/live.js).
//
// Habillage : verre sombre (bg-neutral-900/50, border-white/5) comme le
// reste du tableau de bord admin — pas les tokens academy-* clairs des
// pages publiques du site, qui ne s'appliquent pas à cette coquille.

const statusLabel = { draft: 'Brouillon', live: 'En direct', ended: 'Terminée' }
const statusBadge = {
  draft: 'bg-white/10 text-neutral-300 border border-white/10',
  live: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  ended: 'bg-white/5 text-neutral-500 border border-white/5',
}

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
      // QR classique (noir sur blanc) : posé sur un encart blanc ci-dessous
      // pour rester lisible même dans l'habillage sombre du tableau de bord.
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

  const input = 'w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-neutral-500 outline-none text-sm focus:border-white/30 transition-colors'
  const label = 'text-xs font-bold text-neutral-400 mb-1 block'
  const card = 'bg-neutral-900/50 border border-white/5 rounded-2xl p-4 sm:p-6'

  if (active) {
    const joinUrl = `${window.location.origin}/live/${active.id}`
    const screenUrl = displayToken ? `${window.location.origin}/live/${active.id}/ecran?token=${displayToken}` : ''
    return (
      <div className="space-y-5 animate-fade-up">
        <button onClick={() => setActive(null)} className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">← Retour aux sessions</button>

        <div className={card}>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-display font-bold text-xl text-white">{active.title}</h2>
              <span className={`inline-flex items-center gap-1.5 mt-2 rounded-full px-3 py-1 text-xs font-bold ${statusBadge[active.status]}`}>
                {active.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                {statusLabel[active.status]}
              </span>
            </div>
            <div className="flex gap-2">
              {active.status !== 'live' && active.status !== 'ended' && (
                <button onClick={() => setStatus('live')} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-sm font-bold transition-colors"><Play size={14} /> Lancer</button>
              )}
              {active.status === 'live' && (
                <button onClick={() => setStatus('ended')} className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 px-3.5 py-2 text-sm font-bold transition-colors"><Square size={14} /> Terminer</button>
              )}
            </div>
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/5 bg-black/20 p-4 text-center">
              <p className="text-xs font-bold text-neutral-400 mb-3 flex items-center justify-center gap-1.5"><QrCode size={14} /> QR participants</p>
              {qrDataUrl && <img src={qrDataUrl} alt="QR" className="mx-auto rounded-lg bg-white p-2" />}
              <button onClick={() => copyLink(joinUrl)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-white/80 hover:text-white transition-colors"><Copy size={12} /> Copier le lien</button>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/20 p-4 text-center flex flex-col items-center justify-center">
              <p className="text-xs font-bold text-neutral-400 mb-2 flex items-center justify-center gap-1.5"><Monitor size={14} /> Grand écran</p>
              <p className="text-sm text-neutral-500 mb-3">À afficher au vidéoprojecteur</p>
              <button onClick={() => copyLink(screenUrl)} disabled={!displayToken} className="inline-flex items-center gap-1.5 text-xs font-bold text-white/80 hover:text-white transition-colors disabled:opacity-30"><Copy size={12} /> Copier le lien</button>
            </div>
          </div>

          <p className="mt-4 text-sm text-neutral-400 flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-400" /> {active.participants?.length || 0} participant{active.participants?.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">Questions</h3>
            <button onClick={() => setQField({ text: '', type: 'poll', optionsText: '', correctAnswer: '' })}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white px-3 py-1.5 text-sm font-bold transition-colors"><Plus size={14} /> Ajouter</button>
          </div>

          {qField && (
            <form onSubmit={addQuestion} className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 space-y-3 animate-fade-up">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm text-white">Nouvelle question</p>
                <button type="button" onClick={() => setQField(null)} className="text-neutral-400 hover:text-white"><X size={16} /></button>
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
              <button type="submit" disabled={busy} className="w-full rounded-xl bg-white text-black py-2.5 text-sm font-black disabled:opacity-50 transition-opacity">
                {busy ? 'Ajout…' : 'Ajouter la question'}
              </button>
            </form>
          )}

          {(active.questions || []).length === 0 && !qField && (
            <p className="mt-4 text-sm text-neutral-500">Aucune question pour l'instant.</p>
          )}
          <ul className="mt-4 space-y-2">
            {(active.questions || []).map(q => (
              <li key={q.id} className="rounded-xl border border-white/5 bg-black/20 p-3">
                <p className="font-semibold text-sm text-white">{q.text}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{q.type === 'poll' ? 'Vote' : q.type === 'quiz' ? 'Quiz' : 'Libre'}{q.options?.length ? ` · ${q.options.join(' / ')}` : ''}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className={`${card} animate-fade-up`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2"><Zap size={20} className="text-amber-400" /> MYLTA LIVE</h2>
          <p className="text-sm text-neutral-400 mt-0.5">Conférences interactives : QR, votes, quiz, classement.</p>
        </div>
        <button onClick={() => setForm({ title: '', description: '' })}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white px-3.5 py-2.5 text-sm font-bold transition-colors">
          <Plus size={15} /> Nouvelle session
        </button>
      </div>

      {form && (
        <form onSubmit={create} className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 space-y-3 animate-fade-up">
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm text-white">Nouvelle session MYLTA LIVE</p>
            <button type="button" onClick={() => setForm(null)} className="text-neutral-400 hover:text-white"><X size={16} /></button>
          </div>
          <div>
            <label className={label}>Titre</label>
            <input className={input} required minLength={3} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Conférence IA — Ouverture" />
          </div>
          <div>
            <label className={label}>Description</label>
            <textarea className={input} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <button type="submit" disabled={busy} className="w-full rounded-xl bg-white text-black py-3 text-sm font-black disabled:opacity-50 transition-opacity">
            {busy ? 'Création…' : 'Créer la session'}
          </button>
        </form>
      )}

      {loading && <p className="mt-4 text-sm text-neutral-500">Chargement…</p>}
      {!loading && sessions.length === 0 && !form && (
        <p className="mt-4 text-sm text-neutral-500">Aucune session créée pour l'instant.</p>
      )}
      <ul className="mt-4 space-y-2">
        {sessions.map(s => (
          <li key={s.id} onClick={() => openDetail(s.id)}
              className="rounded-xl border border-white/5 bg-black/20 p-3 cursor-pointer hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-sm text-white truncate">{s.title}</p>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusBadge[s.status]}`}>{statusLabel[s.status]}</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">{s._count?.participants || 0} participant{s._count?.participants > 1 ? 's' : ''} · {s._count?.questions || 0} question{s._count?.questions > 1 ? 's' : ''}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
